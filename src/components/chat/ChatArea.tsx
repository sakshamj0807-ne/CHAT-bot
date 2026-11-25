import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, PanelLeftOpen, ArrowLeft, Key } from 'lucide-react';
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
    removeMessage,
    setIsGenerating,
    isGenerating,
    createConversation,
  } = useChatStore();

  const abortRef = useRef<AbortController | null>(null);
  const conversation = getActiveConversation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);

  useEffect(() => {
    getApiHealth().then(setApiHealth).catch(() => {});
  }, []);

  // Auto-create conversation if none
  useEffect(() => {
    if (!activeConversationId) {
      createConversation();
    }
  }, [activeConversationId, createConversation]);

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
      const conv = useChatStore.getState().getActiveConversation();
      const history = (conv?.messages ?? []).filter(
        (m) => m.id !== assistantMsgId && !m.isStreaming
      );

      let fullContent = '';
      await sendMessage(
        history,
        content,
        (chunk) => {
          fullContent += chunk;
          updateMessage(convId!, assistantMsgId, fullContent);
        },
        abortRef.current.signal
      );

      if (!fullContent) {
        updateMessage(convId!, assistantMsgId, 'I encountered an issue processing your request. Please try again.');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        updateMessage(convId!, assistantMsgId, '⚠️ Connection to the intelligence network was interrupted. Please check your API configuration and try again.');
      } else if (!(err instanceof Error)) {
        updateMessage(convId!, assistantMsgId, '⚠️ An unknown error occurred.');
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
    const conv = getActiveConversation();
    if (!conv) return;

    const msgIndex = conv.messages.findIndex((m) => m.id === messageId);
    if (msgIndex < 1) return;

    const userMsg = conv.messages[msgIndex - 1];
    if (userMsg.role !== 'user') return;

    // Reset assistant message
    updateMessage(activeConversationId, messageId, '');
    
    // Re-stream
    setIsGenerating(true);
    abortRef.current = new AbortController();

    try {
      const history = conv.messages.slice(0, msgIndex - 1);
      let fullContent = '';
      await sendMessage(
        history,
        userMsg.content,
        (chunk) => {
          fullContent += chunk;
          updateMessage(activeConversationId, messageId, fullContent);
        },
        abortRef.current.signal
      );
    } catch (err) {
      // silent
    } finally {
      setIsGenerating(false);
    }
  };

  const hasMessages = (conversation?.messages?.length ?? 0) > 0;

  return (
    <div className="flex flex-col h-full relative">
      {/* Top bar */}
      <div className="flex-shrink-0 glass-strong border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:text-batman-yellow hover:bg-gotham-charcoal transition-all"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <Menu size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div className="hidden md:flex items-center gap-2">
            <BatLogo size={22} />
            <span className="text-batman-yellow font-bold tracking-[0.15em] text-xs uppercase">
              {conversation?.title || 'Dark Knight AI'}
            </span>
          </div>
        </div>

        <div className="hidden lg:block">
          <SystemStatus compact />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs tracking-wider ${
              apiHealth?.hasApiKey
                ? 'border-jade-green/25 bg-jade-green/10 text-jade-green hover:bg-jade-green/15'
                : 'border-batman-yellow/25 bg-batman-yellow/10 text-batman-yellow hover:bg-batman-yellow/15'
            }`}
            title="Configure API Key"
          >
            <Key size={13} />
            <span className="hidden sm:inline">
              {apiHealth?.hasApiKey ? apiHealth.provider.toUpperCase() : 'API KEY'}
            </span>
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
