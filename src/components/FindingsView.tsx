import React, { useState, useEffect } from 'react';
import { Finding } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  ShieldAlert,
  Building,
  UserCheck,
  Calendar,
  Coins,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface FindingsViewProps {
  initialRiskFilter?: string;
  initialSearch?: string;
  onOpenNewFinding: () => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  initialRiskFilter,
  initialSearch,
  onOpenNewFinding,
}) => {
  const { canEditInspection, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [riskFilter, setRiskFilter] = useState(initialRiskFilter || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');

  // Active finding for detail drawer
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);

  // Inline delete confirm state (avoids window.confirm in iframe)
  const [deleteFindingId, setDeleteFindingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const res = await api.getFindings({
        risk_level: riskFilter,
        status: statusFilter,
        search: searchTerm,
      });
      setFindings(res);
    } catch (err: any) {
      console.error('Failed to load findings:', err);
      showToast('error', 'कैफियत सूची लोड हुन सकेन', err?.message || 'सर्भर त्रुटि।');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const res = await api.getFindings({
        risk_level: riskFilter,
        status: statusFilter,
        search: searchTerm,
      });
      setFindings(res);
    } catch (err: any) {
      console.error('Filter findings error:', err);
      showToast('error', 'खोज गर्न सकिएन', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNPR = (amount: number | string) => {
    return formatNepaliNumber(amount);
  };

  const confirmDeleteFinding = async () => {
    if (!deleteFindingId) return;
    try {
      setIsDeleting(true);
      await api.deleteFinding(deleteFindingId);
      setFindings((prev) => prev.filter((f) => f.id !== deleteFindingId));
      if (activeFinding?.id === deleteFindingId) setActiveFinding(null);
      showToast('success', 'कैफियत हटाइयो', 'अभिलेख सफलतापूर्वक हटाइएको छ।');
      setDeleteFindingId(null);
    } catch (err: any) {
      console.error('Failed to delete finding:', err);
      showToast('error', 'हटाउन सकिएन', err?.message || 'प्राविधिक समस्या उत्पन्न भयो।');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'अत्यन्त उच्च':
        return 'bg-red-50 text-red-800 border-red-200 font-bold';
      case 'उच्च':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
      case 'मध्यम':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      case 'न्यून':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

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
            <span className="text-[11px] font-medium text-slate-500">कानूनी विचलन तथा जोखिम अभिलेख</span>
          </div>
          <h3 className="text-base font-bold text-[#0f2c4d] tracking-tight mt-0.5">
            खरिद कैफियत तथा जोखिम व्यवस्थापन
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            निरीक्षणका क्रममा पहिचान गरिएका प्रक्रियागत त्रुटि, कानूनी विचलन तथा वित्तीय जोखिमहरूको केन्द्रीय अभिलेख
          </p>
        </div>

        {canEditInspection && (
          <button
            onClick={onOpenNewFinding}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>नयाँ कैफियत दर्ता गर्नुहोस्</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded border border-slate-200/90 shadow-xs space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="कैफियत शीर्षक, कोड, खरिद आयोजना वा कानूनी दफा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] focus:border-[#0f2c4d] bg-white transition-colors"
            />
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white"
            >
              <option value="">सबै जोखिम स्तर (All Risks)</option>
              <option value="अत्यन्त उच्च">अत्यन्त उच्च जोखिम (Critical)</option>
              <option value="उच्च">उच्च जोखिम (High)</option>
              <option value="मध्यम">मध्यम जोखिम (Medium)</option>
              <option value="न्यून">न्यून जोखिम (Low)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white"
            >
              <option value="">सबै अवस्था (All Status)</option>
              <option value="Open">खुला (Open)</option>
              <option value="Corrective Action Required">सुधार आवश्यक</option>
              <option value="Under Review">समीक्षा भैरहेको</option>
              <option value="Resolved">समाधान भएको</option>
              <option value="Closed">बन्द गरिएको</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            जम्मा कैफियत: <span className="font-semibold text-slate-800 tabular-nums">{formatNepaliNumber(findings.length)}</span> वटा
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setRiskFilter('');
                setStatusFilter('');
                loadFindings();
              }}
              className="px-2.5 py-1 text-slate-600 border border-slate-200 rounded text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              रिसेट
            </button>
            <button
              onClick={handleFilter}
              className="px-3.5 py-1 bg-[#0f2c4d] hover:bg-[#153e6c] text-white rounded text-xs font-semibold transition cursor-pointer"
            >
              फिल्टर लागू
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-[#991b1b] rounded-full" />
            <div className="mt-2 text-xs">कैफियतहरू लोड हुँदैछन्...</div>
          </div>
        ) : findings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            कुनै कैफियत फेला परेन। कृपया फिल्टर बदल्नुहोस् वा नयाँ दर्ता गर्नुहोस्।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3.5">कैफियत कोड</th>
                  <th className="py-2.5 px-3.5">कैफियत विषय र विवरण</th>
                  <th className="py-2.5 px-3.5">खरिद आयोजना / निकाय</th>
                  <th className="py-2.5 px-3.5">कानूनी दफा</th>
                  <th className="py-2.5 px-3.5">जोखिम स्तर</th>
                  <th className="py-2.5 px-3.5 text-right">आर्थिक प्रभाव (रु.)</th>
                  <th className="py-2.5 px-3.5">अवस्था</th>
                  <th className="py-2.5 px-3.5 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {findings.map((f) => {
                  return (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => setActiveFinding(f)}
                    >
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                        {f.finding_code}
                      </td>

                      <td className="py-2.5 px-3.5 max-w-sm">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {f.title}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {f.description}
                        </p>
                      </td>

                      <td className="py-2.5 px-3.5 max-w-xs">
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {f.procurement_title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {f.office_name}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 text-[#0f2c4d] font-medium max-w-[140px] truncate">
                        {f.legal_reference || '-'}
                      </td>

                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] border ${getRiskBadge(
                            f.risk_level
                          )}`}
                        >
                          {f.risk_level}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {Number(f.estimated_financial_impact) > 0
                          ? `रु. ${formatNPR(f.estimated_financial_impact)}`
                          : '-'}
                      </td>

                      <td className="py-2.5 px-3.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {f.status}
                        </span>
                      </td>

                      <td
                        className="py-2.5 px-3.5 text-right space-x-1 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setActiveFinding(f)}
                          className="px-2 py-0.5 text-slate-600 hover:text-[#0f2c4d] border border-slate-200 rounded text-xs hover:bg-slate-50 transition cursor-pointer"
                        >
                          हेर्नुहोस्
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteFindingId(f.id)}
                            className="p-1 text-slate-400 hover:text-red-700 rounded transition cursor-pointer"
                            title="हटाउनुहोस्"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Finding Modal / Drawer */}
      {activeFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden border border-slate-200 text-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold bg-[#991b1b] text-white px-2 py-0.5 rounded">
                    {activeFinding.finding_code}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] border ${getRiskBadge(
                      activeFinding.risk_level
                    )}`}
                  >
                    {activeFinding.risk_level} जोखिम
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                  {activeFinding.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveFinding(null)}
                className="w-7 h-7 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <h4 className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">
                  कैफियतको विस्तृत विवरण
                </h4>
                <p className="mt-1 text-slate-800 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 whitespace-pre-wrap">
                  {activeFinding.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px]">सम्बन्धित खरिद आयोजना:</span>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {activeFinding.procurement_title}
                  </div>
                  <div className="text-[10px] text-slate-500">{activeFinding.office_name}</div>
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px]">उल्लङ्घन भएको कानूनी व्यवस्था:</span>
                  <div className="font-bold text-[#0f2c4d] mt-0.5">
                    {activeFinding.legal_reference || 'उल्लेख नभएको'}
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px]">औंल्याइएको सम्भावित आर्थिक विचलन:</span>
                  <div className="font-bold font-mono text-red-700 text-sm mt-0.5 tabular-nums">
                    {Number(activeFinding.estimated_financial_impact) > 0
                      ? `रु. ${formatNPR(activeFinding.estimated_financial_impact)}`
                      : 'उल्लेख नभएको'}
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px]">जिम्मेवार निकाय तथा पदाधिकारी:</span>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {activeFinding.responsible_officer || activeFinding.responsible_office || '-'}
                  </div>
                </div>
              </div>

              {activeFinding.recommended_corrective_action && (
                <div className="p-3 rounded bg-amber-50/60 border border-amber-200">
                  <span className="font-bold text-amber-900 text-[11px] block">
                    सुझाव गरिएको सुधार/कारबाही:
                  </span>
                  <p className="text-amber-950 mt-0.5 leading-snug">
                    {activeFinding.recommended_corrective_action}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveFinding(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Delete Confirmation Modal */}
      {deleteFindingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-sm w-full p-5 shadow-xl border border-slate-200 text-xs space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>कैफियत हटाउने पुष्टि</span>
            </div>
            <p className="text-slate-600">
              के तपाईं यो कैफियत अभिलेख हटाउन निश्चित हुनुहुन्छ? यो कार्य पुनः फिर्ता गर्न सकिँदैन।
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteFindingId(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 border border-slate-200 rounded cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={confirmDeleteFinding}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'हटाउँदैछ...' : 'हटाउनुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
