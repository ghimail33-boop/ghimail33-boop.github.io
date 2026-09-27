import React, { useState, useEffect } from 'react';
import { Inspection } from '../types';
import { api } from '../services/api';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  FileSpreadsheet,
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Building,
  CheckCircle,
  AlertTriangle,
  FileCheck2,
  Calendar,
} from 'lucide-react';

interface ReportsViewProps {
  onOpenReportPrint: (inspectionId: number) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenReportPrint }) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const res = await api.getInspections();
      setInspections(res);
    } catch (err) {
      console.error('Failed to load inspections for report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white px-5 py-3.5 rounded border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
              राष्ट्रिय सतर्कता केन्द्र
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-medium text-slate-500">प्रतिवेदन तथा अभिलेख</span>
          </div>
          <h3 className="text-base font-bold text-[#0f2c4d] tracking-tight mt-0.5">
            निरीक्षण प्रतिवेदन तथा डाटा निर्यात (Reports & Data Export)
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            आधिकारिक छानविन प्रतिवेदनहरू, परिपालना स्थिति विवरण तथा Excel/CSV डाटा फाइलहरू
          </p>
        </div>
      </div>

      {/* CSV Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Export 1: Procurements CSV */}
        <div className="bg-white p-4 rounded border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1 pr-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#0f2c4d]" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                खरिद आयोजना विवरण (Procurements CSV)
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              दर्ता भएका सम्पूर्ण खरिद विवरण, लागत अनुमान, ठेक्का रकम, कार्यालय र विधिको केन्द्रीय तालिका
            </p>
          </div>
          <a
            href="/api/reports/export/procurements.csv"
            download
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0f2c4d] hover:bg-[#153e6c] text-white rounded text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV डाउनलोड</span>
          </a>
        </div>

        {/* Export 2: Findings CSV */}
        <div className="bg-white p-4 rounded border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1 pr-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#991b1b]" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                कैफियत तथा जोखिम विवरण (Findings CSV)
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              पहिचान भएका सम्पूर्ण कैफियत, कानूनी दफा, सम्भावित आर्थिक विचलन र कारबाही म्यादको अभिलेख
            </p>
          </div>
          <a
            href="/api/reports/export/findings.csv"
            download
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV डाउनलोड</span>
          </a>
        </div>
      </div>

      {/* Official Inspection Reports List */}
      <div className="bg-white rounded border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#0f2c4d]" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              आधिकारिक निरीक्षण प्रतिवेदन सूची (Inspection Dossiers)
            </h4>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            जम्मा: <span className="font-semibold text-slate-800">{formatNepaliNumber(inspections.length)}</span> प्रतिवेदनहरू उपलब्ध
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-[#0f2c4d] border-t-transparent rounded-full" />
            <div className="mt-2 text-xs">प्रतिवेदनहरू लोड हुँदैछन्...</div>
          </div>
        ) : inspections.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            कुनै निरीक्षण प्रतिवेदन तयार भएको छैन।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3.5">निरीक्षण कोड</th>
                  <th className="py-2.5 px-3.5">खरिद आयोजनाको शीर्षक</th>
                  <th className="py-2.5 px-3.5">सार्वजनिक निकाय</th>
                  <th className="py-2.5 px-3.5">प्रमुख प्राविधिक निरीक्षक</th>
                  <th className="py-2.5 px-3.5 text-center">प्रगति</th>
                  <th className="py-2.5 px-3.5">स्थिति</th>
                  <th className="py-2.5 px-3.5 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => {
                  const pct = insp.completion_percentage || 0;
                  return (
                    <tr key={insp.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                        INSP-{insp.id < 10 ? `00${insp.id}` : insp.id < 100 ? `0${insp.id}` : insp.id}
                      </td>

                      <td className="py-2.5 px-3.5 max-w-sm">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {insp.procurement_title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ठेक्का नं: {insp.procurement_number || '-'}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 text-slate-700">
                        {insp.office_name}
                      </td>

                      <td className="py-2.5 px-3.5 text-slate-800">
                        {insp.lead_inspector_name || 'ई. पुरुषोत्तम प्रसाद'}
                      </td>

                      <td className="py-2.5 px-3.5 text-center">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 mx-auto overflow-hidden">
                          <div
                            className="bg-[#0f2c4d] h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block tabular-nums">
                          {formatNepaliNumber(pct)}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            insp.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {insp.status === 'Verified' ? 'प्रमाणित' : insp.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenReportPrint(insp.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-100 text-[#0f2c4d] border border-slate-300 rounded text-xs font-semibold transition cursor-pointer ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>प्रतिवेदन हेर्नुहोस् / प्रिन्ट</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
