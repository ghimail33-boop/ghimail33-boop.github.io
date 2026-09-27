import React from 'react';
import { 
  Layers, 
  CheckSquare, 
  Calculator, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  Scale, 
  Building2, 
  FileCheck2,
  AlertCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { NavTabId } from './Navigation';
import { Language } from '../types/procurement';
import { PROCUREMENT_STAGES } from '../data/procurementData';

interface HomeDashboardViewProps {
  language: Language;
  onTabChange: (tab: NavTabId) => void;
  onSelectStage: (stageId: number) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  language,
  onTabChange,
  onSelectStage
}) => {
  return (
    <div className="space-y-8">
      {/* 1. Official Hero Banner - NVC Blue Tone */}
      <div className="relative overflow-hidden rounded-md bg-linear-to-r from-[#185294] via-[#1b64b5] to-[#2563eb] text-white px-3 py-[0.3rem] sm:px-5 sm:py-[0.5rem] shadow-sm border-b-4 border-amber-400 mb-1.5">
        <div className="relative z-10 max-w-3xl space-y-2">
         
          <p className="text-blue-100 text-xs  leading-relaxed">
            सार्वजनिक खरिदलाई स्वच्छ, मितव्ययी, पारदर्शी र जोखिमरहित बनाउन राष्ट्रिय सतर्कता केन्द्रद्वारा तयार गरिएको सहयोगी सामग्री।
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-[0.25rem]">
            <button
              onClick={() => onTabChange('stages')}
              className="flex items-center gap-2 bg-white text-[#185294] hover:bg-blue-50 font-bold px-5 py-[0.2rem] rounded-md shadow-sm text-xs sm:text-sm transition-all hover:scale-102 cursor-pointer"
            >
              <Layers className="w-4 h-2 text-[#1b64b5]" />
              <span>चरणगत कार्यविधि सुरु गर्नुहोस्</span>
              <ArrowRight className="w-4 h-4 text-[#185294]" />
            </button>

            <button
              onClick={() => onTabChange('checklist')}
              className="flex items-center gap-2 bg-[#144e8c] hover:bg-[#103e73] text-white font-bold px-5 py-[0.2rem] rounded-md shadow-sm text-xs sm:text-sm transition-all hover:scale-102 cursor-pointer border border-blue-300/40"
            >
              <CheckSquare className="w-4 h-4 text-amber-300" />
              <span>सतर्कता चेकलिस्ट भर्नुहोस्</span>
            </button>

            <button
              onClick={() => onTabChange('calculator')}
              className="flex items-center gap-2 bg-blue-900/40 hover:bg-blue-900/60 text-amber-300 font-bold px-4 py-[0.2rem] rounded-md border border-blue-300/40 text-xs sm:text-sm transition cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-amber-300" />
              <span>थ्रेसहोल्ड क्याल्कुलेटर</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Public Entity Coverage Grid */}
      {/* <div>
        <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1b64b5]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              यस प्रणालीले समेटेका सार्वजनिक निकायहरू (Applicable Public Entities)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">सार्वजनिक खरिद ऐन २०६३ को दफा २(ख)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs text-center">
          {[
            { title: 'मन्त्रालय तथा आयोगहरू', icon: '🏛️', desc: 'संघीय तथा संवैधानिक' },
            { title: 'विभाग तथा निर्देशनालय', icon: '🏢', desc: 'केन्द्रीय कार्यालयहरू' },
            { title: 'प्रदेश सरकार तथा निकाय', icon: '🌲', desc: '७ वटै प्रदेश मातहत' },
            { title: '७५३ स्थानीय तहहरू', icon: '🏘️', desc: 'गाउँ र नगरपालिकाहरू' },
            { title: 'सार्वजनिक संस्थान/बोर्ड', icon: '🏦', desc: 'सरकारी स्वामित्व प्राप्त' },
            { title: 'विकास आयोजनाहरू', icon: '🏗️', desc: 'राष्ट्रिय गौरव/आयोजना' },
          ].map((entity, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition">
              <div className="text-xl mb-1">{entity.icon}</div>
              <div className="font-bold text-slate-900 leading-tight text-xs">{entity.title}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{entity.desc}</div>
            </div>
          ))}
        </div>
      </div> */}

     

      {/* 4. 4 Core Feature Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-md text-[#185294] font-bold flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#1b64b5] rounded-xs inline-block"></span>
            <span>खरिद विधि परिपालनाका मुख्य मोड्युलहरू</span>
          </h3>
          <span className="text-xs text-slate-500">आवश्यक खण्डमा क्लिक गरी विवरण हेर्नुहोस्</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div
            onClick={() => onTabChange('stages')}
            className="group bg-white p-5 rounded-lg border-2 border-slate-200 hover:border-[#1b64b5] shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1b64b5] flex items-center justify-center font-bold mb-3 group-hover:bg-[#1b64b5] group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#1b64b5] transition-colors">
                {PROCUREMENT_STAGES.length} चरणगत खरिद कार्यविधि
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                योजना तर्जुमा, लागत अनुमान, बोलपत्र कागजात, सूचना प्रकाशन, दाखिला र खोल्ने, मूल्यांकन, LoI देखि सम्झौता र भुक्तानीसम्म।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#1b64b5] font-bold">
              <span>चरणगत मार्गदर्शन</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onTabChange('checklist')}
            className="group bg-white p-5 rounded-lg border-2 border-slate-200 hover:border-blue-600 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                खरिद विधि परिपालना चेकलिस्ट
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                महालेखा परीक्षकको लेखापरीक्षणमा बेरुजु तथा राष्ट्रिय सतर्कता केन्द्रको प्राविधिक परीक्षणमा अपरिपालनाको जोखिम न्यूनीकरण।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-bold">
              <span>परिपालना चेकलिस्ट</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onTabChange('calculator')}
            className="group bg-white p-5 rounded-lg border-2 border-slate-200 hover:border-amber-600 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                थ्रेसहोल्ड क्याल्कुलेटर
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                खरिद रकम प्रविष्ट गरी लागू हुने आधिकारिक विधि (सोझै, दरभाउ, खुला बोलपत्र), म्याद, बैंक धरौटी र स्वीकृत गर्ने अधिकारी पत्ता लगाउनुहोस्।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-bold">
              <span>क्याल्कुलेटर प्रयोग</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onTabChange('legal')}
            className="group bg-white p-5 rounded-lg border-2 border-slate-200 hover:border-emerald-600 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                सार्वजनिक खरिद ऐन तथा नियमावली
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                सार्वजनिक खरिद ऐन, २०६३ र नियमावली, २०६४ का दफावार कानूनी व्यवस्था।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
              <span>दस्तावेज संग्रह</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Sequential Stepper Jump */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1b64b5]" />
            <span>सार्वजनिक खरिदका {PROCUREMENT_STAGES.length} चरणगत कार्यप्रवाह (क्लिक गरी सिधै अध्ययन गर्नुहोस्)</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">चरण १ - {PROCUREMENT_STAGES.length}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PROCUREMENT_STAGES.map((stg) => (
            <div
              key={stg.id}
              onClick={() => {
                onTabChange('stages');
                onSelectStage(stg.id);
              }}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-[#1b64b5] transition cursor-pointer flex items-start gap-2.5 group"
            >
              <span className="w-6 h-6 rounded-full bg-[#1b64b5] group-hover:bg-[#144e8c] text-white font-bold text-xs flex items-center justify-center shrink-0 transition-colors">
                {stg.id}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 group-hover:text-[#1b64b5] truncate transition-colors">
                  {stg.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {stg.legalBasis}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. NVC Vigilance Mandate & Principles (Replacing the old notice ticker / circulars) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: NVC Vigilance Guidelines for Public Entities */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#1b64b5]" />
              <span>सार्वजनिक खरिदमा राष्ट्रिय सतर्कता केन्द्रको निगरानी तथा प्राविधिक परीक्षण</span>
            </h4>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              भ्रष्टाचार निवारण ऐन, २०५९ को दफा ३८
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 space-y-1">
              <div className="font-bold text-[#185294] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1b64b5]" />
                <span>प्राविधिक परीक्षण (Technical Audit):</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                केन्द्रले सार्वजनिक संस्थाबाट निर्माण वा सञ्चालन भएका विकास आयोजनाहरूको प्राविधिक परीक्षण गर्दछ।
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 space-y-1">
              <div className="font-bold text-[#185294] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1b64b5]" />
                <span>खरिद योजना र प्याकेजिङ अनुगमन:</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                खरिद सीमा छल्न कामलाई साना टुक्रामा बाँडेर सोझै वा दरभाउमा लगेको पाइएमा सम्बन्धित कार्यालय प्रमुख र खरिद अधिकृतमाथि कानूनी कारबाही सिफारिस गरिन्छ।
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 space-y-1">
              <div className="font-bold text-[#185294] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1b64b5]" />
                <span>उपभोक्ता समिति अनुगमन:</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                उपभोक्ता समितिमा भारी मेसिन प्रयोग गरेको, पेटी ठेकेदारलाई जिम्मा दिएको वा वास्तविक समुदाय बाहिरका व्यक्ति संलग्न भएको पाइएमा भुक्तानी रोक्का गरिन्छ।
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 space-y-1">
              <div className="font-bold text-[#185294] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1b64b5]" />
                <span>सार्वजनिक सुनुवाई (Public Audit):</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                प्रत्येक सार्वजनिक निर्माण वा आयोजनामा स्थानीय नागरिक तथा लाभग्राहीको उपस्थितिमा सार्वजनिक सुनुवाई सम्पन्न गरी माइन्युट अनिवार्य संलग्न हुनुपर्दछ।
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Fundamental Procurement Principles */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#1b64b5]" />
            <span>खरिदका आधारभूत सिद्धान्तहरू</span>
          </h4>

          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
              <span className="text-[#1b64b5] font-bold">१.</span>
              <span><strong>मितव्ययिता (Economy):</strong> सार्वजनिक स्रोतको उच्चतम प्रतिफल प्राप्त हुने गरी खरिद गर्ने।</span>
            </li>
            <li className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
              <span className="text-[#1b64b5] font-bold">२.</span>
              <span><strong>पारदर्शिता (Transparency):</strong> सूचना तथा निर्णयहरू e-GP मार्फत सार्वजनिक गर्ने।</span>
            </li>
            <li className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
              <span className="text-[#1b64b5] font-bold">३.</span>
              <span><strong>समान अवसर (Equal Opportunity):</strong> कुनै निश्चित फर्मलाई लक्षित नगरी खुला प्रतिस्पर्धा गराउने।</span>
            </li>
            <li className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
              <span className="text-[#1b64b5] font-bold">४.</span>
              <span><strong>जवाफदेहिता (Accountability):</strong> खरिद अधिकारी तथा मूल्यांकन समितिको व्यक्तिगत जिम्मेवारी।</span>
            </li>
          </ul>

          <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
            <strong>सतर्कता:</strong> सार्वजनिक खरिद ऐनको दफा ८(२) बमोजिम प्रतिस्पर्धा छल्ने नियतले कामलाई टुक्र्याएर सोझै वा दरभाउमा खरिद गरेमा बेरुजु ठहर भई कानून बमोजिम कारबाही हुन्छ।
          </div>
        </div>
      </div>
    </div>
  );
};
