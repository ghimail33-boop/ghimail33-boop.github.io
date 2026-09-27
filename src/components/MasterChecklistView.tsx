import React, { useState, useEffect, useMemo } from 'react';
import { ChecklistItem, ChecklistStage } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  ListOrdered,
  Search,
  Layers,
  BookOpen,
  AlertTriangle,
  FileCheck2,
  Printer,
  Download,
  FilterX,
  ChevronDown,
  ChevronRight,
  SearchX,
} from 'lucide-react';

// पूर्वनिर्धारित जोखिम स्तर अनुसारको रङ्ग संकेत
const RISK_BADGE: Record<string, string> = {
  'न्यून': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'मध्यम': 'bg-amber-100 text-amber-800 border-amber-200',
  'उच्च': 'bg-orange-100 text-orange-800 border-orange-200',
  'अत्यन्त उच्च': 'bg-red-100 text-red-800 border-red-200',
};

const RISK_LEVELS = ['न्यून', 'मध्यम', 'उच्च', 'अत्यन्त उच्च'];
const SOURCE_VERSION_NOTICE = 'Final_Checklist.docx ले १४औँ संशोधन, २०८२ र Sarvajanik_Kharid_Matrix.docx ले १६औँ संशोधन, २०८३ उल्लेख गर्छन्। सूचक तथा रकम सीमा सन्दर्भ सामग्रीमा आधारित छन्; निर्णयअघि हाल लागू राजपत्र/PPMO पाठ र निकायको अधिकार प्रत्यायोजन रुजु गर्नुहोस्।';

