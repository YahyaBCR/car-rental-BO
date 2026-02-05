import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Layout/AdminLayout';
import settingsApi, { SystemSetting, GroupedSettings, BulkUpdateSetting } from '../../services/settingsApi';
import { FaSave, FaCog, FaCreditCard, FaBell, FaCalendar, FaPlane, FaClock, FaUserCheck, FaBullhorn, FaFileContract, FaServer, FaEnvelope, FaChartLine, FaDollarSign } from 'react-icons/fa';
import { FlitCarColors } from '../../utils/constants';
import CurrencySettings from './CurrencySettings';

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<BulkUpdateSetting[]>([]);

  const tabs = [
    { id: 'payment', label: 'Paiement', icon: <FaCreditCard /> },
    { id: 'commission', label: 'Commission', icon: <FaCog /> },
    { id: 'currency', label: 'Devises', icon: <FaDollarSign /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'booking', label: 'Réservation', icon: <FaCalendar /> },
    { id: 'airport', label: 'Aéroports', icon: <FaPlane /> },
    { id: 'availability', label: 'Disponibilité', icon: <FaClock /> },
    { id: 'verification', label: 'Vérification', icon: <FaUserCheck /> },
    { id: 'marketing', label: 'Marketing', icon: <FaBullhorn /> },
    { id: 'legal', label: 'Légal', icon: <FaFileContract /> },
    { id: 'system', label: 'Système', icon: <FaServer /> },
    { id: 'email', label: 'Email', icon: <FaEnvelope /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getAllSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    // Update local state
    setSettings(prev => ({
      ...prev,
      [category]: prev[category]?.map(s =>
        s.key === key ? { ...s, value } : s
      ) || [],
    }));

    // Track changes
    const changeIndex = pendingChanges.findIndex(c => c.category === category && c.key === key);
    if (changeIndex >= 0) {
      setPendingChanges(prev => {
        const updated = [...prev];
        updated[changeIndex] = { category, key, value };
        return updated;
      });
    } else {
      setPendingChanges(prev => [...prev, { category, key, value }]);
    }

    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    if (pendingChanges.length === 0) {
      toast.info('Aucune modification à sauvegarder');
      return;
    }

    try {
      setSaving(true);
      await settingsApi.bulkUpdateSettings(pendingChanges);
      toast.success(`${pendingChanges.length} paramètre(s) mis à jour avec succès`);
      setPendingChanges([]);
      setHasChanges(false);
      fetchSettings(); // Reload to get updated timestamps
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const { category, key, value, value_type, description } = setting;

    switch (value_type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <label className="block font-semibold text-textPrimary text-base">{description}</label>
              <p className="text-xs text-textSecondary mt-1">Clé: {key}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={value}
                onChange={(e) => handleSettingChange(category, key, e.target.checked)}
              />
              <div
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: value ? FlitCarColors.primary : undefined,
                  boxShadow: value ? `0 0 0 4px ${FlitCarColors.primary}20` : undefined
                }}
              ></div>
            </label>
          </div>
        );

      case 'number':
        return (
          <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <label className="block font-semibold text-textPrimary text-base mb-2">{description}</label>
            <p className="text-xs text-textSecondary mb-3">Clé: {key}</p>
            <input
              type="number"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
              style={{
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${FlitCarColors.primary}40`}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              value={value || ''}
              onChange={(e) => handleSettingChange(category, key, parseFloat(e.target.value))}
            />
          </div>
        );

      case 'json':
        return (
          <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <label className="block font-semibold text-textPrimary text-base mb-2">{description}</label>
            <p className="text-xs text-textSecondary mb-3">Clé: {key}</p>
            {renderJsonEditor(category, key, value)}
          </div>
        );

      case 'string':
      default:
        return (
          <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <label className="block font-semibold text-textPrimary text-base mb-2">{description}</label>
            <p className="text-xs text-textSecondary mb-3">Clé: {key}</p>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
              style={{
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${FlitCarColors.primary}40`}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              value={value || ''}
              onChange={(e) => handleSettingChange(category, key, e.target.value)}
            />
          </div>
        );
    }
  };

  const renderJsonEditor = (category: string, key: string, value: any) => {
    // Special rendering for specific JSON fields
    if (key === 'payment_methods') {
      return (
        <div className="space-y-2">
          {Object.entries(value || {}).map(([method, enabled]) => (
            <label key={method} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={enabled as boolean}
                onChange={(e) => handleSettingChange(category, key, {
                  ...value,
                  [method]: e.target.checked,
                })}
                className="rounded text-blue-600"
              />
              <span className="capitalize">{method}</span>
            </label>
          ))}
        </div>
      );
    }

    if (key === 'refund_policy') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Annulation &gt; 7 jours (%)</label>
            <input
              type="number"
              value={value?.more_than_7_days || 0}
              onChange={(e) => handleSettingChange(category, key, {
                ...value,
                more_than_7_days: parseInt(e.target.value),
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Annulation 3-7 jours (%)</label>
            <input
              type="number"
              value={value?.['3_to_7_days'] || 0}
              onChange={(e) => handleSettingChange(category, key, {
                ...value,
                '3_to_7_days': parseInt(e.target.value),
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Annulation &lt; 3 jours (%)</label>
            <input
              type="number"
              value={value?.less_than_3_days || 0}
              onChange={(e) => handleSettingChange(category, key, {
                ...value,
                less_than_3_days: parseInt(e.target.value),
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      );
    }

    if (key === 'by_category') {
      return (
        <div className="space-y-3">
          {Object.entries(value || {}).map(([cat, rate]) => (
            <div key={cat}>
              <label className="block text-sm text-gray-600 mb-1 capitalize">{cat}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.01"
                  value={(rate as number) * 100}
                  onChange={(e) => handleSettingChange(category, key, {
                    ...value,
                    [cat]: parseFloat(e.target.value) / 100,
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <span className="text-gray-600">%</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (key === 'age_by_category') {
      return (
        <div className="space-y-3">
          {Object.entries(value || {}).map(([cat, age]) => (
            <div key={cat}>
              <label className="block text-sm text-gray-600 mb-1 capitalize">{cat}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={age as number}
                  onChange={(e) => handleSettingChange(category, key, {
                    ...value,
                    [cat]: parseInt(e.target.value),
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <span className="text-gray-600">ans</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Default JSON editor (textarea)
    return (
      <textarea
        className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
        rows={5}
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            handleSettingChange(category, key, parsed);
          } catch (err) {
            // Invalid JSON, don't update
          }
        }}
      />
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
            <p className="text-textSecondary">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const currentSettings = settings[activeTab] || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">Paramètres Système</h1>
            <p className="text-textSecondary mt-1">Configurez les paramètres globaux de la plateforme</p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={!hasChanges || saving}
            className={`flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
              hasChanges && !saving
                ? 'text-white hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={{ backgroundColor: hasChanges && !saving ? FlitCarColors.primary : undefined }}
          >
            <FaSave />
            <span>{saving ? 'Sauvegarde...' : `Sauvegarder${hasChanges ? ` (${pendingChanges.length})` : ''}`}</span>
          </button>
        </div>

        {/* Info Banner */}
        {hasChanges && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Modifications non sauvegardées:</strong> Vous avez {pendingChanges.length} modification(s) en attente. N'oubliez pas de sauvegarder vos changements.
            </p>
          </div>
        )}

        {/* Tabs - Grid Layout */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
                }`}
                style={{ backgroundColor: activeTab === tab.id ? FlitCarColors.primary : undefined }}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-4">
          {activeTab === 'currency' ? (
            <CurrencySettings />
          ) : currentSettings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center text-gray-500">
                <FaCog className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>Aucun paramètre disponible pour cette catégorie</p>
              </div>
            </div>
          ) : (
            currentSettings.map((setting) => (
              <div key={setting.id}>{renderSettingInput(setting)}</div>
            ))
          )}
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Note:</strong> Les modifications sont sauvegardées en base de données et prennent effet immédiatement.
            Certains paramètres peuvent nécessiter un redémarrage du serveur (ex: configuration SMTP, clés API).
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
