import React, { useState, useEffect } from 'react';
import { Procurement, Office, FiscalYear } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  FolderGit2,
  Search,
  Filter,
  PlusCircle,
  Eye,
  FileCheck2,
  Building,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ProcurementsViewProps {
  onOpenNewModal: () => void;
  onStartInspection: (procurementId: number) => void;
}

export const ProcurementsView: React.FC<ProcurementsViewProps> = ({
  onOpenNewModal,
  onStartInspection,
}) => {
  const { canEditInspection } = useAuth();
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Selected for detailed modal
  const [activeProcurement, setActiveProcurement] = useState<Procurement | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [pRes, offRes, fyRes] = await Promise.all([
        api.getProcurements(),
        api.getOffices(),
        api.getFiscalYears(),
      ]);
      setProcurements(pRes);
      setOffices(offRes);
      setFiscalYears(fyRes);
    } catch (err) {
      console.error('Failed to load procurements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const res = await api.getProcurements({
        search: searchTerm,
        office_id: selectedOffice,
        procurement_type: selectedType,
        procurement_method: selectedMethod,
        current_status: selectedStatus,
      });
      setProcurements(res);
    } catch (err) {
      console.error('Filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id: number) => {
    try {
      setLoadingDetail(true);
      const proc = await api.getProcurement(id);
      setActiveProcurement(proc);
    } catch (err) {
      console.error('Failed to load procurement details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDocStatusChange = async (docId: number, status: string) => {
    if (!activeProcurement) return;
    try {
      await api.updateProcurementDoc(activeProcurement.id, docId, status);
      // update local state
      setActiveProcurement((prev) => {
        if (!prev || !prev.documents) return prev;
        return {
          ...prev,
          documents: prev.documents.map((d) =>
            d.id === docId ? { ...d, status: status as any } : d
          ),
        };
      });
    } catch (err) {
      console.error('Failed to update doc status:', err);
    }
  };

  const formatNPR = (amount: number | string) => {
    return formatNepaliNumber(amount);
  };

  return (
    <div className="space-y-4">
      {/* Header and Add button */}
      <div className="bg-white px-5 py-3.5 rounded border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
              राष्ट्रिय सतर्कता केन्द्र
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-medium text-slate-500">आयोजना अभिलेख तथा ट्र्याकिङ</span>
          </div>
          <h3 className="text-base font-bold text-[#0f2c4d] tracking-tight mt-0.5">
            सार्वजनिक खरिद आयोजनाहरूको केन्द्रीय अभिलेख
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            सार्वजनिक निकायहरूबाट दर्ता भएका खरिद योजनाहरू, लागत, सम्झौता तथा निरीक्षण प्रगति
          </p>
        </div>

        {canEditInspection && (
          <button
            onClick={onOpenNewModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0f2c4d] hover:bg-[#153e6c] text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>नयाँ खरिद दर्ता गर्नुहोस्</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded border border-slate-200/90 shadow-xs space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="खरिद शीर्षक, ठेक्का नम्बर, आपूर्तिकर्ता वा कोड..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0f2c4d] focus:border-[#0f2c4d] bg-white"
            />
          </div>

          {/* Office Filter */}
          <div>
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0f2c4d] bg-white"
            >
              <option value="">सबै कार्यालयहरू</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0f2c4d] bg-white"
            >
              <option value="">सबै खरिद प्रकार (All Types)</option>
              <option value="Works">निर्माण कार्य (Works)</option>
              <option value="Goods">मालसामान (Goods)</option>
              <option value="Consultancy Services">परामर्श सेवा (Consultancy)</option>
              <option value="Other Services">अन्य सेवा (Other Services)</option>
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0f2c4d] bg-white"
            >
              <option value="">सबै खरिद विधि (All Methods)</option>
              <option value="Open Competitive Bidding">खुला प्रतिस्पर्धा (Open Bidding)</option>
              <option value="Sealed Quotation">सिलबन्दी दरभाउपत्र (Sealed Quotation)</option>
              <option value="Direct Procurement">सोझै खरिद (Direct)</option>
              <option value="Consumer Committee">उपभोक्ता समिति (Consumer Committee)</option>
              <option value="Consultancy Selection">परामर्श सेवा छनोट</option>
              <option value="Special Circumstances">विशेष परिस्थिति / आकस्मिक खरिद</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            जम्मा नतिजा: <span className="font-semibold text-slate-800 tabular-nums">{formatNepaliNumber(procurements.length)}</span> आयोजनाहरू
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedOffice('');
                setSelectedType('');
                setSelectedMethod('');
                setSelectedStatus('');
                loadInitialData();
              }}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-xs transition cursor-pointer"
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
            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-[#0f2c4d] rounded-full" />
            <div className="mt-2 text-xs">खरिद आयोजनाहरू लोड हुँदैछन्...</div>
          </div>
        ) : procurements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            कुनै खरिद विवरण भेटिएन। कृपया नयाँ दर्ता गर्नुहोस् वा फिल्टर बदल्नुहोस्।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3.5">कोड / ठेक्का नं.</th>
                  <th className="py-2.5 px-3.5">खरिद शीर्षक</th>
                  <th className="py-2.5 px-3.5">सार्वजनिक निकाय / स्थान</th>
                  <th className="py-2.5 px-3.5">प्रकार र विधि</th>
                  <th className="py-2.5 px-3.5 text-right">सम्झौता रकम (रु.)</th>
                  <th className="py-2.5 px-3.5">निर्माण व्यवसायी/फर्म</th>
                  <th className="py-2.5 px-3.5 text-center">निरीक्षण स्थिति</th>
                  <th className="py-2.5 px-3.5 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {procurements.map((proc) => {
                  const hasInspection = !!proc.latest_inspection_id;
                  const inspectionStatus = proc.inspection_status || 'निरीक्षण बाँकी';
                  const completionPct = proc.completion_percentage || 0;

                  return (
                    <tr key={proc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3.5">
                        <div className="font-mono font-bold text-slate-900">
                          {proc.procurement_id_code}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]">
                          {proc.procurement_number}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 max-w-xs">
                        <div className="font-medium text-slate-900 leading-snug line-clamp-2">
                          {proc.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          आ.व.: <span className="font-semibold text-slate-700">{proc.fiscal_year_name || '२०८१/८२'}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <div className="font-medium text-slate-800">
                          {proc.office_name}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{proc.district_name || 'काठमाडौं'}, {proc.province_name}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <div className="font-medium text-slate-900">
                          {proc.procurement_type}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {proc.procurement_method}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                        <div className="font-semibold text-slate-900">
                          रु. {formatNPR(proc.contract_amount)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          अनुमान: रु. {formatNPR(proc.estimated_cost)}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 max-w-[140px] truncate text-slate-700">
                        {proc.contractor_name || '-'}
                      </td>

                      <td className="py-2.5 px-3.5 text-center">
                        {hasInspection ? (
                          <div>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                proc.inspection_status === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {inspectionStatus}
                            </span>
                            <div className="w-16 bg-slate-100 rounded-full h-1 mx-auto mt-1.5 overflow-hidden">
                              <div
                                className="bg-[#0f2c4d] h-1 rounded-full"
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono tabular-nums">
                              {formatNepaliNumber(completionPct)}% प्रगति
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            निरीक्षण हुन बाँकी
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => viewDetails(proc.id)}
                          className="px-2 py-1 text-slate-700 hover:text-[#0f2c4d] hover:bg-slate-100 border border-slate-200 rounded text-xs transition cursor-pointer"
                        >
                          विवरण
                        </button>
                        <button
                          onClick={() => onStartInspection(proc.id)}
                          className="px-2.5 py-1 bg-[#0f2c4d] hover:bg-[#153e6c] text-white rounded text-xs font-semibold transition cursor-pointer"
                        >
                          निरीक्षण
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Procurement Detailed Drawer / Modal */}
      {activeProcurement && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-[#0f2c4d] text-white px-2 py-0.5 rounded">
                    {activeProcurement.procurement_id_code}
                  </span>
                  <span className="text-xs font-medium text-slate-500 font-mono">
                    ठेक्का नं: {activeProcurement.procurement_number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeProcurement.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveProcurement(null)}
                className="w-7 h-7 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center font-bold transition cursor-pointer"
                title="बन्द गर्नुहोस्"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Basic Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 bg-slate-50 p-4 rounded border border-slate-200/90 text-xs">
                <div>
                  <span className="text-slate-500">सार्वजनिक निकाय:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{activeProcurement.office_name}</div>
                </div>
                <div>
                  <span className="text-slate-500">मन्त्रालय / विभाग:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{activeProcurement.ministry_name || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-500">प्रदेश तथा जिल्ला:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {activeProcurement.province_name}, {activeProcurement.district_name}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">खरिद प्रकार र विधि:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {activeProcurement.procurement_type} ({activeProcurement.procurement_method})
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">लागत अनुमान:</span>
                  <div className="font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
                    रु. {formatNPR(activeProcurement.estimated_cost)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">सम्झौता रकम:</span>
                  <div className="font-bold font-mono text-[#0f2c4d] mt-0.5 tabular-nums">
                    रु. {formatNPR(activeProcurement.contract_amount)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">निर्माण व्यवसायी/फर्म:</span>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {activeProcurement.contractor_name || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">खरिद अवस्था:</span>
                  <div className="font-bold text-emerald-800 mt-0.5">
                    {activeProcurement.current_status}
                  </div>
                </div>
              </div>

              {/* 19-Point Document Completeness Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                    <FileCheck2 className="w-4 h-4 text-[#0f2c4d]" />
                    <span>अनिवार्य खरिद कागजात रुजु सूची (Statutory File Checklist)</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    क्लिक गरी कागजात स्थिति अद्यावधिक गर्न सकिन्छ
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto border border-slate-200 rounded p-3 bg-white">
                  {activeProcurement.documents?.map((doc) => {
                    const isAvailable = doc.status === 'उपलब्ध';
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 rounded border border-slate-100 hover:bg-slate-50 text-xs transition"
                      >
                        <span className="text-slate-800 font-medium truncate pr-2">
                          {doc.document_title}
                        </span>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleDocStatusChange(doc.id, isAvailable ? 'उपलब्ध छैन' : 'उपलब्ध')}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center space-x-1 cursor-pointer ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                          >
                            {isAvailable ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>उपलब्ध</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-red-600" />
                                <span>उपलब्ध छैन</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setActiveProcurement(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-white transition cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => {
                  const id = activeProcurement.id;
                  setActiveProcurement(null);
                  onStartInspection(id);
                }}
                className="px-4 py-1.5 bg-[#0f2c4d] hover:bg-[#153e6c] text-white rounded text-xs font-semibold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <span>स्थलगत निरीक्षण सुरु / जारी राख्नुहोस्</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
