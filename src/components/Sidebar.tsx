import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  ClipboardCheck,
  AlertTriangle,
  ListOrdered,
  FileSpreadsheet,
  History,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Workflow,
  Scale,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  canViewAuditLogs?: boolean;
  badgeCounts?: {
    findings?: number;
    overdueActions?: number;
    activeInspections?: number;
  };
}

interface NavItem {
  id: string;
  label: string;
  subtext?: string;
  icon: React.ComponentType<any>;
  badge?: number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  canViewAuditLogs = false,
  badgeCounts,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'मुख्य अनुगमन',
      items: [
        {
          id: 'dashboard',
          label: 'ड्यासबोर्ड',
          icon: LayoutDashboard,
        },
        {
          id: 'procurements',
          label: 'खरिद आयोजनाहरू',
          icon: FolderGit2,
        },
      ],
    },
    {
      title: 'निरीक्षण तथा जोखिम',
      items: [
        {
          id: 'inspections',
          label: 'खरिद विश्लेषण',
          subtext: '३४-चरण म्याट्रिक्स',
          icon: ClipboardCheck,
          badge: badgeCounts?.activeInspections,
          badgeColor: 'bg-sky-500/20 text-sky-200 border border-sky-500/30',
        },
        {
          id: 'findings',
          label: 'कैफियत र जोखिम',
          subtext: 'Findings & Risks',
          icon: AlertTriangle,
          badge: badgeCounts?.findings,
          badgeColor: 'bg-red-500/20 text-red-200 border border-red-500/30',
        },
      ],
    },
    {
      title: 'मापदण्ड र प्रतिवेदन',
      items: [
        {
          id: 'master-checklist',
          label: 'मापदण्ड चेकलिस्ट',
          icon: ListOrdered,
        },
        {
          id: 'reports',
          label: 'प्रतिवेदन तथा निर्यात',
          icon: FileSpreadsheet,
        },
        {
          id: 'procurement-process',
          label: 'खरिद प्रक्रिया गाइड',
          icon: Workflow,
        },
      ],
    },
    {
      title: 'अडिट लग र सुरक्षा',
      items: [
        {
          id: 'audit-logs',
          label: 'अडिट लग',
          icon: History,
        },
      ],
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-60'
      } bg-[#0b2138] text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4.25rem)] border-r border-[#153457] transition-[width] duration-200 select-none`}
    >
      {/* Top Sidebar Header */}
      <div className={`${isCollapsed ? 'p-3' : 'px-4 py-3.5'} border-b border-[#153457]`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold tracking-wide min-w-0">
              <Shield className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate uppercase font-bold text-[11px] text-slate-200">
                सार्वजनिक खरिद सहयोगी
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title={isCollapsed ? 'मेनु खोल्नुहोस्' : 'मेनु संकुचन गर्नुहोस्'}
            aria-label="मेनु टगल"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                    } py-2 rounded text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-[#1b446e] text-white font-semibold shadow-xs border-l-3 border-amber-400'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && Number(item.badge) > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                          item.badgeColor || 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer with Institutional Badge */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#153457] bg-[#091a2c] text-[11px] text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Scale className="w-3.5 h-3.5 text-slate-300" />
            <span>खरिदका लागि सहयोगी सामग्री।</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v1.0</span>
        </div>
      )}
    </aside>
  );
};
