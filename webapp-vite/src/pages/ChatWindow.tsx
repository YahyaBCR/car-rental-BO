/**
 * ChatWindow Component
 * Individual conversation chat interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaPaperPlane, FaCircleCheck } from 'react-icons/fa6';
import { messagingApi } from '../services/api/messagingApi';
import type { Message } from '../types/messaging.types';
import { useAppSelector } from '../hooks/useRedux';
import { FlitCarColors } from '../constants/colors';

const ChatWindow: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      if (!conversationId) return;

      const data = await messagingApi.getMessages(conversationId);
      setMessages(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      if (!messages.length) {
        setError(t('chat.loadMessagesError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversationId || sending) return;

    try {
      setSending(true);
      setError(null);

      await messagingApi.sendMessage(conversationId, {
        content: newMessage.trim()
      });

      setNewMessage('');
      await loadMessages();
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(t('chat.sendMessageError'));
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return `Hier ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getOtherUserName = () => {
    if (!messages.length) return '';

    const firstMessage = messages[0];
    if (firstMessage.sender_id === user?.id) {
      // Find a message from the other user
      const otherMessage = messages.find(m => m.sender_id !== user?.id);
      if (otherMessage) {
        return `${otherMessage.first_name} ${otherMessage.last_name}`;
      }
    }

    return `${firstMessage.first_name} ${firstMessage.last_name}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const otherUserName = getOtherUserName();
  const initials = otherUserName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 max-w-5xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/messaging')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: FlitCarColors.primary }}
            >
              <FaArrowLeft size={20} />
            </button>

            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
            >
              {initials}
            </div>

            <div className="flex-1">
              <h1 className="text-lg font-bold text-textPrimary">
                {otherUserName}
              </h1>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {t('chat.online')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(248,249,250,0.8) 100%)' }}>
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-4 shadow-sm">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-4">
                <FaPaperPlane size={40} style={{ color: FlitCarColors.primary }} />
              </div>
              <p className="text-textPrimary font-semibold text-lg">{t('chat.noMessages')}</p>
              <p className="text-textSecondary text-sm mt-2">
                {t('chat.startConversation')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === user?.id;
                const showDate = index === 0 ||
                  new Date(messages[index - 1].created_at).toDateString() !== new Date(message.created_at).toDateString();

                return (
                  <React.Fragment key={message.id}>
                    {/* Date Separator */}
                    {showDate && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-white px-4 py-1 rounded-full shadow-sm text-xs text-textSecondary font-medium">
                          {new Date(message.created_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                      </div>
                    )}

                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                      {/* Avatar for other user */}
                      {!isOwnMessage && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                        >
                          {message.first_name?.charAt(0)}{message.last_name?.charAt(0)}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md transition-all hover:shadow-lg ${
                          isOwnMessage
                            ? 'rounded-br-md'
                            : 'rounded-bl-md'
                        }`}
                        style={isOwnMessage ? {
                          background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})`,
                          color: 'white'
                        } : {
                          backgroundColor: 'white',
                          color: FlitCarColors.textPrimary
                        }}
                      >
                        {!isOwnMessage && (
                          <p className="text-xs font-bold mb-1" style={{ opacity: 0.8 }}>
                            {message.first_name} {message.last_name}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <span style={{ opacity: 0.7 }}>
                            {formatMessageTime(message.created_at)}
                          </span>
                          {isOwnMessage && (
                            <FaCircleCheck size={12} style={{ opacity: 0.7 }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t-2 shadow-2xl" style={{ borderTopColor: '#e5e7eb' }}>
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={t('chat.messagePlaceholder')}
                maxLength={2000}
                disabled={sending}
                rows={1}
                className="w-full px-5 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-all"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {newMessage.length}/2000
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 rounded-2xl text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})`,
                minHeight: '48px'
              }}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">{t('chat.sendingButton')}</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span className="hidden sm:inline">{t('chat.sendButton')}</span>
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {t('chat.sendInstructions')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
