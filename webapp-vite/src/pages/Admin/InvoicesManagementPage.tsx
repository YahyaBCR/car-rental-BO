/**
 * Admin Invoices Management Page
 */

import React, { useState, useEffect } from 'react';
import { FaMagnifyingGlass, FaDownload, FaRotate, FaFileLines } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { invoicesApi, type AdminInvoice } from '../../services/api/invoicesApi';
import { FlitCarColors } from '../../constants/colors';

const InvoicesManagementPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchInvoices = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const response = await invoicesApi.listAllInvoices(page, limit, search);
      setInvoices(response.invoices);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / limit));
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1, searchTerm);
  }, []);

  const handleSearch = () => {
    fetchInvoices(1, searchTerm);
  };

  const handleRegenerateInvoice = async (bookingId: string, invoiceNumber: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir régénérer la facture ${invoiceNumber} ?`)) {
      return;
    }

    try {
      setRegenerating(bookingId);
      await invoicesApi.regenerateInvoice(bookingId, false);
      toast.success('Facture régénérée avec succès');
      fetchInvoices(currentPage, searchTerm);
    } catch (error: any) {
      console.error('Error regenerating invoice:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la régénération');
    } finally {
      setRegenerating(null);
    }
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      // Pass current language for invoice translation
      await invoicesApi.downloadInvoice(bookingId, i18n.language);
      toast.success('Facture téléchargée avec succès');
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price: number, currency?: string) => {
    return `${price.toFixed(2)} ${currency || 'MAD'}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Factures</h1>
          <p className="text-gray-600">Gérer et régénérer les factures des réservations</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Rechercher par numéro de facture, email, ou voiture..."
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

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaFileLines className="text-3xl" style={{ color: FlitCarColors.primary }} />
              <div>
                <p className="text-sm text-gray-600">Total des factures</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des factures...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center">
              <FaFileLines className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">Aucune facture trouvée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Facture
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Propriétaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Véhicule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Période
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.booking_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {invoice.invoice_number}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {invoice.client_first_name} {invoice.client_last_name}
                            </p>
                            <p className="text-sm text-gray-500">{invoice.client_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {invoice.owner_first_name} {invoice.owner_last_name}
                            </p>
                            <p className="text-sm text-gray-500">{invoice.owner_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {invoice.car_brand} {invoice.car_model}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <p>{formatDate(invoice.start_date)}</p>
                            <p>{formatDate(invoice.end_date)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(invoice.total_price, invoice.payment_currency)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invoice.invoice_generated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownloadInvoice(invoice.booking_id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Télécharger"
                            >
                              <FaDownload />
                            </button>
                            <button
                              onClick={() => handleRegenerateInvoice(invoice.booking_id, invoice.invoice_number)}
                              disabled={regenerating === invoice.booking_id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Régénérer"
                            >
                              {regenerating === invoice.booking_id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <FaRotate />
                              )}
                            </button>
                          </div>
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
                      onClick={() => fetchInvoices(currentPage - 1, searchTerm)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => fetchInvoices(currentPage + 1, searchTerm)}
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
                        <span className="font-medium">{total}</span> résultats
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => fetchInvoices(currentPage - 1, searchTerm)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Précédent
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => fetchInvoices(index + 1, searchTerm)}
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
                          onClick={() => fetchInvoices(currentPage + 1, searchTerm)}
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

export default InvoicesManagementPage;
