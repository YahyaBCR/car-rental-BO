/**
 * Client Invoice History Page
 */

import React, { useState, useEffect } from 'react';
import { FaFileLines, FaDownload, FaCar } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { invoicesApi, type UserInvoice } from '../../services/api/invoicesApi';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { FlitCarColors } from '../../constants/colors';

const InvoiceHistoryPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [invoices, setInvoices] = useState<UserInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { formatPrice } = useCurrencyFormat();
  const limit = 10;

  const fetchInvoices = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await invoicesApi.getUserInvoices(page, limit);
      setInvoices(response.invoices);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / limit));
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Factures</h1>
          <p className="text-gray-600">Historique de vos factures de location</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3">
            <FaFileLines className="text-3xl" style={{ color: FlitCarColors.primary }} />
            <div>
              <p className="text-sm text-gray-600">Total des factures</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: FlitCarColors.primary }}></div>
            <p className="mt-4 text-gray-600">Chargement de vos factures...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaFileLines className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune facture</h3>
            <p className="text-gray-500">Vous n'avez pas encore de factures</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.booking_id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Invoice Number */}
                      <div className="flex items-center space-x-2 mb-3">
                        <FaFileLines style={{ color: FlitCarColors.primary }} />
                        <span className="font-semibold text-gray-900">
                          {invoice.invoice_number}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {formatDate(invoice.invoice_generated_at)}
                        </span>
                      </div>

                      {/* Car Info */}
                      <div className="flex items-center space-x-2 mb-3">
                        <FaCar className="text-gray-400" />
                        <span className="text-lg font-semibold text-gray-800">
                          {invoice.car_brand} {invoice.car_model}
                        </span>
                      </div>

                      {/* Rental Period */}
                      <div className="text-sm text-gray-600 mb-3">
                        <span>Période: </span>
                        <span className="font-medium">
                          {formatDate(invoice.start_date)} - {formatDate(invoice.end_date)}
                        </span>
                      </div>

                      {/* Owner Info */}
                      {invoice.owner_first_name && invoice.owner_last_name && (
                        <div className="text-sm text-gray-600">
                          <span>Propriétaire: </span>
                          <span className="font-medium">
                            {invoice.owner_first_name} {invoice.owner_last_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Section: Price & Actions */}
                    <div className="text-right ml-4">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Montant total</p>
                        <p className="text-2xl font-bold" style={{ color: FlitCarColors.primary }}>
                          {formatPrice(invoice.total_price)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownloadInvoice(invoice.booking_id)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                        style={{ backgroundColor: FlitCarColors.primary }}
                      >
                        <FaDownload />
                        <span>Télécharger</span>
                      </button>
                    </div>
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
                onClick={() => fetchInvoices(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => fetchInvoices(index + 1)}
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
                onClick={() => fetchInvoices(currentPage + 1)}
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

export default InvoiceHistoryPage;
