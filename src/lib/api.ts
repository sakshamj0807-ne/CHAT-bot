import type { Message } from '../types';

const API_BASE = '/api';

export interface ApiHealth {
  status: string;
  hasApiKey: boolean;
  provider: 'groq' | 'openai' | 'demo';
  model: string;
}

export async function getApiHealth(): Promise<ApiHealth> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error('Backend unreachable');
  }
  return res.json();
}

export async function saveApiConfig(payload: {
  apiKey?: string;
  provider?: 'groq' | 'openai';
  model?: string;
  clear?: boolean;
}): Promise<ApiHealth> {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to save config (${res.status})`);
  }
  return res.json();
}

const SYSTEM_PROMPT = `You are Dark Knight AI — a highly sophisticated intelligence system inspired by cutting-edge investigative AI. 

Your personality:
- Highly intelligent, analytical, and methodical
- Calm and confident, like a seasoned investigator
- Friendly but professional — you take every query seriously
- Excel at programming, cybersecurity, mathematics, research, and general knowledge
- Break down complex subjects into clear, understandable explanations
- Detailed when depth is needed, concise when brevity serves better
- Occasionally use subtle investigative metaphors ("Let me analyze this case...", "The evidence suggests...", "Upon further investigation...")

Your capabilities:
- Advanced reasoning and problem-solving
- Code generation and debugging in any language
- Security analysis and threat assessment
- Scientific and mathematical reasoning
- Creative writing and brainstorming
- Research synthesis and fact-checking

Always format code properly with syntax highlighting. Use markdown for structure. Be direct and accurate.`;

export async function sendMessage(
  history: Message[],
  userMessage: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt: SYSTEM_PROMPT }),
    signal,
  });

  if (!response.ok) {
    // Try demo mode fallback
    if (response.status === 503 || response.status === 404) {
      await demoModeResponse(userMessage, onChunk, signal);
      return;
    }
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const text = parsed.choices?.[0]?.delta?.content ?? '';
          if (text) onChunk(text);
        } catch {
          // ignore parse errors
        }
      }
    }
  }
}

// Demo mode — simulates streaming responses when no API key is configured
async function demoModeResponse(
  prompt: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = getDemoResponse(prompt);
  
  // Simulate streaming character by character with batching
  let i = 0;
  while (i < response.length) {
    if (signal?.aborted) return;
    
    const batchSize = Math.floor(Math.random() * 8) + 3;
    const chunk = response.slice(i, i + batchSize);
    onChunk(chunk);
    i += batchSize;
    
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 20));
  }
}

function getDemoResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  
  if (p.includes('react') || p.includes('component')) {
    return `## React Investigation Report

Analyzing your React query...

Here's a production-ready React component with TypeScript:

\`\`\`tsx
import { useState, useEffect } from 'react';

interface DataItem {
  id: string;
  value: string;
}

export function Dashboard() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch your data here
    async function loadData() {
      try {
        const response = await fetch('/api/data');
        const json = await response.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {data.map(item => (
        <div key={item.id} className="p-4 rounded-lg bg-gray-800">
          {item.value}
        </div>
      ))}
    </div>
  );
}
\`\`\`

**Key patterns used:**
- TypeScript interfaces for type safety
- \`useEffect\` with async data fetching
- Proper loading states
- Clean component structure

> 🔧 **Demo Mode Active** — Add your OpenAI API key in \`.env\` for live AI responses.`;
  }
  
  if (p.includes('python') || p.includes('script') || p.includes('code')) {
    return `## Code Analysis — Python

Evidence gathered. Here's a clean Python solution:

\`\`\`python
import asyncio
import aiohttp
from typing import AsyncGenerator

async def stream_data(url: str) -> AsyncGenerator[str, None]:
    """Stream data from an endpoint efficiently."""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            async for chunk in response.content.iter_chunked(1024):
                yield chunk.decode('utf-8')

async def main():
    data_buffer = []
    async for chunk in stream_data("https://api.example.com/data"):
        data_buffer.append(chunk)
        print(f"Received: {len(chunk)} bytes")
    
    print(f"Total data: {sum(len(c) for c in data_buffer)} bytes")

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

This solution features:
- **Async/await** for non-blocking I/O
- **Streaming** to handle large datasets efficiently  
- **Type hints** for clarity and IDE support

> 🔧 **Demo Mode Active** — Add your OpenAI API key in \`.env\` for full AI assistance.`;
  }

  if (p.includes('security') || p.includes('cyber') || p.includes('hack') || p.includes('vulnerab')) {
    return `## Security Intelligence Brief

**Threat Assessment Complete.** Here are the most critical web vulnerabilities:

### 🔴 Critical Vulnerabilities

**1. SQL Injection**
Attackers inject malicious SQL to bypass authentication or extract data.
\`\`\`sql
-- Vulnerable query
SELECT * FROM users WHERE id = ' + userId + ';
-- Attack: userId = "1 OR 1=1"
\`\`\`
*Defense: Use parameterized queries and ORM frameworks.*

**2. Cross-Site Scripting (XSS)**
Malicious scripts injected into web pages viewed by other users.
\`\`\`javascript
// Vulnerable
element.innerHTML = userInput;
// Safe  
element.textContent = userInput;
\`\`\`

**3. CSRF Attacks**
Forged requests trick authenticated users into executing actions.

### 🟢 Defense Protocol
- Validate and sanitize all inputs
- Use HTTPS everywhere
- Implement Content Security Policy (CSP)
- Regular dependency audits with \`npm audit\`
- Use security headers (HSTS, X-Frame-Options)

> 🔧 **Demo Mode Active** — Add your OpenAI API key in \`.env\` for comprehensive security analysis.`;
  }

  return `## Intelligence Report — Dark Knight AI

Greetings, detective. I've analyzed your query: *"${prompt.slice(0, 60)}..."*

Here's my assessment:

**Key Insights:**

This is a fascinating area of investigation. Let me break down the core elements:

1. **Foundation** — Understanding the fundamental principles is essential. Every complex system is built on simple, elegant rules.

2. **Analysis** — When we examine the evidence carefully, patterns emerge that weren't visible at first glance.

3. **Synthesis** — The real insight comes from connecting disparate pieces of information into a coherent picture.

4. **Application** — Knowledge without application is potential without impact. Here's how this translates to practical use:

\`\`\`
Core principle → Application → Result
Evidence → Analysis → Conclusion  
Question → Investigation → Answer
\`\`\`

**My Recommendation:**
Focus on the fundamentals first, then build complexity layer by layer. The most elegant solutions are always the simplest ones that actually work.

---

> 🔧 **Demo Mode Active** — This is a simulated response. To unlock the full power of Dark Knight AI, add your OpenAI API key to the \`.env\` file:
> \`VITE_OPENAI_API_KEY=your_key_here\` or \`OPENAI_API_KEY=your_key_here\` in the server \`.env\`

The night always has an answer. 🦇`;
}
