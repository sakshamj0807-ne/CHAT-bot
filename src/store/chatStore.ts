import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Conversation, Message } from '../types';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  searchQuery: string;
  isGenerating: boolean;
  selectedModel: string;
  demoMode: boolean;

  // Actions
  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  pinConversation: (id: string) => void;
  saveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id'>) => string;
  updateMessage: (
    conversationId: string,
    messageId: string,
    content: string,
    options?: { isStreaming?: boolean; isError?: boolean }
  ) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  setSearchQuery: (q: string) => void;
  setIsGenerating: (v: boolean) => void;
  setSelectedModel: (model: string) => void;
  setDemoMode: (enabled: boolean) => void;
  getActiveConversation: () => Conversation | undefined;
  clearAllConversations: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      searchQuery: '',
      isGenerating: false,
      selectedModel: 'openai/gpt-oss-120b',
      demoMode: false,

      createConversation: () => {
        const id = uuidv4();
        const now = new Date();
        const newConv: Conversation = {
          id,
          title: 'New Investigation',
          messages: [],
          createdAt: now,
          updatedAt: now,
          isPinned: false,
          isSaved: false,
        };
        set((s) => ({
          conversations: [newConv, ...s.conversations],
          activeConversationId: id,
          isGenerating: false,
        }));
        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id, isGenerating: false }),

      deleteConversation: (id) =>
        set((s) => {
          const remaining = s.conversations.filter((c) => c.id !== id);
          return {
            conversations: remaining,
            activeConversationId:
              s.activeConversationId === id
                ? remaining[0]?.id ?? null
                : s.activeConversationId,
          };
        }),

      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: new Date() } : c
          ),
        })),

      pinConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          ),
        })),

      saveConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, isSaved: !c.isSaved } : c
          ),
        })),

      addMessage: (conversationId, message) => {
        const id = uuidv4();
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const shouldAutoTitle =
              message.role === 'user' &&
              c.messages.length === 0 &&
              c.title === 'New Investigation';
            const cleanTitle = message.content.replace(/\s+/g, ' ').trim();
            const nextTitle = shouldAutoTitle
              ? cleanTitle.slice(0, 40) + (cleanTitle.length > 40 ? '...' : '')
              : c.title;
            return {
              ...c,
              title: nextTitle,
              messages: [...c.messages, { ...message, id }],
              updatedAt: new Date(),
            };
          }),
        }));
        return id;
      },

      updateMessage: (conversationId, messageId, content, options) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId
                      ? {
                          ...m,
                          content,
                          isStreaming: options?.isStreaming ?? false,
                          isError: options?.isError ?? false,
                        }
                      : m
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        })),

      removeMessage: (conversationId, messageId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.filter((m) => m.id !== messageId),
                }
              : c
          ),
        })),

      setSearchQuery: (q) => set({ searchQuery: q }),
      setIsGenerating: (v) => set({ isGenerating: v }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setDemoMode: (enabled) => set({ demoMode: enabled }),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId);
      },

      clearAllConversations: () =>
        set({ conversations: [], activeConversationId: null }),
    }),
    {
      name: 'dark-knight-ai-chats',
      partialize: (s) => ({
        conversations: s.conversations,
        activeConversationId: s.activeConversationId,
        selectedModel: s.selectedModel,
        demoMode: s.demoMode,
      }),
    }
  )
);
