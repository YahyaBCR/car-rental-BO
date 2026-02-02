/**
 * Messaging Types
 */

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Relations
  first_name?: string;
  last_name?: string;
}

export interface Conversation {
  id: string;
  booking_id: string;
  client_id: string;
  owner_id: string;
  last_message_at: string;
  created_at: string;
  // Relations
  owner_first_name?: string;
  owner_last_name?: string;
  owner_email?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  brand?: string;
  model?: string;
  booking_status?: string;
  last_message?: string;
  unread_count?: number;
}

export interface CreateConversationData {
  bookingId: string;
}

export interface SendMessageData {
  content: string;
}

export interface ConversationResponse {
  success: boolean;
  conversation: Conversation;
}

export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}
