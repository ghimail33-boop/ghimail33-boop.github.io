import React, { useState, useEffect } from 'react';
import { Procurement, ChecklistItem } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../Toast';
import { AlertTriangle, X, Check, ShieldAlert, Coins, Scale, Building, AlertCircle } from 'lucide-react';
import { NepaliDatePicker } from '../NepaliDatePicker';

interface FindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preloadData?: {
    inspection_id?: number;
    procurement_id?: number;
    checklist_item_id?: number;
    title?: string;
    description?: string;
    legal_reference?: string;
    possible_irregularity?: string;
    risk_level?: string;
    estimated_financial_impact?: number;
  } | null;
}

export const FindingModal: React.FC<FindingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preloadData,
}) => {
  const { showToast } = useToast();
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // Form states
  const [procurementId, setProcurementId] = useState<number | ''>('');
  const [checklistItemId, setChecklistItemId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [legalReference, setLegalReference] = useState('');
  const [possibleIrregularity, setPossibleIrregularity] = useState('');
  const [riskLevel, setRiskLevel] = useState<'न्यून' | 'मध्यम' | 'उच्च' | 'अत्यन्त उच्च'>('उच्च');
  const [estimatedImpact, setEstimatedImpact] = useState('');
  const [responsibleOffice, setResponsibleOffice] = useState('');
  const [responsibleOfficer, setResponsibleOfficer] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [deadline, setDeadline] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (preloadData) {
        if (preloadData.procurement_id) setProcurementId(preloadData.procurement_id);
        if (preloadData.checklist_item_id) setChecklistItemId(preloadData.checklist_item_id);
        if (preloadData.title) setTitle(preloadData.title);
        if (preloadData.description) setDescription(preloadData.description);
        if (preloadData.legal_reference) setLegalReference(preloadData.legal_reference);
        if (preloadData.possible_irregularity) setPossibleIrregularity(preloadData.possible_irregularity);
        if (preloadData.risk_level) setRiskLevel(preloadData.risk_level as any);
        if (preloadData.estimated_financial_impact) setEstimatedImpact(String(preloadData.estimated_financial_impact));
        // default deadline 15 days ahead
        const d = new Date();
        d.setDate(d.getDate() + 15);
        const localAdDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        setDeadline(window.NepaliCalendar?.convertADtoBS(localAdDate) || '2081-12-30');
      }
    }
  }, [isOpen, preloadData]);

  const loadDropdowns = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.getProcurements(),
        api.getMasterChecklists(),
      ]);
      setProcurements(pRes);
      setChecklistItems(cRes);
      if (!preloadData?.procurement_id && pRes.length > 0) {
        setProcurementId(pRes[0].id);
        setResponsibleOffice(pRes[0].office_name || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcurementChange = (pId: number) => {
    setProcurementId(pId);
    const p = procurements.find((x) => x.id === pId);
    if (p) setResponsibleOffice(p.office_name || '');
  };

  const handleChecklistChange = (cId: number) => {
    setChecklistItemId(cId);
    const c = checklistItems.find((x) => x.id === cId);
    if (c) {
      if (!legalReference) setLegalReference(c.legal_reference);
      if (!possibleIrregularity) setPossibleIrregularity(c.possible_irregularity || '');
      if (!title) setTitle(`${c.inspection_area} सम्बन्धी प्रक्रियागत कैफियत`);
      if (c.default_risk_level) setRiskLevel(c.default_risk_level as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procurementId || !title || !description) {
      setError('कृपया खरिद आयोजना, कैफियत शीर्षक र विवरण अनिवार्य भर्नुहोस्।');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await api.createFinding({
        inspection_id: preloadData?.inspection_id,
        procurement_id: Number(procurementId),
        checklist_item_id: checklistItemId ? Number(checklistItemId) : undefined,
        title,
        description,
        legal_reference: legalReference,
        risk_level: riskLevel,
        estimated_financial_impact: parseFloat(estimatedImpact) || 0,
        responsible_office: responsibleOffice,
        responsible_officer: responsibleOfficer,
        recommended_corrective_action: recommendedAction,
        deadline: deadline,
        deadline_bs: deadline,
      });

      showToast('success', 'कैफियत दर्ता सफल', 'खरिद कैफियत केन्द्रीय अभिलेखमा सुरक्षित भयो।');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'कैफियत दर्ता गर्न सकिएन।');
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
            <AlertTriangle className="w-4 h-4 text-[#991b1b]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                खरिद प्रक्रियागत कैफियत प्रविष्टि (Record Procurement Finding)
              </h3>
              <p className="text-[11px] text-slate-500">
                निरीक्षणका क्रममा पहिचान गरिएको कानूनी विचलन, वित्तीय जोखिम तथा सुधार कार्य
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

          {/* Group 1: Procurement & Checklist Mapping */}
          <div className="bg-slate-50/70 p-3.5 rounded border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  सम्बन्धित खरिद आयोजना (Procurement)*:
                </label>
                <select
                  required
                  value={procurementId}
                  onChange={(e) => handleProcurementChange(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                >
                  <option value="">-- खरिद आयोजना छान्नुहोस् --</option>
                  {procurements.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.procurement_id_code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  सम्बन्धित चेकलिस्ट बुँदा (Checklist Item):
                </label>
                <select
                  value={checklistItemId}
                  onChange={(e) => handleChecklistChange(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                >
                  <option value="">-- आवश्यक परे चेकलिस्ट बुँदा छान्नुहोस् --</option>
                  {checklistItems.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.checklist_code}: {c.inspection_area} ({c.stage_title_ne || `चरण ${c.stage_number}`})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Group 2: Finding Details */}
          <div className="bg-slate-50/70 p-3.5 rounded border border-slate-200 space-y-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                कैफियतको शीर्षक (Finding Subject)*:
              </label>
              <input
                type="text"
                required
                placeholder="उदा: स्वीकृत खरिद गुरुयोजना विपरीत टुक्रा-टुक्रा पारी सोझै खरिद गरिएको"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                कैफियतको विस्तृत विवरण (Detailed Observations)*:
              </label>
              <textarea
                required
                rows={3}
                placeholder="निरीक्षणका क्रममा फेला परेका प्रमाण, तथ्य र प्रक्रियागत त्रुटिको स्पष्ट विवरण..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  उल्लङ्घन भएको कानूनी व्यवस्था:
                </label>
                <input
                  type="text"
                  placeholder="सार्वजनिक खरिद ऐन, दफा ८(२)"
                  value={legalReference}
                  onChange={(e) => setLegalReference(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  जोखिम स्तर (Risk Level)*:
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs font-semibold"
                >
                  <option value="अत्यन्त उच्च">अत्यन्त उच्च (Critical)</option>
                  <option value="उच्च">उच्च जोखिम (High)</option>
                  <option value="मध्यम">मध्यम जोखिम (Medium)</option>
                  <option value="न्यून">न्यून जोखिम (Low)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  सम्भावित आर्थिक प्रभाव (रु.):
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={estimatedImpact}
                  onChange={(e) => setEstimatedImpact(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Corrective Actions */}
          <div className="bg-slate-50/70 p-3.5 rounded border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  जिम्मेवार निकाय / कार्यालय:
                </label>
                <input
                  type="text"
                  placeholder="सम्बन्धित सार्वजनिक निकाय"
                  value={responsibleOffice}
                  onChange={(e) => setResponsibleOffice(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  जिम्मेवार पदाधिकारी वा पद:
                </label>
                <input
                  type="text"
                  placeholder="कार्यालय प्रमुख / लेखा प्रमुख / खरिद शाखा"
                  value={responsibleOfficer}
                  onChange={(e) => setResponsibleOfficer(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  सुझाव गरिएको सुधारात्मक कारबाही (Recommended Action):
                </label>
                <input
                  type="text"
                  placeholder="अनियमित भुक्तानी असुलउपर गर्ने वा खरिद सम्झौता संशोधन गर्ने..."
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  सुधार कार्य सम्पन्न गर्ने म्याद (वि.सं.):
                </label>
                <input
                  type="text"
                  placeholder="२०८१-१२-३०"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c4d] bg-white text-xs font-mono"
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
              className="px-4 py-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'दर्ता हुँदैछ...' : 'कैफियत अभिलेख गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
