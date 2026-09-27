import React, { useState, useEffect } from 'react';
import { EvidenceFile } from '../../types';
import { api } from '../../services/api';
import { formatNepaliNumber } from '../../utils/numberFormat';
import { useToast } from '../Toast';
import {
  Upload,
  X,
  FileText,
  Trash2,
  ExternalLink,
  Paperclip,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: number;
  checklistItemId?: number;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  inspectionId,
  checklistItemId,
}) => {
  const { showToast } = useToast();
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Upload Form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docNumber, setDocNumber] = useState('');
  const [docDate, setDocDate] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [description, setDescription] = useState('');

  // Inline delete confirm state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && inspectionId) {
      loadFiles();
    }
  }, [isOpen, inspectionId, checklistItemId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getEvidenceFiles(inspectionId, checklistItemId);
      setFiles(res);
    } catch (err: any) {
      console.error(err);
      setError('फाइलहरूको सूची लोड गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('कृपया कुनै फाइल छनोट गर्नुहोस्।');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('inspection_id', String(inspectionId));
      if (checklistItemId) formData.append('checklist_item_id', String(checklistItemId));
      formData.append('document_number', docNumber);
      formData.append('document_date', docDate);
      formData.append('page_number', pageNumber);
      formData.append('description', description);

      await api.uploadEvidence(formData);
      setSelectedFile(null);
      setDocNumber('');
      setDocDate('');
      setPageNumber('');
      setDescription('');
      showToast('success', 'फाइल अपलोड भयो', 'कागजात प्रमाण सफलतापूर्वक सुरक्षित गरियो।');
      loadFiles();
    } catch (err: any) {
      setError(err.message || 'फाइल अपलोड गर्न सकिएन।');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.deleteEvidence(deleteId);
      setFiles((prev) => prev.filter((f) => f.id !== deleteId));
      showToast('success', 'फाइल हटाइयो', 'अभिलेखबाट प्रमाण हटाइएको छ।');
      setDeleteId(null);
    } catch (err: any) {
      console.error(err);
      showToast('error', 'हटाउन सकिएन', err?.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden border border-slate-200 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-[#0f2c4d]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                कागजात तथा प्रमाण अभिलेख (Evidence & Attachments)
              </h3>
              <p className="text-[11px] text-slate-500">
                निरीक्षण प्रमाण, सम्झौता पत्र, बिल वा टिप्पणीको अभिलेख
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center font-bold transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 text-red-800 border border-red-200 rounded font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Form Box */}
          <form
            onSubmit={handleUpload}
            className="p-3.5 bg-slate-50 rounded border border-slate-200/90 space-y-2.5"
          >
            <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#0f2c4d]" />
              <span>नयाँ कागजात वा प्रमाण अपलोड गर्नुहोस्</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-0.5">
                  फाइल चयन गर्नुहोस्*:
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0f2c4d] file:text-white hover:file:bg-[#153e6c] file:cursor-pointer cursor-pointer border border-slate-300 rounded bg-white p-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-0.5">
                  कागजात नम्बर / दर्ता नं.:
                </label>
                <input
                  type="text"
                  placeholder="उदा: चलानी नं. वा रसिद नं."
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#0f2c4d] bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-0.5">
                  कागजातको मिति (वि.सं.):
                </label>
                <input
                  type="text"
                  placeholder="२०८१-०४-१५"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#0f2c4d] bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-0.5">
                  सम्बन्धित पाना नं.:
                </label>
                <input
                  type="text"
                  placeholder="पाना नं. वा फाइल फोल्डर"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#0f2c4d] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-0.5">
                छोटो कैफियत वा विवरण:
              </label>
              <input
                type="text"
                placeholder="यस फाइलले प्रमाणित गर्ने विषय..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#0f2c4d] bg-white"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0f2c4d] hover:bg-[#153e6c] text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'अपलोड हुँदैछ...' : 'अपलोड गर्नुहोस्'}</span>
              </button>
            </div>
          </form>

          {/* Uploaded Files Table */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>अपलोड भएका प्रमाण कागजातहरू</span>
              <span className="text-[11px] font-normal text-slate-500">
                कुल: {formatNepaliNumber(files.length)} फाइलहरू
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500">
                <div className="animate-spin inline-block w-5 h-5 border-2 border-[#0f2c4d] border-t-transparent rounded-full" />
                <div className="mt-1 text-xs">फाइलहरू खोजिँदैछ...</div>
              </div>
            ) : files.length === 0 ? (
              <div className="py-8 text-center text-slate-500 border border-dashed border-slate-300 rounded">
                यस निरीक्षणमा हालसम्म कुनै फाइल अपलोड गरिएको छैन।
              </div>
            ) : (
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2">फाइल नाम</th>
                      <th className="p-2">कागजात विवरण</th>
                      <th className="p-2">दर्ता मिति/पाना</th>
                      <th className="p-2 text-right">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/70">
                        <td className="p-2 font-medium text-slate-900 max-w-[180px] truncate">
                          <div className="flex items-center space-x-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{file.file_name}</span>
                          </div>
                        </td>
                        <td className="p-2 text-slate-600 max-w-[200px] truncate">
                          {file.description || '-'}
                        </td>
                        <td className="p-2 text-slate-500 text-[11px]">
                          {file.document_date || '-'}{' '}
                          {file.page_number ? `(पाना: ${file.page_number})` : ''}
                        </td>
                        <td className="p-2 text-right space-x-2 whitespace-nowrap">
                          {file.file_path && (
                            <a
                              href={file.file_path}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0f2c4d] hover:underline font-semibold"
                            >
                              हेर्नुहोस्
                            </a>
                          )}
                          <button
                            onClick={() => setDeleteId(file.id)}
                            className="text-red-700 hover:text-red-900 font-medium cursor-pointer"
                          >
                            हटाउनुहोस्
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium cursor-pointer"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-xs w-full p-4 shadow-xl border border-slate-200 text-xs space-y-3">
            <div className="font-bold text-red-700 text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>फाइल हटाउने पुष्टि</span>
            </div>
            <p className="text-slate-600">
              के तपाईं यो कागजात फाइल हटाउन चाहनुहुन्छ?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="px-3 py-1 text-slate-600 hover:text-slate-800 border border-slate-200 rounded cursor-pointer"
              >
                रद्द
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white font-semibold rounded cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'हटाउँदैछ...' : 'हटाउनुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
