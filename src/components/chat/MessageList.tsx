import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isGenerating: boolean;
  onRegenerate: (messageId: string) => void;
}

export default function MessageList({ messages, isGenerating, onRegenerate }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastMsg = messages[messages.length - 1];
  const showTyping = isGenerating && lastMsg?.role === 'assistant' && !lastMsg.content;

  return (
    <motion.div
      className="h-full overflow-y-auto chat-scroll px-4 md:px-6 lg:px-12 py-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLast={i === messages.length - 1}
            onRegenerate={onRegenerate}
            isGenerating={isGenerating}
          />
        ))}
      </AnimatePresence>

      {showTyping && <TypingIndicator />}

      <div ref={bottomRef} className="h-4" />
    </motion.div>
  );
}
