import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { TabType, Doctor, Appointment, HealthRecord } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
  onSelectPrompt: (prompt: string) => void;
  onSelectDoctor?: (doc: Doctor) => void;
  onSelectRecord?: (record: HealthRecord) => void;
  doctors?: Doctor[];
  appointments?: Appointment[];
  records?: HealthRecord[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectPrompt,
  onSelectDoctor,
  onSelectRecord,
  doctors = [],
  appointments = [],
  records = [],
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const safeDoctors = Array.isArray(doctors) ? doctors : [];
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeRecords = Array.isArray(records) ? records : [];

  const filteredDoctors = query.trim()
    ? safeDoctors.filter(
        (d) =>
          d?.name?.toLowerCase().includes(query.toLowerCase()) ||
          d?.specialty?.toLowerCase().includes(query.toLowerCase())
      )
    : safeDoctors.slice(0, 3);

  const filteredRecords = query.trim()
    ? safeRecords.filter((r) => r?.title?.toLowerCase().includes(query.toLowerCase()))
    : safeRecords.slice(0, 2);

  const filteredAppointments = query.trim()
    ? safeAppointments.filter(
        (a) =>
          a?.id?.toLowerCase().includes(query.toLowerCase()) ||
          a?.doctor?.toLowerCase().includes(query.toLowerCase())
      )
    : safeAppointments.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-950/50">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors, appointments, records, or clinical questions..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-400 dark:text-slate-400">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="p-4 overflow-y-auto max-h-96 space-y-4 text-xs">
          {/* AI Prompts */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              Ask AI Assistant
            </span>
            <div className="space-y-1">
              {[
                'What is the cancellation policy?',
                'How long does a prescription refill take?',
                'Who is eligible for telemedicine?',
              ].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onSelectPrompt(p);
                    onNavigate('AI Assistant');
                    onClose();
                  }}
                  className="w-full p-2 rounded-xl hover:bg-teal-50/60 dark:hover:bg-teal-950/40 hover:text-teal-900 dark:hover:text-teal-200 flex items-center justify-between text-left text-slate-700 dark:text-slate-300 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{p}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Doctors */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              Doctors & Specialists ({filteredDoctors.length})
            </span>
            <div className="space-y-1">
              {filteredDoctors.length === 0 ? (
                <p className="text-slate-400 italic px-2 py-1">No matching doctors found</p>
              ) : (
                filteredDoctors.map((doc) => (
                  <button
                    key={doc.name}
                    onClick={() => {
                      if (onSelectDoctor) {
                        onSelectDoctor(doc);
                      } else {
                        onNavigate('Book Appointment');
                      }
                      onClose();
                    }}
                    className="w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center justify-between text-left text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{doc.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.specialty} · {doc.clinic}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">Book slot</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Appointments */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              Appointments ({filteredAppointments.length})
            </span>
            <div className="space-y-1">
              {filteredAppointments.length === 0 ? (
                <p className="text-slate-400 italic px-2 py-1">No matching appointments found</p>
              ) : (
                filteredAppointments.map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => {
                      onNavigate('Appointments');
                      onClose();
                    }}
                    className="w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center justify-between text-left text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{apt.id} · {apt.doctor}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{apt.date} at {apt.time}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {apt.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Health Records */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              Health Documents ({filteredRecords.length})
            </span>
            <div className="space-y-1">
              {filteredRecords.length === 0 ? (
                <p className="text-slate-400 italic px-2 py-1">No matching documents found</p>
              ) : (
                filteredRecords.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => {
                      if (onSelectRecord) {
                        onSelectRecord(rec);
                      } else {
                        onNavigate('Health Records');
                      }
                      onClose();
                    }}
                    className="w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center justify-between text-left text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{rec.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{rec.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{rec.size}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
