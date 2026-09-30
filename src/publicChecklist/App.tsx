import React, { useState, useEffect } from 'react';
import { GovernmentHeader } from './components/GovernmentHeader';
import { Navigation, NavTabId } from './components/Navigation';
import { SidebarQuickNav } from './components/SidebarQuickNav';
import { SearchModal } from './components/SearchModal';
import { HomeDashboardView } from './components/HomeDashboardView';
import { ProcurementStagesView } from './components/ProcurementStagesView';
import { ProcurementGuidanceView } from './components/ProcurementGuidanceView';
import { ProcurementMethodsView } from './components/ProcurementMethodsView';
import { ComplianceChecklistView } from './components/ComplianceChecklistView';
import { ThresholdCalculatorView } from './components/ThresholdCalculatorView';
import { LegalDocumentsView } from './components/LegalDocumentsView';
import { CitizenCharterView } from './components/CitizenCharterView';
import { Footer } from './components/Footer';
import { GeminiChatbot } from './components/GeminiChatbot';
import { PROCUREMENT_STAGES } from './data/procurementData';
import { Language } from './types/procurement';

export default function App() {
  const [language, setLanguage] = useState<Language>('ne');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState<NavTabId>('home');
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [chatbotQuery, setChatbotQuery] = useState<string | null>(null);

  const handleAskAi = (query: string) => {
    setChatbotQuery(query);
    setIsChatbotOpen(true);
  };

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle font size change on body
  useEffect(() => {
    const root = document.documentElement;
    if (fontSizeLevel === -1) {
      root.style.fontSize = '14.5px';
    } else if (fontSizeLevel === 0) {
      root.style.fontSize = '16px';
    } else if (fontSizeLevel === 1) {
      root.style.fontSize = '17.5px';
    } else if (fontSizeLevel >= 2) {
      root.style.fontSize = '19px';
    }
  }, [fontSizeLevel]);

  const handlePrint = () => {
    window.print();
  };

  const handleTabChange = (tab: NavTabId) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStage = (stageId: number) => {
    setSelectedStageId(stageId);
    setCurrentTab('stages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChecklistForStage = (stageId: number) => {
    setSelectedStageId(stageId);
    setCurrentTab('checklist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Official Government Header - National Vigilance Centre */}
      <GovernmentHeader
        language={language}
        onLanguageChange={setLanguage}
        fontSizeLevel={fontSizeLevel}
        onFontSizeChange={setFontSizeLevel}
        onPrintClick={handlePrint}
      />

      {/* 2. Primary Navigation Bar & Breadcrumb (Notice Ticker removed per user requirement) */}
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        language={language}
        onSearchOpen={() => setIsSearchOpen(true)}
        activeStageId={selectedStageId}
        onSelectStage={handleSelectStage}
      />

      {/* 3. Main Body Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-3 pb-6">
        {currentTab === 'home' && (
          <HomeDashboardView
            language={language}
            onTabChange={handleTabChange}
            onSelectStage={handleSelectStage}
          />
        )}

        {currentTab === 'stages' && (
          <ProcurementStagesView
            language={language}
            selectedStageId={selectedStageId}
            onSelectStage={setSelectedStageId}
            onOpenChecklistForStage={handleOpenChecklistForStage}
          />
        )}

        {currentTab === 'guidance' && (
          <ProcurementGuidanceView language={language} onAskAi={handleAskAi} />
        )}

        {currentTab === 'methods' && (
          <ProcurementMethodsView
            language={language}
            onOpenCalculator={() => handleTabChange('calculator')}
          />
        )}

        {currentTab === 'checklist' && (
          <ComplianceChecklistView
            language={language}
            initialStageFilter={selectedStageId}
            onPrint={handlePrint}
            onAskAi={handleAskAi}
          />
        )}

        {currentTab === 'calculator' && (
          <ThresholdCalculatorView language={language} />
        )}

        {currentTab === 'legal' && (
          <LegalDocumentsView language={language} />
        )}

        {currentTab === 'charter' && (
          <CitizenCharterView language={language} />
        )}
      </main>

      {/* 4. Floating Quick Navigation Navigator */}
      <SidebarQuickNav
        onTabChange={handleTabChange}
        onSelectStage={handleSelectStage}
        language={language}
      />

      {/* 5. Universal Quick Search Modal (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab, stageId) => {
          if (stageId) setSelectedStageId(stageId);
          handleTabChange(tab);
        }}
      />

      {/* 6. Gemini Public Checklist AI Assistant */}
      <GeminiChatbot
        currentStageContext={
          PROCUREMENT_STAGES.find((s) => s.id === selectedStageId)
            ? {
                id: selectedStageId,
                title:
                  language === 'ne'
                    ? PROCUREMENT_STAGES.find((s) => s.id === selectedStageId)!.title
                    : PROCUREMENT_STAGES.find((s) => s.id === selectedStageId)!.titleEn,
              }
            : null
        }
        isOpenExternal={isChatbotOpen}
        onCloseExternal={() => {
          setIsChatbotOpen(false);
          setChatbotQuery(null);
        }}
        externalQuery={chatbotQuery}
      />

      {/* 7. Official Footer - National Vigilance Centre */}
      <Footer language={language} />
    </div>
  );
}
