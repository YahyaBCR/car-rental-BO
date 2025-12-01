/**
 * Currency Settings Page - Admin BO
 * Gestion des taux de change et marges
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ExchangeRate {
  id: string;
  currency: string;
  rate_to_mad: number;
  effective_date: string;
  is_active: boolean;
  notes: string;
  updated_by?: string;
}

interface RateHistory {
  id: string;
  currency: string;
  rate_to_mad: number;
  effective_date: string;
  is_active: boolean;
  notes: string;
  updated_by_name: string;
  created_at: string;
}

const CurrencySettings: React.FC = () => {
  const [rates, setRates] = useState<{ USD: number; EUR: number }>({ USD: 0, EUR: 0 });
  const [margin, setMargin] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<RateHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Form states
  const [usdRate, setUsdRate] = useState('');
  const [eurRate, setEurRate] = useState('');
  const [usdNotes, setUsdNotes] = useState('');
  const [eurNotes, setEurNotes] = useState('');
  const [newMargin, setNewMargin] = useState('');

  useEffect(() => {
    loadCurrentRates();
    loadHistory();
  }, []);

  const loadCurrentRates = async () => {
    try {
      const response = await axios.get(`${API_URL}/currency/rates`);
      setRates(response.data.rates);
      setMargin(response.data.margin);
      setUsdRate(response.data.rates.USD.toString());
      setEurRate(response.data.rates.EUR.toString());
      setNewMargin((response.data.margin * 100).toFixed(2)); // Convert to percentage
      setLoading(false);
    } catch (error) {
      console.error('Error loading rates:', error);
      toast.error('Erreur lors du chargement des taux');
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/currency/rates/history?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const updateRate = async (currency: 'USD' | 'EUR') => {
    try {
      const rate = currency === 'USD' ? parseFloat(usdRate) : parseFloat(eurRate);
      const notes = currency === 'USD' ? usdNotes : eurNotes;

      if (isNaN(rate) || rate <= 0) {
        toast.error('Le taux doit être un nombre positif');
        return;
      }

      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${API_URL}/currency/rates`,
        { currency, rate, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Taux ${currency} mis à jour avec succès`);

      // Clear notes
      if (currency === 'USD') setUsdNotes('');
      else setEurNotes('');

      // Reload data
      loadCurrentRates();
      loadHistory();
    } catch (error: any) {
      console.error('Error updating rate:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const updateMargin = async () => {
    try {
      const marginValue = parseFloat(newMargin) / 100; // Convert percentage to decimal

      if (isNaN(marginValue) || marginValue < 0) {
        toast.error('La marge doit être un nombre positif');
        return;
      }

      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${API_URL}/currency/margin`,
        { margin: marginValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Marge mise à jour avec succès');
      loadCurrentRates();
    } catch (error: any) {
      console.error('Error updating margin:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Rates Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🇺🇸</span>
            <div className="text-right">
              <div className="text-sm text-gray-600">USD → MAD</div>
              <div className="text-2xl font-bold text-blue-700">{rates.USD.toFixed(4)}</div>
              <div className="text-xs text-gray-500 mt-1">1 USD = {rates.USD} DH</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🇪🇺</span>
            <div className="text-right">
              <div className="text-sm text-gray-600">EUR → MAD</div>
              <div className="text-2xl font-bold text-green-700">{rates.EUR.toFixed(4)}</div>
              <div className="text-xs text-gray-500 mt-1">1 EUR = {rates.EUR} DH</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📊</span>
            <div className="text-right">
              <div className="text-sm text-gray-600">Marge</div>
              <div className="text-2xl font-bold text-purple-700">{(margin * 100).toFixed(2)}%</div>
              <div className="text-xs text-gray-500 mt-1">Commission sur change</div>
            </div>
          </div>
        </div>
      </div>

      {/* Update USD Rate */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-textPrimary mb-4 flex items-center">
          <span className="mr-2">🇺🇸</span>
          Mettre à jour le taux USD
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau taux (1 USD = ? MAD)
            </label>
            <input
              type="number"
              step="0.0001"
              value={usdRate}
              onChange={(e) => setUsdRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 10.1500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Actuel: 1 USD = {rates.USD} MAD
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <input
              type="text"
              value={usdNotes}
              onChange={(e) => setUsdNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Mise à jour hebdomadaire"
            />
          </div>
        </div>
        <button
          onClick={() => updateRate('USD')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Mettre à jour USD
        </button>
      </div>

      {/* Update EUR Rate */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-textPrimary mb-4 flex items-center">
          <span className="mr-2">🇪🇺</span>
          Mettre à jour le taux EUR
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau taux (1 EUR = ? MAD)
            </label>
            <input
              type="number"
              step="0.0001"
              value={eurRate}
              onChange={(e) => setEurRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 10.8900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Actuel: 1 EUR = {rates.EUR} MAD
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <input
              type="text"
              value={eurNotes}
              onChange={(e) => setEurNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Mise à jour hebdomadaire"
            />
          </div>
        </div>
        <button
          onClick={() => updateRate('EUR')}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Mettre à jour EUR
        </button>
      </div>

      {/* Update Margin */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-textPrimary mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Configurer la marge
        </h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marge sur taux de change (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={newMargin}
            onChange={(e) => setNewMargin(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: 0.50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Actuel: {(margin * 100).toFixed(2)}% • Recommandé: 0.3% à 1%
          </p>
          <p className="text-xs text-gray-600 mt-2">
            💡 Exemple: Avec 0.5% de marge sur USD (10.15), le taux effectif sera 10.20
          </p>
        </div>
        <button
          onClick={updateMargin}
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Mettre à jour la marge
        </button>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-textPrimary">Historique des modifications</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {showHistory ? 'Masquer' : 'Afficher'}
          </button>
        </div>

        {showHistory && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Devise
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Taux
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Modifié par
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className={item.is_active ? 'bg-green-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium">
                        {item.currency === 'USD' ? '🇺🇸 USD' : '🇪🇺 EUR'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono">
                      {item.rate_to_mad.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(item.effective_date).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {item.updated_by_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.notes || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Actif
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          Inactif
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informations importantes</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Les taux sont mis à jour immédiatement pour tous les utilisateurs</li>
          <li>• L'ancien taux est automatiquement désactivé lors de la mise à jour</li>
          <li>• Les réservations existantes gardent leur taux d'origine</li>
          <li>• La marge s'applique au taux pour calculer le prix client</li>
          <li>• Consultez les sites comme xe.com ou google.com/finance pour les taux réels</li>
        </ul>
      </div>
    </div>
  );
};

export default CurrencySettings;
