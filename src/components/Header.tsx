import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, ChevronDown, Check, Building2, Calendar } from 'lucide-react';

interface HeaderProps {
  onSearch?: (term: string) => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const { currentUser, switchRole, logout } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roles = [
    { id: 'admin', label: 'एडमिन (Admin)', desc: 'पूर्ण पहुँच र नियन्त्रण' },
    { id: 'reviewer', label: 'पुनरावलोकनकर्ता (Reviewer)', desc: 'समीक्षा, सिफारिस र प्रतिवेदन' },
    { id: 'inspector', label: 'अनुगमन / निरीक्षण अधिकृत (Inspector)', desc: '३४-चरण विश्लेषण तथा कैफियत प्रविष्टि' },    
    { id: 'public_officer', label: 'खरिद अधिकृत (Entity Officer)', desc: 'प्रमाण तथा कागजात व्यवस्थापन' },
  ];

  const currentRoleObj = roles.find((r) => r.id === currentUser?.role) || roles[0];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Top micro bar for government identity */}
      <div className="bg-[#991b1b] text-white text-[11px] px-4 sm:px-6 py-0.5 flex justify-between items-center font-medium tracking-wide">
        <div className="flex items-center space-x-2">
          <span>नेपाल सरकार</span>
          <span className="opacity-60">|</span>
          <span>भ्रष्टाचार नियन्त्रण तथा सुशासन प्रवर्द्धन</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-[11px] tabular-nums">
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3 text-red-200" />
            सिंहदरबार, काठमाडौं
          </span>
          <span className="opacity-60">|</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-red-200" />
            चालु आ.व. २०८३/८४
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-15">
          {/* Left: Emblem & Institutional Title */}
          <div className="flex items-center space-x-3.5">
            <div className="relative shrink-0">
              <img
                src="/emblem.webp"
                alt="नेपालको निशाना छाप"
                className="w-10 h-10 object-contain drop-shadow-xs"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold tracking-wide text-slate-800 uppercase">
                  राष्ट्रिय सतर्कता केन्द्र
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                  NVC-PPCA
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-[#0f2c4d] tracking-tight leading-tight">
                खरिद विधि परिपालना सहयोगी
              </h1>
            </div>
          </div>

          {/* Right: Role Switcher & Account Profile */}
          <div className="flex items-center space-x-3">
            {/* Professional Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition cursor-pointer"
                title="भूमिका परिवर्तन गर्नुहोस्"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#0f2c4d]" />
                <span className="text-slate-500 font-normal">भूमिका:</span>
                <span className="font-semibold text-slate-800">{currentRoleObj.label.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isRoleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      अनुगमन भूमिका छनोट (Role Switch)
                    </div>
                    {roles.map((r) => {
                      const isSelected = currentUser?.role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            switchRole(r.id as any);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-start justify-between hover:bg-slate-50 transition cursor-pointer ${
                            isSelected ? 'bg-blue-50/60 font-semibold text-blue-900' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1">
                              <span>{r.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5">{r.desc}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Current User Badge */}
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0f2c4d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.full_name || 'प्रयोगकर्ता'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                  {currentUser?.designation || currentUser?.role_display_name || 'अधिकृत'}
                </div>
              </div>

              <button
                onClick={logout}
                className="ml-2 p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex items-center justify-center cursor-pointer"
                title="प्रणालीबाट लगआउट गर्नुहोस्"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
