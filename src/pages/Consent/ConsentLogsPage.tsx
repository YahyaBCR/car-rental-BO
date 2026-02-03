/**
 * ConsentLogsPage - Back Office
 * Filterable table of consent events (proof) with CSV export
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaFileAlt, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { ConsentEvent } from '../../services/consentApi';
import consentApi from '../../services/consentApi';
import AdminLayout from '../../components/Layout/AdminLayout';
import ConsentNav from './ConsentNav';

const ConsentLogsPage: React.FC = () => {
  const [events, setEvents] = useState<ConsentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [actorType, setActorType] = useState('');
  const [eventType, setEventType] = useState('');
  const [country, setCountry] = useState('');
  const [locale, setLocale] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadEvents();
  }, [page, actorType, eventType, country, locale, startDate, endDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await consentApi.getEvents({
        actor_type: actorType || undefined,
        event_type: eventType || undefined,
        country: country || undefined,
        locale: locale || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        limit: 50,
      });
      setEvents(data.events || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await consentApi.exportEventsCsv({
        actor_type: actorType || undefined,
        event_type: eventType || undefined,
        country: country || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      toast.success('Export CSV t\u00e9l\u00e9charg\u00e9');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  const eventTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      given: 'bg-green-100 text-green-700',
      updated: 'bg-blue-100 text-blue-700',
      withdrawn: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>{type}</span>;
  };

  const actorBadge = (type: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-purple-100 text-purple-700',
      renter: 'bg-blue-100 text-blue-700',
      anonymous: 'bg-gray-100 text-gray-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>{type}</span>;
  };

  return (
    <AdminLayout>
    <div className="p-6">
      <ConsentNav />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaFileAlt className="text-2xl text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Logs Consentement</h1>
            <p className="text-sm text-gray-500">{total} Evenements</p>
          </div>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
          <FaDownload /> Export CSV (sans PII)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <select value={actorType} onChange={(e) => { setActorType(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Tous les acteurs</option>
            <option value="owner">Owner</option>
            <option value="renter">Renter</option>
            <option value="anonymous">Anonymous</option>
          </select>
          <select value={eventType} onChange={(e) => { setEventType(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Tous les types</option>
            <option value="given">Given</option>
            <option value="updated">Updated</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <input type="text" placeholder="Pays (ex: MA)" value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28" />
          <select value={locale} onChange={(e) => { setLocale(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Toutes langues</option>
            <option value="fr">FR</option>
            <option value="en">EN</option>
            <option value="ar">AR</option>
          </select>
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Acteur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Fonctionnels</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Analytics</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Marketing</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Pays</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Langue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Device</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Aucun \u00e9v\u00e9nement</td></tr>
              ) : events.map((event) => {
                const cats = typeof event.categories === 'string' ? JSON.parse(event.categories as any) : event.categories;
                return (
                  <tr key={event.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(event.created_at).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3">{actorBadge(event.actor_type)}</td>
                    <td className="px-4 py-3">{eventTypeBadge(event.event_type)}</td>
                    <td className="px-4 py-3 text-sm">{cats?.functional ? '\u2705' : '\u274c'}</td>
                    <td className="px-4 py-3 text-sm">{cats?.analytics ? '\u2705' : '\u274c'}</td>
                    <td className="px-4 py-3 text-sm">{cats?.marketing ? '\u2705' : '\u274c'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{event.country || '\u2014'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{event.locale || '\u2014'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{event.device_type || '\u2014'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30">
                <FaChevronLeft className="text-sm" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30">
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default ConsentLogsPage;
