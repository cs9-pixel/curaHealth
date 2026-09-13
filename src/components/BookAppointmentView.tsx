import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Check,
  ArrowRight,
  ArrowLeft,
  Star,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  MapPin,
  Building2,
  Video,
  Download,
  CalendarDays,
  User,
  Phone,
} from 'lucide-react';
import { BookingFormData, Doctor, TabType, Appointment } from '../types';
import { generateAppointmentSlip, generateICSFile, downloadTextFile } from '../utils/downloadUtils';

interface BookAppointmentViewProps {
  bookingStep: number;
  bookingData: BookingFormData;
  bookingSuccess: boolean;
  newAppointmentId: string;
  bookingSubmitting: boolean;
  doctors: Doctor[];
  bookedSlots: string[];
  onSetBookingStep: (step: number) => void;
  onSetBookingData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onCompleteBooking: () => void;
  onResetBooking: () => void;
  onNavigate: (tab: TabType) => void;
  onSelectPrompt?: (prompt: string) => void;
}

const SPECIALTIES = [
  { name: 'General Physician', desc: 'Fever, cough, infection, cold, fatigue & wellness', available: 4 },
  { name: 'Dermatology', desc: 'Acne, skin allergy, eczema, hair fall & laser therapy', available: 2 },
  { name: 'Pediatrics', desc: 'Newborn checkup, child nutrition & infant vaccinations', available: 3 },
  { name: 'Cardiology', desc: 'Hypertension, ECG review, chest pain & heart health', available: 1 },
  { name: 'Orthopedics', desc: 'Joint pain, arthritis, sports injuries & fractures', available: 2 },
];

const AVAILABLE_DATES = [
  '18 Sep 2026',
  '19 Sep 2026',
  '20 Sep 2026',
  '21 Sep 2026',
  '22 Sep 2026',
  '23 Sep 2026',
];

const TIME_SLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'];

