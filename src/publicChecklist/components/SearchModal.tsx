import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Layers, CheckSquare, Calculator, ArrowRight } from 'lucide-react';
import { NavTabId } from './Navigation';
import { PROCUREMENT_STAGES, PROCUREMENT_METHODS, COMPLIANCE_CHECKLIST } from '../data/procurementData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTabId, stageId?: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchedStages = PROCUREMENT_STAGES.filter(
    (s) =>
      s.title.toLowerCase().includes(trimmed) ||
      s.shortDesc.toLowerCase().includes(trimmed) ||
      s.legalBasis.toLowerCase().includes(trimmed)
  );

  const matchedMethods = PROCUREMENT_METHODS.filter(
    (m) =>
      m.name.toLowerCase().includes(trimmed) ||
      m.description.toLowerCase().includes(trimmed) ||
      m.thresholdLimit.toLowerCase().includes(trimmed)
  );

  const matchedChecklist = COMPLIANCE_CHECKLIST.filter(
    (c) =>
      c.question.toLowerCase().includes(trimmed) ||
      c.category.toLowerCase().includes(trimmed) ||
      c.legalRef.toLowerCase().includes(trimmed)
  );

  const hasResults =
    trimmed.length > 0 &&
    (matchedStages.length > 0 || matchedMethods.length > 0 || matchedChecklist.length > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 no-print">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border-2 border-[#1b64b5] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="ऐन, नियम, दफा, चरण, खरिद विधि वा चेकलिस्ट खोज्नुहोस् (उदा. लागत अनुमान, दफा ७, दरभाउ, LoI)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-3 py-1 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
          >
            Esc
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {trimmed.length === 0 ? (
            <div className="text-center py-6 text-slate-500 space-y-3">
              <p className="font-medium">
                केही खोज्न शब्द टाइप गर्नुहोस् वा मुख्य विषयहरू छान्नुहोस्:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                {['वार्षिक खरिद योजना', 'लागत अनुमान', 'दफा १४ सूचना', 'आशयको सूचना LoI', 'उपभोक्ता समिति', 'सोझै खरिद सीमा', 'प्राविधिक परीक्षण'].map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(term)}
                    className="bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 font-medium px-2.5 py-1 rounded border border-slate-200 transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-8 text-slate-500">
              <p className="font-semibold text-slate-700">कुनै नतिजा भेटिएन</p>
              <p className="text-xs text-slate-400 mt-1">
                कृपया अर्को शब्द वा दफा नम्बर प्रविष्ट गर्नुहोस् (उदा. 'खरिद योजना', 'दरभाउ', 'दफा ५')
              </p>
            </div>
          ) : (
            <>
              {/* Stages Results */}
              {matchedStages.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#1b64b5]" />
                    <span>खरिदका चरणहरू ({matchedStages.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedStages.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate('stages', s.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-lg border border-slate-200 hover:border-[#1b64b5] hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            चरण {s.id}: {s.title}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                            {s.shortDesc}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Methods Results */}
              {matchedMethods.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-amber-700" />
                    <span>खरिद विधिहरू ({matchedMethods.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedMethods.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onNavigate('methods');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {m.name}
                          </div>
                          <div className="text-amber-800 text-[11px] font-semibold mt-0.5">
                            सीमा: {m.thresholdLimit}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklist Results */}
              {matchedChecklist.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#1b64b5]" />
                    <span>अनुपालन चेकलिस्ट प्रश्नहरू ({matchedChecklist.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedChecklist.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('checklist');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg border border-slate-200 hover:border-[#1b64b5] hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs line-clamp-1">
                            {c.question}
                          </div>
                          <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                            {c.legalRef} • चरण {c.stageId}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <span>कुनै पनि परिणाममा क्लिक गरी सिधै नेभिगेट गर्नुहोस्</span>
          <span>नेपाल सरकार राष्ट्रिय सतर्कता केन्द्र</span>
        </div>
      </div>
    </div>
  );
};
