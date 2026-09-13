import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Eye,
  UploadCloud,
  ShieldCheck,
  Search,
  CheckCircle2,
  FileCheck,
  X,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HealthRecord } from '../types';

interface HealthRecordsViewProps {
  records: HealthRecord[];
  onOpenPreview: (record: HealthRecord) => void;
  onOpenUpload?: () => void;
  onOpenUploadModal?: () => void;
  onAddRecord?: (record: HealthRecord) => void;
  onDownload: (title: string) => void;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  records,
  onOpenPreview,
  onOpenUpload,
  onOpenUploadModal,
  onAddRecord,
  onDownload,
}) => {
  const [filter, setFilter] = useState<'All' | 'Prescription' | 'Lab Report' | 'Report' | 'Summary'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inline upload toggle state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineDoctor, setInlineDoctor] = useState('');
  const [inlineType, setInlineType] = useState<'Prescription' | 'Report' | 'Lab Report' | 'Summary'>('Prescription');
  const [inlineFileName, setInlineFileName] = useState<string | null>(null);
  const [inlineFileSize, setInlineFileSize] = useState<string>('420 KB');
  const [isInlineDragging, setIsInlineDragging] = useState(false);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  const handleInlineFile = (file: File) => {
    setInlineFileName(file.name);
    const sizeInKb = file.size / 1024;
    const formatted = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${Math.round(sizeInKb)} KB`;
    setInlineFileSize(formatted);

    if (!inlineTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setInlineTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const lower = file.name.toLowerCase();
    if (lower.includes('rx') || lower.includes('prescription')) setInlineType('Prescription');
    else if (lower.includes('lab') || lower.includes('blood') || lower.includes('lipid') || lower.includes('cbc')) setInlineType('Lab Report');
    else if (lower.includes('summary') || lower.includes('discharge')) setInlineType('Summary');
    else if (lower.includes('report') || lower.includes('scan') || lower.includes('xray')) setInlineType('Report');
  };

  const handleInlineDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsInlineDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleInlineFile(e.dataTransfer.files[0]);
    }
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    const newRecord: HealthRecord = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      icon: inlineType === 'Prescription' ? 'Rx' : inlineType === 'Lab Report' ? 'LAB' : 'PDF',
      title: inlineTitle.trim(),
      subtitle: inlineDoctor.trim() ? `${inlineDoctor.trim()} · Uploaded Record` : 'Verified Patient Upload',
      date: new Date(),
      type: inlineType,
      tone: inlineType === 'Prescription' ? 'purple' : inlineType === 'Lab Report' ? 'emerald' : 'blue',
      size: inlineFileSize,
      doctorName: inlineDoctor.trim() || 'Attending Physician',
    };

    if (onAddRecord) {
      onAddRecord(newRecord);
    }

    // Reset & close inline form
    setInlineTitle('');
    setInlineDoctor('');
    setInlineFileName(null);
    setIsUploadOpen(false);
  };

  const handleToggleUpload = () => {
    setIsUploadOpen((prev) => !prev);
  };

  const handleLaunchModal = () => {
    if (onOpenUpload) {
      onOpenUpload();
    } else if (onOpenUploadModal) {
      onOpenUploadModal();
    }
  };

  const filteredRecords = records.filter((rec) => {
    const matchesFilter = filter === 'All' ? true : rec.type === filter;
    const matchesSearch =
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const prescriptionCount = records.filter((r) => r.type === 'Prescription').length;
  const labCount = records.filter((r) => r.type === 'Lab Report').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            DIGITAL HEALTH VAULT
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
            Medical Records & Prescriptions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Encrypted repository of digital prescriptions, diagnostic lab panels, and physician summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Primary Upload Record Toggle Button */}
          <button
            id="upload-record-toggle-btn"
            type="button"
            onClick={handleToggleUpload}
            aria-expanded={isUploadOpen}
            aria-controls="inline-upload-section"
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
              isUploadOpen
                ? 'bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 ring-2 ring-teal-500/40'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            {isUploadOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>Close Upload Form</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Record</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </>
            )}
          </button>

          {/* Modal Popout Option Button */}
          <button
            type="button"
            id="upload-record-modal-toggle-btn"
            onClick={handleLaunchModal}
            title="Open Uploader in Modal Window"
            aria-label="Open uploader modal"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Inline Upload Section */}
      {isUploadOpen && (
        <div
          id="inline-upload-section"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-teal-500/40 dark:border-teal-500/30 shadow-lg animate-in fade-in slide-in-from-top-3 duration-200 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Quick Upload Document
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add a prescription, lab report, or clinical summary to your vault
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUploadOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleInlineSubmit} className="space-y-4">
            {/* Hidden Real File Input */}
            <input
              type="file"
              ref={inlineFileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleInlineFile(e.target.files[0]);
                }
              }}
              accept=".pdf,image/*,.doc,.docx"
              className="hidden"
            />

            {/* Drag & Drop Box */}
            <div
              onClick={() => inlineFileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsInlineDragging(true);
              }}
              onDragLeave={() => setIsInlineDragging(false)}
              onDrop={handleInlineDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isInlineDragging
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40'
                  : inlineFileName
                  ? 'border-teal-400 bg-teal-50/30 dark:bg-teal-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              {inlineFileName ? (
                <div className="space-y-1.5">
                  <FileCheck className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{inlineFileName}</p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold">
                    {inlineFileSize} · Ready to attach
                  </p>
                  <span className="text-[10px] text-slate-400 underline">Click to choose a different file</span>
                </div>
              ) : (
                <div>
                  <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Click to browse or drop medical PDF / image here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Supports PDF, JPG, PNG, DICOM up to 25MB</p>
                </div>
              )}
            </div>

            {/* Category Toggle Buttons */}
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
                    id={`inline-doc-type-${item.val.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setInlineType(item.val)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      inlineType === item.val
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

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={inlineTitle}
                  onChange={(e) => setInlineTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count / Skin Review"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attending Doctor / Lab
                </label>
                <input
                  type="text"
                  value={inlineDoctor}
                  onChange={(e) => setInlineDoctor(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma / Apollo Lab"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleLaunchModal}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Open in full modal dialog</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inlineTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  Save to Health Vault
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Documents
            </span>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
              {String(records.length).padStart(2, '0')}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400">Securely archived</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Prescriptions
            </span>
            <p className="text-2xl font-display font-bold text-purple-700 dark:text-purple-400 mt-1">
              {String(prescriptionCount).padStart(2, '0')}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400">Physician verified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Diagnostic Lab Panels
            </span>
            <p className="text-2xl font-display font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              {String(labCount).padStart(2, '0')}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400">Pathology reports</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['All', 'Prescription', 'Lab Report', 'Report'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                filter === tab
                  ? 'bg-slate-900 dark:bg-teal-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {tab === 'All' ? 'All Documents' : tab + 's'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records or doctor..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">No records found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Try changing your search query or filter</p>
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                {/* Format badge */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-xs shrink-0 ${
                    rec.icon === 'Rx'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      : rec.icon === 'LAB'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {rec.icon}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{rec.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.type === 'Prescription'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : rec.type === 'Lab Report'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {rec.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{rec.subtitle}</p>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <span>
                      {rec.date instanceof Date
                        ? rec.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>·</span>
                    <span>{rec.size}</span>
                    <span>·</span>
                    <span>ID: {rec.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onOpenPreview(rec)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => onDownload(rec.title)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Privacy Guarantee Card */}
      <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-xs text-teal-900 dark:text-teal-200">Clinical Data Privacy & Encryption</h4>
          <p className="text-xs text-teal-800/80 dark:text-teal-300/80 mt-0.5 leading-relaxed">
            All medical records and consultation summaries are encrypted at rest with AES-256 and
            authenticated through patient biometric tokenization in compliance with HIPAA, ABDM, and ISO-27001 standards.
          </p>
        </div>
      </div>
    </div>
  );
};

