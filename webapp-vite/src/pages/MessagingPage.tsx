/**
 * MessagingPage Component
 * Displays list of conversations for authenticated users
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';
import { messagingApi } from '../services/api/messagingApi';
import type { Conversation } from '../types/messaging.types';
import { useAppSelector } from '../hooks/useRedux';

const MessagingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagingApi.getConversations();
      setConversations(data);
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      setError('Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messaging/${conversationId}`);
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (user?.role === 'client') {
      return `${conversation.owner_first_name} ${conversation.owner_last_name}`;
    } else {
      return `${conversation.client_first_name} ${conversation.client_last_name}`;
    }
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    return `${conversation.brand} ${conversation.model}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-textSecondary hover:text-primary transition-colors"
              >
                <FaArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-textPrimary">Messages</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-textSecondary hover:text-primary transition-colors"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-textPrimary">Messages</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-textSecondary text-lg">Aucune conversation pour le moment</p>
            <p className="text-textSecondary mt-2">
              Les conversations apparaîtront ici après la confirmation de vos réservations
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-xl font-bold">
                      {user?.role === 'client'
                        ? conversation.owner_first_name?.charAt(0)
                        : conversation.client_first_name?.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-textPrimary font-semibold truncate">
                      {getConversationTitle(conversation)}
                    </h3>
                    <span className="text-xs text-textSecondary flex-shrink-0">
                      {formatDate(conversation.last_message_at)}
                    </span>
                  </div>

                  <p className="text-sm text-textSecondary mb-1 truncate">
                    {getConversationSubtitle(conversation)}
                  </p>

                  {conversation.last_message && (
                    <p className="text-sm text-textSecondary truncate">
                      {conversation.last_message}
                    </p>
                  )}
                </div>

                {/* Unread Badge */}
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <div className="flex-shrink-0">
                    <div className="bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
