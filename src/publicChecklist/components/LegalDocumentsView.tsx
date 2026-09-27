import React, { useState } from 'react';
import { BookOpen, Download, Search, Scale } from 'lucide-react';
import { APPROVAL_AUTHORITY_BANDS, APPROVAL_AUTHORITY_SPECIAL_CASE, LEGAL_ACTS_DOWNLOADS } from '../data/procurementData';
import { Language } from '../types/procurement';

interface LegalDocumentsViewProps {
  language: Language;
}

export const LegalDocumentsView: React.FC<LegalDocumentsViewProps> = ({ language }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const keySections = [
    { section: 'ऐनको दफा ४', title: 'भेदभाव गर्न नहुने र ब्राण्ड नाम तोक्न निषेध', desc: 'स्पेसिफिकेसनमा कुनै खास ब्राण्ड, ट्रेडमार्क वा उत्पादकको नाम तोक्न नहुने।' },
    { section: 'ऐनको दफा ५', title: 'लागत अनुमान तयारी र स्वीकृति', desc: 'जिल्ला दररेट तथा नर्म्सका आधारमा वस्तुपरक लागत अनुमान तयार गर्नुपर्ने।' },
    { section: 'ऐनको दफा ७', title: 'खरिद योजना तयार गर्नुपर्ने', desc: '१० करोड माथिको गुरुयोजना र प्रत्येक निकायको अनिवार्य वार्षिक खरिद योजना।' },
    { section: 'ऐनको दफा ८', title: 'खरिदको विधि छनोट र टुक्रा गर्न निषेध', desc: 'प्रतिस्पर्धा वा खरिद सीमा छल्ने नियतले कामलाई साना टुक्रामा बाँड्न नपाइने।' },
    { section: 'ऐनको दफा १४', title: 'बोलपत्र आह्वान र सूचनाको म्याद', desc: 'राष्ट्रिय खुला बोलपत्रमा कम्तीमा ३० दिन र अन्तर्राष्ट्रिय खुला बोलपत्रमा कम्तीमा ४५ दिनको सूचना अवधि लागू हुन्छ।' },
    { section: 'ऐनको दफा २३', title: 'मूल्यांकन समिति गठन र परीक्षण', desc: 'प्राविधिक, आर्थिक र सारभूत रूपमा प्रभावग्राही बोलपत्रको वस्तुपरक परीक्षण।' },
    { section: 'ऐनको दफा २७', title: 'आशयको सूचना (LoI) र सम्झौता', desc: 'LoI, review/standstill अवधि र publication requirement चयनित विधि तथा हाल लागू नियम/SBD अनुसार पुष्टि गर्नुहोस्।' },
    { section: 'ऐनको दफा ४०', title: 'सिलबन्दी दरभाउपत्र (RFQ) सम्बन्धी', desc: 'नियम ८४ अनुसार सामान्य मालसामान/निर्माण/अन्य सेवामा रु. २० लाखसम्म र सूचीकृत स्वास्थ्य वस्तुमा रु. ५० लाखसम्म।' },
    { section: 'ऐनको दफा ४१', title: 'सोझै खरिद (Direct Purchase)', desc: 'नियम ८५ अनुसार मालसामान/निर्माणमा रु. १५ लाखसम्म र परामर्श/अन्य सेवामा रु. ५ लाखसम्म; लागू अवस्थामा तीन लिखित दरभाउ माग्ने।' },
    { section: 'ऐनको दफा ४४', title: 'उपभोक्ता समिति वा लाभग्राही समुदाय मार्फत', desc: 'नियम ९७ अनुसार VAT, overhead, contingency र जनसहभागिता सहित रु. १ करोडसम्म; रु. ६० लाखभन्दा बढीमा योगदान अनिवार्य।' },
    { section: 'नियमावली नियम ६६', title: 'अतिरिक्त कार्यसम्पादन जमानत', desc: 'असामान्य कम दरमा थप जमानत लागू हुने अवस्था र formula हाल लागू नियम तथा स्वीकृत SBD/बोलपत्र कागजातबाट जाँच्नुहोस्।' },
    { section: 'भ्रष्टाचार निवारण ऐन दफा ३८', title: 'सतर्कता केन्द्रको प्राविधिक परीक्षण अधिकार', desc: 'सार्वजनिक निर्माण आयोजनाहरूको गुणस्तर, नापी तथा लागतको इन्जिनियरिङ प्राविधिक परीक्षण गर्ने।' },
  ];

  const filteredDownloads = LEGAL_ACTS_DOWNLOADS.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSections = keySections.filter(s =>
    s.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1b64b5] text-white text-xs font-bold px-2 py-0.5 rounded">
              आधिकारिक दस्तावेज
            </span>
            <span className="text-xs text-slate-500 font-medium">
              सार्वजनिक खरिद ऐन तथा नियमावली
            </span>
          </div>
          <h2 className="text-lg sm:text-lg font-black text-[#185294] mt-1">
            {language === 'ne' ? 'सार्वजनिक खरिद ऐन तथा नियमावली' : 'Public Procurement Act and Regulations'}
          </h2>
          {/* <p className="text-slate-600 text-sm mt-0.5">
            {language === 'ne'
              ? 'सबै सार्वजनिक निकायहरूका लागि सार्वजनिक खरिद सम्बन्धी मुख्य ऐन, नियमावली, मानक बोलपत्र कागजात र दफावार कानूनी विवरण।'
              : 'Standard Bidding Documents (SBDs), Acts, Regulations, and key statutory provisions for all public entities.'}
          </p> */}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ऐन, दफा वा फारम खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1b64b5]"
          />
        </div>
      </div>

      {/* 1. Official Downloads Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#1b64b5]" />
          <span>खरिद सम्बन्धी आधिकारिक स्रोतहरू (Procurement Sources)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDownloads.map((doc) => (
            <div
              key={doc.href}
              className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="bg-blue-50 text-[#185294] border border-blue-200 font-bold px-2 py-0.5 rounded">
                    {doc.type}
                  </span>
                  <span className="text-slate-500 font-mono">{doc.size}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug mb-1">
                  {doc.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {doc.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{doc.date}</span>
                <a
                  href={doc.href}
                  download
                  className="flex items-center gap-1.5 bg-[#1b64b5] hover:bg-[#155294] text-white text-xs font-bold px-3 py-1.5 rounded transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>डाउनलोड</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Key Statutory Provisions */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#1b64b5]" />
          <span>महत्वपूर्ण दफा तथा नियमहरूको सूची (Key Statutory Clauses)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {filteredSections.map((sec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between font-bold text-[#185294] mb-1">
                <span>{sec.section}</span>
                <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                  {sec.title}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {sec.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">लागत अनुमान तथा परामर्श प्रस्ताव स्वीकृति अधिकार</h3>
          <p className="mt-1 text-xs text-slate-600">नियम १४ र ८१क</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-bold">पद</th>
                <th className="px-3 py-2 font-bold">निर्माण estimate</th>
                <th className="px-3 py-2 font-bold">मालसामान/सेवा estimate</th>
                <th className="px-3 py-2 font-bold">परामर्श proposal</th>
              </tr>
            </thead>
            <tbody>
              {APPROVAL_AUTHORITY_BANDS.map((band) => (
                <tr key={band.level} className="border-t border-slate-100 align-top">
                  <th className="px-3 py-2 font-semibold text-slate-800">{band.level}</th>
                  <td className="px-3 py-2 text-slate-700">{band.worksEstimate}</td>
                  <td className="px-3 py-2 text-slate-700">{band.goodsServicesEstimate}</td>
                  <td className="px-3 py-2 text-slate-700">{band.consultingAward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-[11px] leading-relaxed text-slate-600">{APPROVAL_AUTHORITY_SPECIAL_CASE}</p>
      </section>
    </div>
  );
};
