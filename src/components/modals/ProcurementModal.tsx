import React, { useState, useEffect } from 'react';
import { Office, Province, District, Municipality, FiscalYear, Ministry } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../Toast';
import { FolderGit2, X, Plus, Check, Building2, Calendar, FileText, UserCheck, AlertCircle } from 'lucide-react';

type NepalLocationData = {
  PROVINCE: Record<string, string>;
  DISTRICTS: Record<string, string[]>;
};

declare global {
  interface Window {
    nepalData: NepalLocationData;
  }
}

const nepalLocationData = window.nepalData;
const nepalProvinces: Province[] = nepalLocationData
  ? Object.entries(nepalLocationData.PROVINCE).map(([id, name_ne]) => ({
      id: Number(id),
      name_en: name_ne,
      name_ne,
    }))
  : [];

interface ProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProcurementModal: React.FC<ProcurementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [offices, setOffices] = useState<Office[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [procurementNumber, setProcurementNumber] = useState('');
  const [officeId, setOfficeId] = useState<number | ''>('');
  const [officeName, setOfficeName] = useState('');
  const [ministryId, setMinistryId] = useState<number | ''>('');
  const [provinceId, setProvinceId] = useState<number | ''>(3); // Bagmati default
  const [districtName, setDistrictName] = useState('काठमाडौं');
  const [municipalityId, setMunicipalityId] = useState<number | ''>(1);
  const [ward, setWard] = useState('');
  const [procurementType, setProcurementType] = useState('Works');
  const [procurementMethod, setProcurementMethod] = useState('Open Competitive Bidding');
  const [fiscalYearId, setFiscalYearId] = useState<number | ''>(1);
  const [budgetSource, setBudgetSource] = useState('नेपाल सरकार स्रोत');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [contractAmount, setContractAmount] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contractDate, setContractDate] = useState('2081-04-15');
  const [contractCompletionDate, setContractCompletionDate] = useState('2082-03-30');
  const [leadInspector, setLeadInspector] = useState('ई. पुरुषोत्तम प्रसाद');
  const [inspectionTeam, setInspectionTeam] = useState('ई. विभूति पोखरेल, ले.पा. पोषराज बुढाथोकी');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
    }
  }, [isOpen]);

  const loadDropdowns = async () => {
    try {
      const [offRes, distRes, minRes, fyRes] = await Promise.all([
        api.getOffices(),
        api.getDistricts(3),
        api.getMinistries(),
        api.getFiscalYears(),
      ]);
      setOffices(offRes);
      setProvinces(nepalProvinces);
      setDistricts(distRes);
      setMinistries(minRes);
      setFiscalYears(fyRes);
    } catch (err) {
      console.error('Failed to load master dropdowns:', err);
    }
  };

  const getDistrictNames = (pId: number | '') =>
    pId === '' || !nepalLocationData ? [] : nepalLocationData.DISTRICTS[String(pId)] || [];

  const handleProvinceChange = async (pId: number) => {
    setProvinceId(pId);
    try {
      const dists = await api.getDistricts(pId);
      setDistricts(dists);
      setDistrictName(getDistrictNames(pId)[0] || '');
    } catch (e) {
      console.error(e);
      setDistrictName(getDistrictNames(pId)[0] || '');
    }
  };

  const handleOfficeNameChange = (name: string) => {
    setOfficeName(name);
    const matchingOffice = offices.find(
      (office) => office.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    setOfficeId(matchingOffice?.id || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !officeName.trim() || !estimatedCost || !contractAmount) {
      setError('कृपया शीर्षक, सार्वजनिक निकाय, लागत अनुमान र सम्झौता रकम भर्नुहोस्।');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await api.createProcurement({
        title,
        procurement_number: procurementNumber || `PROC-${Date.now().toString().slice(-6)}`,
        office_id: officeId ? Number(officeId) : undefined,
        office_name: officeName.trim(),
        ministry_id: ministryId ? Number(ministryId) : undefined,
        province_id: provinceId ? Number(provinceId) : undefined,
        district_id: districts.find((district) => district.name_ne === districtName)?.id,
        municipality_id: municipalityId ? Number(municipalityId) : undefined,
        ward,
        procurement_type: procurementType as any,
        procurement_method: procurementMethod as any,
        fiscal_year_id: Number(fiscalYearId) || 1,
        budget_source: budgetSource,
        estimated_cost: parseFloat(estimatedCost) || 0,
        contract_amount: parseFloat(contractAmount) || 0,
        contract_number: contractNumber,
        contractor_name: contractorName,
        contract_date: contractDate || undefined,
        contract_start_date: contractDate || undefined,
        contract_completion_date: contractCompletionDate || undefined,
        current_status: 'संचालनमा',
        lead_inspector: leadInspector,
        inspection_team: inspectionTeam,
      });

      showToast('success', 'खरिद दर्ता सफल', 'नयाँ खरिद आयोजना केन्द्रीय प्रणालीमा अभिलेखीकरण भयो।');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'खरिद दर्ता गर्न सकिएन।');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded max-w-3xl w-full max-h-[92vh] flex flex-col shadow-xl overflow-hidden border border-slate-200 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-[#0f2c4d]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                नयाँ खरिद आयोजना दर्ता (New Procurement Registration)
              </h3>
              <p className="text-[11px] text-slate-500">
                सार्वजनिक निकायको खरिद योजना, सम्झौता र निरीक्षण टोलीको अभिलेख
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Group 1: General Info */}
          <div className="bg-slate-50/70 p-3.5 rounded border border-slate-200 space-y-3">
            <h4 className="font-bold text-[#0f2c4d] text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>१. खरिद तथा आयोजनाको सामान्य विवरण</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  खरिद / आयोजनाको शीर्षक*:
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: काठमाडौँ-हेटौँडा सुरुङमार्ग निर्माण कार्य"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ठेक्का नं. (Contract No.):
                </label>
                <input
                  type="text"
                  placeholder="NCB-01-2081/82"
                  value={procurementNumber}
                  onChange={(e) => setProcurementNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  सार्वजनिक निकायको नाम*:
                </label>
                <input
                  type="text"
                  required
                  placeholder="सडक विभाग, पुल महाशाखा"
                  value={officeName}
                  onChange={(e) => handleOfficeNameChange(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  प्रदेश (Province):
                </label>
                <select
                  value={provinceId}
                  onChange={(e) => handleProvinceChange(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                >
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_ne}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  जिल्ला (District):
                </label>
                <select
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                >
                  {getDistrictNames(provinceId).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  खरिदको प्रकार (Procurement Type):
                </label>
                <select
                  value={procurementType}
                  onChange={(e) => setProcurementType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                >
                  <option value="Works">निर्माण कार्य (Works)</option>
                  <option value="Goods">मालसामान खरिद (Goods)</option>
                  <option value="Consultancy Services">परामर्श सेवा (Consultancy Services)</option>
                  <option value="Other Services">अन्य गैर-परामर्श सेवा (Other Services)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  खरिद विधि (Method):
                </label>
                <select
                  value={procurementMethod}
                  onChange={(e) => setProcurementMethod(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                >
                  <option value="Open Competitive Bidding">खुला बोलपत्र (Open Bidding)</option>
                  <option value="Sealed Quotation">सिलबन्दी दरभाउपत्र (Sealed Quotation)</option>
                  <option value="Direct Procurement">सोझै खरिद (Direct)</option>
                  <option value="Consumer Committee">उपभोक्ता समिति (Consumer Committee)</option>
                  <option value="Consultancy Selection">परामर्शदाता छनोट (QCBS/FBS/LCS)</option>
                  <option value="Special Circumstances">विशेष परिस्थिति (Emergency)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  आर्थिक वर्ष (Fiscal Year):
                </label>
                <select
                  value={fiscalYearId}
                  onChange={(e) => setFiscalYearId(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                >
                  {fiscalYears.map((fy) => (
                    <option key={fy.id} value={fy.id}>
                      {fy.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Group 2: Budget & Contract Details */}
          <div className="bg-slate-50/70 p-3.5 rounded border border-slate-200 space-y-3">
            <h4 className="font-bold text-[#0f2c4d] text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>२. बजेट, ठेक्का तथा सम्झौता विवरण</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  स्वीकृत लागत अनुमान (रु.)*:
                </label>
                <input
                  type="number"
                  required
                  placeholder="उदा: 25000000"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  सम्झौता रकम (भ्याटसहित रु.)*:
                </label>
                <input
                  type="number"
                  required
                  placeholder="उदा: 21500000"
                  value={contractAmount}
                  onChange={(e) => setContractAmount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  निर्माण व्यवसायी / फर्मको नाम:
                </label>
                <input
                  type="text"
                  placeholder="उदा: हिमाल कन्स्ट्रक्सन प्रा.लि."
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  सम्झौता मिति (वि.सं.):
                </label>
                <input
                  type="text"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  सम्पन्न गर्नुपर्ने म्याद (वि.सं.):
                </label>
                <input
                  type="text"
                  value={contractCompletionDate}
                  onChange={(e) => setContractCompletionDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  बजेट तथा कोषको स्रोत:
                </label>
                <input
                  type="text"
                  value={budgetSource}
                  onChange={(e) => setBudgetSource(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Inspection Team */}
          <div className="bg-slate-50/70 p-3.5 rounded border border-slate-200 space-y-3">
            <h4 className="font-bold text-[#0f2c4d] text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>३. प्राविधिक निरीक्षण टोली (NVC Technical Inspection Team)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  प्रमुख प्राविधिक निरीक्षक:
                </label>
                <input
                  type="text"
                  value={leadInspector}
                  onChange={(e) => setLeadInspector(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  निरीक्षण टोलीका सदस्यहरू:
                </label>
                <input
                  type="text"
                  value={inspectionTeam}
                  onChange={(e) => setInspectionTeam(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#0f2c4d] hover:bg-[#153e6c] text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'दर्ता हुँदैछ...' : 'खरिद आयोजना दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
