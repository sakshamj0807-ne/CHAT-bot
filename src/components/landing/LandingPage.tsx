import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Brain, ChevronRight, Settings, User } from 'lucide-react';
import BatLogo from '../ui/BatLogo';
import SystemStatus from '../ui/SystemStatus';
import SettingsModal from '../ui/SettingsModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const [glitchText, setGlitchText] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 150);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="relative min-h-screen flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gotham skyline background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GothamSkyline />
        <div className="absolute inset-0 bg-gradient-to-b from-gotham-black/60 via-transparent to-gotham-black" />
        {/* Fog layers */}
        <FogLayer />
        {/* Yellow glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.06) 0%, transparent 70%)' }}
        />
        {/* Blue glow bottom right */}
        <div
          className="absolute bottom-20 right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(49,139,255,0.05) 0%, transparent 70%)' }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <motion.div
          className="flex items-center gap-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <BatLogo size={32} />
          <span className="text-batman-yellow font-bold tracking-[0.2em] text-sm uppercase">
            Dark Knight AI
          </span>
        </motion.div>

        <motion.div
          className="hidden md:flex items-center gap-8"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {['Home', 'Features', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-gray-400 hover:text-batman-yellow transition-colors text-sm tracking-widest uppercase font-medium"
            >
              {item}
            </a>
          ))}
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setSettingsOpen(true)}
            title="Configure API Key"
            className="p-2 rounded-lg text-gray-500 hover:text-batman-yellow hover:bg-gotham-charcoal transition-all"
          >
            <Settings size={18} />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:text-batman-yellow hover:bg-gotham-charcoal transition-all">
            <User size={18} />
          </button>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center min-h-[80vh]">
        {/* Bat symbol */}
        <motion.div
          className="mb-10 relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        >
          <div
            className="absolute inset-0 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.15) 0%, transparent 60%)' }}
          />
          <BatLogo size={96} animated />
        </motion.div>

        <motion.p
          className="text-batman-yellow tracking-[0.4em] text-xs uppercase font-semibold mb-6 opacity-80"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          YOUR PERSONAL INTELLIGENCE ASSISTANT
        </motion.p>

        <motion.h1
          className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-none ${glitchText ? 'text-batman-yellow' : 'text-white'}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={{ textShadow: '0 0 60px rgba(245,197,24,0.15)' }}
        >
          THE NIGHT HAS<br />
          <span className="yellow-glow-text">AN ANSWER.</span>
        </motion.h1>

        <motion.p
          className="text-gray-400 text-lg md:text-xl max-w-xl mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          Intelligence beyond limits. Answers beyond imagination.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <button
            className="btn-primary flex items-center gap-2 group"
            onClick={() => navigate('/chat')}
          >
            ENTER THE SYSTEM
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
          <button
            className="px-8 py-3 border border-gray-700 hover:border-batman-yellow text-gray-400 hover:text-batman-yellow rounded-sm transition-all duration-300 text-sm tracking-widest uppercase font-medium"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            LEARN MORE
          </button>
        </motion.div>

        {/* System status strip */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <SystemStatus compact />
        </motion.div>
      </main>

      {/* Features section */}
      <section id="features" className="relative z-20 py-24 px-6 md:px-12">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <p className="text-batman-yellow text-xs tracking-[0.4em] uppercase mb-4">CAPABILITIES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Engineered for the Elite
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass rounded-xl p-6 group hover:border-batman-yellow/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{ background: f.bgColor }}
                >
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 py-8 px-6 border-t border-gotham-charcoal/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BatLogo size={20} />
            <span className="text-gray-600 text-sm">DARK KNIGHT AI · © 2024</span>
          </div>
          <p className="text-gray-700 text-xs tracking-widest">
            INTELLIGENCE BEYOND LIMITS
          </p>
        </div>
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </motion.div>
  );
}

const FEATURES = [
  {
    title: 'Neural Intelligence',
    desc: 'Powered by the most advanced language models for deep analytical thinking and creative problem solving.',
    icon: Brain,
    color: '#F5C518',
    bgColor: 'rgba(245, 197, 24, 0.1)',
  },
  {
    title: 'Secure & Private',
    desc: 'Military-grade security protocols. Your conversations are encrypted and never stored externally.',
    icon: Shield,
    color: '#20C997',
    bgColor: 'rgba(32, 201, 151, 0.1)',
  },
  {
    title: 'Lightning Fast',
    desc: 'Streaming responses with real-time output. No waiting. No delays. Just instant intelligence.',
    icon: Zap,
    color: '#318BFF',
    bgColor: 'rgba(49, 139, 255, 0.1)',
  },
];

function GothamSkyline() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full"
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMax meet"
      style={{ opacity: 0.12 }}
    >
      {/* Buildings */}
      <rect x="0" y="200" width="80" height="200" fill="#F5C518" />
      <rect x="10" y="150" width="20" height="50" fill="#F5C518" />
      <rect x="90" y="250" width="60" height="150" fill="#F5C518" />
      <rect x="160" y="180" width="100" height="220" fill="#F5C518" />
      <rect x="195" y="140" width="30" height="40" fill="#F5C518" />
      <rect x="270" y="220" width="70" height="180" fill="#F5C518" />
      <rect x="350" y="160" width="120" height="240" fill="#F5C518" />
      <rect x="400" y="100" width="20" height="60" fill="#F5C518" />
      <rect x="480" y="230" width="90" height="170" fill="#F5C518" />
      <rect x="580" y="140" width="140" height="260" fill="#F5C518" />
      <rect x="635" y="80" width="30" height="60" fill="#F5C518" />
      <rect x="730" y="200" width="80" height="200" fill="#F5C518" />
      <rect x="820" y="170" width="110" height="230" fill="#F5C518" />
      <rect x="860" y="120" width="30" height="50" fill="#F5C518" />
      <rect x="940" y="240" width="70" height="160" fill="#F5C518" />
      <rect x="1020" y="180" width="100" height="220" fill="#F5C518" />
      <rect x="1130" y="210" width="80" height="190" fill="#F5C518" />
      <rect x="1220" y="160" width="120" height="240" fill="#F5C518" />
      <rect x="1270" y="110" width="20" height="50" fill="#F5C518" />
      <rect x="1350" y="230" width="90" height="170" fill="#F5C518" />
      {/* Windows */}
      {[...Array(30)].map((_, i) => (
        <rect
          key={i}
          x={Math.random() * 1400 + 10}
          y={Math.random() * 300 + 100}
          width="4"
          height="6"
          fill="rgba(245,197,24,0.6)"
        />
      ))}
    </svg>
  );
}

function FogLayer() {
  return (
    <>
      <motion.div
        className="absolute bottom-0 left-0 w-full h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(5,6,8,0.8) 0%, transparent 100%)',
        }}
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-32 left-0 w-full h-32 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 30% 50%, rgba(49,139,255,0.03) 0%, transparent 100%)',
        }}
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}
