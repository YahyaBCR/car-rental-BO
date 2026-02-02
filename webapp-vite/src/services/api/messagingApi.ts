/**
 * Messaging API Service
 */

import { apiClient } from '../apiClient';
import type {
  Message,
  Conversation,
  CreateConversationData,
  SendMessageData,
  ConversationResponse,
  ConversationsResponse,
  MessagesResponse,
  UnreadCountResponse,
} from '../../types/messaging.types';

export const messagingApi = {
  /**
   * Get or create a conversation for a booking
   */
  async getOrCreateConversation(data: CreateConversationData): Promise<Conversation> {
    const response = await apiClient.post<ConversationResponse>(
      '/api/messaging/conversations',
      data
    );
    return response.data.conversation;
  },

  /**
   * Get user's conversations
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<ConversationsResponse>(
      '/api/messaging/conversations'
    );
    return response.data.conversations;
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get<MessagesResponse>(
      `/api/messaging/conversations/${conversationId}/messages`
    );
    return response.data.messages;
  },

  /**
   * Send a message
   */
  async sendMessage(conversationId: string, data: SendMessageData): Promise<Message> {
    const response = await apiClient.post<{ success: boolean; message: Message }>(
      `/api/messaging/conversations/${conversationId}/messages`,
      data
    );
    return response.data.message;
  },

  /**
   * Get unread messages count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>(
      '/api/messaging/unread-count'
    );
    return response.data.unreadCount;
  },
};
