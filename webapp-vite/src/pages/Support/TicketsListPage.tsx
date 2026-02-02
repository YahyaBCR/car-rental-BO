/**
 * Support Tickets List Page - Client/Owner
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTicket, FaFilter } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { supportApi, type Ticket, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from '../../services/api/supportApi';
import { FlitCarColors } from '../../constants/colors';

const TicketsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const limit = 10;

  const fetchTickets = async (page: number = 1) => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;

      const response = await supportApi.getUserTickets(page, limit, filters);
      setTickets(response.tickets);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [statusFilter, categoryFilter]);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/support/tickets/${ticketId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Support</h1>
            <p className="text-gray-600">Gérez vos demandes d'assistance</p>
          </div>
          <button
            onClick={() => navigate('/support/tickets/new')}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: FlitCarColors.primary }}
          >
            <FaPlus />
            <span>Nouveau ticket</span>
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3">
            <FaTicket className="text-3xl" style={{ color: FlitCarColors.primary }} />
            <div>
              <p className="text-sm text-gray-600">Total des tickets</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaFilter className="text-gray-400" />
            <span className="font-semibold text-gray-700">Filtres</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="waiting_user">En attente</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Toutes les catégories</option>
                <option value="booking">Réservation</option>
                <option value="payment">Paiement</option>
                <option value="car">Véhicule</option>
                <option value="account">Compte</option>
                <option value="technical">Technique</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: FlitCarColors.primary }}></div>
            <p className="mt-4 text-gray-600">Chargement des tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTicket className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun ticket</h3>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore créé de ticket de support</p>
            <button
              onClick={() => navigate('/support/tickets/new')}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              Créer un ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleTicketClick(ticket.id)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Ticket Number and Category */}
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
                      <div>
                        <span className="font-bold text-gray-900">{ticket.ticket_number}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{getCategoryLabel(ticket.category)}</span>
                      </div>
                    </div>

                    {/* Subject */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{ticket.subject}</h3>

                    {/* Description Preview */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>

                    {/* Meta Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Créé le {formatDate(ticket.created_at)}</span>
                      {ticket.reply_count !== undefined && ticket.reply_count > 0 && (
                        <>
                          <span>•</span>
                          <span>{ticket.reply_count} réponse{ticket.reply_count > 1 ? 's' : ''}</span>
                        </>
                      )}
                      {ticket.last_reply_at && (
                        <>
                          <span>•</span>
                          <span>Dernière réponse: {formatDate(ticket.last_reply_at)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status and Priority Badges */}
                  <div className="flex flex-col items-end space-y-2 ml-4">
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
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => fetchTickets(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => fetchTickets(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === index + 1
                      ? 'z-10 border-primary text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                  style={currentPage === index + 1 ? { backgroundColor: FlitCarColors.primary } : {}}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => fetchTickets(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsListPage;
