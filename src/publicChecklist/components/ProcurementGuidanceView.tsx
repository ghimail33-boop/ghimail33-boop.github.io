import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Landmark, LoaderCircle, RefreshCw, Search, Sparkles } from 'lucide-react';
import { Language } from '../types/procurement';
import {
  GUIDE_STAGES,
  GuideDataPayload,
  GuideDecision,
  GuideOpinion,
  prepareGuideData,
  rankGuideRecords
} from '../data/procurementGuideData';

interface ProcurementGuidanceViewProps {
  language: Language;
  onAskAi: (query: string) => void;
}

type GuideTab = 'search' | 'stage' | 'advice' | 'pprc' | 'references' | 'about';

const GUIDE_TABS: Array<{ id: GuideTab; label: string }> = [
  { id: 'search', label: 'समस्या खोज' },
  { id: 'stage', label: 'चरण अनुसार' },
  { id: 'advice', label: 'PPMO राय' },
  { id: 'pprc', label: 'PPRC निर्णय' },
  { id: 'references', label: 'दफा / नियम' },
  { id: 'about', label: 'स्रोत र सीमा' }
];

const stageName = (id: string) => GUIDE_STAGES.find((stage) => stage.id === id)?.name || id;

export const ProcurementGuidanceView: React.FC<ProcurementGuidanceViewProps> = ({ language, onAskAi }) => {
  const [data, setData] = useState<ReturnType<typeof prepareGuideData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<GuideTab>('search');
  const [searchText, setSearchText] = useState('');
  const [searchStage, setSearchStage] = useState('');
  const [searchKind, setSearchKind] = useState<'all' | 'opinions' | 'decisions'>('all');
  const [selectedStage, setSelectedStage] = useState('');
  const [adviceText, setAdviceText] = useState('');
  const [adviceStage, setAdviceStage] = useState('');
  const [decisionType, setDecisionType] = useState('');
  const [referenceQuery, setReferenceQuery] = useState('');
  const [selectedReference, setSelectedReference] = useState('');

  const loadGuide = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch('/procurement-guide-data.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json() as GuideDataPayload;
      setData(prepareGuideData(payload));
    } catch (error) {
      console.error('Procurement guide data could not be loaded:', error);
      setLoadError('मार्गदर्शन सामग्री लोड हुन सकेन। पुनः प्रयास गर्नुहोस्।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGuide();
  }, []);

  const rankedOpinions = useMemo(
    () => data ? rankGuideRecords(data.opinions, searchText) : [],
    [data, searchText]
  );
  const rankedDecisions = useMemo(
    () => data ? rankGuideRecords(data.decisions, searchText) : [],
    [data, searchText]
  );

  const stageStats = useMemo(() => GUIDE_STAGES.map((stage) => ({
    ...stage,
    opinionCount: data?.opinions.filter((item) => item.stageIds.includes(stage.id)).length || 0,
    decisionCount: data?.decisions.filter((item) => item.stageIds.includes(stage.id)).length || 0
  })), [data]);

  const getFilteredMatches = (query: string, stageId: string) => {
    if (!data) return { opinions: [], decisions: [] };
    let opinions = query ? rankGuideRecords(data.opinions, query) : [];
    let decisions = query ? rankGuideRecords(data.decisions, query) : [];
    if (stageId) {
      opinions = opinions.filter((item) => item.stageIds.includes(stageId));
      decisions = decisions.filter((item) => item.stageIds.includes(stageId));
    }
    return { opinions, decisions };
  };

  const searchOpinions = searchText
    ? rankedOpinions.filter((item) => !searchStage || item.stageIds.includes(searchStage))
    : searchStage ? data?.opinions.filter((item) => item.stageIds.includes(searchStage)) || [] : [];
  const searchDecisions = searchText
    ? rankedDecisions.filter((item) => !searchStage || item.stageIds.includes(searchStage))
    : searchStage ? data?.decisions.filter((item) => item.stageIds.includes(searchStage)) || [] : [];

  const stageOpinions = selectedStage ? data?.opinions.filter((item) => item.stageIds.includes(selectedStage)) || [] : [];
  const stageDecisions = selectedStage ? data?.decisions.filter((item) => item.stageIds.includes(selectedStage)) || [] : [];

  const adviceMatches = useMemo(() => {
    if (!data) return { opinions: [], decisions: [] };
    const query = adviceText.trim();
    let opinions = query
      ? rankGuideRecords(data.opinions, query)
      : adviceStage ? data.opinions : [];
    let decisions = query
      ? rankGuideRecords(data.decisions, query)
      : adviceStage ? data.decisions : [];
    if (adviceStage) {
      opinions = opinions.filter((item) => item.stageIds.includes(adviceStage));
      decisions = decisions.filter((item) => item.stageIds.includes(adviceStage));
    }
    return { opinions, decisions };
  }, [data, adviceText, adviceStage]);
  const decisionTypes = useMemo(() => [...new Set(data?.decisions.map((item) => item.type) || [])], [data]);

  const referenceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of [...(data?.opinions || []), ...(data?.decisions || [])]) {
      for (const reference of item.references) counts.set(reference, (counts.get(reference) || 0) + 1);
    }
    return [...counts.entries()].sort((first, second) => second[1] - first[1]);
  }, [data]);

  const selectedReferenceItems = selectedReference && data
    ? {
        opinions: data.opinions.filter((item) => item.references.includes(selectedReference)),
        decisions: data.decisions.filter((item) => item.references.includes(selectedReference))
      }
    : null;

  const submitAdvice = () => {
    const question = adviceText.trim();
    if (question.length < 8) return;
    const matches = getFilteredMatches(question, adviceStage);
    const evidence = [
      ...matches.opinions.slice(0, 5).map((item) => `PPMO राय (${item.src}, ${item.date || `क्रम ${item.no}`}): ${item.subject} निष्कर्ष: ${item.opinion}`),
      ...matches.decisions.slice(0, 5).map((item) => `PPRC निर्णय (विवाद नं. ${item.no}, ${item.type}): ${item.subject} निर्णय: ${item.decision} कानुनी आधार: ऐन ${item.act}; नियम ${item.rule}`)
    ].join('\n');
    const relevantStages = adviceStage ? [stageName(adviceStage)] : GUIDE_STAGES
      .filter((stage) => stage.keywords.some((keyword) => question.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())))
      .slice(0, 2)
      .map((stage) => stage.name);
    onAskAi(
      `खरिद चरण: ${relevantStages.join(' / ') || 'प्रयोगकर्ताले उल्लेख गरेको चरण'}\nप्रश्न/द्विविधा: ${question}\nसम्बन्धित स्रोत-अंश:\n${evidence || 'यस प्रश्नसँग मिल्दो अंश फेला परेन। यसलाई स्पष्ट रूपमा भन्नुहोस् र ऐन/नियमको हाल लागू पाठ जाँच्न सुझाउनुहोस्।'}\n\nराय र निर्णय तथ्यविशेष तथा जारी मितिसँग सीमित हुन्छन्। उपलब्ध अंशको सीमा बताउनुहोस्, स्रोतमा नभएको निष्कर्ष नबनाउनुहोस्, र हाल लागू संशोधनसँग मिलाएर मात्र मार्गदर्शन दिनुहोस्।`
    );
  };

  const filterByReference = (reference: string) => {
    setSelectedReference(reference);
    setActiveTab('references');
  };

  const filterByStage = (stageId: string) => {
    setSelectedStage(stageId);
    setActiveTab('stage');
  };

  const ReferenceChips = ({ references }: { references: string[] }) => references.length ? (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {references.slice(0, 8).map((reference) => (
        <button
          type="button"
          key={reference}
          onClick={() => filterByReference(reference)}
          className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#185294] hover:bg-blue-100"
        >
          {reference}
        </button>
      ))}
    </div>
  ) : null;

  const StageTags = ({ stageIds }: { stageIds: string[] }) => stageIds.length ? (
    <div className="mt-1 flex flex-wrap gap-1">
      {stageIds.map((id) => (
        <button type="button" key={id} onClick={() => filterByStage(id)} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-blue-50 hover:text-[#185294]">
          {stageName(id)}
        </button>
      ))}
    </div>
  ) : null;

  const OpinionCard = ({ record }: { record: GuideOpinion }) => (
    <article className="border border-slate-200 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
        <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-[#185294]">PPMO राय</span>
        <span>{record.src}</span>
        {record.date && <span>• {record.date}</span>}
      </div>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">{record.subject}</p>
      <details className="mt-2 border-t border-slate-100 pt-2">
        <summary className="cursor-pointer text-xs font-bold text-[#185294]">राय परामर्शको व्यहोरा</summary>
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{record.opinion}</p>
      </details>
      <StageTags stageIds={record.stageIds} />
      <ReferenceChips references={record.references} />
    </article>
  );

  const DecisionCard = ({ record }: { record: GuideDecision }) => (
    <article className="border border-slate-200 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">विवाद नं. {record.no}</span>
        <span className={`rounded px-2 py-0.5 font-bold ${record.type.includes('बदर') ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-900'}`}>{record.type}</span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">{record.subject}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600"><strong>निवेदक:</strong> {record.app} <span className="text-slate-400">•</span> <strong>विपक्षी:</strong> {record.resp}</p>
      <details className="mt-2 border-t border-slate-100 pt-2">
        <summary className="cursor-pointer text-xs font-bold text-[#185294]">आधार र निर्णय हेर्नुहोस्</summary>
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{record.decision}</p>
        {(record.act || record.rule) && <p className="mt-2 text-[11px] leading-relaxed text-slate-500">ऐन: {record.act || 'उल्लेख छैन'} • नियमावली: {record.rule || 'उल्लेख छैन'}</p>}
      </details>
      <StageTags stageIds={record.stageIds} />
      <ReferenceChips references={record.references} />
    </article>
  );

  const SearchPanel = ({ opinions, decisions, query }: { opinions: GuideOpinion[]; decisions: GuideDecision[]; query: string }) => {
    if (!query && !searchStage) return <p className="border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">समस्या लेख्नुहोस् वा चरण छानेर सम्बन्धित राय र निर्णय हेर्नुहोस्।</p>;
    const selectedOpinions = searchKind === 'decisions' ? [] : opinions.slice(0, 15);
    const selectedDecisions = searchKind === 'opinions' ? [] : decisions.slice(0, 15);
    if (!selectedOpinions.length && !selectedDecisions.length) return <p className="border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">मिल्दो सामग्री भेटिएन। अर्को शब्द प्रयोग गर्नुहोस् वा चरण filter हटाउनुहोस्।</p>;
    return (
      <div className="space-y-4">
        {selectedOpinions.length > 0 && <section><h3 className="mb-2 text-sm font-bold text-slate-800">राय परामर्श <span className="text-slate-500">({opinions.length})</span></h3><div className="space-y-2">{selectedOpinions.map((record, index) => <OpinionCard key={`op-${record.src}-${record.no}-${index}`} record={record} />)}</div></section>}
        {selectedDecisions.length > 0 && <section><h3 className="mb-2 text-sm font-bold text-slate-800">पुनरावलोकन समिति निर्णय <span className="text-slate-500">({decisions.length})</span></h3><div className="space-y-2">{selectedDecisions.map((record, index) => <DecisionCard key={`pp-${record.no}-${index}`} record={record} />)}</div></section>}
      </div>
    );
  };

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center gap-2 text-sm font-semibold text-[#185294]"><LoaderCircle className="h-5 w-5 animate-spin" />खरिद राय तथा निर्णय लोड हुँदैछन्...</div>;
  }

  if (loadError || !data) {
    return <div role="alert" className="flex items-center justify-between gap-4 border border-rose-200 bg-white p-4 text-sm text-rose-900"><span>{loadError || 'स्रोत सामग्री उपलब्ध भएन।'}</span><button type="button" onClick={() => void loadGuide()} className="inline-flex shrink-0 items-center gap-1.5 rounded bg-[#1b64b5] px-3 py-2 font-bold text-white"><RefreshCw className="h-4 w-4" />पुनः प्रयास</button></div>;
  }

  return (
    <div className="procurement-guidance space-y-3 text-slate-800">
      <section className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-bold uppercase text-[#185294]">खरिद निर्णय सहायता</p>
          <h2 className="mt-0.5 text-lg font-black text-slate-900">खरिदका द्विविधा, राय र विवादका निर्णय</h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-600">खरिद चरण छान्नुहोस्, समस्या खोज्नुहोस् वा खरिदको अवस्थाबारे परामर्श लिनुहोस्। राय र समितिका निर्णयका मूल विवरण यही पृष्ठमा पढ्न सकिन्छ।</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[#185294]">{data.opinions.length} PPMO राय</span>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-800">{data.decisions.length} PPRC निर्णय</span>
            <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-900">{GUIDE_STAGES.length} खरिद चरण</span>
          </div>
        </div>
        <button type="button" onClick={() => { setAdviceText(searchText); setActiveTab('advice'); }} className="inline-flex items-center gap-2 rounded bg-[#1b64b5] px-3 py-2 text-xs font-bold text-white hover:bg-[#155294]">
          <Sparkles className="h-4 w-4 text-amber-300" />यस विषयमा परामर्श
        </button>
      </section>

      <nav aria-label="मार्गदर्शनका खण्ड" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {GUIDE_TABS.map((tab) => (
          <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined} className={`shrink-0 border-b-2 px-3 py-2 text-xs font-bold ${activeTab === tab.id ? 'border-amber-400 bg-blue-50 text-[#185294]' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-[#185294]'}`}>
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'search' && (
        <div className="space-y-3">
          <section className="border border-slate-200 bg-white p-3">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900"><Search className="h-4 w-4 text-[#1b64b5]" />आफ्नो समस्या खोज्नुहोस्</h3>
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_240px_200px]">
              <input value={searchText} onChange={(event) => setSearchText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') setActiveTab('search'); }} placeholder="जस्तै: कम बोलपत्र जमानत, अनुभव प्रमाण, म्याद थप…" className="min-w-0 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b64b5]" />
              <select value={searchStage} onChange={(event) => setSearchStage(event.target.value)} className="rounded border border-slate-300 bg-white px-2 py-2 text-xs"><option value="">सबै खरिद चरण</option>{GUIDE_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select>
              <select value={searchKind} onChange={(event) => setSearchKind(event.target.value as typeof searchKind)} className="rounded border border-slate-300 bg-white px-2 py-2 text-xs"><option value="all">राय र निर्णय दुवै</option><option value="opinions">PPMO राय मात्र</option><option value="decisions">PPRC निर्णय मात्र</option></select>
            </div>
          </section>
          <SearchPanel opinions={searchOpinions} decisions={searchDecisions} query={searchText} />
        </div>
      )}

      {activeTab === 'stage' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">चरण छान्दा त्यससँग सम्बन्धित सार्वजनिक निकायका राय र पुनरावलोकन विवादका निर्णय देखिन्छन्। एउटै अभिलेख एकभन्दा बढी चरणसँग मिल्न सक्छ।</p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {stageStats.map((stage) => (
              <button type="button" key={stage.id} onClick={() => setSelectedStage(stage.id)} aria-pressed={selectedStage === stage.id} className={`border p-3 text-left transition ${selectedStage === stage.id ? 'border-[#1b64b5] bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                <span className="block text-sm font-bold text-slate-900">{stage.name}</span>
                <span className="mt-1 block text-[11px] text-slate-600"><strong className="text-[#185294]">{stage.opinionCount}</strong> राय <span className="px-1 text-slate-400">•</span> <strong className="text-emerald-800">{stage.decisionCount}</strong> निर्णय</span>
              </button>
            ))}
          </div>
          {selectedStage ? (
            <section className="space-y-3">
              <div className="border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950"><strong>व्यावहारिक सावधानी:</strong> {GUIDE_STAGES.find((stage) => stage.id === selectedStage)?.tip}</div>
              <h3 className="text-sm font-bold text-slate-900">{stageName(selectedStage)}: राय परामर्श ({stageOpinions.length})</h3>
              {stageOpinions.slice(0, 25).map((record, index) => <OpinionCard key={`stage-op-${record.src}-${record.no}-${index}`} record={record} />)}
              <h3 className="pt-2 text-sm font-bold text-slate-900">यस चरणसँग मिल्ने PPRC समिति निर्णय ({stageDecisions.length})</h3>
              {stageDecisions.slice(0, 15).map((record, index) => <DecisionCard key={`stage-pp-${record.no}-${index}`} record={record} />)}
              {!stageOpinions.length && !stageDecisions.length && <p className="border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-600">शब्दावलीमा आधारित वर्गीकरणबाट यो चरणमा मिलेको अभिलेख भेटिएन। सबै अभिलेख समस्या खोजबाट हेर्नुहोस्।</p>}
            </section>
          ) : <p className="border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-600">माथिबाट खरिद चरण छान्नुहोस्।</p>}
        </div>
      )}

      {activeTab === 'advice' && (
        <div className="space-y-3">
          <section className="border border-slate-200 bg-white p-3">
            <h3 className="mb-2 text-sm font-bold text-slate-900">आफ्नो खरिद अवस्था विस्तारमा लेख्नुहोस्</h3>
            <textarea value={adviceText} onChange={(event) => setAdviceText(event.target.value)} placeholder="खरिदको चरण, विधि, निर्णय वा विवादको मुख्य तथ्य लेख्नुहोस्…" className="min-h-24 w-full rounded border border-slate-300 p-3 text-sm outline-none focus:border-[#1b64b5]" />
            <div className="mt-2 flex flex-wrap gap-2">
              <select value={adviceStage} onChange={(event) => setAdviceStage(event.target.value)} className="min-w-56 rounded border border-slate-300 bg-white px-3 py-2 text-xs"><option value="">चरण स्वतः पहिचान</option>{GUIDE_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select>
              <button type="button" onClick={submitAdvice} disabled={adviceText.trim().length < 8} className="inline-flex items-center gap-2 rounded bg-[#1b64b5] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="h-4 w-4 text-amber-300" />स्रोतसहित परामर्श लिनुहोस्</button>
            </div>
          </section>
          {(adviceText.trim() || adviceStage) && (
            <section className="space-y-3">
              {(adviceStage ? [adviceStage] : GUIDE_STAGES.filter((stage) => stage.keywords.some((keyword) => adviceText.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()))).slice(0, 2).map((stage) => stage.id)).map((id) => <div key={id} className="border-l-4 border-[#1b64b5] bg-blue-50 px-3 py-2 text-xs"><strong>सम्भावित चरण:</strong> {stageName(id)} <span className="text-slate-600">• {GUIDE_STAGES.find((stage) => stage.id === id)?.tip}</span></div>)}
              <p className="text-xs text-slate-600">सबैभन्दा मिल्दा अभिलेखका आधारमा Gemini सहायकलाई प्रश्न पठाइन्छ। तलका नतिजा मिलानका लागि मात्र हुन्, कानुनी निष्कर्ष होइनन्।</p>
              <h3 className="text-sm font-bold">मिल्दा राय परामर्श ({adviceMatches.opinions.length})</h3>
              {adviceMatches.opinions.slice(0, 5).map((record, index) => <OpinionCard key={`advice-op-${record.src}-${record.no}-${index}`} record={record} />)}
              <h3 className="text-sm font-bold">मिल्दा पुनरावलोकन निर्णय ({adviceMatches.decisions.length})</h3>
              {adviceMatches.decisions.slice(0, 5).map((record, index) => <DecisionCard key={`advice-pp-${record.no}-${index}`} record={record} />)}
              {!adviceMatches.opinions.length && !adviceMatches.decisions.length && <p className="border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-600">यो शब्द वा चरणसँग मिल्दो राय/निर्णय भेटिएन। अर्को शब्द प्रयोग गर्नुहोस् वा चरण filter बदल्नुहोस्।</p>}
            </section>
          )}
          <div className="flex items-start gap-2 border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><p>पुराना राय/निर्णय तथ्यविशेषमा आधारित हुन्छन्। उत्तरलाई हाल लागू संशोधन, बोलपत्र कागजात र खरिदको अभिलेखसँग जाँच्नुहोस्; PPMO रायलाई कुनै खास बोलपत्र स्वीकार्ने/अस्वीकार्ने अन्तिम निर्णय नमान्नुहोस्।</p></div>
        </div>
      )}

      {activeTab === 'pprc' && (
        <div className="space-y-3">
          <section className="grid gap-2 border border-slate-200 bg-white p-3 sm:grid-cols-3">
            <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="विवाद, पक्ष वा निर्णय खोज्नुहोस्" className="rounded border border-slate-300 px-3 py-2 text-xs outline-none focus:border-[#1b64b5]" />
            <select value={decisionType} onChange={(event) => setDecisionType(event.target.value)} className="rounded border border-slate-300 bg-white px-2 py-2 text-xs"><option value="">सबै निर्णय प्रकार</option>{decisionTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
            <select value={searchStage} onChange={(event) => setSearchStage(event.target.value)} className="rounded border border-slate-300 bg-white px-2 py-2 text-xs"><option value="">सबै चरण</option>{GUIDE_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select>
          </section>
          <p className="text-xs font-semibold text-slate-600">{(searchText ? rankedDecisions : data.decisions).filter((record) => (!decisionType || record.type === decisionType) && (!searchStage || record.stageIds.includes(searchStage))).length} निर्णय</p>
          <div className="space-y-2">
            {(searchText ? rankedDecisions : data.decisions)
              .filter((record) => (!decisionType || record.type === decisionType) && (!searchStage || record.stageIds.includes(searchStage)))
              .slice(0, 30)
              .map((record, index) => <DecisionCard key={`pprc-${record.no}-${index}`} record={record} />)}
          </div>
        </div>
      )}

      {activeTab === 'references' && (
        <div className="space-y-3">
          <section className="border border-slate-200 bg-white p-3">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><BookOpen className="h-4 w-4 text-[#1b64b5]" />राय तथा निर्णयमा उल्लेख भएका कानुनी सन्दर्भ</h3>
            <input value={referenceQuery} onChange={(event) => setReferenceQuery(event.target.value)} placeholder="दफा वा नियम खोज्नुहोस्" className="w-full rounded border border-slate-300 px-3 py-2 text-xs outline-none focus:border-[#1b64b5]" />
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {referenceCounts.filter(([reference]) => referenceQuery ? reference.toLocaleLowerCase().includes(referenceQuery.toLocaleLowerCase()) : true).slice(0, 60).map(([reference, count]) => (
                <button type="button" key={reference} onClick={() => setSelectedReference(reference)} aria-pressed={selectedReference === reference} className={`flex items-center justify-between border px-2.5 py-2 text-left text-xs ${selectedReference === reference ? 'border-[#1b64b5] bg-blue-50 text-[#185294]' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                  <span className="font-bold">{reference}</span><span className="text-slate-500">{count} अभिलेख</span>
                </button>
              ))}
            </div>
          </section>
          {selectedReference && selectedReferenceItems && <section className="space-y-2"><h3 className="text-sm font-bold">{selectedReference}: {selectedReferenceItems.opinions.length} राय • {selectedReferenceItems.decisions.length} निर्णय</h3>{selectedReferenceItems.opinions.slice(0, 15).map((record, index) => <OpinionCard key={`ref-op-${record.src}-${record.no}-${index}`} record={record} />)}{selectedReferenceItems.decisions.slice(0, 15).map((record, index) => <DecisionCard key={`ref-pp-${record.no}-${index}`} record={record} />)}</section>}
          <p className="text-[11px] leading-relaxed text-slate-500">यो सूची guideमा रहेको राय/निर्णय पाठबाट निकालिएको हो। पुराना अभिलेखमा ऐन/नियमको नाम वा नम्बर अहिलेको व्यवस्थासँग फरक हुन सक्छ।</p>
        </div>
      )}

      {activeTab === 'about' && (
        <section className="space-y-3 border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
          <h3 className="flex items-center gap-2 font-bold text-slate-900"><Landmark className="h-4 w-4 text-[#1b64b5]" />स्रोत र प्रयोगको सीमा</h3>
          <p>यो पृष्ठमा procurement_guide.html मा समावेश सार्वजनिक खरिद अनुगमन कार्यालयका ८४८ राय परामर्श अंश र सार्वजनिक खरिद पुनरावलोकन समितिका २२१ निर्णय खोज्न र चरणअनुसार छान्न मिल्छ।</p>
          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>राय तथा निर्णयको मूल तथ्य र निष्कर्ष संक्षिप्त/युनिकोड रूपान्तरण गरिएका सामग्रीबाट आएका हुन्; पुराना पाठमा टाइप वा रूपान्तरण त्रुटि हुन सक्छ।</li>
            <li>चरण वर्गीकरण विषयका शब्दसँग मिलाएर गरिएको हो; एउटै अभिलेख एकभन्दा बढी चरणमा देखिन सक्छ वा छुट्न सक्छ।</li>
            <li>राय/निर्णय सूची PPMO को अभिलेखमा उल्लेख भएका सन्दर्भबाट निकालिएको हो, हालको संशोधित ऐन/नियमावलीको पूर्ण पाठ होइन।</li>
            <li>राय/निर्णय तथ्यविशेषमा आधारित छन्; कानूनमा भएका संशोधन, बोलपत्र कागजात र आफ्नो मिसिलसँग मिलाएर मात्र निर्णय गर्नुहोस्।</li>
          </ul>
        </section>
      )}

      {/* <footer className="flex items-center gap-2 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
        <BookOpen className="h-3.5 w-3.5 text-[#1b64b5]" />
        {language === 'ne' ? 'स्रोत: procurement_guide.html मा संकलित PPMO राय तथा PPRC निर्णय' : 'Source: compiled PPMO opinions and PPRC decisions in procurement_guide.html'}
      </footer> */}
    </div>
  );
};