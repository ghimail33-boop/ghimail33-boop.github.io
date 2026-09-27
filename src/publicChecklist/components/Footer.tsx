import React from 'react';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { Language } from '../types/procurement';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="w-full bg-[#1e293b] text-slate-300 text-xs border-t-4 border-[#1b64b5] no-print mt-12">
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Government & NVC Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1b64b5]"></span>
              <h4 className="text-white font-bold text-sm tracking-wide">
                नेपाल सरकार राष्ट्रिय सतर्कता केन्द्र
              </h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय मातहत रही भ्रष्टाचार निवारण ऐन, २०५९ बमोजिम सबै सार्वजनिक निकायहरूमा सुशासन प्रवर्द्धन, प्राविधिक परीक्षण, खरिद अनुगमन तथा निगरानी गर्ने आधिकारिक निकाय।
            </p>
            <div className="text-[11px] text-amber-300 font-semibold pt-1">
              "भ्रष्टाचारमुक्त समाज, सुशासनयुक्त सार्वजनिक प्रशासन"
            </div>
          </div>

          {/* Column 2: Key Official Portals */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide border-b border-slate-700 pb-2">
              महत्वपूर्ण सरकारी पोर्टलहरू
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://nvc.gov.np"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <span>राष्ट्रिय सतर्कता केन्द्र (NVC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://bolpatra.gov.np"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <span>विद्युतीय खरिद प्रणाली (e-GP II)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://opmcm.gov.np"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <span>प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://oagnep.gov.np"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <span>महालेखा परीक्षकको कार्यालय (OAG)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://mof.gov.np"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <span>अर्थ मन्त्रालय (Ministry of Finance)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Standards */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide border-b border-slate-700 pb-2">
              कानूनी आधार तथा निर्देशिकाहरू
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-slate-200 transition">
                • भ्रष्टाचार निवारण ऐन, २०५९ (दफा ३८)
              </li>
              <li className="hover:text-slate-200 transition">
                • सार्वजनिक खरिद ऐन, २०६३ (संशोधन सहित)
              </li>
              <li className="hover:text-slate-200 transition">
                • सार्वजनिक खरिद नियमावली, २०६४
              </li>
              <li className="hover:text-slate-200 transition">
                • राष्ट्रिय सतर्कता केन्द्र प्राविधिक परीक्षण निर्देशिका
              </li>
              <li className="hover:text-slate-200 transition">
                • सुशासन (व्यवस्थापन तथा सञ्चालन) ऐन, २०६४
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide border-b border-slate-700 pb-2">
              सम्पर्क तथा उजुरी कक्ष
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>सिंहदरबार, काठमाडौं, नेपाल</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+९७७-१-४२००४०० / ४२००४०१</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>info@nvc.gov.np</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700 mt-2">
                <div className="text-[11px] text-amber-300 font-bold">सतर्कता हटलाइन (टोल फ्री):</div>
                <div className="text-white font-mono font-bold text-sm">१०७ (शुल्क नलाग्ने)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#111827] py-4 px-4 sm:px-8 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            © सर्वाधिकार सुरक्षित २०८२ (2026), नेपाल सरकार राष्ट्रिय सतर्कता केन्द्र।
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1b64b5]" />
            <span>सबै सार्वजनिक निकायहरूका लागि खरिद अनुपालन प्रणाली</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
