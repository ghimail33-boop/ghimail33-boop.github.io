import React, { useState, useEffect, useRef } from 'react';
import { Inspection, ChecklistStage, InspectionChecklistResult } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Save,
  Send,
  CheckCheck,
  Building,
  UserCheck,
  Calendar,
  Layers,
  Paperclip,
  Check,
  Search,
  ChevronLeft,
  ArrowDownCircle,
} from 'lucide-react';

interface InspectionsViewProps {
  initialProcurementId?: number | null;
  onOpenFindingWithPreload: (preload: {
    inspection_id: number;
    procurement_id: number;
    checklist_item_id: number;
    title: string;
    description: string;
    legal_reference: string;
    possible_irregularity?: string;
    risk_level: string;
    estimated_financial_impact?: number;
  }) => void;
  onOpenEvidenceUpload: (inspectionId: number, checklistItemId?: number) => void;
  onOpenReportPrint: (inspectionId: number) => void;
}

export const InspectionsView: React.FC<InspectionsViewProps> = ({
  initialProcurementId,
  onOpenFindingWithPreload,
  onOpenEvidenceUpload,
  onOpenReportPrint,
}) => {
  const { currentUser, canVerify, canEditInspection } = useAuth();
  const { showToast } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [stages, setStages] = useState<ChecklistStage[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected inspection for 34-stage matrix
  const [activeInspection, setActiveInspection] = useState<Inspection | null>(null);
  const [checklistResults, setChecklistResults] = useState<InspectionChecklistResult[]>([]);
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [stageFilter, setStageFilter] = useState<'all' | 'pending' | 'done' | 'issue'>('all');
  const [savingItem, setSavingItem] = useState<number | null>(null);
  const [saveSuccessMap, setSaveSuccessMap] = useState<Record<number, boolean>>({});

  // सूची दृश्य (list view) को खोज तथा स्थिति फिल्टर
  const [listSearch, setListSearch] = useState('');
  const [listStatusFilter, setListStatusFilter] = useState('all');

  // सक्रिय चरणलाई rail मा स्वतः देखाउन (auto-scroll)
  const stageBtnRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    loadData();
  }, []);

  // सक्रिय चरणको button rail भित्र देखिने गरी स्वतः scroll गर्ने
  useEffect(() => {
    if (!activeInspection) return;
    const btn = stageBtnRefs.current[selectedStage];
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedStage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inspRes, stageRes] = await Promise.all([
        api.getInspections(),
        api.getStages(),
      ]);
      setInspections(inspRes);
      setStages(stageRes);

      // If initial procurement was passed, pick or create inspection
      if (initialProcurementId) {
        const found = inspRes.find((i) => i.procurement_id === initialProcurementId);
        if (found) {
          openInspectionDetail(found.id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load inspections:', err);
      showToast('error', 'निरीक्षण सूची लोड हुन सकेन', err?.message || 'सर्भरसँग कनेक्ट हुन सकेन।');
    } finally {
      setLoading(false);
    }
  };

  const openInspectionDetail = async (id: number) => {
    try {
      setLoading(true);
      const [insp, checklist] = await Promise.all([
        api.getInspection(id),
        api.getInspectionChecklist(id),
      ]);
      setActiveInspection(insp);
      setChecklistResults(checklist);
      setSelectedStage(1);
      setStageFilter('all');
    } catch (err: any) {
      console.error('Failed to load inspection detail:', err);
      showToast('error', 'निरीक्षण विवरण लोड हुन सकेन', err?.message || 'पुनः प्रयास गर्नुहोस्।');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChecklistItem = async (
    item: InspectionChecklistResult,
    updates: Partial<InspectionChecklistResult>
  ) => {
    if (!activeInspection) return;
    const itemId = item.checklist_item_id;
    setSavingItem(itemId);

    const merged = { ...item, ...updates };

    // Update local state immediately for responsive UX
    setChecklistResults((prev) =>
      prev.map((r) => (r.checklist_item_id === itemId ? merged : r))
    );

    try {
      const res = await api.saveInspectionChecklistItem(activeInspection.id, {
        checklist_item_id: itemId,
        compliance_status: merged.compliance_status || 'जाँच बाँकी',
        risk_level: merged.risk_level || 'मध्यम',
        evidence_reference: merged.evidence_reference,
        observation: merged.observation,
        financial_impact: merged.financial_impact,
        inspector_comment: merged.inspector_comment,
      });

      // Update active inspection's completion percentage and risk score
      setActiveInspection((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          completion_percentage: res.completion_percentage,
          risk_score: res.risk_score,
          status: prev.status === 'Draft' ? 'In Progress' : prev.status,
        };
      });

      setSaveSuccessMap((prev) => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setSaveSuccessMap((prev) => ({ ...prev, [itemId]: false }));
      }, 2000);
    } catch (err: any) {
      console.error('Save checklist result failed:', err);
      // असफल भएमा स्थानीय state पुरानै अवस्थामा फर्काउने
      setChecklistResults((prev) =>
        prev.map((r) => (r.checklist_item_id === itemId ? item : r))
      );
      showToast('error', 'बुँदाको नतिजा सुरक्षित हुन सकेन', err?.message || 'सर्भरसँग सम्पर्क हुन सकेन।');
    } finally {
      setSavingItem(null);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeInspection) return;
    try {
      const updated = await api.updateInspection(activeInspection.id, {
        status: newStatus as any,
      });
      setActiveInspection((prev) => (prev ? { ...prev, ...updated } : prev));
      loadData();
      showToast('success', 'स्थिति परिवर्तन भयो', 'निरीक्षणको स्थिति सफलतापूर्वक अद्यावधिक गरियो।');
    } catch (err: any) {
      showToast('error', 'स्थिति परिवर्तन हुन सकेन', err.message || 'पुनः प्रयास गर्नुहोस्।');
    }
  };

  // सक्रिय निरीक्षण भित्रका व्युत्पन्न (derived) विवरणहरू
  const isPendingStatus = (status?: string) => !status || status === 'जाँच बाँकी';
  const isIssueStatus = (status?: string) =>
    status === 'परिपालन नभएको' || status === 'आंशिक परिपालन' || status === 'प्रमाण अपुग';

  const stageItemsAll = checklistResults.filter(
    (item) => item.stage_number === selectedStage
  );

  const currentStageItems = stageItemsAll.filter((item) => {
    if (stageFilter === 'pending') return isPendingStatus(item.compliance_status);
    if (stageFilter === 'done') return !isPendingStatus(item.compliance_status);
    if (stageFilter === 'issue') return isIssueStatus(item.compliance_status);
    return true;
  });

  const stagePendingCount = stageItemsAll.filter((i) => isPendingStatus(i.compliance_status)).length;
  const stageIssueCount = stageItemsAll.filter((i) => isIssueStatus(i.compliance_status)).length;
  const stageDoneCount = stageItemsAll.length - stagePendingCount;

  const pendingItems = checklistResults.filter((i) => isPendingStatus(i.compliance_status));
  const firstPendingItem = pendingItems[0];
  const overallDoneCount = checklistResults.length - pendingItems.length;

  const stageNumbers = stages.map((s) => s.stage_number);
  const currentStageIdx = stageNumbers.indexOf(selectedStage);
  const totalChecklistItems = checklistResults.length;

  const scrollToItem = (itemId: number) => {
    const el = document.getElementById(`chk-item-${itemId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('chk-jump-highlight');
    // दोहोरो जम्पमा पनि animation पुनः चलाउन reflow बाध्य पार्ने
    void el.offsetWidth;
    el.classList.add('chk-jump-highlight');
    window.setTimeout(() => el.classList.remove('chk-jump-highlight'), 1800);
  };

  const jumpToItem = (itemId: number, stageNumber: number) => {
    setStageFilter('all');
    if (stageNumber !== selectedStage) {
      setSelectedStage(stageNumber);
      window.setTimeout(() => scrollToItem(itemId), 150);
    } else {
      scrollToItem(itemId);
    }
  };

  const jumpToFirstPending = () => {
    if (!firstPendingItem) {
      showToast('success', 'सबै बुँदाको जाँच सम्पन्न भइसकेको छ', 'जाँच बाँकी कुनै बुँदा भेटिएन।');
      return;
    }
    jumpToItem(firstPendingItem.checklist_item_id, firstPendingItem.stage_number);
  };

  const filteredInspections = inspections.filter((insp) => {
    const q = listSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      [insp.inspection_code, insp.procurement_title, insp.office_name, insp.procurement_id_code]
        .some((v) => String(v || '').toLowerCase().includes(q));
    const matchesStatus = listStatusFilter === 'all' || insp.status === listStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatNPR = (amount: number | string) => {
    return formatNepaliNumber(amount);
  };

  // If viewing single inspection 34-stage evaluation matrix
  if (activeInspection) {
    const isCompleted = activeInspection.completion_percentage === 100;
    const isVerified = activeInspection.status === 'Verified';

    return (
      <div className="space-y-5">
        {/* <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p>दुई उपलब्ध स्रोतमा संशोधन संस्करण फरक छ (१४औँ, २०८२ बनाम १६औँ, २०८३)। चरण २६–२७ का विशेष विधि सूचकसमेत जाँच्नुहोस्; प्रगति/जोखिम अंक अभिलेख र screening सूचक हुन्, कानूनी राय वा अन्तिम वैधता प्रमाणपत्र होइनन्।</p>
        </div> */}
        {/* Top Navigation & Status Bar */}
        <div className="bg-white px-5 py-3.5 rounded border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveInspection(null)}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="पछाडि फर्किनुहोस्"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold bg-[#0f2c4d] text-white px-2 py-0.5 rounded">
                  {activeInspection.inspection_code}
                </span>
                <span className="text-xs font-medium text-slate-500 font-mono">
                  खरिद कोड: {activeInspection.procurement_id_code}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    isVerified
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  {activeInspection.status === 'Verified' ? 'प्रमाणित' : activeInspection.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
                {activeInspection.procurement_title}
              </h2>
            </div>
          </div>

          {/* Workflow Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenReportPrint(activeInspection.id)}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#0f2c4d]" />
              <span>प्रतिवेदन हेर्नुहोस् (Report Dossier)</span>
            </button>

            {canEditInspection && activeInspection.status === 'In Progress' && (
              <button
                onClick={() => handleUpdateStatus('Submitted')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0f2c4d] hover:bg-[#153e6c] text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>समीक्षाको लागि पेश गर्नुहोस्</span>
              </button>
            )}

            {canVerify && ['Submitted', 'Under Review'].includes(activeInspection.status) && (
              <button
                onClick={() => handleUpdateStatus('Verified')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>निरीक्षण प्रमाणीकरण गर्नुहोस् (Verify)</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress & Metadata Bar */}
        <div className="bg-[#0f2c4d] text-white p-4 rounded border border-[#0b2440] shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-300 text-[11px]">सार्वजनिक निकाय:</span>
            <div className="font-bold text-white mt-0.5">{activeInspection.office_name}</div>
          </div>
          <div>
            <span className="text-slate-300 text-[11px]">निरीक्षक टोली:</span>
            <div className="font-semibold text-slate-100 mt-0.5 truncate">
              {activeInspection.inspection_team || activeInspection.lead_inspector_name}
            </div>
          </div>
          <div>
            <span className="text-slate-300 text-[11px]">जोखिम सूचकांक (Risk Score):</span>
            <div className="font-bold text-amber-300 mt-0.5 font-mono">
              {formatNepaliNumber(activeInspection.risk_score)} / ४.०
            </div>
          </div>
          <div>
            <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
              <span>
                चेकलिस्ट प्रगति ({formatNepaliNumber(overallDoneCount)}/{formatNepaliNumber(checklistResults.length)} बुँदा):
              </span>
              <span className="font-bold text-white font-mono">
                {formatNepaliNumber(activeInspection.completion_percentage)}%
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${activeInspection.completion_percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 34-Stage Horizontal Navigation Tabs */}
        <div className="bg-white p-2 rounded border border-slate-200/90 shadow-xs overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {stages.map((st) => {
              const isActive = selectedStage === st.stage_number;
              const stageItems = checklistResults.filter(
                (r) => r.stage_number === st.stage_number
              );
              const checkedCount = stageItems.filter(
                (r) => r.compliance_status && r.compliance_status !== 'जाँच बाँकी'
              ).length;
              const totalCount = stageItems.length;
              const isStageDone = totalCount > 0 && checkedCount === totalCount;
              const stageIssues = stageItems.filter((r) =>
                isIssueStatus(r.compliance_status)
              ).length;

              return (
                <button
                  key={st.id}
                  ref={(el) => {
                    stageBtnRefs.current[st.stage_number] = el;
                  }}
                  onClick={() => setSelectedStage(st.stage_number)}
                  className={`px-3 py-2 rounded text-left transition flex items-center space-x-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#0f2c4d] text-white font-bold shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-white text-[#0f2c4d]'
                        : isStageDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {formatNepaliNumber(st.stage_number)}
                  </span>
                  <div className="text-xs">
                    <div className="truncate max-w-[140px] leading-tight">
                      {st.title_ne}
                    </div>
                    <div
                      className={`text-[10px] font-normal flex items-center space-x-1 ${
                        isActive ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      <span>
                        {formatNepaliNumber(checkedCount)}/{formatNepaliNumber(totalCount)} सम्पन्न
                      </span>
                      {stageIssues > 0 && (
                        <span
                          className={`font-bold ${
                            isActive ? 'text-amber-300' : 'text-red-700'
                          }`}
                          title={`${stageIssues} वटा बुँदामा समस्या भेटिएको`}
                        >
                          • {formatNepaliNumber(stageIssues)} समस्या
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Items List */}
        <div className="space-y-4">
          <div className="bg-white rounded border border-slate-200/90 shadow-xs p-3.5 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#0f2c4d] shrink-0" />
                <span>
                  चरण {formatNepaliNumber(selectedStage)} / {formatNepaliNumber(stageNumbers.length)}:{' '}
                  {stages.find((s) => s.stage_number === selectedStage)?.title_ne}
                </span>
              </h3>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => currentStageIdx > 0 && setSelectedStage(stageNumbers[currentStageIdx - 1])}
                  disabled={currentStageIdx <= 0}
                  className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="अघिल्लो चरण"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => currentStageIdx < stageNumbers.length - 1 && setSelectedStage(stageNumbers[currentStageIdx + 1])}
                  disabled={currentStageIdx >= stageNumbers.length - 1}
                  className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="अर्को चरण"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={jumpToFirstPending}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition cursor-pointer"
                  title="पहिलो जाँच बाँकी बुँदामा पुग्नुहोस्"
                >
                  <ArrowDownCircle className="w-4 h-4 text-amber-700" />
                  <span>बाँकी बुँदामा जानुहोस्</span>
                  {pendingItems.length > 0 && (
                    <span className="bg-amber-200 text-amber-900 px-1.5 rounded font-mono font-bold text-[10px] tabular-nums">
                      {formatNepaliNumber(pendingItems.length)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* चरण-स्तरीय फिल्टर chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">यस चरणमा:</span>
              {(
                [
                  { key: 'all', label: 'सबै', count: stageItemsAll.length },
                  { key: 'pending', label: 'जाँच बाँकी', count: stagePendingCount },
                  { key: 'done', label: 'जाँच सम्पन्न', count: stageDoneCount },
                  { key: 'issue', label: 'समस्या भेटिएको', count: stageIssueCount },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStageFilter(f.key)}
                  className={`px-2.5 py-0.5 rounded border text-xs font-semibold transition cursor-pointer ${
                    stageFilter === f.key
                      ? 'bg-[#0f2c4d] text-white border-[#0f2c4d]'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {f.label} ({formatNepaliNumber(f.count)})
                </button>
              ))}
            </div>
          </div>

          {currentStageItems.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              यो फिल्टरमा पर्ने कुनै बुँदा भेटिएन — फिल्टर परिवर्तन गर्नुहोस्।
            </div>
          )}

          {currentStageItems.map((item) => {
            const isSaving = savingItem === item.checklist_item_id;
            const isSaved = !!saveSuccessMap[item.checklist_item_id];
            const isNonCompliant =
              item.compliance_status === 'परिपालन नभएको' ||
              item.compliance_status === 'आंशिक परिपालन' ||
              item.compliance_status === 'प्रमाण अपुग';

            return (
              <div
                key={item.checklist_item_id}
                id={`chk-item-${item.checklist_item_id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 transition hover:border-slate-300"
              >
                {/* Item Top: Code, Legal Ref, Risk & Irregularity */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {item.checklist_code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.inspection_area}
                      </h4>
                    </div>
                    <div className="text-xs text-blue-700 font-medium">
                      कानूनी आधार: {item.legal_reference}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs text-slate-500">पूर्वनिर्धारित जोखिम:</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {item.default_risk_level}
                    </span>
                  </div>
                </div>

                {/* Question & Irregularity Alert */}
                <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <span className="font-bold text-blue-900 block mb-1">
                      जाँच गर्नुपर्ने प्रश्न (Statutory Inspection Question):
                    </span>
                    <p className="text-slate-800 leading-relaxed">
                      {item.inspection_question}
                    </p>
                    {item.required_documents && (
                      <div className="mt-2 text-[11px] text-blue-800 font-medium">
                        हेर्नुपर्ने कागजात: {item.required_documents}
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-1">
                      हुनसक्ने विकृति / जोखिम (Potential Irregularity):
                    </span>
                    <p className="text-amber-950 leading-relaxed">
                      {item.possible_irregularity || 'कानूनी सीमा उल्लंघन तथा प्रक्रियागत त्रुटि'}
                    </p>
                  </div>
                </div>

                {/* Input Fields: Compliance Status, Risk Level, Financial Impact, Observation, Evidence */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Compliance Status Selector */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      परिपालन स्थिति (Compliance Status):
                    </label>
                    <select
                      value={item.compliance_status || 'जाँच बाँकी'}
                      onChange={(e) =>
                        handleSaveChecklistItem(item, {
                          compliance_status: e.target.value as any,
                        })
                      }
                      className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="जाँच बाँकी">जाँच बाँकी (Pending)</option>
                      <option value="परिपालन">परिपालन (Compliant)</option>
                      <option value="आंशिक परिपालन">आंशिक परिपालन (Partially Compliant)</option>
                      <option value="परिपालन नभएको">परिपालन नभएको (Non-compliant)</option>
                      <option value="प्रमाण अपुग">प्रमाण अपुग (Missing Evidence)</option>
                      <option value="लागू नहुने">लागू नहुने (Not Applicable)</option>
                    </select>
                  </div>

                  {/* Risk Level */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      जोखिम स्तर (Assessed Risk):
                    </label>
                    <select
                      value={item.risk_level || item.default_risk_level}
                      onChange={(e) =>
                        handleSaveChecklistItem(item, {
                          risk_level: e.target.value as any,
                        })
                      }
                      className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="न्यून">न्यून (Low)</option>
                      <option value="मध्यम">मध्यम (Medium)</option>
                      <option value="उच्च">उच्च (High)</option>
                      <option value="अत्यन्त उच्च">अत्यन्त उच्च (Critical)</option>
                    </select>
                  </div>

                  {/* Financial Impact */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      सम्भावित आर्थिक असर (Financial Impact रु.):
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={item.financial_impact || ''}
                      onChange={(e) =>
                        setChecklistResults((prev) =>
                          prev.map((r) =>
                            r.checklist_item_id === item.checklist_item_id
                              ? { ...r, financial_impact: parseFloat(e.target.value) || 0 }
                              : r
                          )
                        )
                      }
                      onBlur={(e) =>
                        handleSaveChecklistItem(item, {
                          financial_impact: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>

                  {/* Evidence Reference & Attachment */}
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        प्रमाण कागजात संकेत / मिसिल पाना नं. (Evidence Reference):
                      </label>
                      <input
                        type="text"
                        placeholder="उदा: निर्णय टिप्पणी पाना नं. २३, बिल नं. ४५..."
                        value={item.evidence_reference || ''}
                        onChange={(e) =>
                          setChecklistResults((prev) =>
                            prev.map((r) =>
                              r.checklist_item_id === item.checklist_item_id
                                ? { ...r, evidence_reference: e.target.value }
                                : r
                            )
                          )
                        }
                        onBlur={(e) =>
                          handleSaveChecklistItem(item, {
                            evidence_reference: e.target.value,
                          })
                        }
                        className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <button
                        onClick={() =>
                          onOpenEvidenceUpload(activeInspection.id, item.checklist_item_id)
                        }
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs border border-slate-300 transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-700" />
                        <span>प्रमाण फाइल अपलोड ({formatNepaliNumber(item.evidence_count || 0)})</span>
                      </button>

                      {isNonCompliant && (
                        <button
                          onClick={() =>
                            onOpenFindingWithPreload({
                              inspection_id: activeInspection.id,
                              procurement_id: activeInspection.procurement_id,
                              checklist_item_id: item.checklist_item_id,
                              title: `${item.inspection_area} सम्बन्धी कैफियत`,
                              description: item.observation || item.inspection_question,
                              legal_reference: item.legal_reference,
                              possible_irregularity: item.possible_irregularity,
                              risk_level: item.risk_level || 'उच्च',
                              estimated_financial_impact: item.financial_impact || 0,
                            })
                          }
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>कैफियतमा दर्ता गर्नुहोस्</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Observation text */}
                  <div className="md:col-span-3">
                    <label className="font-bold text-slate-700 block mb-1">
                      स्थलगत निरीक्षण टिप्पणी / कैफियत (Observations & Notes):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="स्थलगत अनुगमनको क्रममा देखिएको तथ्य, परिमाण, दररेट वा प्रक्रियागत विवरण यहाँ खुलाउनुहोस्..."
                      value={item.observation || ''}
                      onChange={(e) =>
                        setChecklistResults((prev) =>
                          prev.map((r) =>
                            r.checklist_item_id === item.checklist_item_id
                              ? { ...r, observation: e.target.value }
                              : r
                          )
                        )
                      }
                      onBlur={(e) =>
                        handleSaveChecklistItem(item, {
                          observation: e.target.value,
                        })
                      }
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>

                {/* Save Feedback */}
                <div className="mt-2 flex items-center justify-end text-[11px]">
                  {isSaving && (
                    <span className="text-blue-600 font-medium animate-pulse">
                      सुरक्षित गरिँदैछ...
                    </span>
                  )}
                  {isSaved && (
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>सुरक्षित भयो</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Inspections List View
  return (
    <div className="space-y-4">
      {/* Institutional Top Header */}
      <div className="bg-white px-5 py-3.5 rounded border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
              राष्ट्रिय सतर्कता केन्द्र
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-medium text-slate-500">स्थलगत प्राविधिक निरीक्षण</span>
          </div>
          <h3 className="text-base font-bold text-[#0f2c4d] tracking-tight mt-0.5">
            खरिद विश्लेषण तथा {formatNepaliNumber(stages.length)}-चरण मूल्याङ्कन म्याट्रिक्स
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            खरिदको आवश्यकता पहिचानदेखि अन्तिम सम्परीक्षणसम्मका {formatNepaliNumber(totalChecklistItems)} वटा वैधानिक सूचकहरूको प्रत्यक्ष मूल्याङ्कन
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="निरीक्षण कोड, आयोजना वा निकाय..."
              className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white transition-colors"
            />
          </div>
          <select
            value={listStatusFilter}
            onChange={(e) => setListStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs border border-slate-300 rounded font-medium focus:ring-1 focus:ring-[#0f2c4d] bg-white"
          >
            <option value="all">सबै स्थिति (All Status)</option>
            <option value="Draft">मस्यौदा (Draft)</option>
            <option value="In Progress">प्रगतिमा (In Progress)</option>
            <option value="Submitted">पेश भएको (Submitted)</option>
            <option value="Under Review">समीक्षाधीन (Under Review)</option>
            <option value="Verified">प्रमाणित (Verified)</option>
            <option value="Closed">सम्पन्न (Closed)</option>
          </select>
        </div>
      </div>

      {filteredInspections.length === 0 && (
        <div className="bg-white rounded border border-dashed border-slate-300 p-10 text-center text-xs text-slate-500">
          खोज वा फिल्टरसँग मिल्ने कुनै निरीक्षण भेटिएन।
        </div>
      )}

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredInspections.map((insp) => {
          const isVerified = insp.status === 'Verified';
          const completionPct = insp.completion_percentage || 0;

          return (
            <div
              key={insp.id}
              className="bg-white rounded border border-slate-200/90 shadow-xs hover:border-slate-400 hover:shadow-xs transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-[#0f2c4d] text-white px-2 py-0.5 rounded">
                    {insp.inspection_code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}
                  >
                    {isVerified ? 'प्रमाणित' : insp.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {insp.procurement_title}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                    <Building className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{insp.office_name}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">निर्माण व्यवसायी:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">
                      {insp.contractor_name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">सम्झौता रकम:</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      रु. {formatNPR(insp.contract_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">दर्ता भएका कैफियत:</span>
                    <span className="font-bold text-red-700 tabular-nums">
                      {formatNepaliNumber(insp.findings_count || 0)} वटा
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">चेकलिस्ट मूल्याङ्कन:</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums">
                      {formatNepaliNumber(completionPct)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#0f2c4d] h-1.5 rounded-full transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenReportPrint(insp.id)}
                  className="text-xs text-slate-600 hover:text-[#0f2c4d] font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#0f2c4d]" />
                  <span>प्रतिवेदन</span>
                </button>

                <button
                  onClick={() => openInspectionDetail(insp.id)}
                  className="px-3.5 py-1.5 bg-[#0f2c4d] hover:bg-[#153e6c] text-white rounded text-xs font-semibold shadow-xs transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>{formatNepaliNumber(stages.length)}-चरण विश्लेषण</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
