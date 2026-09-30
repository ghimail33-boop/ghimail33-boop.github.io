import React, { useState } from 'react';
import { 
  Home, 
  Layers, 
  CheckSquare, 
  Calculator, 
  BookOpen, 
  Users, 
  Search, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck,
  Scale,
  MessagesSquare
} from 'lucide-react';
import { Language } from '../types/procurement';
import { PROCUREMENT_STAGES } from '../data/procurementData';

export type NavTabId = 'home' | 'stages' | 'guidance' | 'methods' | 'checklist' | 'calculator' | 'legal' | 'charter';

interface NavigationProps {
  currentTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  language: Language;
  onSearchOpen: () => void;
  activeStageId?: number | null;
  onSelectStage?: (stageId: number) => void;
  compact?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  language,
  onSearchOpen,
  activeStageId,
  onSelectStage,
  compact = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'home' as NavTabId,
      labelNe: 'गृहपृष्ठ',
      labelEn: 'Home',
      icon: Home
    },
    {
      id: 'stages' as NavTabId,
      labelNe: 'चरणगत कार्यविधि',
      labelEn: 'Step-by-Step Procedure',
      icon: Layers,
      badge: `${PROCUREMENT_STAGES.length} चरण`
    },
    {
      id: 'guidance' as NavTabId,
      labelNe: 'द्विविधा तथा निर्णय मार्गदर्शन',
      labelEn: 'Dilemmas & Decisions',
      icon: MessagesSquare
    },
    {
      id: 'methods' as NavTabId,
      labelNe: 'खरिद विधिहरू',
      labelEn: 'Procurement Methods',
      icon: Scale
    },
    {
      id: 'checklist' as NavTabId,
      labelNe: 'परिपालना चेकलिस्ट',
      labelEn: 'Vigilance Checklist',
      icon: CheckSquare,
      // badge: 'अनिवार्य'
    },
    {
      id: 'calculator' as NavTabId,
      labelNe: 'थ्रेसहोल्ड क्याल्कुलेटर',
      labelEn: 'Threshold Calculator',
      icon: Calculator
    },
    {
      id: 'legal' as NavTabId,
      labelNe: 'कानूनी आधारहरू',
      labelEn: 'Acts & Downloads',
      icon: BookOpen
    },
    {
      id: 'charter' as NavTabId,
      labelNe: 'नागरिक वडापत्र तथा उजुरी',
      labelEn: 'Citizen Charter & Grievance',
      icon: Users
    }
  ];

  const handleSelectTab = (tab: NavTabId) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const currentItem = navItems.find((n) => n.id === currentTab);

  return (
    <>
      {/* NVC Blue Tone Navigation Bar - No red, no dark midnight */}
      <nav className="w-full bg-[#1b64b5] text-white shadow-sm sticky top-0 z-40 no-print border-b border-blue-700">
        <div className={compact ? 'w-full max-w-none px-1.5 xl:px-1.5' : 'max-w-7xl mx-auto px-4 sm:px-8'}>
          <div className="flex items-center justify-between h-8">
            {/* Desktop Navigation Links */}
            <div className={`${compact ? 'hidden xl:flex' : 'hidden lg:flex'} items-center ${compact ? 'gap-2' : 'space-x-1 xl:space-x-1.5'} h-full`}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`relative flex items-center ${compact ? 'gap-4 px-1 py-0.5 text-[11px] whitespace-nowrap rounded-md border' : 'gap-1.5 px-3 py-1 text-sm rounded-t border-b-1'} font-semibold transition-all cursor-pointer h-full shrink-0 ${
                      isActive
                        ? 'bg-[#144e8c] text-white border-amber-300 font-bold'
                        : compact
                          ? 'border-white/20 bg-white/10 text-blue-50 hover:bg-white/20 hover:text-white'
                          : 'border-transparent text-blue-50 hover:bg-[#16559a] hover:text-white'
                    }`}
                  >
                    <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} ${isActive ? 'text-amber-300' : 'text-blue-100'}`} />
                    <span className={compact ? 'whitespace-nowrap' : undefined}>
                      {language === 'ne' ? item.labelNe : item.labelEn}
                    </span>
                    {item.badge && (
                      <span className={`text-[10px] bg-amber-400 text-slate-900 font-bold ${compact ? 'px-0.5 whitespace-nowrap' : 'px-1.5'} py-0.2 rounded-full ml-0.5`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Header elements */}
            <div className={`${compact ? 'xl:hidden' : 'lg:hidden'} flex items-center`}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 rounded bg-blue-700 hover:bg-blue-600 text-white focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <span className="ml-2.5 text-sm font-bold text-white truncate max-w-[200px]">
                {language === 'ne' ? currentItem?.labelNe : currentItem?.labelEn}
              </span>
            </div>

            {/* Right: Quick Search Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={onSearchOpen}
                className={`flex items-center ${compact ? 'gap-0 px-1 text-[11px]' : 'gap-2 px-3 text-xs'} bg-[#144e8c] hover:bg-[#0f4075] text-slate-100 py-1.5 rounded-full font-medium border border-blue-400/40 shadow-inner transition cursor-pointer whitespace-nowrap`}
                title="ऐन, नियम, दफा वा कार्यविधि खोज्नुहोस्"
              >
                <Search className="w-3.5 h-3.5 text-amber-300" />
                <span className={compact ? 'hidden' : 'hidden sm:inline'}>
                  {compact
                    ? language === 'ne' ? 'खोज' : 'Search'
                    : language === 'ne' ? 'खोज्नुहोस् (Search)...' : 'Quick Search...'}
                </span>
                <kbd className={`${compact ? 'hidden' : 'hidden sm:inline'} bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded text-[10px] font-mono`}>
                  Ctrl+K
                </kbd>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className={`${compact ? 'xl:hidden' : 'lg:hidden'} bg-[#16559a] border-t border-blue-700 px-4 py-3 space-y-1`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition ${
                    isActive ? 'bg-[#103e73] text-amber-300 font-bold' : 'text-blue-50 hover:bg-[#1a5ea8]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-amber-300" />
                    <span>{language === 'ne' ? item.labelNe : item.labelEn}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Official Breadcrumb Bar */}
      <div className="bg-[#f0f4f9] border-b border-slate-200 py-1.5 px-4 sm:px-8 text-xs text-slate-600 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-1 text-[#1b64b5] hover:underline font-semibold"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'गृहपृष्ठ' : 'Home'}</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#185294] font-bold">
              {language === 'ne' ? currentItem?.labelNe : currentItem?.labelEn}
            </span>
            {currentTab === 'stages' && activeStageId && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-800 font-medium">चरण {activeStageId}</span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1b64b5]" />
            <span>राष्ट्रिय सतर्कता केन्द्रको – सार्वजनिक खरिदमा सुशासन, नियमको परिपालना  र बेरुजु रोकथाम पहल</span>
          </div>
        </div>
      </div>
    </>
  );
};
