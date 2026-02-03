/**
 * ConsentConfigPage - Back Office
 * Manage cookie consent configuration: toggles, providers, TTL, banner texts, policy versions
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaCog, FaSave, FaHistory } from 'react-icons/fa';
import type { ConsentConfig } from '../../services/consentApi';
import consentApi from '../../services/consentApi';
import AdminLayout from '../../components/Layout/AdminLayout';
import ConsentNav from './ConsentNav';

const LANGUAGES = ['fr', 'en', 'ar'] as const;
const LANG_LABELS: Record<string, string> = { fr: 'Fran\u00e7ais', en: 'English', ar: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' };

const defaultBannerTexts: Record<string, any> = {
  fr: { title: '', description: '', acceptAll: 'Accepter tout', rejectAll: 'Refuser tout', customize: 'Personnaliser', save: 'Enregistrer mes choix', categories: { essential: { name: 'Essentiels', description: '' }, functional: { name: 'Fonctionnels', description: '' }, analytics: { name: 'Analytiques', description: '' }, marketing: { name: 'Marketing', description: '' } } },
  en: { title: '', description: '', acceptAll: 'Accept all', rejectAll: 'Reject all', customize: 'Customize', save: 'Save my choices', categories: { essential: { name: 'Essential', description: '' }, functional: { name: 'Functional', description: '' }, analytics: { name: 'Analytics', description: '' }, marketing: { name: 'Marketing', description: '' } } },
  ar: { title: '', description: '', acceptAll: '\u0642\u0628\u0648\u0644 \u0627\u0644\u0643\u0644', rejectAll: '\u0631\u0641\u0636 \u0627\u0644\u0643\u0644', customize: '\u062a\u062e\u0635\u064a\u0635', save: '\u062d\u0641\u0638 \u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a\u064a', categories: { essential: { name: '\u0623\u0633\u0627\u0633\u064a\u0629', description: '' }, functional: { name: '\u0648\u0638\u064a\u0641\u064a\u0629', description: '' }, analytics: { name: '\u062a\u062d\u0644\u064a\u0644\u064a\u0629', description: '' }, marketing: { name: '\u062a\u0633\u0648\u064a\u0642\u064a\u0629', description: '' } } },
};

const ConsentConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'history'>('config');
  const [langTab, setLangTab] = useState<string>('fr');

  // Form state
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [functionalEnabled, setFunctionalEnabled] = useState(true);
  const [analyticsProvider, setAnalyticsProvider] = useState('none');
  const [marketingProvider, setMarketingProvider] = useState('none');
  const [ttlFunctional, setTtlFunctional] = useState(365);
  const [ttlAnalytics, setTtlAnalytics] = useState(365);
  const [ttlMarketing, setTtlMarketing] = useState(365);
  const [bannerTexts, setBannerTexts] = useState<Record<string, any>>(defaultBannerTexts);
  const [cookiePolicyVersion, setCookiePolicyVersion] = useState('1.0');
  const [privacyPolicyVersion, setPrivacyPolicyVersion] = useState('1.0');

  // History
  const [configs, setConfigs] = useState<ConsentConfig[]>([]);
  const [currentVersion, setCurrentVersion] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activeConfig, allConfigs] = await Promise.all([
        consentApi.getActiveConfig().catch(() => null),
        consentApi.getConfigs(),
      ]);

      if (activeConfig) {
        setAnalyticsEnabled(activeConfig.analytics_enabled);
        setMarketingEnabled(activeConfig.marketing_enabled);
        setFunctionalEnabled(activeConfig.functional_enabled);
        setAnalyticsProvider(activeConfig.analytics_provider);
        setMarketingProvider(activeConfig.marketing_provider);
        setTtlFunctional(activeConfig.ttl_functional);
        setTtlAnalytics(activeConfig.ttl_analytics);
        setTtlMarketing(activeConfig.ttl_marketing);
        setBannerTexts(activeConfig.banner_texts || defaultBannerTexts);
        setCookiePolicyVersion(activeConfig.cookie_policy_version);
        setPrivacyPolicyVersion(activeConfig.privacy_policy_version);
        setCurrentVersion(activeConfig.version);
      }

      setConfigs(allConfigs.configs || []);
    } catch (error) {
      toast.error('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await consentApi.createConfig({
        analytics_enabled: analyticsEnabled,
        marketing_enabled: marketingEnabled,
        functional_enabled: functionalEnabled,
        analytics_provider: analyticsProvider,
        marketing_provider: marketingProvider,
        ttl_functional: ttlFunctional,
        ttl_analytics: ttlAnalytics,
        ttl_marketing: ttlMarketing,
        banner_texts: bannerTexts,
        cookie_policy_version: cookiePolicyVersion,
        privacy_policy_version: privacyPolicyVersion,
      } as any);
      toast.success('Configuration enregistr\u00e9e (nouvelle version cr\u00e9\u00e9e)');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const updateBannerText = (lang: string, field: string, value: string) => {
    setBannerTexts(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value }
    }));
  };

  const updateCategoryText = (lang: string, category: string, field: string, value: string) => {
    setBannerTexts(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        categories: {
          ...prev[lang]?.categories,
          [category]: { ...prev[lang]?.categories?.[category], [field]: value }
        }
      }
    }));
  };

  const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="font-medium text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
      </button>
    </div>
  );

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><div className="text-gray-500">Chargement...</div></div></AdminLayout>;
  }

  return (
    <AdminLayout>
    <div className="p-6">
      <ConsentNav />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaCog className="text-2xl text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuration Consentement</h1>
            <p className="text-sm text-gray-500">Version actuelle: {currentVersion}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'config' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Configuration
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <FaHistory className="inline mr-1" /> Historique
          </button>
        </div>
      </div>

      {activeTab === 'config' ? (
        <div className="space-y-6">
          {/* Categories Toggles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Catégories de cookies</h2>
            <Toggle checked={functionalEnabled} onChange={setFunctionalEnabled} label="Fonctionnels" />
            <Toggle checked={analyticsEnabled} onChange={setAnalyticsEnabled} label="Analytics" />
            <Toggle checked={marketingEnabled} onChange={setMarketingEnabled} label="Marketing" />
          </div>

          {/* Providers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fournisseurs</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Analytics Provider</label>
                <select value={analyticsProvider} onChange={(e) => setAnalyticsProvider(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="none">Aucun</option>
                  <option value="GA4">Google Analytics 4</option>
                  <option value="Matomo">Matomo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Provider</label>
                <select value={marketingProvider} onChange={(e) => setMarketingProvider(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="none">Aucun</option>
                  <option value="Meta">Meta Pixel</option>
                  <option value="Google Ads">Google Ads</option>
                </select>
              </div>
            </div>
          </div>

          {/* TTL */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Données (TTL en jours)</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonctionnels</label>
                <input type="number" value={ttlFunctional} onChange={(e) => setTtlFunctional(parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Analytics</label>
                <input type="number" value={ttlAnalytics} onChange={(e) => setTtlAnalytics(parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marketing</label>
                <input type="number" value={ttlMarketing} onChange={(e) => setTtlMarketing(parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
          </div>

          {/* Policy Versions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Versions légales</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version Politique Cookies</label>
                <input type="text" value={cookiePolicyVersion} onChange={(e) => setCookiePolicyVersion(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version Politique Confidentialit\u00e9</label>
                <input type="text" value={privacyPolicyVersion} onChange={(e) => setPrivacyPolicyVersion(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
          </div>

          {/* Banner Texts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Textes du bandeau</h2>
            <div className="flex gap-2 mb-4">
              {LANGUAGES.map((lang) => (
                <button key={lang} onClick={() => setLangTab(lang)} className={`px-4 py-2 rounded-lg text-sm font-medium ${langTab === lang ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {LANG_LABELS[lang]}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input type="text" value={bannerTexts[langTab]?.title || ''} onChange={(e) => updateBannerText(langTab, 'title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" dir={langTab === 'ar' ? 'rtl' : 'ltr'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={bannerTexts[langTab]?.description || ''} onChange={(e) => updateBannerText(langTab, 'description', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} dir={langTab === 'ar' ? 'rtl' : 'ltr'} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bouton Accepter</label>
                  <input type="text" value={bannerTexts[langTab]?.acceptAll || ''} onChange={(e) => updateBannerText(langTab, 'acceptAll', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" dir={langTab === 'ar' ? 'rtl' : 'ltr'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bouton Refuser</label>
                  <input type="text" value={bannerTexts[langTab]?.rejectAll || ''} onChange={(e) => updateBannerText(langTab, 'rejectAll', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" dir={langTab === 'ar' ? 'rtl' : 'ltr'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bouton Personnaliser</label>
                  <input type="text" value={bannerTexts[langTab]?.customize || ''} onChange={(e) => updateBannerText(langTab, 'customize', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" dir={langTab === 'ar' ? 'rtl' : 'ltr'} />
                </div>
              </div>

              <h3 className="font-medium text-gray-700 mt-4">Catégories</h3>
              {['essential', 'functional', 'analytics', 'marketing'].map((cat) => (
                <div key={cat} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{cat} - Nom</label>
                    <input type="text" value={bannerTexts[langTab]?.categories?.[cat]?.name || ''} onChange={(e) => updateCategoryText(langTab, cat, 'name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" dir={langTab === 'ar' ? 'rtl' : 'ltr'} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{cat} - Description</label>
                    <input type="text" value={bannerTexts[langTab]?.categories?.[cat]?.description || ''} onChange={(e) => updateCategoryText(langTab, cat, 'description', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" dir={langTab === 'ar' ? 'rtl' : 'ltr'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
              <FaSave /> {saving ? 'Enregistrement...' : 'Enregistrer (nouvelle version)'}
            </button>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Version</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Analytics</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Marketing</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Fonctionnels</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Cr\u00e9\u00e9 par</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id} className={`border-t ${config.is_active ? 'bg-green-50' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium">v{config.version}</td>
                  <td className="px-4 py-3 text-sm">{config.is_active ? '\u2705' : '\u2014'}</td>
                  <td className="px-4 py-3 text-sm">{config.analytics_enabled ? 'ON' : 'OFF'}</td>
                  <td className="px-4 py-3 text-sm">{config.marketing_enabled ? 'ON' : 'OFF'}</td>
                  <td className="px-4 py-3 text-sm">{config.functional_enabled ? 'ON' : 'OFF'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{config.created_by_email || '\u2014'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(config.created_at).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default ConsentConfigPage;
