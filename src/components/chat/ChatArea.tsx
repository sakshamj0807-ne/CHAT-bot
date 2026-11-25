import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, PanelLeftOpen, ArrowLeft, Cpu, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import SystemStatus from '../ui/SystemStatus';
import BatLogo from '../ui/BatLogo';
import SettingsModal from '../ui/SettingsModal';
import { sendMessage, getApiHealth, type ApiHealth } from '../../lib/api';

interface ChatAreaProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function ChatArea({ sidebarOpen, onToggleSidebar }: ChatAreaProps) {
  const navigate = useNavigate();
  const {
    activeConversationId,
    getActiveConversation,
    addMessage,
    updateMessage,
    setIsGenerating,
    isGenerating,
    createConversation,
    selectedModel,
    demoMode,
  } = useChatStore();

  const abortRef = useRef<AbortController | null>(null);
  const conversation = getActiveConversation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);

  useEffect(() => {
    getApiHealth(true).then(setApiHealth).catch(() => {});
  }, []);

  // Auto-create conversation if none
  useEffect(() => {
    if (!activeConversationId) {
      createConversation();
    }
  }, [activeConversationId, createConversation]);

  // Abort active generation when switching conversations or starting a new chat
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, [activeConversationId]);

  const useDemo = demoMode || (apiHealth !== null && !apiHealth.hasApiKey);

  const handleSend = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
    }

    // Add user message
    addMessage(convId, {
      role: 'user',
      content,
      timestamp: new Date(),
    });

    // Add placeholder assistant message
    const assistantMsgId = addMessage(convId, {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    });

    setIsGenerating(true);
    abortRef.current = new AbortController();

    try {
      const conv = useChatStore
        .getState()
        .conversations.find((c) => c.id === convId);
      const history = (conv?.messages ?? []).filter(
        (m) => m.id !== assistantMsgId && !m.isStreaming && !m.isError
      );

      // Remove the just-added user message from history since sendMessage appends userMessage
      const priorHistory = history.slice(0, -1);

      let fullContent = '';
      await sendMessage(
        priorHistory,
        content,
        (chunk) => {
          fullContent += chunk;
          updateMessage(convId!, assistantMsgId, fullContent, { isStreaming: true });
        },
        abortRef.current.signal,
        { model: selectedModel, demoMode: useDemo }
      );

      if (fullContent) {
        updateMessage(convId!, assistantMsgId, fullContent, { isStreaming: false });
      } else {
        updateMessage(
          convId!,
          assistantMsgId,
          'No response was received from the AI engine. Please retry.',
          { isStreaming: false, isError: true }
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        const currentMsg = useChatStore
          .getState()
          .conversations.find((c) => c.id === convId)
          ?.messages.find((m) => m.id === assistantMsgId);
        updateMessage(
          convId!,
          assistantMsgId,
          currentMsg?.content || 'Generation stopped by user.',
          { isStreaming: false }
        );
      } else {
        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while contacting Groq AI.';
        updateMessage(convId!, assistantMsgId, message, {
          isStreaming: false,
          isError: true,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
  };

  const handleRegenerate = async (messageId: string) => {
    if (!activeConversationId || isGenerating) return;
    const convId = activeConversationId;
    const conv = getActiveConversation();
    if (!conv) return;

    const msgIndex = conv.messages.findIndex((m) => m.id === messageId);
    if (msgIndex < 1) return;

    const userMsg = conv.messages[msgIndex - 1];
    if (userMsg.role !== 'user') return;

    updateMessage(convId, messageId, '', { isStreaming: true, isError: false });
    setIsGenerating(true);
    abortRef.current = new AbortController();

    try {
      const priorHistory = conv.messages
        .slice(0, msgIndex - 1)
        .filter((m) => !m.isError && !m.isStreaming);

      let fullContent = '';
      await sendMessage(
        priorHistory,
        userMsg.content,
        (chunk) => {
          fullContent += chunk;
          updateMessage(convId, messageId, fullContent, { isStreaming: true });
        },
        abortRef.current.signal,
        { model: selectedModel, demoMode: useDemo }
      );

      if (fullContent) {
        updateMessage(convId, messageId, fullContent, { isStreaming: false });
      } else {
        updateMessage(convId, messageId, 'No response received. Please retry.', {
          isStreaming: false,
          isError: true,
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        updateMessage(convId, messageId, err.message, {
          isStreaming: false,
          isError: true,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const hasMessages = (conversation?.messages?.length ?? 0) > 0;
  const isLive = Boolean(apiHealth?.hasApiKey && apiHealth?.verified && !demoMode);

  return (
    <div className="flex flex-col h-full relative">
      {/* Top bar */}
      <div className="flex-shrink-0 glass-strong border-b border-white/[0.04] px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:text-batman-yellow hover:bg-gotham-charcoal transition-all flex-shrink-0"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <Menu size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <BatLogo size={22} />
            <span className="text-batman-yellow font-bold tracking-[0.15em] text-xs uppercase truncate max-w-[200px]">
              {conversation?.title || 'Dark Knight AI'}
            </span>
          </div>
        </div>

        <div className="hidden xl:block">
          <SystemStatus compact />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs tracking-wider font-mono ${
              isLive
                ? 'border-jade-green/25 bg-jade-green/10 text-jade-green hover:bg-jade-green/15'
                : useDemo
                ? 'border-batman-yellow/25 bg-batman-yellow/10 text-batman-yellow hover:bg-batman-yellow/15'
                : 'border-signal-red/25 bg-signal-red/10 text-signal-red hover:bg-signal-red/15'
            }`}
            title="AI Engine Configuration"
          >
            {isLive ? (
              <>
                <span className="status-dot-green animate-pulse" />
                <span className="hidden sm:inline">LIVE · GROQ · {selectedModel}</span>
                <span className="sm:hidden">LIVE</span>
              </>
            ) : useDemo ? (
              <>
                <Sparkles size={12} />
                <span>DEMO MODE</span>
              </>
            ) : (
              <>
                <AlertCircle size={12} />
                <span>API ERROR</span>
              </>
            )}
            <Cpu size={12} className="opacity-70" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 p-2 rounded-lg text-gray-600 hover:text-batman-yellow hover:bg-gotham-charcoal transition-all text-xs tracking-wider"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">HOME</span>
          </button>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConfigUpdated={setApiHealth}
      />

      {/* Chat content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {hasMessages ? (
            <MessageList
              key={activeConversationId}
              messages={conversation?.messages ?? []}
              isGenerating={isGenerating}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <WelcomeScreen key="welcome" onPromptSelect={handleSend} />
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 md:p-6">
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isGenerating={isGenerating}
          disabled={false}
        />
      </div>
    </div>
  );
}
