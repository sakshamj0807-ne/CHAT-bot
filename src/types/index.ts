export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
  isSaved?: boolean;
}

export interface SystemStatus {
  online: boolean;
  aiActive: boolean;
  securityStatus: 'protected' | 'warning' | 'breach';
  connectionStrength: number; // 0-100
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
}
