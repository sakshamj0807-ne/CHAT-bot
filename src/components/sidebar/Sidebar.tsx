import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Pin, Bookmark, Settings, User,
  MessageSquare, Trash2, Edit3, Check, X, ChevronDown, ChevronRight,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import type { Conversation } from '../../types';
import BatLogo from '../ui/BatLogo';
import SystemStatus from '../ui/SystemStatus';
import SettingsModal from '../ui/SettingsModal';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  onClose: () => void;
  onNewChat: () => void;
}

export default function Sidebar({ onClose, onNewChat }: SidebarProps) {
  const navigate = useNavigate();
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    deleteConversation,
    renameConversation,
    pinConversation,
    saveConversation,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  const [showStatus, setShowStatus] = useState(false);
  const [showPinned, setShowPinned] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinned = filtered.filter((c) => c.isPinned);
  const saved = filtered.filter((c) => c.isSaved && !c.isPinned);
  const recent = filtered.filter((c) => !c.isPinned && !c.isSaved);

  return (
    <div className="h-full flex flex-col glass-strong border-r border-white/[0.04]" style={{ width: 280 }}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BatLogo size={24} />
            <span className="text-batman-yellow font-bold tracking-[0.2em] text-xs uppercase">
              Dark Knight AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/[0.04] transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* New chat button */}
        <motion.button
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group"
          style={{
            background: 'rgba(245,197,24,0.08)',
            border: '1px solid rgba(245,197,24,0.15)',
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
        >
          <Plus size={15} className="text-batman-yellow group-hover:rotate-90 transition-transform" />
          <span className="text-batman-yellow tracking-wider text-xs uppercase font-semibold">New Investigation</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-white/[0.04]">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-gotham-charcoal/60 border border-white/[0.05] rounded-lg pl-8 pr-3 py-2 text-xs text-gray-300 placeholder-gray-700 outline-none focus:border-batman-yellow/20 transition-all"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto chat-scroll py-2">
        {/* Pinned */}
        {pinned.length > 0 && (
          <Section
            title="Pinned"
            icon={<Pin size={11} />}
            open={showPinned}
            onToggle={() => setShowPinned((v) => !v)}
            count={pinned.length}
          >
            {pinned.map((c) => (
              <ConvItem
                key={c.id}
                conv={c}
                active={c.id === activeConversationId}
                onSelect={setActiveConversation}
                onDelete={deleteConversation}
                onRename={renameConversation}
                onPin={pinConversation}
                onSave={saveConversation}
              />
            ))}
          </Section>
        )}

        {/* Saved */}
        {saved.length > 0 && (
          <Section
            title="Saved"
            icon={<Bookmark size={11} />}
            open={showSaved}
            onToggle={() => setShowSaved((v) => !v)}
            count={saved.length}
          >
            {saved.map((c) => (
              <ConvItem
                key={c.id}
                conv={c}
                active={c.id === activeConversationId}
                onSelect={setActiveConversation}
                onDelete={deleteConversation}
                onRename={renameConversation}
                onPin={pinConversation}
                onSave={saveConversation}
              />
            ))}
          </Section>
        )}

        {/* Recent */}
        <div className="px-3 py-2">
          <p className="text-xs text-gray-700 uppercase tracking-widest font-semibold mb-2 px-1">Recent</p>
          {recent.length === 0 && (
            <p className="text-xs text-gray-700 px-1 py-4 text-center">No conversations yet</p>
          )}
          {recent.map((c) => (
            <ConvItem
              key={c.id}
              conv={c}
              active={c.id === activeConversationId}
              onSelect={setActiveConversation}
              onDelete={deleteConversation}
              onRename={renameConversation}
              onPin={pinConversation}
              onSave={saveConversation}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.04] p-3 space-y-1">
        <button
          onClick={() => setShowStatus((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/[0.03] transition-all text-xs"
        >
          <span className="status-dot-green animate-pulse" />
          <span className="flex-1 text-left tracking-wider">SYSTEM STATUS</span>
          <ChevronDown size={11} className={`transition-transform ${showStatus ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {showStatus && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-1 pb-2">
                <SystemStatus />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-batman-yellow hover:bg-white/[0.03] transition-all text-xs"
        >
          <Settings size={13} />
          <span>API &amp; Settings</span>
        </button>

        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-batman-yellow hover:bg-batman-yellow/[0.05] transition-all text-xs"
        >
          <Home size={13} />
          <span>Back to Home</span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 px-3 py-2 mt-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-gotham-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F5C518, #C9A012)' }}
          >
            DK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-300 font-medium truncate">Detective</p>
            <p className="text-xs text-gray-700 truncate">Gotham City</p>
          </div>
          <User size={12} className="text-gray-700" />
        </div>
      </div>
    </div>
  );
}

function Section({
  title, icon, open, onToggle, count, children,
}: {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 py-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-1.5 px-1 py-1 text-gray-700 hover:text-gray-500 transition-colors"
      >
        {icon}
        <span className="text-xs uppercase tracking-widest font-semibold flex-1 text-left">{title}</span>
        <span className="text-xs bg-gotham-charcoal px-1.5 py-0.5 rounded">{count}</span>
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConvItem({
  conv, active, onSelect, onDelete, onRename, onPin, onSave,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onPin: (id: string) => void;
  onSave: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editTitle, setEditTitle] = useState(conv.title);
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditTitle(conv.title);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const confirmEdit = () => {
    if (editTitle.trim()) onRename(conv.id, editTitle.trim());
    setEditing(false);
  };

  const preview =
    conv.messages.length > 0
      ? conv.messages[conv.messages.length - 1].content.slice(0, 60)
      : 'No messages yet';

  return (
    <motion.div
      className={`relative group/item flex items-start gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 mb-0.5 ${
        active
          ? 'bg-batman-yellow/[0.08] border border-batman-yellow/15'
          : 'hover:bg-white/[0.03] border border-transparent'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setConfirmingDelete(false);
      }}
      onClick={() => !editing && !confirmingDelete && onSelect(conv.id)}
      whileHover={{ x: 1 }}
    >
      <MessageSquare
        size={13}
        className={`flex-shrink-0 mt-0.5 transition-colors ${active ? 'text-batman-yellow' : 'text-gray-700'}`}
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmEdit();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="flex-1 bg-gotham-charcoal border border-batman-yellow/30 rounded px-1.5 py-0.5 text-xs text-gray-200 outline-none"
              autoFocus
            />
            <button onClick={confirmEdit} className="text-jade-green hover:text-jade-green/80 p-0.5">
              <Check size={11} />
            </button>
            <button onClick={() => setEditing(false)} className="text-signal-red hover:text-signal-red/80 p-0.5">
              <X size={11} />
            </button>
          </div>
        ) : (
          <>
            <p className={`text-xs font-medium truncate ${active ? 'text-batman-yellow' : 'text-gray-300'}`}>
              {conv.title}
            </p>
            <p className="text-xs text-gray-700 truncate mt-0.5">{preview}</p>
            <p className="text-xs text-gray-800 mt-0.5 font-mono">
              {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
            </p>
          </>
        )}
      </div>

      {/* Action buttons */}
      {hover && !editing && (
        <div
          className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-gotham-dark/90 rounded-lg p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={startEdit}
            className="p-1 rounded text-gray-600 hover:text-gray-300 transition-colors"
            title="Rename"
          >
            <Edit3 size={10} />
          </button>
          <button
            onClick={() => onPin(conv.id)}
            className={`p-1 rounded transition-colors ${conv.isPinned ? 'text-batman-yellow' : 'text-gray-600 hover:text-gray-300'}`}
            title={conv.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={10} />
          </button>
          <button
            onClick={() => onSave(conv.id)}
            className={`p-1 rounded transition-colors ${conv.isSaved ? 'text-electric-blue' : 'text-gray-600 hover:text-gray-300'}`}
            title={conv.isSaved ? 'Unsave' : 'Save'}
          >
            <Bookmark size={10} />
          </button>
          {confirmingDelete ? (
            <>
              <button
                onClick={() => {
                  onDelete(conv.id);
                  setConfirmingDelete(false);
                }}
                className="p-1 rounded text-signal-red hover:bg-signal-red/15 transition-colors"
                title="Confirm delete"
              >
                <Check size={10} />
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="p-1 rounded text-gray-500 hover:text-gray-300 transition-colors"
                title="Cancel"
              >
                <X size={10} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="p-1 rounded text-gray-600 hover:text-signal-red transition-colors"
              title="Delete"
            >
              <Trash2 size={10} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
