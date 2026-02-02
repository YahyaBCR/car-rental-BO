/**
 * Support Ticket Details Page - With Discussion
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaPaperPlane, FaXmark } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { supportApi, type Ticket, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from '../../services/api/supportApi';
import { FlitCarColors } from '../../constants/colors';

const TicketDetailsPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await supportApi.getTicketDetails(ticketId!);
      setTicket(response.ticket);
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      toast.error('Erreur lors du chargement du ticket');
      navigate('/support/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }

    try {
      setSendingReply(true);
      await supportApi.addReply(ticketId!, replyMessage);
      setReplyMessage('');
      toast.success('Réponse envoyée');
      fetchTicket(); // Refresh to show new reply
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error('Erreur lors de l\'envoi de la réponse');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir fermer ce ticket ?')) {
      return;
    }

    try {
      setClosingTicket(true);
      await supportApi.closeTicket(ticketId!);
      toast.success('Ticket fermé');
      fetchTicket();
    } catch (error: any) {
      console.error('Error closing ticket:', error);
      toast.error('Erreur lors de la fermeture du ticket');
    } finally {
      setClosingTicket(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heure${Math.floor(diffInHours) > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      booking: '📅',
      payment: '💳',
      car: '🚗',
      account: '👤',
      technical: '⚙️',
      other: '❓'
    };
    return icons[category] || '📋';
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      booking: 'Réservation',
      payment: 'Paiement',
      car: 'Véhicule',
      account: 'Compte',
      technical: 'Technique',
      other: 'Autre'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
          <p className="text-gray-600">Chargement du ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  const canClose = ticket.status !== 'closed' && ticket.status !== 'resolved';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/support/tickets')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>Retour aux tickets</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Discussion */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getCategoryIcon(ticket.category)}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {ticket.ticket_number} • {getCategoryLabel(ticket.category)} • Créé le {formatDate(ticket.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                  >
                    {getPriorityLabel(ticket.priority)}
                  </span>
                </div>
              </div>

              {/* Original Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {/* Booking Info if exists */}
              {ticket.booking_id && ticket.car_brand && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Réservation liée</p>
                  <p className="text-sm text-blue-800">
                    {ticket.car_brand} {ticket.car_model} • {ticket.booking_start_date && formatDate(ticket.booking_start_date)}
                  </p>
                </div>
              )}
            </div>

            {/* Discussion Thread */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Discussion</h2>

              {/* Replies */}
              <div className="space-y-4 mb-6">
                {ticket.replies && ticket.replies.length > 0 ? (
                  ticket.replies.map((reply) => {
                    const isAdmin = reply.role === 'admin';
                    return (
                      <div
                        key={reply.id}
                        className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] ${isAdmin ? 'bg-gray-100' : 'bg-primary bg-opacity-10'} rounded-lg p-4`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <FaUser className={isAdmin ? 'text-gray-600' : 'text-primary'} />
                            <span className="font-semibold text-sm text-gray-900">
                              {reply.first_name} {reply.last_name}
                              {isAdmin && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Support</span>}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap mb-2">{reply.message}</p>
                          <p className="text-xs text-gray-500">{formatDate(reply.created_at)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-8">Aucune réponse pour le moment</p>
                )}
              </div>

              {/* Reply Form */}
              {canClose && (
                <div className="border-t pt-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyMessage.trim()}
                      className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                      style={{ backgroundColor: FlitCarColors.primary }}
                    >
                      <FaPaperPlane />
                      <span>{sendingReply ? 'Envoi...' : 'Envoyer'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Info */}
          <div className="space-y-6">
            {/* Status Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Statut</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Priorité</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                  >
                    {getPriorityLabel(ticket.priority)}
                  </span>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Catégorie</p>
                  <p className="text-gray-900 font-medium">
                    {getCategoryIcon(ticket.category)} {getCategoryLabel(ticket.category)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Créé le</p>
                  <p className="text-gray-900">{formatDate(ticket.created_at)}</p>
                </div>

                {ticket.updated_at && ticket.updated_at !== ticket.created_at && (
                  <div>
                    <p className="text-gray-600 mb-1">Dernière mise à jour</p>
                    <p className="text-gray-900">{formatDate(ticket.updated_at)}</p>
                  </div>
                )}

                {ticket.assigned_first_name && (
                  <div>
                    <p className="text-gray-600 mb-1">Assigné à</p>
                    <p className="text-gray-900 font-medium">
                      {ticket.assigned_first_name} {ticket.assigned_last_name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {canClose && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                <button
                  onClick={handleCloseTicket}
                  disabled={closingTicket}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <FaXmark />
                  <span>{closingTicket ? 'Fermeture...' : 'Fermer le ticket'}</span>
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Fermez ce ticket si votre problème est résolu
                </p>
              </div>
            )}

            {/* Help */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">💡 Aide</h3>
              <p className="text-sm text-green-800">
                Notre équipe de support répond généralement dans les 24 heures. Vous recevrez une notification par email lors d'une nouvelle réponse.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