export const MasterChecklistView: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [stages, setStages] = useState<ChecklistStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  // ३४ चरण भएकाले लामो सूची सजिलै हेर्न चरणगत खोल्ने/खुम्च्याउने सुविधा
  const [collapsedStages, setCollapsedStages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, stagesRes] = await Promise.all([
        api.getMasterChecklists(),
        api.getStages(),
      ]);
      setItems(itemsRes);
      setStages(stagesRes);
    } catch (err: any) {
      console.error('Failed to load master checklist:', err);
      showToast('error', 'चेकलिस्ट लोड हुन सकेन', err?.message || 'सर्भरसँग कनेक्ट हुन सकेन।');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesStage = selectedStage ? item.stage_number === Number(selectedStage) : true;
    const matchesRisk = riskFilter ? item.default_risk_level === riskFilter : true;
    const matchesSearch = !q
      ? true
      : item.checklist_code.toLowerCase().includes(q) ||
        item.inspection_area.toLowerCase().includes(q) ||
        item.inspection_question.toLowerCase().includes(q) ||
        (item.legal_reference || '').toLowerCase().includes(q) ||
        (item.required_documents || '').toLowerCase().includes(q);
    return matchesStage && matchesRisk && matchesSearch;
  });

  const filtersActive = !!searchTerm.trim() || !!selectedStage || !!riskFilter;
  const checklistCountsByStage = new Map<number, number>();
  items.forEach((item) => {
    checklistCountsByStage.set(
      item.stage_number,
      (checklistCountsByStage.get(item.stage_number) || 0) + 1
    );
  });

  // चरण अनुसार समूहबद्ध (grouped) सूची — चरण क्रमानुसार क्रमबद्ध
  const groupedItems = useMemo(() => {
    const byStage = new Map<number, ChecklistItem[]>();
    filteredItems.forEach((it) => {
      const arr = byStage.get(it.stage_number) || [];
      arr.push(it);
      byStage.set(it.stage_number, arr);
    });

    const orderedStageNumbers = stages.length
      ? stages.map((s) => s.stage_number)
      : [...byStage.keys()].sort((a, b) => a - b);
    const extraNumbers = [...byStage.keys()]
      .filter((n) => !orderedStageNumbers.includes(n))
      .sort((a, b) => a - b);

    return [...orderedStageNumbers, ...extraNumbers]
      .map((n) => {
        const stage = stages.find((s) => s.stage_number === n);
        const stageItems = (byStage.get(n) || []).sort((a, b) => a.sort_order - b.sort_order);
        return {
          stageNumber: n,
          stageTitle: stage?.title_ne || stageItems[0]?.stage_title_ne || `चरण ${n}`,
          items: stageItems,
        };
      })
      .filter((g) => g.items.length > 0 || !filtersActive);
  }, [filteredItems, stages, filtersActive]);

  const matchedStageCount = groupedItems.filter((g) => g.items.length > 0).length;

  const isStageExpanded = (stageNumber: number) =>
    filtersActive || !collapsedStages[stageNumber];

  const toggleStage = (stageNumber: number) => {
    setCollapsedStages((prev) => ({ ...prev, [stageNumber]: !prev[stageNumber] }));
  };

  const expandAllStages = () => setCollapsedStages({});
  const collapseAllStages = () => {
    const all: Record<number, boolean> = {};
    stages.forEach((s) => (all[s.stage_number] = true));
    setCollapsedStages(all);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setRiskFilter('');
  };

  // CSV एक्सपोर्ट — Excel/UTF-8 अनुकूल (BOM सहित), हालको फिल्टर अनुसार
  const exportCSV = () => {
    if (filteredItems.length === 0) {
      showToast('warning', 'एक्सपोर्ट गर्न कुनै बुँदा भेटिएन', 'फिल्टर परिवर्तन गरी पुनः प्रयास गर्नुहोस्।');
      return;
    }
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = [
      'क्रम संख्या',
      'चरण नं.',
      'चरण',
      'कोड',
      'अनुगमन क्षेत्र',
      'कानूनी आधार',
      'निरीक्षण प्रश्न',
      'सम्भावित विकृति / जोखिम',
      'पूर्वनिर्धारित जोखिम स्तर',
      'आवश्यक कागजात',
    ];
    const rows = filteredItems.map((item, idx) =>
      [
        idx + 1,
        item.stage_number,
        item.stage_title_ne || '',
        item.checklist_code,
        item.inspection_area,
        item.legal_reference,
        item.inspection_question,
        item.possible_irregularity || '',
        item.default_risk_level,
        item.required_documents || '',
      ]
        .map(esc)
        .join(',')
    );
    const csv = '\uFEFF' + [header.map(esc).join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nvc-master-checklist.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'CSV एक्सपोर्ट सम्पन्न', `${filteredItems.length} बुँदा फाइलमा सुरक्षित गरियो।`);
  };

  // प्रिन्ट अघि सबै चरण खोलेर मात्र प्रिन्ट डायलग खोल्ने
  const handlePrint = () => {
    setCollapsedStages({});
    window.setTimeout(() => window.print(), 80);
  };

  return (
    <div className="space-y-5">
      {/* On-screen Header (प्रिन्टमा देखा पर्दैन) */}
      <div className="no-print">
        <h3 className="text-md font-bold text-blue-900 flex items-center space-x-2">
          <ListOrdered className="w-4 h-4 text-blue-700" />
          <span>सार्वजनिक खरिद चेकलिस्ट</span>
        </h3>
        <p className="text-xs text-slate-500">
          सार्वजनिक खरिद ऐन, २०६३ तथा सार्वजनिक खरिद नियमावली, २०६४ सन्दर्भका{' '}
          {loading
            ? '…'
            : `${formatNepaliNumber(stages.length)}-चरणका ${formatNepaliNumber(items.length)} वटा checklist सूचकहरू`}
        </p>
      </div>
      {/* <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p>{SOURCE_VERSION_NOTICE}</p>
      </div> */}

      {/* Print-only Header (प्रिन्टमा मात्र देखा पर्ने शीर्षक) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-3">
        <h1 className="text-lg font-bold text-slate-900">
          सार्वजनिक खरिद चेकलिस्ट
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          सार्वजनिक खरिद ऐन, २०६३ / नियमावली, २०६४ — जम्मा {formatNepaliNumber(items.length)} बुँदा, प्रिन्ट गरिएको{' '}
          {formatNepaliNumber(filteredItems.length)} बुँदा
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          राष्ट्रिय सतर्कता केन्द्र (NVC) | मिति: {new Date().toLocaleDateString('ne-NP')}
        </p>
        <p className="text-[10px] text-slate-600 mt-1">{SOURCE_VERSION_NOTICE}</p>
      </div>

      {/* Filter, Search & Action Bar */}
      <div className="no-print bg-white p-2 rounded-xl border border-slate-200 shadow-xs space-y-1.5 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="अनुगमन क्षेत्र, कानूनी दफा, कागजात वा प्रश्न..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-slate-50"
            />
          </div>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-slate-50 max-w-[260px]"
          >
            <option value="">सबै चरणहरू ({formatNepaliNumber(stages.length)} वटा)</option>
            {stages.map((st) => (
              <option key={st.id} value={st.stage_number}>
                चरण {formatNepaliNumber(st.stage_number)}: {st.title_ne} ({formatNepaliNumber(checklistCountsByStage.get(st.stage_number) || 0)} बुँदा)
              </option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-slate-50"
          >
            <option value="">सबै जोखिम स्तर</option>
            {RISK_LEVELS.map((level) => (
              <option key={level} value={level}>
                जोखिम: {level}
              </option>
            ))}
          </select>

          {filtersActive && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1.5 px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <FilterX className="w-4 h-4 text-red-600" />
              <span>फिल्टर हटाउनुहोस्</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="text-slate-500 font-medium flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>
              जम्मा सूचक:{' '}
              <span className="font-bold text-slate-900">{formatNepaliNumber(filteredItems.length)}</span> / {formatNepaliNumber(items.length)}
              {filtersActive && (
                <span className="text-slate-400"> ({formatNepaliNumber(matchedStageCount)} चरणमा फेला परे)</span>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {!filtersActive && (
              <>
                <button
                  onClick={expandAllStages}
                  className="px-2.5 py-1 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  सबै खोल्नुहोस्
                </button>
                <button
                  onClick={collapseAllStages}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  सबै खुम्च्याउनुहोस्
                </button>
              </>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>प्रिन्ट गर्नुहोस्</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>CSV एक्सपोर्ट</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          सुझाव: प्रिन्ट तथा CSV एक्सपोर्टमा हाल लागू भएको फिल्टरकै बुँदाहरू समावेश हुन्छन्।
        </p>
      </div>

      {/* Items List — चरणगत समूहबद्ध */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" />
          <div className="mt-2 text-xs"> चेकलिस्ट लोड हुँदैछ...</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <SearchX className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="mt-3 text-sm font-bold text-slate-700">कुनै बुँदा भेटिएन</p>
          <p className="text-xs text-slate-500 mt-1">
            शब्द, चरण वा जोखिम स्तर परिवर्तन गरी पुनः प्रयास गर्नुहोस्।
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition no-print"
          >
            फिल्टर हटाउनुहोस्
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedItems.map((group) => (
            <div key={group.stageNumber} className="space-y-3">
              {/* Stage Group Header */}
              <div className="flex items-center justify-between bg-[#0e4596] text-white px-4 py-1.5 rounded-md shadow-xs">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="shrink-0 bg-blue-600 text-white text-xs font-mono font-bold px-2 py-0.5 rounded">
                    चरण {formatNepaliNumber(group.stageNumber)}
                  </span>
                  <h3 className="font-bold text-sm truncate">{group.stageTitle}</h3>
                  <span className="shrink-0 text-[11px] text-slate-800 bg-slate-300 px-2 py-0.5 rounded-full">
                    {formatNepaliNumber(group.items.length)} बुँदा
                  </span>
                </div>
                <button
                  onClick={() => toggleStage(group.stageNumber)}
                  disabled={filtersActive}
                  title={
                    filtersActive
                      ? 'फिल्टर सक्रिय हुँदा सबै बुँदा खुला रहन्छन्'
                      : 'चरण खोल्नुहोस् / खुम्च्याउनुहोस्'
                  }
                  className={`no-print shrink-0 flex items-center space-x-1 text-[11px] font-semibold transition ${
                    filtersActive
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isStageExpanded(group.stageNumber) ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>खुम्च्याउनुहोस्</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>खोल्नुहोस्</span>
                    </>
                  )}
                </button>
              </div>

              {/* Stage Items */}
              {isStageExpanded(group.stageNumber) && (
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-xs p-2 hover:border-blue-300 transition text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                            {item.checklist_code}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {item.inspection_area}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-slate-500">पूर्वनिर्धारित जोखिम:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full border ${
                              RISK_BADGE[item.default_risk_level] ||
                              'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {item.default_risk_level}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2 space-y-1.5">
                          <div className="text-blue-800 font-semibold flex items-center space-x-1">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            <span>कानूनी आधार: {item.legal_reference}</span>
                          </div>
                          <div className="text-slate-900 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {item.inspection_question}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                            <span className="font-bold text-amber-900 mb-0.5 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              हुनसक्ने विकृति / जोखिम:
                            </span>
                            <span className="text-amber-950">
                              {item.possible_irregularity ||
                                'प्रक्रियागत विचलन तथा सार्वजनिक स्रोतको दुरुपयोग'}
                            </span>
                          </div>
                          {item.required_documents && (
                            <div className="text-[11px] text-slate-600 flex items-start gap-1">
                              <FileCheck2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                              <span>
                                <span className="font-bold text-slate-700">आवश्यक कागजात: </span>
                                {item.required_documents}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
