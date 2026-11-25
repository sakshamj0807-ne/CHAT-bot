import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { getApiHealth, type ApiHealth } from '../../lib/api';
import { useChatStore } from '../../store/chatStore';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onConfigUpdated?: (health: ApiHealth) => void;
}

const DEFAULT_MODELS = [
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (Recommended)' },
  { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B (Fast)' },
  { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B' },
];

export default function SettingsModal({ open, onClose, onConfigUpdated }: SettingsModalProps) {
  const { selectedModel, setSelectedModel, demoMode, setDemoMode } = useChatStore();
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [testing, setTesting] = useState(false);

  const runConnectionTest = useCallback(async () => {
    setTesting(true);
    try {
      const data = await getApiHealth(true);
      setHealth(data);
      onConfigUpdated?.(data);
      if (data.verified && !data.supportedModels.some((m) => m.id === selectedModel)) {
        setSelectedModel(data.model || DEFAULT_MODELS[0].id);
      }
    } catch {
      setHealth({
        status: 'error',
        hasApiKey: false,
        verified: false,
        provider: 'demo',
        model: selectedModel,
        supportedModels: DEFAULT_MODELS,
        error: 'Backend server unreachable. Make sure the Node.js server is running.',
      });
    } finally {
      setTesting(false);
    }
  }, [onConfigUpdated, selectedModel, setSelectedModel]);

  useEffect(() => {
    if (!open) return;
    runConnectionTest();
  }, [open, runConnectionTest]);

  const models = health?.supportedModels?.length ? health.supportedModels : DEFAULT_MODELS;
  const isLive = Boolean(health?.hasApiKey && health?.verified && !demoMode);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md glass-strong rounded-2xl border border-white/[0.08] p-6 shadow-2xl relative"
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-batman-yellow/10 border border-batman-yellow/20 flex items-center justify-center">
                  <Cpu size={18} className="text-batman-yellow" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm tracking-wide">
                    AI Engine Configuration
                  </h3>
                  <p className="text-gray-500 text-xs">Groq Backend · Server-Side Credentials</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Connection Status Card */}
            <div className="mb-4 px-3.5 py-3 rounded-xl bg-gotham-charcoal/70 border border-white/[0.05] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Engine Status</span>
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-jade-green">
                    <span className="status-dot-green animate-pulse" />
                    LIVE · GROQ
                  </span>
                ) : demoMode || !health?.hasApiKey ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-batman-yellow">
                    <Sparkles size={12} />
                    DEMO MODE (SIMULATED)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-signal-red">
                    <AlertCircle size={12} />
                    CONNECTION ERROR
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Active Model</span>
                <span className="font-mono text-electric-blue">{selectedModel}</span>
              </div>
            </div>

            {/* Server Error / Info */}
            {health?.error && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl text-xs bg-signal-red/10 border border-signal-red/25 text-signal-red">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{health.error}</span>
              </div>
            )}

            {health?.verified && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl text-xs bg-jade-green/10 border border-jade-green/25 text-jade-green">
                <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                <span>Groq API connection verified. Responses are generated live.</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Groq Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-gotham-charcoal/80 border border-white/[0.08] focus:border-electric-blue/50 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none transition-all"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id} className="bg-gotham-dark text-gray-200">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Demo Mode Toggle */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gotham-charcoal/50 border border-white/[0.05]">
                <div>
                  <p className="text-xs text-gray-300 font-medium">Demo Mode</p>
                  <p className="text-[11px] text-gray-600">
                    Use simulated responses instead of live Groq AI
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoMode(!demoMode)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    demoMode ? 'bg-batman-yellow' : 'bg-gotham-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-gotham-black transition-transform ${
                      demoMode ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-gotham-charcoal/40 border border-white/[0.04] text-[11px] text-gray-500">
                <ShieldCheck size={14} className="text-jade-green flex-shrink-0 mt-0.5" />
                <span>
                  API keys are loaded strictly on the backend from{' '}
                  <code className="text-batman-yellow font-mono">.env</code> (
                  <code className="text-gray-300 font-mono">GROQ_API_KEY</code>) and never stored in browser storage.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={runConnectionTest}
                  disabled={testing}
                  className="flex-1 flex items-center justify-center gap-2 bg-batman-yellow hover:bg-batman-yellow-dim text-gotham-black font-semibold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ boxShadow: '0 0 18px rgba(245, 197, 24, 0.25)' }}
                >
                  <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
                  {testing ? 'Testing Groq...' : 'Test Groq Connection'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
