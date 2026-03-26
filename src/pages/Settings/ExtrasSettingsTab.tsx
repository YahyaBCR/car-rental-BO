import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import extrasApi, { BookingExtra } from '../../services/extrasApi';
import { FlitCarColors } from '../../utils/constants';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const CATEGORIES = ['general', 'protection', 'equipment', 'comfort', 'navigation'];
const PRICING_TYPES = [
  { value: 'per_day', label: 'Par jour' },
  { value: 'fixed', label: 'Forfait fixe' },
];

const EMPTY_FORM: Partial<BookingExtra> = {
  name_fr: '', name_en: '', name_ar: '',
  description_fr: '', description_en: '', description_ar: '',
  icon: 'FaStar', category: 'general',
  price_mad: 0, pricing_type: 'per_day',
  max_quantity: 1, sort_order: 0, is_active: true,
};

export const ExtrasSettingsTab: React.FC = () => {
  const [extras, setExtras] = useState<BookingExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<BookingExtra>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchExtras(); }, []);

  const fetchExtras = async () => {
    try {
      setLoading(true);
      const data = await extrasApi.getAll();
      setExtras(data);
    } catch {
      toast.error('Erreur chargement des options');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (extra: BookingExtra) => {
    setForm({ ...extra });
    setEditingId(extra.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name_fr?.trim()) { toast.error('Le nom FR est obligatoire'); return; }
    if (form.price_mad == null || form.price_mad < 0) { toast.error('Prix invalide'); return; }
    try {
      setSaving(true);
      if (editingId) {
        await extrasApi.update(editingId, form);
        toast.success('Option mise à jour');
      } else {
        await extrasApi.create(form);
        toast.success('Option créée');
      }
      setShowForm(false);
      fetchExtras();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette option ?')) return;
    try {
      await extrasApi.delete(id);
      toast.success('Option supprimée');
      fetchExtras();
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const handleToggle = async (extra: BookingExtra) => {
    try {
      await extrasApi.update(extra.id, { is_active: !extra.is_active });
      fetchExtras();
    } catch {
      toast.error('Erreur');
    }
  };

  const f = (field: keyof BookingExtra, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Options supplémentaires</h2>
          <p className="text-xs text-gray-500 mt-0.5">Affiché sous forme de popup lors de la réservation</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg"
          style={{ backgroundColor: FlitCarColors.primary }}
        >
          <FaPlus className="w-3.5 h-3.5" />
          Nouvelle option
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-sm text-gray-700">{editingId ? 'Modifier l\'option' : 'Nouvelle option'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom (FR) *</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm" value={form.name_fr || ''} onChange={e => f('name_fr', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom (EN)</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm" value={form.name_en || ''} onChange={e => f('name_en', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom (AR)</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm" dir="rtl" value={form.name_ar || ''} onChange={e => f('name_ar', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description (FR)</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm" rows={2} value={form.description_fr || ''} onChange={e => f('description_fr', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description (EN)</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm" rows={2} value={form.description_en || ''} onChange={e => f('description_en', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description (AR)</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm" rows={2} dir="rtl" value={form.description_ar || ''} onChange={e => f('description_ar', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prix (MAD) *</label>
              <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded text-sm" value={form.price_mad ?? ''} onChange={e => f('price_mad', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tarification</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm" value={form.pricing_type || 'per_day'} onChange={e => f('pricing_type', e.target.value)}>
                {PRICING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Qté max</label>
              <input type="number" min="1" max="10" className="w-full px-3 py-2 border border-gray-300 rounded text-sm" value={form.max_quantity ?? 1} onChange={e => f('max_quantity', parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm" value={form.category || 'general'} onChange={e => f('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Icône (react-icons fa6)</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="FaUserPlus" value={form.icon || ''} onChange={e => f('icon', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ordre d'affichage</label>
              <input type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded text-sm" value={form.sort_order ?? 0} onChange={e => f('sort_order', parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white rounded disabled:opacity-50" style={{ backgroundColor: FlitCarColors.primary }}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>
      ) : extras.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-400 text-sm">
          Aucune option configurée. Créez la première.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prix</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Qté max</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actif</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {extras.map(extra => (
                <tr key={extra.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{extra.name_fr}</div>
                    <div className="text-xs text-gray-400">{extra.description_fr?.substring(0, 50)}{(extra.description_fr?.length || 0) > 50 ? '…' : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{extra.category}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{Number(extra.price_mad).toFixed(2)} MAD</td>
                  <td className="px-4 py-3 text-gray-600">{extra.pricing_type === 'per_day' ? 'Par jour' : 'Fixe'}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{extra.max_quantity}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(extra)} className="text-lg">
                      {extra.is_active
                        ? <FaToggleOn style={{ color: FlitCarColors.primary }} />
                        : <FaToggleOff className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(extra)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50"><FaEdit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(extra.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-red-50"><FaTrash className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExtrasSettingsTab;
