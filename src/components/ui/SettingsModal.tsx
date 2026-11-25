import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Eye, EyeOff, CheckCircle2, AlertCircle, Trash2, Sparkles } from 'lucide-react';
import { getApiHealth, saveApiConfig, type ApiHealth } from '../../lib/api';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onConfigUpdated?: (health: ApiHealth) => void;
}

const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile (Recommended)' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (Ultra Fast)' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
];

const OPENAI_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Recommended)' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
];

export default function SettingsModal({ open, onClose, onConfigUpdated }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<'groq' | 'openai'>('groq');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setFeedback(null);
    getApiHealth()
      .then((data) => {
        setHealth(data);
        if (data.provider === 'groq' || data.provider === 'openai') {
          setProvider(data.provider);
          setModel(data.model);
        }
      })
      .catch(() => {
        setHealth(null);
      });
  }, [open]);

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    const trimmed = value.trim();
    if (trimmed.startsWith('gsk_')) {
      setProvider('groq');
      if (!GROQ_MODELS.some((m) => m.id === model)) {
        setModel(GROQ_MODELS[0].id);
      }
    } else if (trimmed.startsWith('sk-')) {
      setProvider('openai');
      if (!OPENAI_MODELS.some((m) => m.id === model)) {
        setModel(OPENAI_MODELS[0].id);
      }
    }
  };

  const handleProviderChange = (next: 'groq' | 'openai') => {
    setProvider(next);
    setModel(next === 'groq' ? GROQ_MODELS[0].id : OPENAI_MODELS[0].id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setFeedback({ type: 'error', text: 'Please enter an API key first.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const updated = await saveApiConfig({
        apiKey: apiKey.trim(),
        provider,
        model,
      });
      setHealth(updated);
      setApiKey('');
      onConfigUpdated?.(updated);
      setFeedback({
        type: 'success',
        text: `Connected to ${updated.provider.toUpperCase()} (${updated.model}). Live AI is active.`,
      });
    } catch {
      setFeedback({
        type: 'error',
        text: 'Could not reach the backend server. Make sure `npm run server` is running.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await saveApiConfig({ clear: true });
      setHealth(updated);
      setApiKey('');
      onConfigUpdated?.(updated);
      setFeedback({
        type: 'success',
        text: 'API key cleared. Switched back to Demo Mode.',
      });
    } catch {
      setFeedback({
        type: 'error',
        text: 'Could not reach the backend server.',
      });
    } finally {
      setSaving(false);
    }
  };

  const models = provider === 'groq' ? GROQ_MODELS : OPENAI_MODELS;

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
                  <Key size={18} className="text-batman-yellow" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm tracking-wide">
                    AI Engine Configuration
                  </h3>
                  <p className="text-gray-500 text-xs">Connect your Groq or OpenAI API key</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current status */}
            <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-gotham-charcoal/70 border border-white/[0.05] flex items-center justify-between">
              <span className="text-xs text-gray-400">Current Mode</span>
              {health?.hasApiKey ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-jade-green">
                  <span className="status-dot-green animate-pulse" />
                  LIVE · {health.provider.toUpperCase()}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-batman-yellow">
                  <Sparkles size={12} />
                  DEMO MODE
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Provider */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['groq', 'openai'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleProviderChange(p)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium uppercase tracking-wider border transition-all ${
                        provider === p
                          ? 'bg-electric-blue/15 border-electric-blue/40 text-electric-blue'
                          : 'bg-gotham-charcoal/50 border-white/[0.05] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {p === 'groq' ? 'Groq (gsk_...)' : 'OpenAI (sk-...)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    placeholder={
                      health?.hasApiKey
                        ? '•••••••••••••••••••••••• (enter new key to replace)'
                        : provider === 'groq'
                        ? 'gsk_...'
                        : 'sk-...'
                    }
                    className="w-full bg-gotham-charcoal/80 border border-white/[0.08] focus:border-electric-blue/50 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono text-gray-200 placeholder-gray-600 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 mt-1.5">
                  Stored securely on your local Node.js server (.env), never exposed to browser storage.
                </p>
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-gotham-charcoal/80 border border-white/[0.08] focus:border-electric-blue/50 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none transition-all"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id} className="bg-gotham-dark text-gray-200">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                    feedback.type === 'success'
                      ? 'bg-jade-green/10 border border-jade-green/25 text-jade-green'
                      : 'bg-signal-red/10 border border-signal-red/25 text-signal-red'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-batman-yellow hover:bg-batman-yellow-dim text-gotham-black font-semibold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ boxShadow: '0 0 18px rgba(245, 197, 24, 0.25)' }}
                >
                  {saving ? 'Connecting...' : 'Save & Activate'}
                </button>
                {health?.hasApiKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={saving}
                    title="Clear API Key and switch to Demo Mode"
                    className="p-2.5 rounded-xl bg-signal-red/10 border border-signal-red/20 text-signal-red hover:bg-signal-red/20 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
