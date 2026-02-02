/**
 * Support Chat Widget - Floating support button with quick chat
 */

import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaXmark, FaPaperPlane, FaTicket } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import supportApi from '../../services/api/supportApi';
import type { Ticket } from '../../services/api/supportApi';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';

const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadRecentTickets();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        const button = document.getElementById('support-chat-button');
        if (button && !button.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadRecentTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await supportApi.getUserTickets(1, 3);
      setRecentTickets(response.tickets);
    } catch (error) {
      console.error('Error loading recent tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleQuickTicket = async () => {
    if (!message.trim()) {
      toast.error('Veuillez saisir votre message');
      return;
    }

    try {
      setLoading(true);
      const ticketData = {
        category,
        subject: `Question rapide - ${getCategoryLabel(category)}`,
        description: message,
        priority: 'medium' as const
      };

      await supportApi.createTicket(ticketData);
      toast.success('Ticket créé avec succès ! Notre équipe vous répondra bientôt.');
      setMessage('');
      setCategory('other');
      loadRecentTickets();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticketId: string) => {
    setIsOpen(false);
    navigate(`/support/tickets/${ticketId}`);
  };

  const handleViewAllTickets = () => {
    setIsOpen(false);
    navigate('/support/tickets');
  };

  const getCategoryLabel = (cat: string): string => {
    const labels: Record<string, string> = {
      booking: 'Réservation',
      payment: 'Paiement',
      car: 'Véhicule',
      account: 'Compte',
      technical: 'Technique',
      other: 'Autre'
    };
    return labels[cat] || cat;
  };

  const getCategoryIcon = (cat: string): string => {
    const icons: Record<string, string> = {
      booking: '📅',
      payment: '💳',
      car: '🚗',
      account: '👤',
      technical: '⚙️',
      other: '❓'
    };
    return icons[cat] || '📋';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      open: '#10B981',
      in_progress: '#3B82F6',
      waiting_user: '#F59E0B',
      resolved: '#8B5CF6',
      closed: '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      open: 'Ouvert',
      in_progress: 'En cours',
      waiting_user: 'En attente',
      resolved: 'Résolu',
      closed: 'Fermé'
    };
    return labels[status] || status;
  };

  return (
    <>
      {/* Floating Button */}
      <button
        id="support-chat-button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 z-50"
        style={{ backgroundColor: FlitCarColors.primary }}
        aria-label="Support"
      >
        {isOpen ? (
          <FaXmark className="text-2xl" />
        ) : (
          <FaComments className="text-2xl" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col"
          style={{ maxHeight: '600px', height: '600px' }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 rounded-t-lg flex items-center justify-between"
            style={{ backgroundColor: FlitCarColors.primary }}
          >
            <div className="flex items-center space-x-2 text-white">
              <FaComments className="text-xl" />
              <h3 className="font-bold text-lg">Support FlitCar</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <FaXmark className="text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Recent Tickets Section */}
            {recentTickets.length > 0 && (
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-gray-700">Vos tickets récents</h4>
                  <button
                    onClick={handleViewAllTickets}
                    className="text-xs font-medium hover:underline"
                    style={{ color: FlitCarColors.primary }}
                  >
                    Voir tout
                  </button>
                </div>
                <div className="space-y-2">
                  {loadingTickets ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: FlitCarColors.primary }}></div>
                    </div>
                  ) : (
                    recentTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleViewTicket(ticket.id)}
                        className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                            <span className="text-xs font-semibold text-gray-600">{ticket.ticket_number}</span>
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: getStatusColor(ticket.status) }}
                          >
                            {getStatusLabel(ticket.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium line-clamp-1">{ticket.subject}</p>
                        {ticket.last_reply_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Dernière réponse: {new Date(ticket.last_reply_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Quick Message Section */}
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Créer un ticket rapide</h4>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-2">Catégorie</label>
                <div className="grid grid-cols-3 gap-2">
                  {['booking', 'payment', 'car', 'account', 'technical', 'other'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                        category === cat
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={category === cat ? { borderColor: FlitCarColors.primary } : {}}
                    >
                      <span className="text-xl mb-1">{getCategoryIcon(cat)}</span>
                      <span className="text-xs font-medium text-gray-700">{getCategoryLabel(cat)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-medium text-gray-600 mb-2">Votre message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre problème ou question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  style={{ minHeight: '120px' }}
                />
              </div>
            </div>

            {/* Footer - Send Button */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleQuickTicket}
                disabled={loading || !message.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    <span>Envoyer le ticket</span>
                  </>
                )}
              </button>
              <button
                onClick={handleViewAllTickets}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-2 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <FaTicket />
                <span className="text-sm">Voir tous mes tickets</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
