import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Paperclip, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

const SUGGESTED_PROMPTS = [
  'Explain quantum computing simply',
  'Help me build a React application',
  'Analyze a cybersecurity problem',
  'Write a Python web scraper',
  'Research dark matter physics',
  'Brainstorm a startup idea',
];

export default function ChatInput({ onSend, onStop, isGenerating, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = useCallback(() => {
    if (!text.trim() || isGenerating || disabled) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, isGenerating, disabled, onSend]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-3">
      {/* Suggested prompts */}
      <AnimatePresence>
        {showPrompts && !isGenerating && (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setText(p);
                  setShowPrompts(false);
                  textareaRef.current?.focus();
                }}
                className="text-xs px-3 py-1.5 rounded-full glass border border-white/[0.06] text-gray-400 hover:text-batman-yellow hover:border-batman-yellow/30 transition-all"
              >
                {p}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input box */}
      <div
        className="relative rounded-2xl transition-all duration-300"
        style={{
          background: 'rgba(21, 25, 34, 0.85)',
          backdropFilter: 'blur(16px)',
          border: isGenerating
            ? '1px solid rgba(245,197,24,0.25)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: isGenerating
            ? '0 0 20px rgba(245,197,24,0.08)'
            : '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Scanning line when generating */}
        {isGenerating && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,197,24,0.5), transparent)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <div className="flex items-end gap-3 p-3 pl-4">
          {/* Attachment */}
          <button
            className="flex-shrink-0 p-2 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/[0.04] transition-all mb-0.5"
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowPrompts(true)}
            placeholder="Ask anything, detective..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-gray-200 text-sm leading-relaxed placeholder-gray-600 min-h-[1.5rem] max-h-[200px] py-2"
          />

          {/* Voice */}
          <button
            className="flex-shrink-0 p-2 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/[0.04] transition-all mb-0.5"
            title="Voice input"
          >
            <Mic size={16} />
          </button>

          {/* Send / Stop */}
          <motion.button
            onClick={isGenerating ? onStop : handleSend}
            disabled={!isGenerating && (!text.trim() || disabled)}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 mb-0.5 ${
              isGenerating
                ? 'bg-signal-red/20 text-signal-red border border-signal-red/30 hover:bg-signal-red/30'
                : text.trim()
                ? 'bg-batman-yellow text-gotham-black hover:bg-batman-yellow-dim'
                : 'bg-gotham-charcoal text-gray-700 cursor-not-allowed'
            }`}
            whileTap={{ scale: 0.92 }}
            style={
              text.trim() && !isGenerating
                ? { boxShadow: '0 0 15px rgba(245,197,24,0.3)' }
                : {}
            }
          >
            {isGenerating ? <Square size={15} /> : <Send size={15} />}
          </motion.button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-700">
        Press <kbd className="px-1 py-0.5 rounded bg-gotham-charcoal text-gray-600 font-mono text-xs">Enter</kbd> to send,{' '}
        <kbd className="px-1 py-0.5 rounded bg-gotham-charcoal text-gray-600 font-mono text-xs">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
