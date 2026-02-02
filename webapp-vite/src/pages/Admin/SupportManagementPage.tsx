/**
 * Admin Support Management Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMagnifyingGlass, FaFilter, FaTicket, FaClock, FaCircleCheck, FaUser } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { supportApi, type Ticket, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from '../../services/api/supportApi';
import { FlitCarColors } from '../../constants/colors';

const SupportManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  useEffect(() => {
    loadStatistics();
    fetchTickets(1);
  }, [statusFilter, categoryFilter, priorityFilter]);

  const loadStatistics = async () => {
    try {
      const response = await supportApi.getStatistics();
      setStats(response.statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const fetchTickets = async (page: number = 1) => {
    try {
      setLoading(true);
      const filters: any = { search: searchTerm };
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;
      if (priorityFilter) filters.priority = priorityFilter;

      const response = await supportApi.getAllTickets(page, limit, filters);
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

  const handleSearch = () => {
    fetchTickets(1);
  };

  const handleTicketClick = (ticketId: string) => {
    navigate(`/admin/support/tickets/${ticketId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusCount = (status: string): number => {
    if (!stats?.byStatus) return 0;
    const stat = stats.byStatus.find((s: any) => s.status === status);
    return stat ? parseInt(stat.count) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion du Support</h1>
          <p className="text-gray-600">Gérer les tickets de support des utilisateurs</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tickets ouverts</p>
                  <p className="text-3xl font-bold text-green-600">{getStatusCount('open')}</p>
                </div>
                <FaTicket className="text-4xl text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">En cours</p>
                  <p className="text-3xl font-bold text-blue-600">{getStatusCount('in_progress')}</p>
                </div>
                <FaClock className="text-4xl text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Résolus</p>
                  <p className="text-3xl font-bold text-purple-600">{getStatusCount('resolved')}</p>
                </div>
                <FaCircleCheck className="text-4xl text-purple-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Temps réponse moyen</p>
                  <p className="text-3xl font-bold" style={{ color: FlitCarColors.primary }}>
                    {stats.avgResponseTimeHours > 0 ? `${stats.avgResponseTimeHours.toFixed(1)}h` : 'N/A'}
                  </p>
                </div>
                <FaUser className="text-4xl opacity-20" style={{ color: FlitCarColors.primary }} />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Rechercher par numéro, email, sujet..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                Rechercher
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <FaFilter className="text-gray-400" />
            <span className="font-semibold text-gray-700">Filtres</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Toutes les priorités</option>
                <option value="urgent">Urgente</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
              <p className="text-gray-600">Chargement des tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <FaTicket className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">Aucun ticket trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sujet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priorité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigné à
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => handleTicketClick(ticket.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getCategoryIcon(ticket.category)}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ticket.ticket_number}</p>
                              {ticket.reply_count !== undefined && ticket.reply_count > 0 && (
                                <p className="text-xs text-gray-500">{ticket.reply_count} réponse{ticket.reply_count > 1 ? 's' : ''}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {ticket.user_first_name} {ticket.user_last_name}
                            </p>
                            <p className="text-xs text-gray-500">{ticket.user_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getCategoryLabel(ticket.category)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 truncate max-w-xs">{ticket.subject}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: getStatusColor(ticket.status) }}
                          >
                            {getStatusLabel(ticket.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                          >
                            {getPriorityLabel(ticket.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ticket.assigned_first_name ? (
                            `${ticket.assigned_first_name} ${ticket.assigned_last_name}`
                          ) : (
                            <span className="text-gray-400 italic">Non assigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ticket.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => fetchTickets(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => fetchTickets(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage <span className="font-medium">{(currentPage - 1) * limit + 1}</span> à{' '}
                        <span className="font-medium">{Math.min(currentPage * limit, total)}</span> sur{' '}
                        <span className="font-medium">{total}</span> tickets
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => fetchTickets(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Précédent
                        </button>
                        {[...Array(Math.min(totalPages, 5))].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => fetchTickets(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-primary border-primary text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => fetchTickets(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Suivant
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportManagementPage;
