import React, { useEffect, useState } from 'react';
import { HomeDashboardView } from '../publicChecklist/components/HomeDashboardView';
import { ProcurementStagesView } from '../publicChecklist/components/ProcurementStagesView';
import { ProcurementGuidanceView } from '../publicChecklist/components/ProcurementGuidanceView';
import { ProcurementMethodsView } from '../publicChecklist/components/ProcurementMethodsView';
import { ComplianceChecklistView } from '../publicChecklist/components/ComplianceChecklistView';
import { ThresholdCalculatorView } from '../publicChecklist/components/ThresholdCalculatorView';
import { LegalDocumentsView } from '../publicChecklist/components/LegalDocumentsView';
import { CitizenCharterView } from '../publicChecklist/components/CitizenCharterView';
import { Navigation, type NavTabId } from '../publicChecklist/components/Navigation';
import { SearchModal } from '../publicChecklist/components/SearchModal';
import { SidebarQuickNav } from '../publicChecklist/components/SidebarQuickNav';
import { GeminiChatbot } from '../publicChecklist/components/GeminiChatbot';
import { PROCUREMENT_STAGES } from '../publicChecklist/data/procurementData';
import type { Language } from '../publicChecklist/types/procurement';

export type ProcurementProcessTab = NavTabId;

export const ProcurementProcessView: React.FC = () => {
  const [language, setLanguage] = useState<Language>('ne');
  const [fontSizeLevel, setFontSizeLevel] = useState(0);
  const [currentTab, setCurrentTab] = useState<ProcurementProcessTab>('home');
  const [selectedStageId, setSelectedStageId] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotQuery, setChatbotQuery] = useState<string | null>(null);

  const handleAskAi = (query: string) => {
    setChatbotQuery(query);
    setIsChatbotOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSizeLevel === -1) {
      root.style.fontSize = '14.5px';
    } else if (fontSizeLevel === 0) {
      root.style.fontSize = '16px';
    } else if (fontSizeLevel === 1) {
      root.style.fontSize = '17.5px';
    } else {
      root.style.fontSize = '19px';
    }
  }, [fontSizeLevel]);

  const handleTabChange = (tab: ProcurementProcessTab) => {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[70vh] bg-[#f4f7fb] text-slate-800">
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        language={language}
        onSearchOpen={() => setIsSearchOpen(true)}
        activeStageId={selectedStageId}
        onSelectStage={handleSelectStage}
        compact
      />

      <main className="w-full">
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

        {currentTab === 'calculator' && <ThresholdCalculatorView language={language} />}

        {currentTab === 'legal' && <LegalDocumentsView language={language} />}

        {currentTab === 'charter' && <CitizenCharterView language={language} />}
      </main>

      <SidebarQuickNav
        onTabChange={handleTabChange}
        onSelectStage={handleSelectStage}
        language={language}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab, stageId) => {
          if (stageId) setSelectedStageId(stageId);
          handleTabChange(tab);
        }}
      />

      {/* Gemini Public Checklist AI Assistant */}
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
    </div>
  );
};
