/**
 * Support Management Page - Admin Back-Office
 */

import React, { useState, useEffect } from 'react';
import { FaSearch, FaTicketAlt, FaFilter, FaClock, FaCheckCircle, FaUser, FaPaperPlane } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import supportApi, {
  type Ticket,
  type Admin,
  getStatusColor,
  getPriorityColor,
  getCategoryIcon,
  getCategoryLabel
} from '../../services/supportApi';
import { FlitCarColors } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadTickets();
    loadAdmins();
    loadStats();
  }, [page, statusFilter, categoryFilter, priorityFilter, assignedToFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (assignedToFilter) filters.assignedTo = assignedToFilter;
      if (search) filters.search = search;

      const response = await supportApi.getAllTickets(page, 20, filters);
      setTickets(response.tickets);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await supportApi.getAvailableAdmins();
      setAdmins(response.admins);
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await supportApi.getStatistics();
      setStats(response.statistics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTickets();
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await supportApi.updateTicketStatus(ticketId, newStatus);
      toast.success('Statut mis à jour');
      loadTickets();
      loadStats();
      if (selectedTicket?.id === ticketId) {
        loadTicketDetails(ticketId);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handlePriorityChange = async (ticketId: string, newPriority: string) => {
    try {
      await supportApi.updateTicketPriority(ticketId, newPriority);
      toast.success('Priorité mise à jour');
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        loadTicketDetails(ticketId);
      }
    } catch (error: any) {
      console.error('Error updating priority:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleAssignChange = async (ticketId: string, adminId: string) => {
    try {
      await supportApi.assignTicket(ticketId, adminId || null);
      toast.success(adminId ? 'Ticket assigné' : 'Ticket désassigné');
      loadTickets();
      loadStats();
      if (selectedTicket?.id === ticketId) {
        loadTicketDetails(ticketId);
      }
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation');
    }
  };

  const loadTicketDetails = async (ticketId: string) => {
    try {
      const response = await supportApi.getTicketDetails(ticketId);
      setSelectedTicket(response.ticket);
    } catch (error) {
      console.error('Error loading ticket details:', error);
      toast.error('Erreur lors du chargement du ticket');
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    loadTicketDetails(ticket.id);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }

    try {
      setSendingReply(true);
      await supportApi.addReply(selectedTicket.id, replyMessage, false);
      setReplyMessage('');
      toast.success('Réponse envoyée');
      loadTicketDetails(selectedTicket.id);
      loadTickets();
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusCount = (status: string): number => {
    if (!stats?.byStatus) return 0;
    const found = stats.byStatus.find((s: any) => s.status === status);
    return found ? parseInt(found.count) : 0;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Support</h1>
            <p className="text-textSecondary">Gestion des tickets de support</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Ouverts</p>
                  <p className="text-3xl font-bold" style={{ color: getStatusColor('open') }}>
                    {getStatusCount('open')}
                  </p>
                </div>
                <FaTicketAlt className="text-4xl opacity-20" style={{ color: getStatusColor('open') }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">En cours</p>
                  <p className="text-3xl font-bold" style={{ color: getStatusColor('in_progress') }}>
                    {getStatusCount('in_progress')}
                  </p>
                </div>
                <FaClock className="text-4xl opacity-20" style={{ color: getStatusColor('in_progress') }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Résolus</p>
                  <p className="text-3xl font-bold" style={{ color: getStatusColor('resolved') }}>
                    {getStatusCount('resolved')}
                  </p>
                </div>
                <FaCheckCircle className="text-4xl opacity-20" style={{ color: getStatusColor('resolved') }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Temps de réponse</p>
                  <p className="text-3xl font-bold text-textPrimary">
                    {stats.avgResponseTimeHours ? `${stats.avgResponseTimeHours.toFixed(1)}h` : '-'}
                  </p>
                </div>
                <FaClock className="text-4xl opacity-20" style={{ color: FlitCarColors.primary }} />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-textSecondary" />
            <span className="font-semibold text-textPrimary">Filtres</span>
          </div>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par numéro, sujet, client..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-white font-semibold hover:shadow-lg transition-shadow"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                Rechercher
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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
              <label className="block text-sm font-medium text-textSecondary mb-2">Catégorie</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
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
              <label className="block text-sm font-medium text-textSecondary mb-2">Priorité</label>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Toutes les priorités</option>
                <option value="urgent">Urgent</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">Assigné à</label>
              <select
                value={assignedToFilter}
                onChange={(e) => { setAssignedToFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Tous</option>
                <option value="unassigned">Non assigné</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.first_name} {admin.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-textPrimary">
              Tickets ({total})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: FlitCarColors.primary }}></div>
              <p className="mt-4 text-textSecondary">Chargement...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <FaTicketAlt className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-textSecondary">Aucun ticket trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Priorité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Assigné à
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Créé le
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getCategoryIcon(ticket.category)}</span>
                            <div>
                              <div className="text-sm font-semibold text-textPrimary">
                                {ticket.ticket_number}
                              </div>
                              <div className="text-sm text-textSecondary line-clamp-1">
                                {ticket.subject}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-textPrimary">
                            {ticket.user_first_name} {ticket.user_last_name}
                          </div>
                          <div className="text-sm text-textSecondary">{ticket.user_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-textPrimary">
                            {getCategoryLabel(ticket.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={ticket.priority}
                            onChange={(e) => handlePriorityChange(ticket.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded-full text-white border-0"
                            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                          >
                            <option value="low">Basse</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                            <option value="urgent">Urgente</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded-full text-white border-0"
                            style={{ backgroundColor: getStatusColor(ticket.status) }}
                          >
                            <option value="open">Ouvert</option>
                            <option value="in_progress">En cours</option>
                            <option value="waiting_user">En attente</option>
                            <option value="resolved">Résolu</option>
                            <option value="closed">Fermé</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={ticket.assigned_to || ''}
                            onChange={(e) => handleAssignChange(ticket.id, e.target.value)}
                            className="text-sm px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="">Non assigné</option>
                            {admins.map(admin => (
                              <option key={admin.id} value={admin.id}>
                                {admin.first_name} {admin.last_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          {formatDate(ticket.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewTicket(ticket)}
                            className="text-primary hover:text-primary-dark font-semibold"
                            style={{ color: FlitCarColors.primary }}
                          >
                            Voir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-textPrimary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-textSecondary">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-textPrimary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Ticket Details Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getCategoryIcon(selectedTicket.category)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-textPrimary">{selectedTicket.subject}</h2>
                    <p className="text-sm text-textSecondary">
                      {selectedTicket.ticket_number} • {getCategoryLabel(selectedTicket.category)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-textSecondary hover:text-textPrimary text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Original Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-textSecondary mb-2">Description:</p>
                  <p className="text-textPrimary whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-textSecondary mb-1">Client</p>
                    <p className="text-textPrimary font-medium">
                      {selectedTicket.user_first_name} {selectedTicket.user_last_name}
                    </p>
                    <p className="text-sm text-textSecondary">{selectedTicket.user_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-textSecondary mb-1">Créé le</p>
                    <p className="text-textPrimary">{formatDate(selectedTicket.created_at)}</p>
                  </div>
                </div>

                {/* Replies */}
                {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-textPrimary mb-4">Discussion</h3>
                    <div className="space-y-4">
                      {selectedTicket.replies.map((reply) => {
                        const isAdmin = reply.role === 'admin';
                        return (
                          <div
                            key={reply.id}
                            className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${isAdmin ? 'bg-primary bg-opacity-10' : 'bg-gray-100'} rounded-lg p-4`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <FaUser className={isAdmin ? 'text-primary' : 'text-gray-600'} />
                                <span className="font-semibold text-sm text-textPrimary">
                                  {reply.first_name} {reply.last_name}
                                  {isAdmin && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Support</span>}
                                </span>
                              </div>
                              <p className="text-textPrimary whitespace-pre-wrap mb-2">{reply.message}</p>
                              <p className="text-xs text-textSecondary">{formatDate(reply.created_at)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div className="border-t pt-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Écrivez votre réponse..."
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
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SupportPage;
