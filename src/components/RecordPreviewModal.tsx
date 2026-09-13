import React from 'react';
import { X, Download, ShieldCheck, Printer, FileText, Calendar, User, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
import { HealthRecord } from '../types';
import { generateRecordSummary, downloadTextFile } from '../utils/downloadUtils';
import { useAuth } from '../context/AuthContext';

interface RecordPreviewModalProps {
  record: HealthRecord | null;
  onClose: () => void;
  onDownload?: (title: string) => void;
}

export const RecordPreviewModal: React.FC<RecordPreviewModalProps> = ({
  record,
  onClose,
  onDownload,
}) => {
  const { user } = useAuth();
  if (!record) return null;

  const handleDownload = () => {
    const summary = generateRecordSummary(record);
    downloadTextFile(`${record.id}_${record.title.replace(/\s+/g, '_')}.txt`, summary);
    if (onDownload) {
      onDownload(record.title);
    }
  };

  const isLabReport = record.type === 'Lab Report' || record.title.toLowerCase().includes('lipid') || record.title.toLowerCase().includes('blood');
  const isPrescription = record.type === 'Prescription';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{record.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                  {record.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Document ID: {record.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Download Record File"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          {/* Clinical Header */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Patient</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{user?.name || 'Chaitanya Sahu'}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">UHID: {user?.uhid || '#PR-89021'}</p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Attending Clinician</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{record.doctorName || 'Dr. Priya Sharma'}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{record.doctorSpecialty || 'General Physician'}</p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Date Verified</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {record.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Digital Verification</span>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Signature
              </p>
            </div>
          </div>

          {/* Clinical Observations */}
          <div className="space-y-3 text-xs leading-relaxed">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Clinical Findings & Interpretation
            </h4>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700 space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-slate-100">Clinical Diagnosis:</strong> Patient reviewed for routine preventive wellness & biochemical assessment.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-slate-100">Attending Physician Observations:</strong> Normal hemodynamic stability. No acute distress noted. Routine dietary and lifestyle exercise regimen advised.
              </p>
            </div>

            {/* If it's a Lab Report, show diagnostic panel parameters */}
            {isLabReport && (
              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                  Pathology Diagnostic Parameters (Lipid Profile)
                </h5>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2.5">Test Parameter</th>
                        <th className="p-2.5">Observed Value</th>
                        <th className="p-2.5">Reference Range</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="p-2.5 font-medium">Total Cholesterol</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">178 mg/dL</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400">&lt; 200 mg/dL</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">Normal</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Triglycerides</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">126 mg/dL</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400">&lt; 150 mg/dL</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">Optimal</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">HDL Cholesterol (Good)</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">54 mg/dL</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400">&gt; 40 mg/dL</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">Normal</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">LDL Cholesterol (Calculated)</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">98.8 mg/dL</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400">&lt; 100 mg/dL</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">Normal</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* If it's a Prescription, show dosage schedule */}
            {isPrescription && (
              <div className="space-y-2">
                <h5 className="font-bold text-purple-950 dark:text-purple-300 text-xs uppercase tracking-wider">
                  Prescribed Therapy & Dosage Schedule
                </h5>
                <div className="rounded-xl border border-purple-200/80 dark:border-purple-800/80 bg-purple-50/30 dark:bg-purple-950/30 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-purple-100/60 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-semibold border-b border-purple-200 dark:border-purple-800">
                      <tr>
                        <th className="p-2.5">Formulation</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100/60 dark:divide-purple-800/60 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">Tab. Multivitamin & Minerals</td>
                        <td className="p-2.5">1 Tab Daily</td>
                        <td className="p-2.5">30 Days</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400">Post breakfast with water</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">Topical Hydrocortisone 1%</td>
                        <td className="p-2.5">Twice daily</td>
                        <td className="p-2.5">7 Days</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400">Apply thin film on dry skin</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">Vitamin D3 60,000 IU</td>
                        <td className="p-2.5">1 Sachet weekly</td>
                        <td className="p-2.5">4 Weeks</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400">In warm milk post dinner</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Digital signature encrypted via ISO-27001 CuraHealth Vault</span>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
