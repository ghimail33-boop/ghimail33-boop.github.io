import React, { useState } from 'react';
import { 
  ChevronUp, 
  Compass, 
  Layers, 
  CheckSquare, 
  Calculator, 
  BookOpen, 
  X, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { NavTabId } from './Navigation';
import { Language } from '../types/procurement';
import { PROCUREMENT_STAGES } from '../data/procurementData';

interface SidebarQuickNavProps {
  onTabChange: (tab: NavTabId) => void;
  onSelectStage: (stageId: number) => void;
  language: Language;
}

export const SidebarQuickNav: React.FC<SidebarQuickNavProps> = ({
  onTabChange,
  onSelectStage,
  language
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stagesList = PROCUREMENT_STAGES.map((stage) => ({
    id: stage.id,
    name: `${stage.stageNumber}: ${stage.title}`,
  }));

  return (
    <>
      {/* Floating Action Trigger Button on Right edge */}
      <div className="fixed right-3 bottom-24 z-50 flex flex-col items-end space-y-2 no-print">
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-full bg-[#185294] text-white shadow-md hover:bg-[#144378] hover:scale-105 transition-all border border-blue-300"
            title="पृष्ठको माथि जानुहोस् (Scroll to top)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#1b64b5] text-white shadow-lg hover:bg-[#155294] transition-all border-2 border-amber-300 group cursor-pointer"
          title="द्रुत नेभिगेसन मेनु"
        >
          <Compass className="w-5 h-5 text-amber-300 animate-spin group-hover:rotate-180 transition-transform" />
          <span className="text-xs font-bold tracking-wide">
            {language === 'ne' ? 'द्रुत नेभिगेटर' : 'Quick Nav'}
          </span>
        </button>
      </div>

      {/* Slide-out Quick Navigation Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end no-print">
          <div className="w-full max-w-sm bg-white h-full shadow-xl flex flex-col border-l-4 border-[#1b64b5] animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="bg-[#185294] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">
                  {language === 'ne' ? 'द्रुत नेभिगेसन तथा सिधा पहुँच' : 'Quick Access Navigation'}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-blue-800 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2 text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1b64b5]"></span>
                  {language === 'ne' ? 'मुख्य औजारहरू (Direct Tools)' : 'Direct Tools'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onTabChange('checklist');
                      setIsOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-900 font-semibold transition"
                  >
                    <CheckSquare className="w-5 h-5 text-[#1b64b5] mb-1" />
                    <span>सतर्कता चेकलिस्ट</span>
                  </button>

                  <button
                    onClick={() => {
                      onTabChange('calculator');
                      setIsOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900 font-semibold transition"
                  >
                    <Calculator className="w-5 h-5 text-slate-700 mb-1" />
                    <span>थ्रेसहोल्ड क्याल्कुलेटर</span>
                  </button>

                  <button
                    onClick={() => {
                      onTabChange('methods');
                      setIsOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold transition"
                  >
                    <Layers className="w-5 h-5 text-amber-700 mb-1" />
                    <span>खरिद विधिहरू</span>
                  </button>

                  <button
                    onClick={() => {
                      onTabChange('legal');
                      setIsOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold transition"
                  >
                    <BookOpen className="w-5 h-5 text-emerald-700 mb-1" />
                    <span>ऐन तथा डाउनलोड</span>
                  </button>
                </div>
              </div>

              {/* Direct stage jump */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1b64b5]"></span>
                    {language === 'ne' ? `खरिदका ${stagesList.length} चरणहरू (Jump to Phase)` : 'Procurement Phases'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">चरण १ - {stagesList.length}</span>
                </h4>
                <div className="space-y-1">
                  {stagesList.map((stg) => (
                    <button
                      key={stg.id}
                      onClick={() => {
                        onTabChange('stages');
                        onSelectStage(stg.id);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-100 text-slate-700 hover:text-[#1b64b5] transition text-left font-medium border border-transparent hover:border-slate-200"
                    >
                      <span className="truncate">{stg.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Legal Warning Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>सतर्कता स्मरण</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  सार्वजनिक खरिद ऐन, २०६३ को दफा ८(२) बमोजिम प्रतिस्पर्धा छल्ने गरी काम टुक्र्याउनु कानून विपरित हुन्छ।
                </p>
              </div>
            </div>

            {/* Bottom Footer in quick nav */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-slate-500 text-[11px]">
              नेपाल सरकार राष्ट्रिय सतर्कता केन्द्र
            </div>
          </div>
        </div>
      )}
    </>
  );
};
