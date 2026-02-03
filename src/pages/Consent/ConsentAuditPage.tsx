/**
 * ConsentAuditPage - Back Office
 * Admin action audit trail with before/after diff
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaHistory, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { AuditLog } from '../../services/consentApi';
import consentApi from '../../services/consentApi';
import AdminLayout from '../../components/Layout/AdminLayout';
import ConsentNav from './ConsentNav';

const ConsentAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadLogs();
  }, [page, entityType, startDate, endDate]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await consentApi.getAuditLogs({
        entity_type: entityType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        limit: 20,
      });
      setLogs(data.auditLogs || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'audit');
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (obj: any): string => {
    if (!obj) return 'null';
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <AdminLayout>
    <div className="p-6">
      <ConsentNav />
      <div className="flex items-center gap-3 mb-6">
        <FaHistory className="text-2xl text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Audit Back-Office</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <select value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Toutes les entitées</option>
            <option value="consent_config">Configuration</option>
          </select>
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Audit List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">Chargement...</div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">Aucune entrée d'audit</div>
        ) : logs.map((log) => (
          <div key={log.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 text-left"
            >
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-900">{log.action}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm text-gray-500">{log.entity_type}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">{log.admin_email || 'Unknown'}</div>
                  <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString('fr-FR')}</div>
                </div>
                {expandedId === log.id ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
              </div>
            </button>

            {expandedId === log.id && (
              <div className="border-t border-gray-200 px-5 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Avant</h4>
                    <pre className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-gray-700 overflow-auto max-h-60">{formatJson(log.before_state)}</pre>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Apr\u00e8s</h4>
                    <pre className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-gray-700 overflow-auto max-h-60">{formatJson(log.after_state)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} / {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 bg-white border">
              <FaChevronLeft className="text-sm" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 bg-white border">
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default ConsentAuditPage;
