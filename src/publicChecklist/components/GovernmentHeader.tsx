import React, { useState, useEffect } from 'react';
import { PhoneCall, Calendar, Globe, Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import { Language } from '../types/procurement';

interface GovernmentHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  fontSizeLevel: number;
  onFontSizeChange: (level: number) => void;
  onPrintClick: () => void;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  language,
  onLanguageChange,
  fontSizeLevel,
  onFontSizeChange,
  onPrintClick
}) => {
  const [currentDateTime, setCurrentDateTime] = useState({
    bsDate: '२०८२ फागुन १५ गते, शुक्रबार',
    time: '१०:३० बिहान',
    adDate: 'February 27, 2026'
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const nepaliMonths = [
        'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
        'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
      ];
      const nepaliDays = [
        'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
      ];
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      const toNep = (n: number) => n.toString().split('').map(d => nepaliDigits[parseInt(d, 10)] || d).join('');
      
      const dayName = nepaliDays[now.getDay()];
      const monthName = nepaliMonths[10];
      const timeStr = `${toNep(now.getHours())}:${toNep(now.getMinutes())}`;

      setCurrentDateTime({
        bsDate: `२०८२ ${monthName} ${toNep(now.getDate())} गते, ${dayName}`,
        time: timeStr,
        adDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-white border-b border-slate-200 select-none no-print">
      {/* 1. Official Government Top Utility Bar - NVC Blue Tone */}
      <div className="bg-[#185294] text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date & Time */}
          <div className="flex items-center space-x-3 text-slate-100 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'ne' ? currentDateTime.bsDate : `${currentDateTime.adDate} (B.S. 2082)`}</span>
            </span>
            <span className="hidden md:inline text-blue-200">|</span>
            <span className="hidden md:inline text-blue-100">नेपाल प्रमाणिक समय (NST UTC+5:45)</span>
          </div>

          {/* Right: Accessibility, Helpline & Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Toll Free Helpline: NVC 107 & Hello Sarkar 1111 */}
            <div className="hidden sm:flex items-center gap-1.5 text-amber-300 font-semibold bg-blue-900/60 px-2.5 py-0.5 rounded border border-blue-400/30 text-[11px]">
              <PhoneCall className="w-3 h-3 text-amber-300" />
              <span>सतर्कता टोल फ्री: १०७ | हेलो सरकार: ११११</span>
            </div>

            {/* Font Size Adjuster A- A A+ */}
            <div className="flex items-center bg-blue-900/80 rounded border border-blue-400/40 p-0.5 text-[11px]">
              <button
                onClick={() => onFontSizeChange(Math.max(-1, fontSizeLevel - 1))}
                title="अक्षर घटाउनुहोस् (Decrease Font)"
                className={`px-1.5 py-0.5 rounded transition ${fontSizeLevel === -1 ? 'bg-amber-400 text-slate-900 font-bold' : 'hover:bg-blue-800 text-slate-200'}`}
              >
                A-
              </button>
              <button
                onClick={() => onFontSizeChange(0)}
                title="सामान्य अक्षर (Normal Font)"
                className={`px-1.5 py-0.5 rounded transition ${fontSizeLevel === 0 ? 'bg-amber-400 text-slate-900 font-bold' : 'hover:bg-blue-800 text-slate-200'}`}
              >
                A
              </button>
              <button
                onClick={() => onFontSizeChange(Math.min(2, fontSizeLevel + 1))}
                title="अक्षर बढाउनुहोस् (Increase Font)"
                className={`px-1.5 py-0.5 rounded transition ${fontSizeLevel > 0 ? 'bg-amber-400 text-slate-900 font-bold' : 'hover:bg-blue-800 text-slate-200'}`}
              >
                A+
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={onPrintClick}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-800 hover:bg-blue-700 text-slate-100 transition"
              title="यो पृष्ठ प्रिन्ट गर्नुहोस्"
            >
              <Printer className="w-3 h-3 text-amber-300" />
              <span className="hidden sm:inline">प्रिन्ट</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'ne' ? 'en' : 'ne')}
              className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-0.5 rounded shadow-xs transition"
              title="भाषा परिवर्तन गर्नुहोस्"
            >
              <Globe className="w-3.5 h-3.5 text-blue-950" />
              <span>{language === 'ne' ? 'English' : 'नेपाली'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Official Emblem and NVC Masthead Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Official Emblem of Nepal + National Vigilance Centre */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Authentic SVG of Nepal Coat of Arms / Emblem */}
            <div className="shrink-0">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-xs"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="नेपालको निशान छाप (Emblem of Nepal)"
              >
                <circle cx="100" cy="100" r="92" fill="#F8FAFC" stroke="#1b64b5" strokeWidth="2.5" />
                
                {/* Petals Wreath ring */}
                <g fill="#1b64b5" opacity="0.85">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                    <circle
                      key={i}
                      cx={100 + 82 * Math.cos((deg * Math.PI) / 180)}
                      cy={100 + 82 * Math.sin((deg * Math.PI) / 180)}
                      r="6.5"
                    />
                  ))}
                </g>

                {/* Sky & Mount Everest Peaks */}
                <path d="M25 125 C45 95, 75 75, 100 55 C125 75, 155 95, 175 125 Z" fill="#E0F2FE" />
                <polygon points="100,55 75,110 125,110" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                <polygon points="100,55 100,110 125,110" fill="#E2E8F0" />
                <polygon points="65,80 40,120 90,120" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
                <polygon points="135,80 110,120 160,120" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />

                {/* Green Terai / Hills Base */}
                <path d="M30 120 Q100 110 170 120 L168 152 Q100 168 32 152 Z" fill="#15803D" />
                <path d="M40 125 Q100 118 160 125 L158 145 Q100 156 42 145 Z" fill="#16A34A" opacity="0.7" />

                {/* Handshake */}
                <g transform="translate(76, 122) scale(0.48)">
                  <path d="M10 25 C10 15, 30 15, 45 28 C60 15, 80 15, 80 25 C80 45, 10 45, 10 25 Z" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
                  <path d="M28 20 C35 25, 45 25, 60 20" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
                </g>

                <circle cx="100" cy="74" r="3" fill="#FBBF24" />

                {/* Bottom Ribbon */}
                <path d="M35 160 Q100 182 165 160 L160 176 Q100 196 40 176 Z" fill="#185294" />
                <text
                  x="100"
                  y="173"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="bold"
                  fontFamily="Mukta, sans-serif"
                >
                  जननी जन्मभूमिश्च स्वर्गादपि गरीयसी
                </text>
              </svg>
            </div>

            {/* Official Header Text as requested: नेपाल सरकार राष्ट्रिय सतर्कता केन्द्र */}
            <div className="flex flex-col">
              <span className="text-[#185294] font-bold text-xs sm:text-sm tracking-wide">
                {language === 'ne' ? 'नेपाल सरकार' : 'Government of Nepal'}
              </span>
              <span className="text-slate-600 text-[11px] sm:text-xs font-medium">
                {language === 'ne' ? 'प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय' : 'Office of the Prime Minister and Council of Ministers'}
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-[#1b64b5] leading-tight">
                {language === 'ne' ? 'नेपाल सरकार राष्ट्रिय सतर्कता केन्द्र' : 'Government of Nepal National Vigilance Centre'}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 font-medium">
                <span className="text-[#185294] font-semibold">
                  {language === 'ne' ? 'सबै सार्वजनिक निकायहरूका लागि सार्वजनिक खरिद प्रक्रिया मार्गदर्शन तथा अनुपालन प्रणाली' : 'Public Procurement Procedure Guidance & Compliance System for All Public Entities'}
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="hidden sm:inline">सिंहदरबार, काठमाडौं</span>
              </div>
            </div>
          </div>

          {/* Right: NVC Official Portal Link & National Flag */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="text-right text-xs border-r pr-4 border-slate-200">
              <div className="text-slate-500 font-medium">आधिकारिक सतर्कता पोर्टल:</div>
              <a
                href="https://nvc.gov.np"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#1b64b5] font-bold hover:underline"
              >
                <span>nvc.gov.np</span>
                <ExternalLink className="w-3 h-3 text-[#1b64b5]" />
              </a>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>प्राविधिक परीक्षण तथा अनुगमन</span>
              </div>
            </div>

            {/* National Flag of Nepal SVG */}
            <div className="relative group cursor-pointer" title="नेपालको राष्ट्रिय झण्डा (National Flag of Nepal)">
              <svg
                className="w-10 h-13 drop-shadow-xs hover:scale-105 transition-transform"
                viewBox="0 0 100 130"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="5,5 95,50 42,50 88,118 5,118"
                  fill="#1b64b5"
                />
                <polygon
                  points="10,12 80,47 38,47 75,112 10,112"
                  fill="#2563eb"
                />
                <g transform="translate(18, 24) scale(0.6)">
                  <path
                    d="M12 18 A14 14 0 0 0 38 18 A12 12 0 0 1 12 18 Z"
                    fill="#FFFFFF"
                  />
                  <circle cx="25" cy="18" r="4.5" fill="#FFFFFF" />
                </g>
                <g transform="translate(24, 76) scale(0.6)">
                  <circle cx="20" cy="20" r="8" fill="#FFFFFF" />
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                    <polygon
                      key={i}
                      points="20,7 18,14 22,14"
                      fill="#FFFFFF"
                      transform={`rotate(${deg} 20 20)`}
                    />
                  ))}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