export const BookAppointmentView: React.FC<BookAppointmentViewProps> = ({
  bookingStep,
  bookingData,
  bookingSuccess,
  newAppointmentId,
  bookingSubmitting,
  doctors,
  bookedSlots,
  onSetBookingStep,
  onSetBookingData,
  onCompleteBooking,
  onResetBooking,
  onNavigate,
  onSelectPrompt,
}) => {
  const [patientName, setPatientName] = useState(bookingData.patientName || 'Chaitanya Sahu');
  const [patientPhone, setPatientPhone] = useState(bookingData.patientPhone || '+91 98765 43210');
  const [consultType, setConsultType] = useState<'In-Clinic' | 'Video Consultation'>(
    bookingData.consultationType || 'In-Clinic'
  );
  const [symptoms, setSymptoms] = useState(
    bookingData.symptoms || 'Regular health checkup and consultation'
  );

  const filteredDoctors = doctors.filter((d) =>
    bookingData.specialty ? d.specialty.includes(bookingData.specialty) : true
  );

  const selectedDoctorObj = doctors.find((d) => d.name === bookingData.doctor);

  // Success Confirmation Screen
  if (bookingSuccess) {
    const fakeAppointment: Appointment = {
      id: newAppointmentId,
      doctor: bookingData.doctor,
      specialty: bookingData.specialty,
      date: bookingData.date,
      time: bookingData.time,
      status: 'Scheduled',
      clinic: selectedDoctorObj?.clinic || 'CareFirst Medical Center, Indiranagar',
      patientName: patientName,
      fee: selectedDoctorObj?.fee || '₹800',
      type: consultType,
      symptoms: symptoms,
      instructions: 'Please arrive 10 minutes prior to scheduled slot.',
    };

    const handleDownloadSlip = () => {
      const slip = generateAppointmentSlip(fakeAppointment);
      downloadTextFile(`Appointment_Slip_${newAppointmentId}.txt`, slip);
    };

    const handleDownloadCalendar = () => {
      const ics = generateICSFile(fakeAppointment);
      downloadTextFile(`Appointment_${newAppointmentId}.ics`, ics, 'text/calendar;charset=utf-8');
    };

    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-2xs">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              BOOKING CONFIRMED & REGISTERED
            </span>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
              Your consultation is confirmed!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1">
              Your appointment voucher has been issued and synchronized with the clinic registry.
            </p>
          </div>

          {/* Voucher Summary Card */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Appointment Reference</span>
              <p className="font-mono font-bold text-base text-teal-700 dark:text-teal-400 mt-0.5">
                {newAppointmentId}
              </p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Patient</span>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{patientName}</p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Doctor</span>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{bookingData.doctor}</p>
              <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">{bookingData.specialty}</p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Consultation Type</span>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{consultType}</p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Scheduled Date</span>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{bookingData.date}</p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Slot Time</span>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{bookingData.time}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Clinic / Facility:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {selectedDoctorObj?.clinic || 'CareFirst Medical Center, Indiranagar'}
              </p>
            </div>
          </div>

          {/* Download and Calendar Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadSlip}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-2xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Slip</span>
            </button>

            <button
              onClick={handleDownloadCalendar}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs inline-flex items-center gap-2 transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Add to Calendar (.ics)</span>
            </button>

            {onSelectPrompt && (
              <button
                onClick={() => {
                  onSelectPrompt(
                    `How should I prepare for my appointment with ${bookingData.doctor} (${bookingData.specialty}) on ${bookingData.date}?`
                  );
                  onNavigate('AI Assistant');
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 font-semibold text-xs inline-flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Ask AI to Prepare for Visit</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('Appointments')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-2xs transition-colors"
            >
              View In My Consultations
            </button>
            <button
              onClick={() => {
                onResetBooking();
                onNavigate('Home');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFinalSubmit = () => {
    onSetBookingData((prev) => ({
      ...prev,
      patientName,
      patientPhone,
      consultationType: consultType,
      symptoms,
    }));
    onCompleteBooking();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            CLINICAL SCHEDULER
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
            Book an In-Clinic or Video Consultation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select medical specialty, choose your doctor, pick an available slot, and confirm.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800/70 text-xs font-semibold text-teal-800 dark:text-teal-300">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Zero Booking Fee · Free Reschedule</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, label: '1. Department' },
            { step: 2, label: '2. Physician' },
            { step: 3, label: '3. Date & Slot' },
            { step: 4, label: '4. Patient Details' },
          ].map((item) => {
            const isCompleted = bookingStep > item.step;
            const isCurrent = bookingStep === item.step;
            return (
              <div
                key={item.step}
                className={`p-2.5 sm:p-3 rounded-xl flex items-center gap-2 transition-all ${
                  isCurrent
                    ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-2xs'
                    : isCompleted
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-teal-500 text-slate-900'
                      : isCompleted
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.step}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* STEP 1: Specialty */}
        {bookingStep === 1 && (
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                STEP 01 OF 04
              </span>
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
                Select Medical Department
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Choose the clinical area tailored to your symptoms or health concern.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {SPECIALTIES.map((spec) => {
                const isSelected = bookingData.specialty === spec.name;
                return (
                  <button
                    key={spec.name}
                    onClick={() => {
                      onSetBookingData((prev) => ({
                        ...prev,
                        specialty: spec.name,
                        doctor: '',
                      }));
                      onSetBookingStep(2);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800/60">
                          {spec.available} doctors
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-teal-300 transition-colors">
                        {spec.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{spec.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-700 dark:text-teal-400">
                      <span>Select specialty</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Doctor Selection */}
        {bookingStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  STEP 02 OF 04
                </span>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Choose Your Doctor
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Showing specialists available in {bookingData.specialty}.
                </p>
              </div>

              <button
                onClick={() => onSetBookingStep(1)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Specialties
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => {
                const isSelected = bookingData.doctor === doc.name;
                return (
                  <div
                    key={doc.name}
                    onClick={() => {
                      onSetBookingData((prev) => ({ ...prev, doctor: doc.name }));
                      onSetBookingStep(3);
                    }}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/20 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                            {doc.avatarText}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{doc.name}</h4>
                            <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">{doc.specialty}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{doc.qualification}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 shrink-0">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{doc.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 my-2 leading-relaxed">
                        {doc.about}
                      </p>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">{doc.clinic}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{doc.years} yrs experience · {doc.languages.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-base font-display font-bold text-slate-900 dark:text-slate-100">{doc.fee}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block -mt-1">Consultation fee</span>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs inline-flex items-center gap-1">
                        <span>Select Doctor</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Date, Mode & Slot */}
        {bookingStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  STEP 03 OF 04
                </span>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Choose Consultation Mode & Slot
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  With {bookingData.doctor} ({bookingData.specialty})
                </p>
              </div>

              <button
                onClick={() => onSetBookingStep(2)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Doctor
              </button>
            </div>

            {/* Consultation Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Consultation Type:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultType('In-Clinic')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    consultType === 'In-Clinic'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">In-Clinic Visit</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Consult directly at {selectedDoctorObj?.clinic || 'Indiranagar Medical Center'}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultType('Video Consultation')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    consultType === 'Video Consultation'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">Telehealth Video Call</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Join encrypted video call from home on phone or laptop
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Picker Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Preferred Date:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {AVAILABLE_DATES.map((dateStr) => {
                  const parts = dateStr.split(' ');
                  const isSelected = bookingData.date === dateStr;
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => onSetBookingData((prev) => ({ ...prev, date: dateStr }))}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-slate-900 dark:border-teal-500 bg-slate-900 dark:bg-teal-600 text-white shadow-2xs'
                          : 'border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-80 block">
                        {parts[1]} {parts[2]}
                      </span>
                      <p className="text-xl font-display font-bold my-0.5">{parts[0]}</p>
                      <span className="text-[10px] font-medium block opacity-90">Available</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Time Slot:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = bookingData.time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => onSetBookingData((prev) => ({ ...prev, time: slot }))}
                      className={`p-3 rounded-xl border text-center font-medium text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                        isBooked
                          ? 'opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-not-allowed text-slate-400 dark:text-slate-500'
                          : isSelected
                          ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot}</span>
                      {isBooked && <span className="text-[9px] uppercase font-bold">Booked</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onSetBookingStep(2)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Back
              </button>

              <button
                type="button"
                disabled={!bookingData.date || !bookingData.time}
                onClick={() => onSetBookingStep(4)}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-2xs transition-all"
              >
                <span>Continue to Patient Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Patient Details & Final Review */}
        {bookingStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  STEP 04 OF 04
                </span>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Patient Information & Confirmation
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Verify patient credentials and provide brief clinical symptoms.
                </p>
              </div>

              <button
                onClick={() => onSetBookingStep(3)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Slots
              </button>
            </div>

            {/* Input Form for Patient */}
            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                Patient Contact & Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (for SMS & Voucher) *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Symptoms / Health Concern
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild fever, persistent throat pain, routine review..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Final Booking Summary Box */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                APPOINTMENT SUMMARY
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Doctor:</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{bookingData.doctor}</p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">{bookingData.specialty}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Consultation Mode:</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5">{consultType}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Date & Slot:</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5">{bookingData.date}</p>
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-400">{bookingData.time}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Consultation Fee:</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{selectedDoctorObj?.fee || '₹800'}</p>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Free Reschedule Policy</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => onSetBookingStep(3)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Back to Date & Slot
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!patientName.trim() || bookingSubmitting}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-2xs transition-all"
              >
                {bookingSubmitting ? (
                  <span>Issuing Clinic Voucher...</span>
                ) : (
                  <>
                    <span>Confirm & Book Appointment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
