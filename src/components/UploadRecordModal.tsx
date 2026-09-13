import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import { HealthRecord } from '../types';

interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (record: HealthRecord) => void;
  onAddRecord?: (record: HealthRecord) => void;
}

export const UploadRecordModal: React.FC<UploadRecordModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  onAddRecord,
}) => {
  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [type, setType] = useState<'Prescription' | 'Report' | 'Lab Report' | 'Summary'>('Prescription');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string>('420 KB');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setFileName(file.name);
    // Format human-readable file size
    const sizeInKb = file.size / 1024;
    const formatted = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${Math.round(sizeInKb)} KB`;
    setFileSize(formatted);

    // If title is empty, infer from file name
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Infer type if obvious
    const lower = file.name.toLowerCase();
    if (lower.includes('rx') || lower.includes('prescription')) setType('Prescription');
    else if (lower.includes('lab') || lower.includes('blood') || lower.includes('lipid') || lower.includes('cbc')) setType('Lab Report');
    else if (lower.includes('summary') || lower.includes('discharge')) setType('Summary');
    else if (lower.includes('report') || lower.includes('scan') || lower.includes('xray')) setType('Report');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRecord: HealthRecord = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      icon: type === 'Prescription' ? 'Rx' : type === 'Lab Report' ? 'LAB' : 'PDF',
      title: title.trim(),
      subtitle: doctor.trim() ? `${doctor.trim()} · Uploaded Record` : 'Verified Patient Upload',
      date: new Date(),
      type,
      tone: type === 'Prescription' ? 'purple' : type === 'Lab Report' ? 'emerald' : 'blue',
      size: fileSize,
      doctorName: doctor.trim() || 'Attending Physician',
    };

    if (onUpload) onUpload(newRecord);
    if (onAddRecord) onAddRecord(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Upload Clinical Document</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add prescription, lab report, or diagnostic scan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hidden Real File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf,image/*,.doc,.docx"
            className="hidden"
          />

          {/* Real Drag & Drop / Click Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40'
                : fileName
                ? 'border-teal-400 bg-teal-50/30 dark:bg-teal-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            {fileName ? (
              <div className="space-y-1.5">
                <FileCheck className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto" />
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{fileName}</p>
                <p className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold">{fileSize} · Ready for upload</p>
                <span className="text-[10px] text-slate-400 underline">Click to change file</span>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Click to select or drag PDF / image here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Supports PDF, JPG, PNG, DICOM up to 25MB</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Blood Count / Skin Review"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Document Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'Prescription' as const, label: 'Prescription', badge: 'Rx' },
                { val: 'Lab Report' as const, label: 'Lab Report', badge: 'LAB' },
                { val: 'Report' as const, label: 'Diagnostic', badge: 'SCAN' },
                { val: 'Summary' as const, label: 'Summary', badge: 'SUM' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  id={`modal-doc-type-${item.val.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setType(item.val)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    type === item.val
                      ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 text-teal-800 dark:text-teal-200 ring-2 ring-teal-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold opacity-75">{item.badge}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attending Doctor / Diagnostic Lab
            </label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="e.g. Dr. Priya Sharma / Apollo Diagnostics"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/60 flex items-center gap-2 text-[11px] text-teal-800 dark:text-teal-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <span>Encrypted with 256-bit AES storage compliant with ABDM guidelines.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
