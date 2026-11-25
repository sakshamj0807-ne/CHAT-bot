const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

const SUPPORTED_GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
];

const DARK_KNIGHT_SYSTEM_PROMPT = `You are DARK KNIGHT AI, an advanced intelligent AI assistant.

Your personality is analytical, logical, calm, confident, professional, and helpful.

You are capable of:
- Programming and software development.
- Cybersecurity education.
- Mathematics and calculations.
- Science and technology.
- Research and general knowledge.
- Problem-solving.
- Writing and explanations.

Understand the user's actual question before responding.

Answer simple questions directly. Do not generate unnecessary reports for simple questions.

For calculations, provide correct results.
For programming, provide functional code.
For cybersecurity, explain concepts accurately and responsibly.
For complex topics, provide structured explanations.
Maintain conversation context within the current conversation.

Never invent information or pretend to have performed actions you have not performed.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return res.status(503).json({
      error: 'GROQ_API_KEY is missing. Configure GROQ_API_KEY in your environment variables.',
      code: 'MISSING_API_KEY',
    });
  }

  const { messages, model: requestedModel } = req.body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.', code: 'INVALID_REQUEST' });
  }

  if (messages.length > 50) {
    return res.status(400).json({ error: 'Conversation history exceeds maximum request limit.', code: 'TOO_MANY_MESSAGES' });
  }

  const sanitizedMessages = [];
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      return res.status(400).json({ error: 'Invalid message format.', code: 'INVALID_MESSAGE' });
    }
    const trimmed = m.content.trim();
    if (trimmed) {
      sanitizedMessages.push({ role: m.role, content: trimmed.slice(0, 32000) });
    }
  }

  if (sanitizedMessages.length === 0) {
    return res.status(400).json({ error: 'Cannot send an empty message.', code: 'EMPTY_MESSAGE' });
  }

  const activeModel =
    (requestedModel && String(requestedModel).trim()) ||
    process.env.GROQ_MODEL ||
    process.env.AI_MODEL ||
    DEFAULT_GROQ_MODEL;

  if (!SUPPORTED_GROQ_MODELS.includes(activeModel)) {
    return res.status(400).json({
      error: `Unsupported Groq model "${activeModel}". Supported models: ${SUPPORTED_GROQ_MODELS.join(', ')}.`,
      code: 'UNSUPPORTED_MODEL',
    });
  }

  try {
    const upstream = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: DARK_KNIGHT_SYSTEM_PROMPT },
          ...sanitizedMessages,
        ],
        stream: true,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      let userMessage = `Groq API error (HTTP ${upstream.status}).`;
      let code = 'GROQ_ERROR';
      if (upstream.status === 401) {
        userMessage = 'Invalid GROQ_API_KEY. Authentication with Groq failed.';
        code = 'INVALID_API_KEY';
      } else if (upstream.status === 429) {
        userMessage = 'Groq API rate limit exceeded. Please wait a moment and try again.';
        code = 'RATE_LIMIT';
      } else if (upstream.status === 404 || upstream.status === 400) {
        userMessage = `Groq rejected the request for model "${activeModel}".`;
        code = 'MODEL_ERROR';
      }
      return res.status(upstream.status).json({ error: userMessage, code });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch {
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Network error communicating with Groq AI.', code: 'NETWORK_ERROR' });
    } else {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}
