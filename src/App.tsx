import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProcurementsView } from './components/ProcurementsView';
import { InspectionsView } from './components/InspectionsView';
import { FindingsView } from './components/FindingsView';
import { MasterChecklistView } from './components/MasterChecklistView';
import { ReportsView } from './components/ReportsView';
import { ProcurementProcessView } from './components/ProcurementProcessView';
import { AuditLogsView } from './components/AuditLogsView';
import { LoginView } from './components/LoginView';
import PublicChecklistApp from './publicChecklist/App';

import { ProcurementModal } from './components/modals/ProcurementModal';
import { FindingModal } from './components/modals/FindingModal';
import { EvidenceModal } from './components/modals/EvidenceModal';
import { ReportPrintModal } from './components/modals/ReportPrintModal';
import { ToastProvider } from './components/Toast';
import { api } from './services/api';

function MainApp() {
  const { currentUser, isLoading, isAdmin, isReviewer } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Navigation Filter state
  const [navParams, setNavParams] = useState<any>({});
  const [selectedProcurementForInspection, setSelectedProcurementForInspection] = useState<number | null>(null);

  // Badge counts
  const [badgeCounts, setBadgeCounts] = useState<{
    findings?: number;
    overdueActions?: number;
    activeInspections?: number;
  }>({});

  // Modals state
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [findingPreload, setFindingPreload] = useState<any>(null);

  const [evidenceModalParams, setEvidenceModalParams] = useState<{
    isOpen: boolean;
    inspectionId: number;
    checklistItemId?: number;
  }>({
    isOpen: false,
    inspectionId: 1,
  });

  const [reportPrintModalParams, setReportPrintModalParams] = useState<{
    isOpen: boolean;
    inspectionId: number;
  }>({
    isOpen: false,
    inspectionId: 1,
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    loadBadgeCounts();
  }, [currentTab, currentUser]);

  const loadBadgeCounts = async () => {
    try {
      const summary = await api.getDashboardSummary();
      setBadgeCounts({
        findings: Number(summary.kpis.open_findings) || 0,
        overdueActions: Number(summary.kpis.overdue_corrective_actions) || 0,
        activeInspections: Number(summary.kpis.in_progress_inspections) || 0,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleNavigate = (tab: string, filter?: any) => {
    setCurrentTab(tab);
    setNavParams(filter || {});
  };

  const handleStartInspection = (procurementId: number) => {
    setSelectedProcurementForInspection(procurementId);
    setCurrentTab('inspections');
  };

  const handleOpenFindingWithPreload = (preload: any) => {
    setFindingPreload(preload);
    setIsFindingModalOpen(true);
  };

  const handleOpenEvidenceUpload = (inspectionId: number, checklistItemId?: number) => {
    setEvidenceModalParams({
      isOpen: true,
      inspectionId,
      checklistItemId,
    });
  };

  const handleOpenReportPrint = (inspectionId: number) => {
    setReportPrintModalParams({
      isOpen: true,
      inspectionId,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto" />
          <div className="text-sm font-semibold tracking-wide">
            राष्ट्रिय सतर्कता केन्द्र (NVC) प्रणाली लोड हुँदैछ...
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Government Header */}
      <Header activeView={currentTab} />

      {/* Main Layout */}
      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        <div className="no-print">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => handleNavigate(tab)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
            canViewAuditLogs={isAdmin || isReviewer}
            badgeCounts={badgeCounts}
          />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-2 sm:p-3 lg:p-4 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onOpenNewProcurement={() => setIsProcurementModalOpen(true)}
              onOpenNewFinding={() => {
                setFindingPreload(null);
                setIsFindingModalOpen(true);
              }}
            />
          )}

          {currentTab === 'procurements' && (
            <ProcurementsView
              onOpenNewModal={() => setIsProcurementModalOpen(true)}
              onStartInspection={handleStartInspection}
            />
          )}

          {currentTab === 'inspections' && (
            <InspectionsView
              initialProcurementId={selectedProcurementForInspection}
              onOpenFindingWithPreload={handleOpenFindingWithPreload}
              onOpenEvidenceUpload={handleOpenEvidenceUpload}
              onOpenReportPrint={handleOpenReportPrint}
            />
          )}

          {currentTab === 'findings' && (
            <FindingsView
              initialRiskFilter={navParams?.risk_level}
              initialSearch={navParams?.search}
              onOpenNewFinding={() => {
                setFindingPreload(null);
                setIsFindingModalOpen(true);
              }}
            />
          )}

          {currentTab === 'master-checklist' && <MasterChecklistView />}

          {currentTab === 'reports' && (
            <ReportsView onOpenReportPrint={handleOpenReportPrint} />
          )}

          {currentTab === 'procurement-process' && <ProcurementProcessView />}

          {currentTab === 'audit-logs' && <AuditLogsView />}
        </main>
      </div>

      {/* Modals */}
      <ProcurementModal
        isOpen={isProcurementModalOpen}
        onClose={() => setIsProcurementModalOpen(false)}
        onSuccess={() => {
          loadBadgeCounts();
        }}
      />

      <FindingModal
        isOpen={isFindingModalOpen}
        preloadData={findingPreload}
        onClose={() => {
          setIsFindingModalOpen(false);
          setFindingPreload(null);
        }}
        onSuccess={() => {
          loadBadgeCounts();
        }}
      />

      <EvidenceModal
        isOpen={evidenceModalParams.isOpen}
        inspectionId={evidenceModalParams.inspectionId}
        checklistItemId={evidenceModalParams.checklistItemId}
        onClose={() =>
          setEvidenceModalParams((prev) => ({ ...prev, isOpen: false }))
        }
      />

      <ReportPrintModal
        isOpen={reportPrintModalParams.isOpen}
        inspectionId={reportPrintModalParams.inspectionId}
        onClose={() =>
          setReportPrintModalParams((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}

export default function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/checklist') {
    return <PublicChecklistApp />;
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
