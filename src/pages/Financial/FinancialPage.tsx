import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaChartLine, FaWallet } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import financialApi from '../../services/financialApi';
import { FlitCarColors } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const FinancialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'commissions' | 'payouts'>('transactions');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, [activeTab]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'transactions') {
        const data = await financialApi.getTransactions({ page: 1, limit: 20 });
        console.log('📊 [Financial] Transactions data:', data);
        setTransactions(data.data);
      } else if (activeTab === 'payouts') {
        const data = await financialApi.getPayouts();
        console.log('📊 [Financial] Payouts data:', data);
        setPayouts(data);
      }

      const reportsData = await financialApi.getFinancialReports();
      console.log('📊 [Financial] Reports data:', reportsData);
      setReports(reportsData);
    } catch (error) {
      console.error('❌ [Financial] Error loading financial data:', error);
      toast.error('Erreur lors du chargement des données financières');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Gestion Financière</h1>
          <p className="text-textSecondary mt-1">Vue d'ensemble des transactions, commissions et paiements</p>
        </div>

        {/* Summary Cards */}
        {reports && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Chiffre d'Affaires Brut</p>
                  <p className="text-3xl font-bold text-textPrimary">{formatCurrency(reports.totalRevenue)}</p>
                  <p className="text-xs text-textSecondary mt-2">Volume total des réservations</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: FlitCarColors.success + '20' }}>
                  <FaChartLine className="text-2xl" style={{ color: FlitCarColors.success }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Revenus FlitCar</p>
                  <p className="text-3xl font-bold text-textPrimary">{formatCurrency(reports.totalCommission)}</p>
                  <p className="text-xs text-textSecondary mt-2">
                    {reports.averageCommissionRate ? `Taux moyen: ${(reports.averageCommissionRate * 100).toFixed(1)}%` : 'Commissions plateforme'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: FlitCarColors.primary + '20' }}>
                  <FaDollarSign className="text-2xl" style={{ color: FlitCarColors.primary }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">À Payer aux Owners</p>
                  <p className="text-3xl font-bold text-textPrimary">{formatCurrency(reports.totalPayouts)}</p>
                  <p className="text-xs text-textSecondary mt-2">Montants dus aux propriétaires</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: FlitCarColors.warning + '20' }}>
                  <FaWallet className="text-2xl" style={{ color: FlitCarColors.warning }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-textSecondary hover:text-textPrimary'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'payouts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-textSecondary hover:text-textPrimary'
                }`}
              >
                Paiements Owners
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
                <p className="text-textSecondary">Chargement...</p>
              </div>
            ) : activeTab === 'transactions' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Voiture</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Commission</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-textSecondary">{formatDate(tx.created_at || tx.start_date)}</td>
                        <td className="px-4 py-3 text-sm text-textPrimary">{tx.car_name}</td>
                        <td className="px-4 py-3 text-sm text-textSecondary">{tx.client_name}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-textPrimary">{formatCurrency(tx.total_price)}</td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: FlitCarColors.primary }}>
                          {formatCurrency(tx.commission)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge badge-success">{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Réservations</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Revenus</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Commission</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">À Payer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payouts.map((payout: any) => (
                      <tr key={payout.ownerId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-textPrimary">{payout.ownerName}</p>
                            <p className="text-xs text-textSecondary">{payout.ownerEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-textSecondary">{payout.bookingsCount}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-textPrimary">{formatCurrency(payout.totalRevenue)}</td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: FlitCarColors.primary }}>
                          {formatCurrency(payout.commission)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold" style={{ color: FlitCarColors.success }}>
                          {formatCurrency(payout.ownerPayout)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinancialPage;
