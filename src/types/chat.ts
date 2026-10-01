export interface ChatUserProfile {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar: string;
  senderRole: 'visitor' | 'admin';
  text: string;
  createdAt: string;
  readByAdmin?: boolean;
  readByVisitor?: boolean;
}

export interface CommunityMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  senderAvatar: string;
  senderRole: 'visitor' | 'admin';
  text: string;
  createdAt: string;
}
