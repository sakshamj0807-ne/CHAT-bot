import type { Message } from '../types';

const API_BASE = '/api';

export interface GroqModelInfo {
  id: string;
  label: string;
}

export interface ApiHealth {
  status: 'online' | 'error';
  hasApiKey: boolean;
  verified: boolean;
  provider: 'groq' | 'demo';
  model: string;
  supportedModels: GroqModelInfo[];
  error?: string;
}

export async function getApiHealth(verify = false): Promise<ApiHealth> {
  const url = verify ? `${API_BASE}/health?verify=true` : `${API_BASE}/health`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Backend health check failed (HTTP ${res.status})`);
  }
  return res.json();
}

export interface SendMessageOptions {
  model?: string;
  demoMode?: boolean;
}

export async function sendMessage(
  history: Message[],
  userMessage: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  options?: SendMessageOptions
): Promise<void> {
  // Explicit Demo Mode only (never used silently when Live AI is active or failing)
  if (options?.demoMode) {
    const simulated = `[DEMO MODE — SIMULATED RESPONSE]\n\nLive Groq AI is currently disabled because Demo Mode is selected or no \`GROQ_API_KEY\` is configured in the backend \`.env\` file.\n\nYour message ("${userMessage.slice(0, 80)}${userMessage.length > 80 ? '...' : ''}") was not sent to Groq. Configure \`GROQ_API_KEY\` in \`.env\` and disable Demo Mode in Settings for real AI responses.`;
    for (let i = 0; i < simulated.length; i += 8) {
      if (signal?.aborted) return;
      onChunk(simulated.slice(i, i + 8));
      await new Promise((r) => setTimeout(r, 12));
    }
    return;
  }

  const cleanHistory = history
    .filter((m) => !m.isError && !m.isStreaming && m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));

  const messages = [...cleanHistory, { role: 'user' as const, content: userMessage }];

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: options?.model,
    }),
    signal,
  });

  if (!response.ok) {
    let errorMessage = `Request failed (HTTP ${response.status})`;
    try {
      const errData = await response.json();
      if (errData?.error) errorMessage = errData.error;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response stream received from backend.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        const text = parsed.choices?.[0]?.delta?.content ?? '';
        if (text) onChunk(text);
      } catch (e) {
        if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
          // Only rethrow explicit API errors, ignore partial JSON chunks
          if (!(e instanceof SyntaxError)) {
            throw e;
          }
        }
      }
    }
  }
}
