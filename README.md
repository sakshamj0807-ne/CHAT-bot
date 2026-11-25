# 🦇 DARK KNIGHT AI

> *"The night has an answer. Intelligence beyond limits."*

A premium, fully functional AI chatbot web application inspired by Batman's Gotham City, futuristic intelligence systems, and modern AI platforms.

---

## ✨ Features

- **Interactive Particle Background** — Cursor-reactive particle network with ripple effects
- **Cinematic Landing Page** — Gotham-inspired skyline, animated fog, bat logo
- **Three-Panel Chat Dashboard** — Collapsible sidebar, main chat area, glassmorphism input
- **Real AI Integration** — OpenAI GPT-4o/3.5 with streaming responses
- **Demo Mode** — Fully functional without an API key
- **Persistent Conversations** — LocalStorage-backed chat history with Zustand
- **Markdown & Code Highlighting** — Full markdown rendering with syntax highlighting
- **Framer Motion Animations** — Smooth page transitions, message animations, typing indicator
- **System Status Panel** — Live clock, connection indicators, AI status
- **Fully Responsive** — Desktop, tablet, and mobile optimized

---

## 🎨 Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Gotham Black | `#050608` | Primary background |
| Dark Charcoal | `#0B0E14` | Secondary surfaces |
| Graphite | `#151922` | Cards and containers |
| **Batman Yellow** | `#F5C518` | Primary accent (15%) |
| Electric Blue | `#318BFF` | Interactive highlights |
| Signal Red | `#E34D5B` | Alerts & warnings |
| Jade Green | `#20C997` | Success & status |

---

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
cd dark-knight-ai
npm install
\`\`\`

### 2. Configure API Key (Optional)

Copy `.env.example` to `.env` and add your OpenAI API key:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env`:
\`\`\`
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
\`\`\`

> **Without an API key**, the app runs in **Demo Mode** with pre-written intelligent responses.

### 3. Start Development

\`\`\`bash
# Start both frontend (Vite) and backend (Express) together:
npm run start

# Or individually:
npm run dev      # Frontend at http://localhost:5173
npm run server   # Backend at http://localhost:3001
\`\`\`

### 4. Build for Production

\`\`\`bash
npm run build
npm run server  # Serves both API and static files
\`\`\`

---

## 🏗️ Architecture

\`\`\`
dark-knight-ai/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatDashboard.tsx   # Main 3-panel layout
│   │   │   ├── ChatArea.tsx        # Conversation management
│   │   │   ├── ChatInput.tsx       # Glassmorphism input
│   │   │   ├── MessageList.tsx     # Message container
│   │   │   ├── MessageBubble.tsx   # Individual messages + markdown
│   │   │   ├── TypingIndicator.tsx # Animated dots
│   │   │   └── WelcomeScreen.tsx   # Prompt cards
│   │   ├── landing/
│   │   │   └── LandingPage.tsx     # Hero + features + nav
│   │   ├── sidebar/
│   │   │   └── Sidebar.tsx         # Conversation management
│   │   └── ui/
│   │       ├── BatLogo.tsx         # Animated bat SVG logo
│   │       ├── ParticleBackground.tsx  # Canvas particle system
│   │       └── SystemStatus.tsx    # Live status indicators
│   ├── store/
│   │   └── chatStore.ts           # Zustand state management
│   ├── lib/
│   │   └── api.ts                 # API client + demo mode
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   ├── App.tsx                    # Router + AnimatePresence
│   └── main.tsx                   # Entry point
├── server/
│   └── index.cjs                  # Express + OpenAI streaming
├── tailwind.config.js             # Custom Gotham color palette
└── .env.example                   # Environment template
\`\`\`

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `Ctrl/Cmd+K` | Focus input |

---

## 🔧 Tech Stack

**Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand  
**Backend:** Node.js, Express, OpenAI SDK  
**UI:** Lucide React, React Markdown, React Syntax Highlighter  
**Build:** Vite  

---

*The night always has an answer.* 🦇
