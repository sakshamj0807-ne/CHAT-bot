// server/index.cjs — Dark Knight AI Backend (CommonJS for Node.js compatibility)
const express = require('express');
const cors = require('cors');
const path = require('path');

// Try to load dotenv if available
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // dotenv not required in production
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

const fs = require('fs');

// Helper to persist key config to .env
function writeEnvConfig({ groqKey = '', openaiKey = '', model = '' }) {
  const envPath = path.join(__dirname, '..', '.env');
  const content = [
    '# Groq API Key (starts with gsk_...)',
    `GROQ_API_KEY=${groqKey}`,
    '',
    '# Or OpenAI API Key (starts with sk-...)',
    `OPENAI_API_KEY=${openaiKey}`,
    '',
    '# Optional: override default model',
    `AI_MODEL=${model}`,
    '',
    `PORT=${process.env.PORT || 3001}`,
    `NODE_ENV=${process.env.NODE_ENV || 'development'}`,
    '',
  ].join('\n');
  fs.writeFileSync(envPath, content, 'utf8');
}

// Health check
app.get('/api/health', (req, res) => {
  const provider = process.env.GROQ_API_KEY ? 'groq' : process.env.OPENAI_API_KEY ? 'openai' : 'demo';
  const defaultModel = provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    hasApiKey: !!(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY),
    provider,
    model: process.env.AI_MODEL || defaultModel,
  });
});

// Configure API key from UI
app.post('/api/config', (req, res) => {
  const { apiKey, provider, model, clear } = req.body || {};

  if (clear || !apiKey || !String(apiKey).trim()) {
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_MODEL;
    try {
      writeEnvConfig({});
    } catch (e) {
      console.error('Failed to update .env:', e.message);
    }
    return res.json({
      status: 'ok',
      hasApiKey: false,
      provider: 'demo',
      model: 'demo',
    });
  }

  const trimmedKey = String(apiKey).trim();
  const detectedProvider =
    provider === 'groq' || provider === 'openai'
      ? provider
      : trimmedKey.startsWith('gsk_')
      ? 'groq'
      : 'openai';

  if (detectedProvider === 'groq') {
    process.env.GROQ_API_KEY = trimmedKey;
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = trimmedKey;
    delete process.env.GROQ_API_KEY;
  }

  const cleanModel = model ? String(model).trim() : '';
  if (cleanModel) {
    process.env.AI_MODEL = cleanModel;
  } else {
    delete process.env.AI_MODEL;
  }

  try {
    writeEnvConfig({
      groqKey: detectedProvider === 'groq' ? trimmedKey : '',
      openaiKey: detectedProvider === 'openai' ? trimmedKey : '',
      model: cleanModel,
    });
  } catch (e) {
    console.error('Failed to write .env:', e.message);
  }

  const activeModel =
    cleanModel || (detectedProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

  return res.json({
    status: 'ok',
    hasApiKey: true,
    provider: detectedProvider,
    model: activeModel,
  });
});

// Chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body;

  // Support both OPENAI_API_KEY and GROQ_API_KEY
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const isGroq = !!process.env.GROQ_API_KEY;

  if (!apiKey) {
    // No API key — return 503 so frontend falls back to demo mode
    return res.status(503).json({ error: 'No API key configured. Using demo mode.' });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  try {
    // Set up SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const OpenAI = require('openai');

    // Groq uses OpenAI-compatible API — just swap the base URL
    const client = new OpenAI({
      apiKey,
      baseURL: isGroq ? 'https://api.groq.com/openai/v1' : undefined,
    });

    // Default model based on provider
    const defaultModel = isGroq
      ? 'llama-3.3-70b-versatile'   // Fast, capable Groq model
      : 'gpt-4o-mini';

    const stream = await client.chat.completions.create({
      model: process.env.AI_MODEL || defaultModel,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
        ...messages,
      ],
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      if (res.destroyed) break;

      const data = JSON.stringify({
        choices: [
          {
            delta: {
              content: chunk.choices[0]?.delta?.content || '',
            },
          },
        ],
      });
      res.write(`data: ${data}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI engine error', details: error.message });
    } else {
      res.write(`data: [DONE]\n\n`);
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
  const activeKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const provider = process.env.GROQ_API_KEY ? 'Groq' : process.env.OPENAI_API_KEY ? 'OpenAI' : 'None (Demo Mode)';
  console.log(`\n🦇 Dark Knight AI Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${activeKey ? `✅ Configured (${provider})` : '⚠️  Not configured (Demo Mode)'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
