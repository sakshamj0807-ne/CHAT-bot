import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../sidebar/Sidebar';
import ChatArea from './ChatArea';
import { useChatStore } from '../../store/chatStore';

export default function ChatDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { activeConversationId, createConversation } = useChatStore();

  // Auto-create a conversation if none exists
  if (!activeConversationId) {
    // Will be triggered on render — we'll handle in useEffect in the child
  }

  return (
    <motion.div
      className="flex h-screen overflow-hidden bg-gotham-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0 overflow-hidden"
          >
            <Sidebar
              onClose={() => setSidebarOpen(false)}
              onNewChat={() => {
                createConversation();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
      </div>
    </motion.div>
  );
}
