import React from 'react';
import {
  Calendar,
  FileText,
  Sparkles,
  Shield,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarPlus,
  ArrowUpRight,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { Appointment, HealthRecord, TabType } from '../types';

interface HomeViewProps {
  appointments: Appointment[];
  records: HealthRecord[];
  offlineMode: boolean;
  onNavigate: (tab: TabType) => void;
  onSelectPrompt: (prompt: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  appointments,
  records,
  offlineMode,
  onNavigate,
  onSelectPrompt,
}) => {
  const nextAppointment = appointments[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 text-white p-6 sm:p-8 relative overflow-hidden shadow-sm border border-transparent dark:border-slate-800">
        {/* Subtle decorative background elements */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-24 -bottom-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5 text-teal-300" />
              <span>Grounded Clinical Copilot Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white mb-2">
              Comprehensive patient care, appointments, & records.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Interact with your verified healthcare agent, lookup upcoming clinic consultations,
              and access medical records in a secure clinical workspace.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => onNavigate('Book Appointment')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-all shadow-sm shadow-teal-900/30"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => onNavigate('AI Assistant')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold backdrop-blur-sm border border-white/10 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Upcoming Appointments */}
        <button
          onClick={() => onNavigate('Appointments')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Upcoming
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
              {String(appointments.length).padStart(2, '0')}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Next: {nextAppointment ? nextAppointment.date : 'None'}</span>
            </p>
          </div>
        </button>

        {/* Metric 2: Health Documents */}
        <button
          onClick={() => onNavigate('Health Records')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Records
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
              {String(records.length).padStart(2, '0')}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Prescriptions & lab reports</p>
          </div>
        </button>

        {/* Metric 3: Health Vitals */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-left flex flex-col justify-between">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recent Vitals
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
              118/78
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Normal BP · Pulse 72 bpm</span>
            </p>
          </div>
        </div>

        {/* Metric 4: Primary Physician */}
        <button
          onClick={() => onNavigate('Doctors')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Primary Care
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 truncate">
              Dr. Priya Sharma
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Indiranagar Clinic · Available</span>
            </p>
          </div>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Copilot Card & Next Visits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conversational Prompts Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  AI HEALTHCARE COPILOT
                </span>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  What clinical question do you have today?
                </h3>
              </div>
              <button
                onClick={() => onNavigate('AI Assistant')}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 inline-flex items-center gap-1 group"
              >
                Open full assistant
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
              Ask about appointment policies, prescription refills, telemedicine requirements, or your
              upcoming visits:
            </p>

            {/* Quick suggested chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  label: 'What is the cancellation policy?',
                  desc: 'Free up to 4 hrs before slot',
                },
                {
                  label: 'How long does a prescription refill take?',
                  desc: 'Typically 2 to 4 working hours',
                },
                {
                  label: 'Who is eligible for telemedicine?',
                  desc: 'General, Derm, & Pediatrics',
                },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    onSelectPrompt(chip.label);
                    onNavigate('AI Assistant');
                  }}
                  className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50/50 dark:hover:bg-teal-950/40 hover:border-teal-200 dark:hover:border-teal-800 text-left transition-colors group"
                >
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-900 dark:group-hover:text-teal-300">
                    {chip.label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{chip.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Appointment Spotlight */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  UPCOMING SCHEDULE
                </span>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Confirmed visits
                </h3>
              </div>
              <button
                onClick={() => onNavigate('Appointments')}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 inline-flex items-center gap-1"
              >
                View all ({appointments.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-800/30"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Date Tile */}
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                      <span className="text-base font-display font-bold text-slate-900 dark:text-slate-100 leading-none">
                        {apt.date.split(' ')[0]}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 tracking-wider mt-0.5">
                        {apt.date.split(' ')[1]}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{apt.doctor}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            apt.status === 'Scheduled'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{apt.specialty}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {apt.time}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {apt.clinic || 'Main Medical Center'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {apt.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('Appointments')}
                    className="self-start sm:self-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: System Stack & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                QUICK ACTIONS
              </span>
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Immediate access
              </h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('Book Appointment')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <CalendarPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Book new visit</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose doctor and date</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('Appointments')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Check appointment status</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Lookup by ID (e.g. APT-043)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('Health Records')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Health documents</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Prescriptions & lab reports</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('Doctors')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Doctor Directory</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Browse verified specialists</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Patient Health Profile & Emergency Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  HEALTH PROFILE
                </span>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Clinical Summary
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Active Patient
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Blood Group</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">O+ Positive</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Known Allergies</span>
                <span className="font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                  Penicillin
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Health Insurance (TPA)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Star Health · #SH-99201</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Emergency Contact</span>
                <span className="font-semibold text-teal-700 dark:text-teal-400">+91 98765 43210</span>
              </div>
            </div>

            {/* Emergency Hotline Alert */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-900 to-slate-900 dark:from-teal-950 dark:to-slate-950 text-white flex items-center justify-between gap-3 border border-teal-800/50">
              <div>
                <p className="text-xs font-bold text-teal-200">24/7 Clinical Emergency</p>
                <p className="text-[11px] text-slate-300 mt-0.5">Direct Ambulance Hotline</p>
              </div>
              <span className="text-base font-display font-bold text-white bg-white/15 px-3 py-1 rounded-lg border border-white/20">
                108 / 112
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
