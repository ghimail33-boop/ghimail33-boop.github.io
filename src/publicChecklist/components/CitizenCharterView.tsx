import React, { useState } from 'react';
import { Users, HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle2, PhoneCall, ShieldCheck } from 'lucide-react';
import { CITIZEN_CHARTER_DATA, FREQUENT_QUESTIONS } from '../data/procurementData';
import { Language } from '../types/procurement';

interface CitizenCharterViewProps {
  language: Language;
}

export const CitizenCharterView: React.FC<CitizenCharterViewProps> = ({ language }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [grievanceSubmitted, setGrievanceSubmitted] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    officeTarget: '',
    subject: '',
    description: ''
  });
  const [formError, setFormError] = useState('');

  const handleFaqToggle = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.officeTarget || !formData.description) {
      setFormError('कृपया सम्बन्धित सार्वजनिक निकाय र उजुरीको विवरण अनिवार्य भर्नुहोस्।');
      return;
    }
    const newId = `NVC-VIG-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(newId);
    setGrievanceSubmitted(true);
  };

  return (
    <div className="space-y-3">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1b64b5] text-white text-xs font-bold px-2 py-0.5 rounded">
              सुशासन, निगरानी तथा पारदर्शिता
            </span>
            <span className="text-xs text-slate-500 font-medium">
              भ्रष्टाचार निवारण ऐन, २०५९ तथा सुशासन ऐन, २०६४ बमोजिम
            </span>
          </div>
          <h2 className="text-lg sm:text-lg font-black text-[#185294] mt-1">
            {language === 'ne' ? 'नागरिक वडापत्र तथा सतर्कता उजुरी डेस्क' : 'Citizen Charter & Vigilance Grievance Desk'}
          </h2>
          {/* <p className="text-slate-600 text-sm mt-0.5">
            {language === 'ne'
              ? 'राष्ट्रिय सतर्कता केन्द्रको नागरिक वडापत्र, सार्वजनिक खरिदमा हुने अनियमितता सम्बन्धी उजुरी तथा सोधपुछ।'
              : 'National Vigilance Centre Citizen Charter, procurement irregularities complaint desk, and hotline.'}
          </p> */}
        </div>

        <div className="flex items-center gap-2 bg-blue-50 text-blue-950 border border-blue-200 px-4 py-2 rounded-lg">
          <PhoneCall className="w-5 h-5 text-[#1b64b5]" />
          <div className="text-xs">
            <div className="font-bold">सतर्कता केन्द्र हटलाइन</div>
            <div className="font-mono font-bold text-[#185294]">फोन: ४२००३४५ | email:navic@nvc.gov.np</div>
          </div>
        </div>
      </div>

      {/* 1. Citizen Charter Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1b64b5]" />
            <span>राष्ट्रिय सतर्कता केन्द्रको नागरिक वडापत्र</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">अद्यावधिक: २०८३</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#185294] text-white">
              <tr>
                <th className="p-3 w-10">क्र.सं.</th>
                <th className="p-3">प्रवाह गरिने सेवा</th>
                <th className="p-3">जिम्मेवार शाखा / अधिकृत</th>
                <th className="p-3">लाग्ने समय</th>
                <th className="p-3">दस्तुर</th>
                <th className="p-3">आवश्यक प्रमाण तथा कागजात</th>
                <th className="p-3">फाँट / कोठा</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {CITIZEN_CHARTER_DATA.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-700">{idx + 1}</td>
                  <td className="p-3 font-bold text-[#185294]">{item.service}</td>
                  <td className="p-3 text-slate-700 font-medium">{item.responsibleOfficer}</td>
                  <td className="p-3">
                    <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                      {item.timeframe}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{item.fee}</td>
                  <td className="p-3 text-slate-600">
                    <ul className="list-disc pl-4 space-y-0.5">
                      {item.requiredDocuments.map((doc, dIdx) => (
                        <li key={dIdx}>{doc}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-600">{item.roomNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Frequently Asked Questions */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#1b64b5]" />
            <span>बारम्बार सोधिने प्रश्नहरू (Frequently Asked Questions - FAQ)</span>
          </h3>

          <div className="space-y-2">
            {FREQUENT_QUESTIONS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 overflow-hidden transition"
                >
                  <button
                    onClick={() => handleFaqToggle(idx)}
                    className="w-full flex items-center justify-between p-3.5 text-left bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-xs sm:text-sm font-bold text-slate-900"
                  >
                    <span>{idx + 1}. {faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="p-3.5 bg-white border-t border-slate-200 text-xs text-slate-700 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Grievance Desk / Vigilance Complaint Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border-2 border-blue-200 shadow-xs">
          <div className="flex items-center gap-2 border-b border-blue-100 pb-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#1b64b5]" />
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider">
              राष्ट्रिय सतर्कता केन्द्र उजुरी तथा गुनासो डेस्क
            </h3>
          </div>

          {grievanceSubmitted ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-950 text-sm">
                उजुरी / सूचना दर्ता भयो!
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                तपाईंको उजुरी राष्ट्रिय सतर्कता केन्द्रको गुनासो तथा अनुगमन शाखा समक्ष गोप्य रूपमा दर्ता भएको छ।
              </p>
              <div className="bg-white p-2 rounded border border-emerald-300 font-mono text-xs font-bold text-slate-900">
                ट्र्याकिङ टोकन: {ticketId}
              </div>
              <button
                onClick={() => {
                  setGrievanceSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', officeTarget: '', subject: '', description: '' });
                }}
                className="text-xs text-[#1b64b5] underline font-bold"
              >
                नयाँ उजुरी दर्ता गर्नुहोस्
              </button>
            </div>
          ) : (
            <form onSubmit={handleGrievanceSubmit} className="space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-50 text-red-800 border border-red-200 rounded font-medium">
                  {formError}
                </div>
              )}
              <p className="text-slate-600 text-xs">
                सार्वजनिक निकायहरूको खरिदमा गुणस्तरहीन काम, काम टुक्र्याउने, मिलोमतो वा अनियमितता भएमा सतर्कता केन्द्रमा गोप्य उजुरी दिनुहोस्:
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1">तपाईंको पूरा नाम</label>
                <input
                  type="text"
                  placeholder="उदा. पोषराज बुढाथोकी"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#1b64b5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">सम्पर्क फोन नं.</label>
                  <input
                    type="tel"
                    placeholder="९८XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#1b64b5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ईमेल (ऐच्छिक)</label>
                  <input
                    type="email"
                    placeholder="citizen@domain.gov.np"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#1b64b5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">सम्बन्धित सार्वजनिक निकाय / पदाधिकारी *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. कागेश्वरी मनोहरा नगरपालिका"
                  value={formData.officeTarget}
                  onChange={(e) => setFormData({ ...formData, officeTarget: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#1b64b5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">उजुरीको विषय वा अनियमितता सम्बन्धी विवरण *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="खरिद प्रक्रिया वा निर्माण कार्यको गुणस्तर सम्बन्धी संक्षिप्त विवरण उल्लेख गर्नुहोस्..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#1b64b5] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-[#1b64b5] hover:bg-[#155294] text-white font-bold py-2 rounded shadow-xs transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>राष्ट्रिय सतर्कता केन्द्रमा पेश गर्नुहोस्</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
