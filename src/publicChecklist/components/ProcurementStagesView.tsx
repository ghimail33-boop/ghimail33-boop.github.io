import React from 'react';
import { 
  FileText, 
  Clock, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  ListOrdered,
  ArrowLeft, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PROCUREMENT_STAGES, PROCUREMENT_SOURCE_NOTE } from '../data/procurementData';
import { Language } from '../types/procurement';

interface ProcurementStagesViewProps {
  language: Language;
  selectedStageId: number;
  onSelectStage: (stageId: number) => void;
  onOpenChecklistForStage: (stageId: number) => void;
}

export const ProcurementStagesView: React.FC<ProcurementStagesViewProps> = ({
  language,
  selectedStageId,
  onSelectStage,
  onOpenChecklistForStage,
}) => {
  const currentStage = PROCUREMENT_STAGES.find((s) => s.id === selectedStageId) || PROCUREMENT_STAGES[0];

  const handlePrev = () => {
    if (selectedStageId > 1) {
      onSelectStage(selectedStageId - 1);
    }
  };

  const handleNext = () => {
    if (selectedStageId < PROCUREMENT_STAGES.length) {
      onSelectStage(selectedStageId + 1);
    }
  };

  return (
    <div className="space-y-3 text-slate-800">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1b64b5] text-white text-xs font-bold px-2 py-0.5 rounded">
              {language === 'ne' ? `${PROCUREMENT_STAGES.length} चरणगत प्रक्रिया` : `${PROCUREMENT_STAGES.length}-Phase Process`}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              सार्वजनिक खरिद ऐन, २०६३ र नियमावली, २०६४ बमोजिम
            </span>
          </div>
          <h3 className="text-md sm:text-md font-black text-[#185294] mt-1">
            {language === 'ne' ? 'चरणगत खरिद कार्यविधि' : 'Step-by-Step Procurement Procedures'}
          </h3>
          <p className="text-slate-600 text-sm mt-0.5">
            {language === 'ne' 
              ? 'खरिद योजनादेखि अन्तिम भुक्तानीसम्म पालना गर्नुपर्ने कानूनी चरणहरू।' 
              : 'End-to-end statutory procurement phases from initial planning to contract closure for all public entities.'}
          </p>
        </div>

        {/* Stepper Quick Summary pill */}
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-md text-right">
          <div className="text-xs text-slate-500 font-semibold">हालको चरण</div>
          <div className="text-lg font-black text-[#185294]">
            {selectedStageId} / {PROCUREMENT_STAGES.length}
          </div>
        </div>
      </div>
{/* 
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
        {PROCUREMENT_SOURCE_NOTE}
      </div> */}

      {/* Interactive process stepper */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs overflow-x-auto no-print">
        <div className="flex items-center justify-between min-w-[700px] relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
          <div 
            className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-[#1b64b5] -z-0 transition-all duration-300"
            style={{ width: `${((selectedStageId - 1) / (PROCUREMENT_STAGES.length - 1)) * 95}%` }}
          />

          {PROCUREMENT_STAGES.map((stage) => {
            const isSelected = stage.id === selectedStageId;
            const isCompleted = stage.id < selectedStageId;
            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
                aria-current={isSelected ? 'step' : undefined}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors border ${
                    isSelected
                      ? 'bg-[#1b64b5] text-white border-amber-400 ring-2 ring-blue-100'
                      : isCompleted
                      ? 'bg-[#185294] text-white border-[#185294]'
                      : 'bg-white text-slate-600 border-slate-300 group-hover:border-blue-400'
                  }`}
                >
                  {stage.id}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 max-w-[85px] text-center leading-tight truncate ${
                    isSelected ? 'text-[#185294] font-bold' : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  {stage.title.split(' ')[0]} {stage.title.split(' ')[1] || ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Stage Detail Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* Stage Header */}
        <div className="border-b-4 border-amber-400 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="bg-blue-50 text-[#185294] border border-blue-200 text-xs font-bold px-2 py-1 rounded">
              {currentStage.stageNumber}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onOpenChecklistForStage(currentStage.id)}
                className="flex items-center gap-1.5 bg-[#1b64b5] hover:bg-[#155294] text-white px-3 py-2 rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>यस चरणको अनुपालन चेकलिस्ट परीक्षण</span>
              </button>
            </div>
          </div>

          <h3 className="text-lg font-black text-slate-900 mt-3">
            {language === 'ne' ? currentStage.title : currentStage.titleEn}
          </h3>
          <p className="text-slate-600 text-sm mt-1 leading-relaxed max-w-4xl">
            {language === 'ne' ? currentStage.shortDesc : currentStage.shortDescEn}
          </p>

          {/* Quick Legal & Time badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-200 text-xs">
            <div className="flex items-start gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 text-slate-700">
              <Scale className="w-4 h-4 text-[#1b64b5] shrink-0" />
              <span><strong className="text-slate-900">कानूनी आधार:</strong> {currentStage.legalBasis}</span>
            </div>
            <div className="flex items-start gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200 text-amber-950">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span><strong>तोकिएको म्याद:</strong> {currentStage.timeLimit}</span>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white">
          <section className="md:col-span-2 rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
              <ListOrdered className="w-5 h-5 text-[#1b64b5]" />
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'यस चरणमा अपनाउने कार्यविधि' : 'Procedure to Follow in This Stage'}
              </h4>
            </div>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-700">
              {currentStage.procedureSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1b64b5] text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <p className="border-t border-blue-200 pt-2 text-xs leading-relaxed text-blue-950">
              रकमको सीमा, अवधि, स्वीकृति दिने अधिकारी, जमानत र विधि-विशेषका शर्त सम्बन्धित खरिदको प्रकृति तथा लागू संशोधित नियमावली र मानक कागजातबाट यकिन गर्नुहोस्।
            </p>
          </section>

          {/* 1. Key Responsibilities */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-[#1b64b5]" />
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'प्रमुख जिम्मेवारी तथा कार्यहरू' : 'Key Responsibilities'}
              </h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {currentStage.keyResponsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#1b64b5] font-bold shrink-0 mt-0.5">•</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 2. Mandatory Documents */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <FileText className="w-5 h-5 text-[#1b64b5]" />
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'अनिवार्य कागजात तथा अभिलेखहरू' : 'Mandatory Documents & Records'}
              </h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {currentStage.mandatoryDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2 border-b border-slate-100 pb-2 last:border-b-0">
                  <span className="text-[#1b64b5] font-bold shrink-0">{idx + 1}.</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Checkpoints */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'सतर्कता जाँच बिन्दुहरू (Vigilance Checkpoints)' : 'Compliance Checkpoints'}
              </h4>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              {currentStage.checkpoints.map((chk, idx) => (
                <div key={idx} className="flex items-start gap-2 border-b border-slate-100 pb-2 last:border-b-0 text-slate-700">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span>{chk}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Risk & Audit Warning */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'लेखापरीक्षण/बेरुजु जोखिम र सतर्कता सुझाव' : 'Audit Risk & Vigilance Guidance'}
              </h4>
            </div>
            <div className="bg-amber-50/80 p-3 rounded border border-amber-200 text-xs sm:text-sm text-amber-950 leading-relaxed">
              {currentStage.risksAndMitigation}
            </div>

            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded border border-blue-200 text-xs text-blue-950 mt-2">
              <Lightbulb className="w-4 h-4 text-[#1b64b5] shrink-0 mt-0.5" />
              <div>
                <strong>राष्ट्रिय सतर्कता केन्द्रको निर्देशन:</strong> {currentStage.officialAdvice}
              </div>
            </div>
          </section>
        </div>

        {/* Stepper Navigation Controls (Next / Prev) */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            onClick={handlePrev}
            disabled={selectedStageId === 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs sm:text-sm font-bold transition ${
              selectedStageId === 1
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>अघिल्लो चरण</span>
          </button>

          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            चरण {selectedStageId} / {PROCUREMENT_STAGES.length}: {currentStage.title.split(' ')[0]}
          </span>

          <button
            onClick={handleNext}
            disabled={selectedStageId === PROCUREMENT_STAGES.length}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs sm:text-sm font-bold transition ${
              selectedStageId === PROCUREMENT_STAGES.length
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#1b64b5] hover:bg-[#155294] text-white shadow-xs cursor-pointer'
            }`}
          >
            <span>पछिल्लो चरण</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
