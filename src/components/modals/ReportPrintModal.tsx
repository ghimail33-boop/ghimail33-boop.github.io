import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatNepaliNumber, toNepaliDigits } from '../../utils/numberFormat';
import { Printer, X, Download, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: number;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  isOpen,
  onClose,
  inspectionId,
}) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && inspectionId) {
      loadReport();
    }
  }, [isOpen, inspectionId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.getInspectionReport(inspectionId);
      setReport(res && !res.error ? res : null);
    } catch (err) {
      console.error('Failed to load report packet:', err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatNPR = (amount: number | string) => {
    return formatNepaliNumber(amount);
  };

  const formatInspectionDate = () => {
    const currentBsDate = window.NepaliCalendar?.getCurrentDate() || '2081-08-15';
    return toNepaliDigits(currentBsDate);
  };

  const formatNepaliDeadline = (date?: string, preservedBsDate?: string) => {
    if (preservedBsDate) return toNepaliDigits(String(preservedBsDate).slice(0, 10));
    if (!date) return '-';

    const raw = String(date);
    let datePart = raw.slice(0, 10);

    if (raw.includes('T')) {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        datePart = `${y}-${m}-${d}`;
      }
    }

    const bsDate = window.NepaliCalendar?.convertADtoBS(datePart) || datePart;
    return toNepaliDigits(bsDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300 text-xs">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print p-3.5 border-b border-slate-200 bg-[#0f2c4d] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-bold text-sm">
                आधिकारिक प्राविधिक निरीक्षण प्रतिवेदन (Official Technical Inspection Report)
              </span>
              <p className="text-[11px] text-slate-300">
                राष्ट्रिय सतर्कता केन्द्र, सिंहदरबार - सार्वजनिक खरिद अनुगमन
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिन्ट / PDF सेभ गर्नुहोस्</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white print:p-0 print:overflow-visible">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <div className="animate-spin inline-block w-8 h-8 border-3 border-[#0f2c4d] border-t-transparent rounded-full" />
              <div className="mt-2 text-xs">प्रतिवेदन तयार गरिँदैछ...</div>
            </div>
          ) : !report || !report.inspection || !report.procurement ? (
            <div className="py-20 text-center text-red-600">
              प्रतिवेदन विवरण प्राप्त गर्न सकिएन।
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto text-slate-900 font-serif print:text-black">
              {/* Official Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 relative">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-20 text-left">
                    <img
                      src="/emblem.webp"
                      alt="नेपाल सरकार निशाना छाप"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center space-y-1">
                    <div className="text-xs font-bold text-red-800 tracking-wider">
                      नेपाल सरकार
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f2c4d] print:text-black font-sans">
                      राष्ट्रिय सतर्कता केन्द्र
                    </h1>
                    <div className="text-xs font-bold">सिंहदरबार, काठमाडौँ</div>
                    <div className="text-xs font-medium text-slate-600 print:text-black">
                      (प्राविधिक परीक्षण तथा खरिद अनुगमन महाशाखा)
                    </div>
                  </div>
                  <div className="w-24 text-right text-[11px] font-sans text-slate-600 print:text-black space-y-0.5">
                    <div>
                      पत्र संख्या: <span className="font-mono">०८१/८२</span>
                    </div>
                    <div>
                      चलानी नं: <span className="font-mono">{report.inspection.id + 420}</span>
                    </div>
                    <div>
                      मिति: <span className="font-mono">{formatInspectionDate()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 inline-block border-y border-slate-900 py-1 px-6">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider font-sans">
                    सार्वजनिक खरिद अनुगमन तथा प्राविधिक निरीक्षण प्रतिवेदन
                  </h2>
                </div>
              </div>

              {/* Subject & Reference */}
              <div className="space-y-1 text-xs font-sans">
                <div className="flex">
                  <span className="font-bold w-24 shrink-0">विषय:</span>
                  <span className="font-bold underline">
                    {report.procurement.title} को खरिद प्रक्रिया तथा प्राविधिक निरीक्षण सम्बन्धमा।
                  </span>
                </div>
                <div className="flex">
                  <span className="font-bold w-24 shrink-0">सम्बन्धित निकाय:</span>
                  <span>{report.procurement.office_name} ({report.procurement.district_name || 'काठमाडौं'}, {report.procurement.province_name})</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-24 shrink-0">ठेक्का नं.:</span>
                  <span className="font-mono font-semibold">{report.procurement.procurement_number}</span>
                </div>
              </div>

              {/* Executive Summary Grid */}
              <div className="border border-slate-300 rounded p-4 bg-slate-50/60 print:bg-transparent font-sans text-xs">
                <h3 className="font-bold text-[#0f2c4d] print:text-black border-b border-slate-300 pb-1 mb-2">
                  १. खरिद आयोजनाको संक्षेप विवरण
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-slate-500 print:text-black block text-[11px]">खरिद प्रकार र विधि:</span>
                    <span className="font-semibold">{report.procurement.procurement_type} ({report.procurement.procurement_method})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-black block text-[11px]">लागत अनुमान (रु.):</span>
                    <span className="font-mono font-semibold">रु. {formatNPR(report.procurement.estimated_cost)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-black block text-[11px]">सम्झौता रकम (रु.):</span>
                    <span className="font-mono font-bold text-[#0f2c4d] print:text-black">रु. {formatNPR(report.procurement.contract_amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-black block text-[11px]">निर्माण व्यवसायी/फर्म:</span>
                    <span className="font-semibold">{report.procurement.contractor_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-black block text-[11px]">सम्झौता मिति:</span>
                    <span className="font-mono">{report.procurement.contract_date || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-black block text-[11px]">सम्पन्न हुने म्याद:</span>
                    <span className="font-mono">{report.procurement.contract_completion_date || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-black block text-[11px]">निरीक्षण स्थिति:</span>
                    <span className="font-bold text-emerald-800 print:text-black">{report.inspection.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-black block text-[11px]">कुल पहिचान कैफियत:</span>
                    <span className="font-bold text-red-800 print:text-black tabular-nums">{formatNepaliNumber(report.findings.length)} वटा</span>
                  </div>
                </div>
              </div>

              {/* Findings Section */}
              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <h3 className="font-bold text-[#0f2c4d] print:text-black text-xs sm:text-sm">
                    २. पहिचान गरिएका कानूनी विचलन तथा जोखिमपूर्ण कैफियतहरू (Audit Findings)
                  </h3>
                  <span className="text-[11px] text-slate-500 print:text-black">
                    सार्वजनिक खरिद ऐन, २०६३ तथा नियमावली, २०६४ अनुसार
                  </span>
                </div>

                {report.findings.length === 0 ? (
                  <div className="p-4 border border-slate-200 rounded text-center text-slate-600 text-xs">
                    निरीक्षणका क्रममा कुनै कैफियत फेला परेन। खरिद प्रक्रिया सन्तोषजनक देखिएको छ।
                  </div>
                ) : (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                        <tr>
                          <th className="p-2 w-16">कोड</th>
                          <th className="p-2">कैफियत विषय तथा विवरण</th>
                          <th className="p-2">कानूनी व्यवस्था</th>
                          <th className="p-2 w-20">जोखिम</th>
                          <th className="p-2 text-right">आर्थिक प्रभाव</th>
                          <th className="p-2">सुझाव तथा म्याद</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {report.findings.map((f: any) => (
                          <tr key={f.id} className="align-top">
                            <td className="p-2 font-mono font-bold text-slate-900">{f.finding_code}</td>
                            <td className="p-2">
                              <div className="font-bold text-slate-900">{f.title}</div>
                              <p className="text-[11px] text-slate-600 print:text-black mt-0.5 leading-relaxed">
                                {f.description}
                              </p>
                            </td>
                            <td className="p-2 text-slate-800 font-medium text-[11px]">
                              {f.legal_reference || '-'}
                            </td>
                            <td className="p-2 font-semibold">
                              <span className="text-[11px]">{f.risk_level}</span>
                            </td>
                            <td className="p-2 text-right font-mono font-semibold tabular-nums">
                              {Number(f.estimated_financial_impact) > 0
                                ? `रु. ${formatNPR(f.estimated_financial_impact)}`
                                : '-'}
                            </td>
                            <td className="p-2 text-[11px]">
                              <div>{f.recommended_action || '-'}</div>
                              {f.corrective_action_deadline && (
                                <div className="text-slate-500 font-mono mt-0.5">
                                  म्याद: {formatNepaliDeadline(f.corrective_action_deadline)}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Signature Blocks */}
              <div className="pt-10 grid grid-cols-3 gap-6 text-center font-sans text-xs">
                <div className="space-y-1">
                  <div className="border-b border-dotted border-slate-700 h-10 w-3/4 mx-auto"></div>
                  <div className="font-bold mt-1">{report.inspection.lead_inspector || 'ई. पुरुषोत्तम प्रसाद'}</div>
                  <div className="text-[11px] text-slate-500 print:text-black">प्रमुख प्राविधिक निरीक्षक</div>
                </div>

                <div className="space-y-1">
                  <div className="border-b border-dotted border-slate-700 h-10 w-3/4 mx-auto"></div>
                  <div className="font-bold mt-1">{report.inspection.verified_by || 'समीक्षक / निर्देशक'}</div>
                  <div className="text-[11px] text-slate-500 print:text-black">समीक्षा तथा रुजु अधिकारी</div>
                </div>

                <div className="space-y-1">
                  <div className="border-b border-dotted border-slate-700 h-10 w-3/4 mx-auto"></div>
                  <div className="font-bold mt-1">सचिव / प्रमुख</div>
                  <div className="text-[11px] text-slate-500 print:text-black">राष्ट्रिय सतर्कता केन्द्र</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
