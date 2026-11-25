// server/index.cjs — Dark Knight AI Backend (Groq-powered)
const express = require('express');
const cors = require('cors');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch {
  // dotenv optional in production environments with injected env vars
}

const app = express();
const PORT = process.env.PORT || 3001;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

const SUPPORTED_GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (Recommended)' },
  { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B (Fast)' },
  { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B' },
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

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

function getConfiguredModel(requestedModel) {
  const candidate =
    (requestedModel && String(requestedModel).trim()) ||
    process.env.GROQ_MODEL ||
    process.env.AI_MODEL ||
    DEFAULT_GROQ_MODEL;
  return candidate;
}

// Health & real Groq connection check
app.get('/api/health', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  const activeModel = getConfiguredModel();

  if (!apiKey || !apiKey.trim()) {
    return res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      hasApiKey: false,
      verified: false,
      provider: 'demo',
      model: activeModel,
      supportedModels: SUPPORTED_GROQ_MODELS,
      error: 'GROQ_API_KEY is not configured in the backend .env file.',
    });
  }

  // Verify the key against Groq's /models endpoint if ?verify=true
  if (req.query.verify === 'true') {
    try {
      const response = await fetch(`${GROQ_BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });

      if (!response.ok) {
        const msg =
          response.status === 401
            ? 'Invalid GROQ_API_KEY. Please check your backend .env file.'
            : `Groq connection check failed (HTTP ${response.status}).`;
        return res.json({
          status: 'error',
          timestamp: new Date().toISOString(),
          hasApiKey: true,
          verified: false,
          provider: 'groq',
          model: activeModel,
          supportedModels: SUPPORTED_GROQ_MODELS,
          error: msg,
        });
      }

      const data = await response.json();
      const availableIds = new Set((data.data || []).map((m) => m.id));
      const verifiedModels = SUPPORTED_GROQ_MODELS.filter((m) => availableIds.has(m.id));

      return res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        hasApiKey: true,
        verified: true,
        provider: 'groq',
        model: activeModel,
        supportedModels: verifiedModels.length > 0 ? verifiedModels : SUPPORTED_GROQ_MODELS,
      });
    } catch {
      return res.json({
        status: 'error',
        timestamp: new Date().toISOString(),
        hasApiKey: true,
        verified: false,
        provider: 'groq',
        model: activeModel,
        supportedModels: SUPPORTED_GROQ_MODELS,
        error: 'Network error while connecting to Groq API.',
      });
    }
  }

  return res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    hasApiKey: true,
    verified: true,
    provider: 'groq',
    model: activeModel,
    supportedModels: SUPPORTED_GROQ_MODELS,
  });
});

// List supported Groq models
app.get('/api/models', (req, res) => {
  res.json({
    provider: 'groq',
    defaultModel: DEFAULT_GROQ_MODEL,
    models: SUPPORTED_GROQ_MODELS,
  });
});

// Chat endpoint with streaming (Groq only, server-side key only)
app.post('/api/chat', async (req, res) => {
  const { messages, model: requestedModel } = req.body || {};
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return res.status(503).json({
      error: 'GROQ_API_KEY is missing. Add GROQ_API_KEY to your backend .env file and restart the server.',
      code: 'MISSING_API_KEY',
    });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.', code: 'INVALID_REQUEST' });
  }

  if (messages.length > 50) {
    return res.status(400).json({ error: 'Conversation history exceeds maximum request limit (50 messages).', code: 'TOO_MANY_MESSAGES' });
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

  const activeModel = getConfiguredModel(requestedModel);
  const isKnownModel = SUPPORTED_GROQ_MODELS.some((m) => m.id === activeModel);
  if (!isKnownModel) {
    return res.status(400).json({
      error: `Unsupported Groq model "${activeModel}". Supported models: ${SUPPORTED_GROQ_MODELS.map((m) => m.id).join(', ')}.`,
      code: 'UNSUPPORTED_MODEL',
    });
  }

  try {
    const OpenAI = require('openai');
    const client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: GROQ_BASE_URL,
    });

    const stream = await client.chat.completions.create({
      model: activeModel,
      messages: [
        { role: 'system', content: DARK_KNIGHT_SYSTEM_PROMPT },
        ...sanitizedMessages,
      ],
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    for await (const chunk of stream) {
      if (res.destroyed) break;

      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        const data = JSON.stringify({ choices: [{ delta: { content } }] });
        res.write(`data: ${data}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    const status = error?.status || error?.statusCode || 500;
    let userMessage = 'Failed to get a response from Groq AI.';
    let code = 'GROQ_ERROR';

    if (status === 401) {
      userMessage = 'Invalid GROQ_API_KEY. Authentication with Groq failed.';
      code = 'INVALID_API_KEY';
    } else if (status === 429) {
      userMessage = 'Groq API rate limit exceeded. Please wait a moment and try again.';
      code = 'RATE_LIMIT';
    } else if (status === 404 || status === 400) {
      userMessage = `Groq rejected the request for model "${activeModel}".`;
      code = 'MODEL_ERROR';
    }

    console.error(`[Groq Error ${status}]`, code);

    if (!res.headersSent) {
      return res.status(status).json({ error: userMessage, code });
    } else {
      res.write(`data: ${JSON.stringify({ error: userMessage, code })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  const hasKey = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
  console.log(`\n🦇 Dark Knight AI Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🤖 Provider: Groq (${getConfiguredModel()})`);
  console.log(`🔑 GROQ_API_KEY: ${hasKey ? '✅ Loaded from .env' : '⚠️  Missing (Demo Mode only)'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
