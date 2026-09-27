import React, { useState } from 'react';
import { Calculator, ShieldAlert, CheckCircle2, Scale, Clock, Award, Info } from 'lucide-react';
import { APPROVAL_AUTHORITY_BANDS, APPROVAL_AUTHORITY_SPECIAL_CASE, PROCUREMENT_SOURCE_NOTE, THRESHOLD_RULES } from '../data/procurementData';
import { Language } from '../types/procurement';

interface ThresholdCalculatorViewProps {
  language: Language;
}

export const ThresholdCalculatorView: React.FC<ThresholdCalculatorViewProps> = ({ language }) => {
  const [procurementType, setProcurementType] = useState<'works' | 'goods' | 'consulting' | 'other'>('works');
  const [amountInput, setAmountInput] = useState<string>('1200000');
  const [isCommunityUser, setIsCommunityUser] = useState<boolean>(false);

  const numericAmount = parseFloat(amountInput.replace(/,/g, '')) || 0;
  const hasAmount = amountInput.trim().length > 0 && Number.isFinite(Number(amountInput.replace(/,/g, '')));
  const matchingRules = hasAmount
    ? THRESHOLD_RULES.filter((rule) => {
        if (rule.type !== procurementType) return false;
        if (rule.methodId === 'consumer-committee' && !isCommunityUser) return false;
        return numericAmount >= rule.minAmount && numericAmount <= rule.maxAmount;
      })
    : [];

  const formatNPR = (val: number) => {
    return new Intl.NumberFormat('ne-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 })
      .format(val)
      .replace('NPR', 'रु.');
  };

  const presetAmounts = [
    { label: 'रु. ४ लाख', value: 400000 },
    { label: 'रु. १५ लाख', value: 1500000 },
    { label: 'रु. ८० लाख', value: 8000000 },
    { label: 'रु. ३ करोड', value: 30000000 },
    { label: 'रु. २० करोड', value: 200000000 },
  ];

  return (
    <div className="space-y-3">
      {/* Top Banner */}
      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1b64b5] text-white text-xs font-bold px-2 py-0.5 rounded">
              {language === 'ne' ? 'थ्रेसहोल्ड तथा अख्तियारी क्याल्कुलेटर' : 'Threshold & Authority Calculator'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ऐन तथा नियमावलीमा स्पष्ट रकमगत सीमा
            </span>
          </div>
          <h3 className="text-md sm:text-lg font-black text-[#185294] mt-1">
            {language === 'ne' ? 'सबै सार्वजनिक निकायका लागि खरिद सीमा र धरौटी क्याल्कुलेटर' : 'Procurement Limit & Authority Calculator'}
          </h3>
          <p className="text-slate-600 text-sm mt-0.5">
            {language === 'ne'
              ? 'लागत अनुमान रकम प्रविष्ट गरी लागू हुने आधिकारिक खरिद विधि, म्याद, बैंक ग्यारेन्टी र स्वीकृत गर्ने निकाय पत्ता लगाउनुहोस्।'
              : 'Enter estimated value to determine the statutory procurement method, notice period, and approving authority.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#1b64b5]" />
            <span>खरिद सम्बन्धी विवरण प्रविष्ट गर्नुहोस्</span>
          </h3>

          {/* 1. Procurement Nature */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              १. खरिदको प्रकृति (Nature of Procurement):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'works', label: 'निर्माण कार्य (Works)' },
                { id: 'goods', label: 'मालसामान (Goods)' },
                { id: 'consulting', label: 'परामर्श सेवा (Consulting)' },
                { id: 'other', label: 'अन्य सेवा' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setProcurementType(t.id as any);
                    if (t.id !== 'works') setIsCommunityUser(false);
                  }}
                  className={`p-2 rounded text-xs font-bold border transition text-center cursor-pointer ${
                    procurementType === t.id
                      ? 'bg-[#1b64b5] text-white border-blue-800'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              २. स्वीकृत लागत अनुमान रकम (भ्याट बाहेक/सहित - रु):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-sm">रु.</span>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="उदा. 1500000"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-lg text-slate-900 font-bold text-base focus:border-[#1b64b5] focus:outline-none"
              />
            </div>
            <div className="text-right text-xs text-slate-500 mt-1 font-mono font-medium">
              अंकमा: {formatNPR(numericAmount)}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1.5">द्रुत नमुना रकमहरू:</div>
            <div className="flex flex-wrap gap-1.5">
              {presetAmounts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAmountInput(p.value.toString())}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded border border-slate-300 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Consumer committee route is an eligibility choice, not the default result. */}
          {procurementType === 'works' && numericAmount <= 10000000 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-950">
                <input
                  type="checkbox"
                  checked={isCommunityUser}
                  onChange={(e) => setIsCommunityUser(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>उपभोक्ता समिति विधिका शर्त पूरा हुन्छन्?</span>
              </label>
              <p className="text-[11px] text-amber-800 mt-1">नियम ९७ अनुसार लागत अनुमान रु. १ करोडसम्मको योग्य निर्माण कार्य वा सम्बन्धित सेवा।</p>
            </div>
          )}
        </div>

        {/* Right Output Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-lg border-2 border-[#1b64b5] shadow-xs p-2 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  लागू हुन सक्ने विधि/रकम विकल्प
                </span>
                <h3 className="text-md sm:text-lg font-black text-[#185294] mt-0.5">{matchingRules.length} वटा रकम-आधारित विकल्प</h3>
              </div>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                नियमगत विकल्प
              </span>
            </div>

            {!hasAmount ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">पहिले लागत अनुमान रकम प्रविष्ट गर्नुहोस्।</p>
            ) : matchingRules.length === 0 ? (
              <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">यस रकम/प्रकृतिका लागि ऐन वा नियमावलीमा छुट्टै numeric route भेटिएन। लागू विधि विवरण हेर्नुहोस्।</p>
            ) : (
              <div className="space-y-3">
                {matchingRules.map((rule, index) => (
                  <article key={`${rule.methodId}-${rule.type}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{rule.method}</h4>
                        <p className="mt-0.5 text-xs text-slate-600">{rule.applicability}</p>
                      </div>
                      <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-900">{rule.formattedRange}</span>
                    </div>
                    <dl className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                      <div><dt className="font-bold text-slate-500">ऐन/नियम</dt><dd className="mt-0.5 text-slate-800">{rule.legalSection}</dd></div>
                      <div><dt className="font-bold text-slate-500">स्वीकृति अधिकारी</dt><dd className="mt-0.5 text-slate-800">{rule.approvingAuthority}</dd></div>
                      <div className="sm:col-span-2"><dt className="font-bold text-slate-500">सूचना/प्रस्ताव अवधि</dt><dd className="mt-0.5 text-slate-800">{rule.noticePeriodDays}</dd></div>
                      <div className="sm:col-span-2"><dt className="font-bold text-slate-500">मुख्य कागजात</dt><dd className="mt-0.5 text-slate-800">{(rule.requiredDocuments || []).join(' • ')}</dd></div>
                      <div className="sm:col-span-2"><dt className="font-bold text-slate-500">विशेष शर्त</dt><dd className="mt-0.5 text-slate-800">{rule.specialRules}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            )}

            {/* Security is method/SBD-specific and must not be guessed as a universal percentage. */}
            <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200 space-y-2">
              <h4 className="text-xs font-bold text-[#185294] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1b64b5]" />
                <span>जमानत तथा धरौटी</span>
              </h4>
              <p className="text-xs leading-relaxed text-slate-700">Bid security, performance security, validity र additional security विधि, लागू नियम र चालू SBD/contract condition अनुसार अलग-अलग निर्धारण गर्नुहोस्। यो रकमलाई अनुमानित सार्वभौम प्रतिशतमा गणना नगर्नुहोस्।</p>
            </div>

            {/* Special Instructions & Caution */}
            <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>सतर्कता:</strong> रकमको overlap लाई अनुमति ठानेर स्वतः विधि नछान्नुहोस्; कुल आवश्यकता जोडेर anti-splitting परीक्षण र लिखित method justification गर्नुहोस्।
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">लागत अनुमान तथा परामर्श प्रस्ताव स्वीकृति अधिकारी</h3>
          <p className="mt-1 text-xs text-slate-600">{PROCUREMENT_SOURCE_NOTE} लागत अनुमान र परामर्श प्रस्तावको स्वीकृति सम्बन्धित नियमअनुसार अलग छन्।</p>
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
        <p className="px-4 py-3 text-[11px] leading-relaxed text-slate-600">
          {APPROVAL_AUTHORITY_SPECIAL_CASE}
        </p>
      </section>
    </div>
  );
};
