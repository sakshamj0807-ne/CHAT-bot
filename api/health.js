const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

const SUPPORTED_GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (Recommended)' },
  { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B (Fast)' },
  { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B' },
];

export default async function handler(req, res) {
  const apiKey = process.env.GROQ_API_KEY;
  const activeModel = process.env.GROQ_MODEL || process.env.AI_MODEL || DEFAULT_GROQ_MODEL;

  if (!apiKey || !apiKey.trim()) {
    return res.status(200).json({
      status: 'online',
      timestamp: new Date().toISOString(),
      hasApiKey: false,
      verified: false,
      provider: 'demo',
      model: activeModel,
      supportedModels: SUPPORTED_GROQ_MODELS,
      error: 'GROQ_API_KEY is not configured in environment variables.',
    });
  }

  if (req.query?.verify === 'true') {
    try {
      const response = await fetch(`${GROQ_BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (!response.ok) {
        return res.status(200).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          hasApiKey: true,
          verified: false,
          provider: 'groq',
          model: activeModel,
          supportedModels: SUPPORTED_GROQ_MODELS,
          error:
            response.status === 401
              ? 'Invalid GROQ_API_KEY. Authentication failed.'
              : `Groq connection check failed (HTTP ${response.status}).`,
        });
      }
    } catch {
      return res.status(200).json({
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

  return res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    hasApiKey: true,
    verified: true,
    provider: 'groq',
    model: activeModel,
    supportedModels: SUPPORTED_GROQ_MODELS,
  });
}
