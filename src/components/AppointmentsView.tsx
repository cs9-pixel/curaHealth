import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  ShieldCheck,
  CalendarPlus,
  RefreshCw,
  XCircle,
  Download,
  CalendarDays,
  FileText,
  Video,
  Building2,
  Sparkles,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { Appointment, TabType } from '../types';
import { generateAppointmentSlip, generateICSFile, downloadTextFile } from '../utils/downloadUtils';
import { useAuth } from '../context/AuthContext';

interface AppointmentsViewProps {
  appointments: Appointment[];
  appointmentId: string;
  appointmentLoading: boolean;
  appointmentResult: string;
  appointmentOffline: boolean;
  onSetAppointmentId: (id: string) => void;
  onCheckAppointment: (customId?: string) => void;
  onNavigate: (tab: TabType) => void;
  onCancelAppointment: (id: string) => void;
  onRescheduleAppointment?: (id: string, newDate: string, newTime: string) => void;
  onUpdateAppointmentStatus?: (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => void;
}

const RESCHEDULE_DATES = [
  '20 Sep 2026',
  '21 Sep 2026',
  '22 Sep 2026',
  '23 Sep 2026',
  '24 Sep 2026',
  '25 Sep 2026',
];

const RESCHEDULE_SLOTS = [
  '09:30 AM',
  '11:00 AM',
  '02:30 PM',
  '04:00 PM',
  '06:00 PM',
];

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  appointmentId,
  appointmentLoading,
  appointmentResult,
  appointmentOffline,
  onSetAppointmentId,
  onCheckAppointment,
  onNavigate,
  onCancelAppointment,
  onRescheduleAppointment,
  onUpdateAppointmentStatus,
}) => {
  const { user } = useAuth();
  const [filterTab, setFilterTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reschedule Modal State
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [selectedNewDate, setSelectedNewDate] = useState(RESCHEDULE_DATES[0]);
  const [selectedNewSlot, setSelectedNewSlot] = useState(RESCHEDULE_SLOTS[0]);

  // Cancel Confirmation Modal State
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);

  // Selected Detail Modal
  const [detailApt, setDetailApt] = useState<Appointment | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCheckAppointment();
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    // Tab filter
    if (filterTab === 'Upcoming' && apt.status !== 'Scheduled' && apt.status !== 'Rescheduled') {
      return false;
    }
    if (filterTab === 'Completed' && apt.status !== 'Completed') {
      return false;
    }
    if (filterTab === 'Cancelled' && apt.status !== 'Cancelled') {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        apt.id.toLowerCase().includes(q) ||
        apt.doctor.toLowerCase().includes(q) ||
        apt.specialty.toLowerCase().includes(q) ||
        (apt.clinic && apt.clinic.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const handleConfirmReschedule = () => {
    if (!rescheduleApt || !onRescheduleAppointment) return;
    onRescheduleAppointment(rescheduleApt.id, selectedNewDate, selectedNewSlot);
    setRescheduleApt(null);
  };

  const handleDownloadSlip = (apt: Appointment) => {
    const slip = generateAppointmentSlip(apt);
    downloadTextFile(`Consultation_Voucher_${apt.id}.txt`, slip);
  };

  const handleDownloadICS = (apt: Appointment) => {
    const ics = generateICSFile(apt);
    downloadTextFile(`Consultation_${apt.id}.ics`, ics, 'text/calendar;charset=utf-8');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Real-time Clinic Schedule Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
            Consultations & Appointment Status
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Review confirmed visits, download printable consultation slips, reschedule anytime, or lookup reference details.
          </p>
        </div>

        <button
          onClick={() => onNavigate('Book Appointment')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs shrink-0"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book New Visit</span>
        </button>
      </div>

      {/* Appointment ID Quick Reference Lookup */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Quick Reference ID Lookup</h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Direct registry lookup for your booked slots
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={appointmentId}
              onChange={(e) => onSetAppointmentId(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Enter Reference ID (e.g. APT-043, APT-001)"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
          <button
            onClick={() => onCheckAppointment()}
            disabled={appointmentLoading || !appointmentId.trim()}
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shrink-0 shadow-2xs"
          >
            {appointmentLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching clinic registry...</span>
              </>
            ) : (
              <>
                <span>Search Reference</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick ID Chips */}
        <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-500 dark:text-slate-400">
          <span>Quick check:</span>
          {['APT-043', 'APT-001', 'APT-088'].map((id) => (
            <button
              key={id}
              onClick={() => {
                onSetAppointmentId(id);
                onCheckAppointment(id);
              }}
              className="font-mono font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
            >
              {id}
            </button>
          ))}
        </div>

        {/* Status Result Box */}
        {appointmentResult && (
          <div className="mt-4 p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Clinical Registry Confirmation
              </span>
              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                Verified Record
              </span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {appointmentResult}
            </p>
          </div>
        )}
      </div>

      {/* Main Consultations Section with Filters */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Tab Filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(
              [
                { id: 'Upcoming', label: 'Upcoming Visits' },
                { id: 'All', label: 'All Consultations' },
                { id: 'Completed', label: 'Past & Completed' },
                { id: 'Cancelled', label: 'Cancelled' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  filterTab === tab.id
                    ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box within list */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor or specialty..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((apt) => {
            const isUpcoming = apt.status === 'Scheduled' || apt.status === 'Rescheduled';
            const isCancelled = apt.status === 'Cancelled';
            const isCompleted = apt.status === 'Completed';

            return (
              <div
                key={apt.id}
                className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between space-y-4 shadow-2xs ${
                  isCancelled
                    ? 'border-slate-200 dark:border-slate-800 opacity-75'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top row: Date tile, Doctor info, Status badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex flex-col items-center justify-center font-bold shrink-0">
                        <span className="text-lg leading-none">{apt.date.split(' ')[0]}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 dark:text-teal-400 mt-0.5">
                          {apt.date.split(' ')[1]}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">{apt.doctor}</h4>
                        </div>
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5">{apt.specialty}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Patient: {apt.patientName || 'Chaitanya'}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        apt.status === 'Scheduled'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : apt.status === 'Rescheduled'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : apt.status === 'Completed'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  {/* Consultation metadata */}
                  <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {apt.time}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        {apt.type === 'Video Consultation' ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Video Call</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>In-Clinic Visit</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1 text-slate-600 dark:text-slate-300">{apt.clinic || 'CareFirst Medical Center, Indiranagar'}</span>
                    </div>

                    {apt.symptoms && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">Chief Reason:</strong> {apt.symptoms}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 font-mono">Reference: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{apt.id}</strong></span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{apt.fee || '₹800'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadSlip(apt)}
                      title="Download consultation voucher"
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="hidden sm:inline">Slip</span>
                    </button>

                    {isUpcoming && (
                      <button
                        onClick={() => handleDownloadICS(apt)}
                        title="Add to Calendar (.ics)"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span className="hidden sm:inline">Calendar</span>
                      </button>
                    )}

                    <button
                      onClick={() => setDetailApt(apt)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
                    >
                      Details
                    </button>
                  </div>

                  {isUpcoming && (
                    <div className="flex items-center gap-2">
                      {user?.role === 'doctor' && onUpdateAppointmentStatus && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'Completed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete Consult</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setRescheduleApt(apt);
                          setSelectedNewDate(RESCHEDULE_DATES[0]);
                          setSelectedNewSlot(RESCHEDULE_SLOTS[0]);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => setCancelModalApt(apt)}
                        className="px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => {
                        onNavigate('Book Appointment');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 text-xs font-semibold transition-colors"
                    >
                      Book Follow-up
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredAppointments.length === 0 && (
            <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-base">No appointments in this view</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? `No consultations match "${searchQuery}".`
                  : `You do not have any ${filterTab.toLowerCase()} appointments registered.`}
              </p>
              <button
                onClick={() => onNavigate('Book Appointment')}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                Schedule New Consultation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Reschedule Consultation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">With {rescheduleApt.doctor} · {rescheduleApt.id}</p>
              </div>
              <button
                onClick={() => setRescheduleApt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select New Date</label>
                <div className="grid grid-cols-3 gap-2">
                  {RESCHEDULE_DATES.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedNewDate(date)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        selectedNewDate === date
                          ? 'bg-slate-900 dark:bg-teal-600 text-white border-slate-900 dark:border-teal-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select New Time Slot</label>
                <div className="grid grid-cols-2 gap-2">
                  {RESCHEDULE_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedNewSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                        selectedNewSlot === slot
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p>
                  No reschedule penalty. Your doctor will be notified automatically with your new chosen slot ({selectedNewDate} at {selectedNewSlot}).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleApt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                  Cancel this consultation?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to cancel your visit with <strong className="text-slate-800 dark:text-slate-200">{cancelModalApt.doctor}</strong> on <strong className="text-slate-800 dark:text-slate-200">{cancelModalApt.date} ({cancelModalApt.time})</strong>?
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left">
                <p>✓ 100% Free cancellation policy applies.</p>
                <p className="mt-1">✓ Your slot will be safely released to other patients.</p>
                <p className="mt-1">✓ You can easily re-book or choose another specialist at any time.</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setCancelModalApt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={() => {
                    onCancelAppointment(cancelModalApt.id);
                    setCancelModalApt(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  Yes, Cancel Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Voucher Modal */}
      {detailApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">Official Consultation Slip</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{detailApt.id}</h3>
              </div>
              <button
                onClick={() => setDetailApt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 font-medium">Doctor</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{detailApt.doctor}</p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">{detailApt.specialty}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Status</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{detailApt.status}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{detailApt.type || 'In-Clinic'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Date & Time</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{detailApt.date} · {detailApt.time}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Consultation Fee</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{detailApt.fee || '₹800'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">Clinic Facility</h4>
                <p className="text-slate-700 dark:text-slate-300">{detailApt.clinic || 'CareFirst Medical Center, Indiranagar'}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">12th Main, 100ft Road, Indiranagar, Bangalore · Phone: +91 80 4911 2000</p>
              </div>

              {detailApt.instructions && (
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800 text-teal-900 dark:text-teal-200">
                  <span className="font-bold block mb-0.5">Patient Preparation Instructions:</span>
                  <p>{detailApt.instructions}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
              <button
                onClick={() => handleDownloadSlip(detailApt)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Slip</span>
              </button>

              <button
                onClick={() => setDetailApt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
