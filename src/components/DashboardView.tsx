import React, { useEffect, useState } from 'react';
import { DashboardSummary } from '../types';
import { api } from '../services/api';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  ShieldAlert,
  AlertTriangle,
  FolderGit2,
  CheckCircle,
  Coins,
  TrendingUp,
  FileCheck2,
  Building2,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  X,
  BookOpen,
  EyeOff,
  Scale,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string, filter?: any) => void;
  onOpenNewProcurement: () => void;
  onOpenNewFinding: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewProcurement,
  onOpenNewFinding,
}) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideEmptyStages, setHideEmptyStages] = useState(false);
  const [showGuide, setShowGuide] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nvc_guide_dismissed') !== '1';
    } catch {
      return true;
    }
  });

  const dismissGuide = () => {
    setShowGuide(false);
    try {
      localStorage.setItem('nvc_guide_dismissed', '1');
    } catch {
      // ignore
    }
  };

  const restoreGuide = () => {
    setShowGuide(true);
    try {
      localStorage.removeItem('nvc_guide_dismissed');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNPR = (amount: number | string) => {
    return formatNepaliNumber(amount);
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-3">
        <div className="w-8 h-8 border-3 border-slate-300 border-t-[#0f2c4d] rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">अनुगमन तथा जोखिम तथ्याङ्क प्रशोधन हुँदैछ...</p>
      </div>
    );
  }

  const { kpis, compliance, risk, stages, provinces, alerts } = data;

  const sortedStages = [...stages].sort((a, b) => {
    const diff = (Number(b.findings_count) || 0) - (Number(a.findings_count) || 0);
    return diff !== 0 ? diff : a.stage_number - b.stage_number;
  });
  const zeroStageCount = sortedStages.filter((s) => !(Number(s.findings_count) > 0)).length;
  const visibleStages = hideEmptyStages
    ? sortedStages.filter((s) => Number(s.findings_count) > 0)
    : sortedStages;
  const maxFindings = Math.max(...stages.map((s) => Number(s.findings_count) || 0), 1);

  const totalComplianceEvaluated = compliance.reduce((acc, c) => acc + (Number(c.count) || 0), 0) || 1;

  return (
    <div className="space-y-4">
      {/* Top Institutional Header Bar */}
      <div className="bg-white px-5 py-3.5 rounded border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
              राष्ट्रिय सतर्कता केन्द्र
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-medium text-slate-500">
              सार्वजनिक खरिद ऐन, २०६३ तथा नियमावली, २०६४
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0f2c4d] tracking-tight mt-0.5">
            खरिद प्रक्रिया तथा जोखिम अनुगमन ड्यासबोर्ड
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            कुल <span className="font-semibold text-slate-800 tabular-nums">{formatNepaliNumber(kpis.total_checklist_stages)}</span> खरिद चरण र{' '}
            <span className="font-semibold text-slate-800 tabular-nums">{formatNepaliNumber(kpis.total_checklist_items)}</span> अनिवार्य परिपालना सूचकहरूको नियमित निगरानी
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenNewProcurement}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded bg-[#0f2c4d] text-white hover:bg-[#153e6c] text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>नयाँ खरिद दर्ता</span>
          </button>
          <button
            onClick={onOpenNewFinding}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded bg-[#991b1b] text-white hover:bg-[#b91c1c] text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>कैफियत प्रविष्टि</span>
          </button>
        </div>
      </div>

      {/* Guide Banner */}
      {showGuide ? (
        <div className="relative bg-slate-50 border border-slate-200/90 p-3.5 rounded shadow-xs">
          <button
            onClick={dismissGuide}
            className="absolute top-2.5 right-2.5 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
            title="मार्गदर्शन लुकाउनुहोस्"
            aria-label="मार्गदर्शन लुकाउनुहोस्"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start space-x-3 pr-8">
            <div className="w-7 h-7 rounded bg-[#0f2c4d]/10 text-[#0f2c4d] flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900">
                अनुगमन कार्यप्रणाली संक्षिप्त मार्गनिर्देशन ({formatNepaliNumber(kpis.total_checklist_stages)} चरण र {formatNepaliNumber(kpis.total_checklist_items)} कानूनी बुँदाहरू)
              </div>
              <div className="mt-1.5 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-800">१.</span>
                  <span>खरिद आयोजना दर्ता गरी सम्झौता तथा कागजात विवरण प्रविष्ट गर्नुहोस्</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-800">२.</span>
                  <span>३४-चरण म्याट्रिक्समा गई चरणगत चेकलिस्ट बुँदाहरू परिपालना जाँच गर्नुहोस्</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-800">३.</span>
                  <span>त्रुटि वा विचलन भेटिएमा जोखिम वर्गीकरणसहित कैफियत अभिलेख गर्नुहोस्</span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <button
                  onClick={() => onNavigate('procurements')}
                  className="text-xs font-semibold text-[#0f2c4d] hover:underline"
                >
                  खरिद आयोजना सूची →
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => onNavigate('inspections')}
                  className="text-xs font-semibold text-[#0f2c4d] hover:underline"
                >
                  विश्लेषण सुरु गर्नुहोस् →
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => onNavigate('master-checklist')}
                  className="text-xs font-semibold text-[#0f2c4d] hover:underline"
                >
                  मापदण्ड चेकलिस्ट →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={restoreGuide}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>कार्यप्रणाली मार्गदर्शन देखाउनुहोस्</span>
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Procurements */}
        <div
          onClick={() => onNavigate('procurements')}
          className="bg-white p-4 rounded border border-slate-200/90 hover:border-slate-400 hover:shadow-xs cursor-pointer transition relative"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>कुल खरिद आयोजनाहरू</span>
            <FolderGit2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatNepaliNumber(kpis.total_procurements)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>सम्झौता रकम:</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              रु. {formatNPR(kpis.total_contract_volume)}
            </span>
          </div>
        </div>

        {/* Card 2: Active Inspections */}
        <div
          onClick={() => onNavigate('inspections')}
          className="bg-white p-4 rounded border border-slate-200/90 hover:border-slate-400 hover:shadow-xs cursor-pointer transition relative"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>सक्रिय खरिद विश्लेषण</span>
            <FileCheck2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatNepaliNumber(kpis.in_progress_inspections)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>सम्पन्न/प्रमाणित:</span>
            <span className="font-semibold text-emerald-700 tabular-nums">
              {formatNepaliNumber(kpis.verified_inspections)} / {formatNepaliNumber(kpis.total_inspections)}
            </span>
          </div>
        </div>

        {/* Card 3: High & Critical Risk Findings */}
        <div
          onClick={() => onNavigate('findings', { risk_level: 'उच्च' })}
          className="bg-white p-4 rounded border border-slate-200/90 hover:border-red-300 hover:shadow-xs cursor-pointer transition relative"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="text-red-800 font-semibold">उच्च तथा गम्भीर कैफियत</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-700 tabular-nums">
            {formatNepaliNumber(kpis.high_critical_findings)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>कुल कैफियत संख्या:</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {formatNepaliNumber(kpis.total_findings)} (खुला: {formatNepaliNumber(kpis.open_findings)})
            </span>
          </div>
        </div>

        {/* Card 4: Financial Irregularity Exposure */}
        <div
          onClick={() => onNavigate('findings')}
          className="bg-white p-4 rounded border border-slate-200/90 hover:border-amber-300 hover:shadow-xs cursor-pointer transition relative"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="text-amber-800 font-semibold">औंल्याइएको आर्थिक विचलन</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tabular-nums truncate">
            रु. {formatNPR(kpis.total_financial_impact)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>कारबाही आवश्यक:</span>
            <span className="font-semibold text-amber-700 tabular-nums">
              {formatNepaliNumber(kpis.overdue_corrective_actions)} म्याद नाघेको
            </span>
          </div>
        </div>
      </div>

      {/* Main Analytical Section: 34-Stage Heatmap & Compliance/Risk Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: 34-Stage Procurement Irregularity Distribution */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded border border-slate-200/90 shadow-xs">
          <div className="flex items-start justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{formatNepaliNumber(kpis.total_checklist_stages)} खरिद चरण अनुसार कैफियत (Findings) वितरण</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                कुन खरिद चरणमा बढी कानूनी त्रुटि वा प्रक्रियागत अनियमितता भेटियो (घट्दो क्रममा)
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {zeroStageCount > 0 && (
                <button
                  onClick={() => setHideEmptyStages((v) => !v)}
                  className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded bg-slate-50 transition cursor-pointer"
                >
                  {hideEmptyStages
                    ? `शून्य कैफियतका ${formatNepaliNumber(zeroStageCount)} देखाउनुहोस्`
                    : `शून्य कैफियतका ${formatNepaliNumber(zeroStageCount)} लुकाउनुहोस्`}
                </button>
              )}
              <button
                onClick={() => onNavigate('master-checklist')}
                className="text-xs text-[#0f2c4d] hover:underline font-semibold flex items-center space-x-1"
              >
                <span>पूर्ण चेकलिस्ट</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="mt-3.5 space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {visibleStages.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
                हालसम्म कुनै पनि खरिद चरणमा कैफियत भेटिएको छैन।
              </div>
            ) : (
              visibleStages.map((st) => {
                const findingsCount = Number(st.findings_count) || 0;
                const pct = (findingsCount / maxFindings) * 100;
                const hasImpact = Number(st.financial_impact) > 0;

                return (
                  <div
                    key={st.stage_id}
                    onClick={() => onNavigate('master-checklist', { stage_number: st.stage_number })}
                    className="p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <span className="font-mono font-bold text-slate-500 text-[11px] w-6 shrink-0">
                          #{st.stage_number < 10 ? `0${st.stage_number}` : st.stage_number}
                        </span>
                        <span className="font-medium text-slate-800 truncate">
                          {st.title_ne}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          ({formatNepaliNumber(st.items_count)} सूचक)
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {hasImpact && (
                          <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            रु. {formatNPR(st.financial_impact)}
                          </span>
                        )}
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] tabular-nums ${
                            findingsCount > 0
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {formatNepaliNumber(findingsCount)} कैफियत
                        </span>
                      </div>
                    </div>

                    {/* Minimal Progress Line */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          findingsCount > 3
                            ? 'bg-red-700'
                            : findingsCount > 0
                            ? 'bg-amber-600'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${findingsCount > 0 ? Math.max(pct, 10) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Compliance Status & Risk Classification */}
        <div className="space-y-4">
          {/* Compliance Status Breakdown */}
          <div className="bg-white p-4 sm:p-5 rounded border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              समग्र परिपालन अवस्था (Compliance Status)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              निरीक्षण गरिएका सूचकहरूको वर्तमान नतिजा
            </p>

            <div className="space-y-2.5">
              {compliance.map((c) => {
                const countNum = Number(c.count) || 0;
                const percentage = Math.round((countNum / totalComplianceEvaluated) * 100);

                const statusStyles: Record<string, { bar: string; text: string; bg: string }> = {
                  'परिपालन': { bar: 'bg-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-50/50' },
                  'आंशिक परिपालन': { bar: 'bg-amber-500', text: 'text-amber-800', bg: 'bg-amber-50/50' },
                  'परिपालन नभएको': { bar: 'bg-red-600', text: 'text-red-800', bg: 'bg-red-50/50' },
                  'प्रमाण अपुग': { bar: 'bg-orange-500', text: 'text-orange-800', bg: 'bg-orange-50/50' },
                  'लागू नहुने': { bar: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50' },
                };

                const currentStyle = statusStyles[c.compliance_status] || {
                  bar: 'bg-slate-500',
                  text: 'text-slate-800',
                  bg: 'bg-slate-50',
                };

                return (
                  <div key={c.compliance_status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{c.compliance_status}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatNepaliNumber(countNum)} ({formatNepaliNumber(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${currentStyle.bar}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Level Distribution Matrix */}
          <div className="bg-white p-4 sm:p-5 rounded border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              जोखिम वर्गीकरण (Risk Classification)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              कैफियतहरूको गम्भीरता स्तर
            </p>

            <div className="grid grid-cols-2 gap-2">
              {risk.map((r) => {
                const isHigh = r.risk_level === 'उच्च' || r.risk_level === 'अत्यन्त उच्च';
                return (
                  <div
                    key={r.risk_level}
                    onClick={() => onNavigate('findings', { risk_level: r.risk_level })}
                    className={`p-2.5 rounded border text-center transition cursor-pointer hover:shadow-xs ${
                      isHigh
                        ? 'border-red-200 bg-red-50/40 text-red-900'
                        : 'border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-slate-600">
                      {r.risk_level} जोखिम
                    </div>
                    <div className="text-lg font-bold mt-0.5 tabular-nums">
                      {formatNepaliNumber(r.count)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Province Wise Distribution */}
          {provinces && provinces.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded border border-slate-200/90 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>प्रदेशगत अनुगमन स्थिति</span>
                <span className="text-[11px] font-normal text-slate-500">७ प्रदेश</span>
              </h3>
              <div className="mt-2.5 space-y-1.5 text-xs">
                {provinces.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-slate-600 py-0.5">
                    <span>{p.name_ne}</span>
                    <span className="font-mono text-slate-800 tabular-nums">
                      {formatNepaliNumber(p.inspections_count)} विश्लेषण / {formatNepaliNumber(p.findings_count)} कैफियत
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Table: Critical Findings / Action Required Alerts */}
      <div className="bg-white p-4 sm:p-5 rounded border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              शीघ्र सम्बोधन गर्नुपर्ने कैफियतहरू (Urgent Findings)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              उच्च जोखिम तथा सम्भावित ठूलो आर्थिक दायित्व भएका कैफियतहरू
            </p>
          </div>
          <button
            onClick={() => onNavigate('findings')}
            className="text-xs text-[#0f2c4d] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <span>सबै कैफियत सूची ({formatNepaliNumber(kpis.total_findings)})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3">कैफियत कोड</th>
                <th className="py-2.5 px-3">खरिद आयोजना / निकाय</th>
                <th className="py-2.5 px-3">कैफियत विषय</th>
                <th className="py-2.5 px-3">जोखिम स्तर</th>
                <th className="py-2.5 px-3 text-right">आर्थिक प्रभाव</th>
                <th className="py-2.5 px-3 text-center">कारबाही</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    हाल कुनै तत्काल सम्बोधन गर्नुपर्ने गम्भीर कैफियत फेला परेको छैन।
                  </td>
                </tr>
              ) : (
                alerts.map((al) => (
                  <tr key={al.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {al.finding_code}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 max-w-xs truncate">
                        {al.procurement_title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{al.office_name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-sm truncate">
                      {al.title}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                        {al.risk_level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      रु. {formatNPR(al.estimated_financial_impact)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onNavigate('findings', { search: al.finding_code })}
                        className="text-[#0f2c4d] hover:underline font-semibold cursor-pointer"
                      >
                        हेर्नुहोस्
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
