import React, { useState } from 'react';
import { Scale, Clock, AlertCircle, FileCheck, ArrowRight, FileText, UserCheck, Search } from 'lucide-react';
import { PROCUREMENT_METHODS, PROCUREMENT_SOURCE_NOTE } from '../data/procurementData';
import { Language } from '../types/procurement';

interface ProcurementMethodsViewProps {
  language: Language;
  onOpenCalculator: () => void;
}

export const ProcurementMethodsView: React.FC<ProcurementMethodsViewProps> = ({
  language,
  onOpenCalculator
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'works' | 'goods' | 'consulting' | 'other'>('all');
  const [activeMethodId, setActiveMethodId] = useState<string>('open-bidding');
  const [searchTerm, setSearchTerm] = useState('');

  const query = searchTerm.trim().toLowerCase();
  const filteredMethods = PROCUREMENT_METHODS.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch = !query || [
      m.name,
      m.description,
      m.thresholdLimit,
      m.legalRef,
      m.nameEn,
      ...m.steps,
      ...(m.requiredDocuments || []),
      ...(m.evaluationProcess || []),
      ...m.specialConditions,
    ].some((value) => value.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const activeMethod = filteredMethods.find((m) => m.id === activeMethodId) || filteredMethods[0] || PROCUREMENT_METHODS[0];
  const requiredDocuments = activeMethod.requiredDocuments || [
    'स्वीकृत खरिद माग, वार्षिक खरिद योजना र बजेट/स्रोत सुनिश्चितता',
    'बजार अध्ययन, लागत अनुमान र अधिकारप्राप्त अधिकारीको स्वीकृति',
    'विधि छनोटको लिखित औचित्य तथा स्वीकृत स्पेसिफिकेसन/कार्यविवरण',
  ];
  const evaluationProcess = activeMethod.evaluationProcess || [
    'स्वीकृत कागजातमा पूर्वनिर्धारित मापदण्ड मात्र लागू गर्ने',
    'मूल्याङ्कन र निर्णयको कारण प्रतिवेदनमा राख्ने',
  ];
  const specialConditions = activeMethod.id === 'sealed-quotation'
    ? [
        'नियम ८४(३क–ख) अनुसार पहिलो सूचनामा तीनभन्दा कम प्रस्ताव आए दोस्रो सूचना प्रकाशित गर्ने',
        ...activeMethod.specialConditions.slice(1),
      ]
    : activeMethod.specialConditions;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div>
          <p className="font-bold">{PROCUREMENT_SOURCE_NOTE}</p>
          <p className="mt-0.5">
            विधि छनोट गर्नुअघि सम्बन्धित नियमको हाल लागू संशोधन, PPMO का निर्देशन/मानक कागजात, स्वीकृत बजेट र अधिकार सीमा पुष्टि गर्नुहोस्।
          </p>
        </div>
      </div>
      {/* Top Banner */}
      <div className="bg-white px-5 py-2.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1b64b5] text-white text-xs font-bold px-2 py-0.5 rounded">
              {language === 'ne' ? 'खरिदका विधिहरू' : 'Procurement Methods'}
            </span>
            {/* <span className="text-xs text-slate-500 font-medium">
              सार्वजनिक खरिद ऐन/नियमावली; विधिअनुसार फरक दफा/नियम
            </span> */}
          </div>
          <h3 className="text-md  font-black text-[#185294] mt-1">
            {language === 'ne' ? 'प्रचलित सार्वजनिक खरिदका मुख्य विधिहरू' : 'Public Procurement Methods in Nepal'}
          </h3>
          <p className="text-slate-600 text-sm mt-0.5">
            {language === 'ne'
              ? 'हरेक विधिको कानुनी आधार, लागू हुने अवस्था, चरणबद्ध कार्यविधि, मूल्याङ्कन, आवश्यक कागजात र विशेष शर्त हेर्न विधि छान्नुहोस्।'
              : 'Statutory methods categorized by monetary threshold, nature of works, and competitive rigor for public entities.'}
          </p>
        </div>

        <button
          onClick={onOpenCalculator}
          className="flex items-center gap-2 bg-[#1b64b5] hover:bg-[#155294] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
        >
          <span>थ्रेसहोल्ड क्याल्कुलेटर खोल्नुहोस्</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'सबै विधिहरू (All Methods)' },
          { id: 'works', label: 'निर्माण कार्य (Works)' },
          { id: 'goods', label: 'मालसामान आपूर्ति (Goods)' },
          { id: 'consulting', label: 'परामर्श सेवा (Consulting)' },
          { id: 'other', label: 'अन्य/विशेष विधि' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-[#1b64b5] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <label className="relative block max-w-lg">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="विधि, रकम सीमा, दफा/नियम वा कागजात खोज्नुहोस्"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </label>

      {/* Method Cards Grid & Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Selectable List of Methods */}
        <div className="max-h-[calc(100vh-15rem)] space-y-3 overflow-y-auto pr-1 lg:col-span-1">
          {filteredMethods.map((method) => {
            const isSelected = method.id === activeMethod.id;
            return (
              <div
                key={method.id}
                onClick={() => setActiveMethodId(method.id)}
                className={`p-4 rounded-lg border-2 transition cursor-pointer text-left ${
                  isSelected
                    ? 'border-[#1b64b5] bg-blue-50/50 shadow-xs ring-1 ring-blue-400'
                    : 'border-slate-200 bg-white hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {method.category === 'works' ? 'निर्माण कार्य' : method.category === 'goods' ? 'मालसामान' : method.category === 'consulting' ? 'परामर्श सेवा' : 'अन्य/विशेष'}
                  </span>
                  <span className="text-[11px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                    {method.thresholdLimit}
                  </span>
                </div>
                <h3 className={`font-black text-sm ${isSelected ? 'text-[#185294]' : 'text-slate-800'}`}>
                  {method.name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {method.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Side: Comprehensive Details of Active Method */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-3">
          {/* Header of Active Method */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="bg-[#1b64b5] text-white text-xs font-bold px-2.5 py-0.5 rounded">
                आधिकारिक कार्यविधि
              </span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded">
                सीमा: {activeMethod.thresholdLimit}
              </span>
            </div>
            <h3 className="text-md sm:text-md font-black text-[#185294]">
              {activeMethod.name}
            </h3>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
              {activeMethod.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded">
                <Scale className="w-4 h-4 text-[#1b64b5]" />
                <span><strong>कानूनी आधार:</strong> {activeMethod.legalRef}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded text-amber-900 border border-amber-200">
                <Clock className="w-4 h-4 text-amber-700" />
                <span><strong>सूचनाको म्याद:</strong> {activeMethod.noticePeriod}</span>
              </div>
            </div>
              <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-950">
                <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <div><strong>स्वीकृत गर्ने अधिकारी:</strong> {activeMethod.approvingAuthority || 'नियम र निकायको अधिकार प्रत्यायोजनअनुसार सक्षम अधिकारी; तलको approval table जाँच्नुहोस्।'}</div>
              </div>
          </div>

          {/* Step by Step Flow */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#1b64b5]" />
              <span>चरणबद्ध कार्यविधि (नियमअनुसार क्रमशः पूरा गर्ने)</span>
            </h4>
            <p className="mb-3 text-xs leading-relaxed text-slate-600">
              {activeMethod.steps.length} चरण: आवश्यकता र स्वीकृतिबाट सुरु गरी प्रतिस्पर्धा/छनोट, सम्झौता र कामको जाँचसम्मको क्रम।
            </p>
            <div className="space-y-2">
              {activeMethod.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/40 p-3 text-xs leading-relaxed text-slate-800 sm:text-sm">
                  <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[#1b64b5] px-1 font-bold text-white">
                    {idx + 1}
                  </span>
                  <p className="pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1b64b5]" />
              <span>आवश्यक मुख्य कागजात</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {requiredDocuments.map((document, idx) => (
                <li key={idx} className="flex items-start gap-2 rounded border border-slate-200 bg-slate-50 p-2.5">
                  <span className="font-bold text-blue-700">{idx + 1}.</span>
                  <span>{document}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>मूल्याङ्कन/छनोटको आधार</span>
            </h4>
            <ol className="space-y-2 text-xs text-slate-800">
              {evaluationProcess.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 rounded border border-emerald-100 bg-emerald-50/50 p-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-700 text-[10px] font-bold text-white">{idx + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Special Statutory Restrictions */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>अनिवार्य शर्तहरू तथा कानुनी बन्देजहरू (Mandatory Constraints)</span>
            </h4>
            <div className="space-y-2">
              {specialConditions.map((cond, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-amber-50/70 p-2.5 rounded border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium">
                  <span className="text-amber-700 font-bold">⚠</span>
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
