import React, { useState } from 'react';
import {
  Search,
  Star,
  MapPin,
  Calendar,
  Video,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Languages,
  ArrowRight,
  Stethoscope,
  Sparkles,
  Info,
  X,
  CreditCard,
  Award,
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorsDirectoryViewProps {
  doctors: Doctor[];
  onSelectDoctorForBooking?: (doctorName: string, specialty: string) => void;
  onBookDoctor?: (doc: Doctor) => void;
  onAskAboutDoctor?: (doctorName: string) => void;
}

const SPECIALTIES = [
  'All Specialties',
  'General Physician',
  'Dermatology',
  'Pediatrics',
  'Cardiology',
  'Orthopedics',
];

export const DoctorsDirectoryView: React.FC<DoctorsDirectoryViewProps> = ({
  doctors,
  onSelectDoctorForBooking,
  onBookDoctor,
  onAskAboutDoctor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedMode, setSelectedMode] = useState<'All' | 'In-Clinic' | 'Video'>('All');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  
  // Doctor details modal
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);

  const handleBook = (doc: Doctor) => {
    if (onSelectDoctorForBooking) {
      onSelectDoctorForBooking(doc.name, doc.specialty);
    } else if (onBookDoctor) {
      onBookDoctor(doc);
    }
  };

  const handleAskAI = (docName: string) => {
    if (onAskAboutDoctor) {
      onAskAboutDoctor(docName);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.about.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All Specialties' || doc.specialty.includes(selectedSpecialty);

    const matchesMode =
      selectedMode === 'All' ||
      (selectedMode === 'In-Clinic' && doc.consultationType.includes('In-Clinic')) ||
      (selectedMode === 'Video' && doc.consultationType.includes('Video'));

    const matchesToday = !onlyAvailableToday || doc.nextSlot.toLowerCase().includes('today');

    return matchesSearch && matchesSpecialty && matchesMode && matchesToday;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>100% Medical Council Verified Clinicians</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
            Find & Consult Top Doctors
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Browse qualified specialists across leading clinics, view real patient reviews, verified qualifications, and book same-day slots.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center min-w-[100px]">
            <span className="block text-2xl font-display font-bold text-slate-900 dark:text-slate-100">{doctors.length}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Doctors</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center min-w-[100px]">
            <span className="block text-2xl font-display font-bold text-teal-600 dark:text-teal-400">4.8★</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg. Rating</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, specialty, clinic, or health condition (e.g. fever, acne, hypertension)..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Specialty Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Mode & Availability Toggles */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 text-xs">
              {(['All', 'In-Clinic', 'Video'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    selectedMode === mode
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode === 'All' ? 'All Modes' : mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => setOnlyAvailableToday(!onlyAvailableToday)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                onlyAvailableToday
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Today Only
            </button>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.name}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            {/* Top row: Avatar, Name, Specialization */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                    {doc.avatarText}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">{doc.name}</h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Verified clinician" />
                    </div>
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{doc.qualification}</p>
                  </div>
                </div>

                {/* Rating badge */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{doc.rating}</span>
                  <span className="text-amber-700/70 dark:text-amber-400/70 font-normal text-[11px]">({doc.reviews})</span>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3.5 line-clamp-2 leading-relaxed">
                {doc.about}
              </p>

              {/* Metadata details */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{doc.clinic}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">{doc.location}</span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">{doc.years} yrs</strong> clinical practice
                  </span>
                  <span className="flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-slate-400" />
                    {doc.languages.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom row: Fee, next slot, and booking CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                  Next Available Slot
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {doc.nextSlot}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="text-right mr-1">
                  <span className="text-base font-display font-bold text-slate-900 dark:text-slate-100">{doc.fee}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block -mt-1">per visit</span>
                </div>

                <button
                  onClick={() => setSelectedDoctorModal(doc)}
                  title="View full doctor profile"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  Profile
                </button>

                <button
                  onClick={() => handleAskAI(doc.name)}
                  title="Ask AI about this doctor"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </button>

                <button
                  onClick={() => handleBook(doc)}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <span>Book Visit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDoctors.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <Stethoscope className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-base">No physicians found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We couldn't find any physicians matching "{searchQuery}". Try broadening your specialty filter or clearing your search term.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('All Specialties');
                setSelectedMode('All');
                setOnlyAvailableToday(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Doctor Detailed Profile Modal */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-2xs shrink-0">
                  {selectedDoctorModal.avatarText}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">{selectedDoctorModal.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5">{selectedDoctorModal.specialty}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedDoctorModal.qualification}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {selectedDoctorModal.rating} ({selectedDoctorModal.reviews} patient reviews)
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {selectedDoctorModal.years} yrs experience
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoctorModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">About Doctor</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedDoctorModal.about}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{selectedDoctorModal.clinic}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">{selectedDoctorModal.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <Languages className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">Languages: {selectedDoctorModal.languages.join(', ')}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Accepted Health Insurance / TPA</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['Star Health', 'Care Health', 'HDFC ERGO', 'Max Bupa', 'ICICI Lombard Cashless'].map((ins) => (
                    <span key={ins} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-slate-200/50 dark:border-slate-700">
                      {ins}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-800 dark:text-teal-300 tracking-wider block">Next Available Slot</span>
                  <span className="font-bold text-teal-900 dark:text-teal-200 text-xs">{selectedDoctorModal.nextSlot}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">{selectedDoctorModal.fee}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block -mt-1">Consultation fee</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const doc = selectedDoctorModal;
                  setSelectedDoctorModal(null);
                  handleAskAI(doc.name);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Ask AI Assistant</span>
              </button>

              <button
                onClick={() => {
                  const doc = selectedDoctorModal;
                  setSelectedDoctorModal(null);
                  handleBook(doc);
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
