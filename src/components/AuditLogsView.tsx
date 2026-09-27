import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { api } from '../services/api';
import { formatNepaliNumber } from '../utils/numberFormat';
import { History, Shield, Clock, Search, Filter, ShieldCheck, User } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getAuditLogs();
      setLogs(res);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err?.message || 'अडिट लग लोड गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (log.username || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.entity_type || '').toLowerCase().includes(q) ||
      String(log.entity_id || '').includes(q) ||
      (log.ip_address || '').includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white px-5 py-3.5 rounded border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
              राष्ट्रिय सतर्कता केन्द्र
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-medium text-slate-500">सुरक्षा तथा प्रणाली अनुगमन</span>
          </div>
          <h3 className="text-base font-bold text-[#0f2c4d] tracking-tight mt-0.5">
            प्रणाली अडिट लग (System Audit Trail)
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            प्रणालीमा सम्पादित सम्पूर्ण खरिद दर्ता, चेकलिस्ट मूल्याङ्कन, कैफियत सिर्जना तथा प्रतिवेदन प्रमाणीकरणको सुरक्षा अभिलेख
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="प्रयोगकर्ता, कार्य वा इकाई खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white w-64"
            />
          </div>
          <button
            onClick={loadLogs}
            className="px-3 py-1.5 text-xs border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-medium cursor-pointer"
          >
            ताजा गर्नुहोस्
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-[#0f2c4d] border-t-transparent rounded-full" />
            <div className="mt-2 text-xs">अडिट लग लोड हुँदैछ...</div>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-700 text-xs">
            {error}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            हाल कुनै अडिट लग फेला परेन।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3.5">समय (Timestamp)</th>
                  <th className="py-2.5 px-3.5">प्रयोगकर्ता</th>
                  <th className="py-2.5 px-3.5">सम्पादित कार्य (Action)</th>
                  <th className="py-2.5 px-3.5">इकाई (Entity)</th>
                  <th className="py-2.5 px-3.5">रेकर्ड ID</th>
                  <th className="py-2.5 px-3.5 text-right">IP ठेगाना</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3.5 font-mono text-slate-600 text-[11px]">
                      {new Date(log.created_at).toLocaleString('ne-NP')}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.username || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="font-mono font-medium text-[#0f2c4d] bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700">
                      {log.entity_type}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px]">
                      {log.entity_id || '-'}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px] text-right">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
