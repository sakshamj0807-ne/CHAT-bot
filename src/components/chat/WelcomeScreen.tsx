import { motion } from 'framer-motion';
import { Zap, Shield, Code2, FlaskConical, Lightbulb, Search } from 'lucide-react';
import BatLogo from '../ui/BatLogo';

interface WelcomeScreenProps {
  onPromptSelect: (prompt: string) => void;
}

const PROMPT_CARDS = [
  {
    icon: Lightbulb,
    title: 'Explain a Concept',
    desc: 'Break down complex topics clearly',
    prompt: 'Explain how neural networks learn, using simple analogies',
    color: '#F5C518',
    bg: 'rgba(245, 197, 24, 0.07)',
  },
  {
    icon: Code2,
    title: 'Build with React',
    desc: 'Get expert development help',
    prompt: 'Help me build a React dashboard with real-time data updates',
    color: '#318BFF',
    bg: 'rgba(49, 139, 255, 0.07)',
  },
  {
    icon: Shield,
    title: 'Cybersecurity',
    desc: 'Analyze threats and defenses',
    prompt: 'Explain common web vulnerabilities and how to prevent them',
    color: '#E34D5B',
    bg: 'rgba(227, 77, 91, 0.07)',
  },
  {
    icon: Zap,
    title: 'Write Code',
    desc: 'Generate production-ready code',
    prompt: 'Write a Python script to scrape and analyze data from a website',
    color: '#20C997',
    bg: 'rgba(32, 201, 151, 0.07)',
  },
  {
    icon: Search,
    title: 'Deep Research',
    desc: 'Investigate any topic thoroughly',
    prompt: 'Research the latest developments in quantum computing for 2024',
    color: '#F5C518',
    bg: 'rgba(245, 197, 24, 0.07)',
  },
  {
    icon: FlaskConical,
    title: 'Brainstorm Ideas',
    desc: 'Creative thinking and innovation',
    prompt: 'Brainstorm 5 innovative startup ideas in the AI space with business models',
    color: '#318BFF',
    bg: 'rgba(49, 139, 255, 0.07)',
  },
];

export default function WelcomeScreen({ onPromptSelect }: WelcomeScreenProps) {
  return (
    <motion.div
      className="h-full overflow-y-auto chat-scroll flex flex-col items-center justify-center px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Avatar */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
      >
        <div
          className="absolute inset-0 blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.12) 0%, transparent 60%)' }}
        />
        <BatLogo size={64} animated />
      </motion.div>

      <motion.div
        className="text-center mb-12 max-w-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Good evening, detective.
        </h2>
        <p className="text-gray-500 leading-relaxed">
          The system is online. What shall we investigate today?
        </p>
        <div
          className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest"
          style={{ background: 'rgba(32, 201, 151, 0.08)', border: '1px solid rgba(32,201,151,0.15)' }}
        >
          <span className="status-dot-green animate-pulse" />
          <span className="text-jade-green">AI ENGINE ACTIVE</span>
        </div>
      </motion.div>

      {/* Prompt grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
        {PROMPT_CARDS.map((card, i) => (
          <motion.button
            key={card.title}
            className="text-left glass rounded-xl p-4 hover:border-white/[0.1] transition-all duration-300 group"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPromptSelect(card.prompt)}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
              style={{ background: card.bg }}
            >
              <card.icon size={16} style={{ color: card.color }} />
            </div>
            <p className="text-gray-200 font-medium text-sm mb-1">{card.title}</p>
            <p className="text-gray-600 text-xs leading-relaxed">{card.desc}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
