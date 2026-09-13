import React, { useState, useEffect } from 'react';
import {
  Home,
  Sparkles,
  Calendar,
  CalendarPlus,
  FileText,
  Stethoscope,
  X,
  HeartPulse,
  LogOut,
} from 'lucide-react';
import {
  TabType,
  Appointment,
  Doctor,
  HealthRecord,
  ChatMessage,
  NotificationItem,
  ToastItem,
  BookingFormData,
} from './types';
import {
  INITIAL_APPOINTMENTS,
  DOCTORS_DATABASE,
  INITIAL_RECORDS,
  INITIAL_NOTIFICATIONS,
  MOCK_KB_KNOWLEDGE,
  TODAY,
} from './data/mockData';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { HomeView } from './components/HomeView';
import { AssistantView } from './components/AssistantView';
import { AppointmentsView } from './components/AppointmentsView';
import { BookAppointmentView } from './components/BookAppointmentView';
import { HealthRecordsView } from './components/HealthRecordsView';
import { DoctorsDirectoryView } from './components/DoctorsDirectoryView';
import { RecordPreviewModal } from './components/RecordPreviewModal';
import { UploadRecordModal } from './components/UploadRecordModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ToastContainer } from './components/ToastContainer';
import { generateRecordSummary, downloadTextFile } from './utils/downloadUtils';
import { processClinicalQuery } from './services/clinicalAI';

const API_URL = 'http://127.0.0.1:8000';

export default function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  // Appointments state with persistent storage
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('cura_clinical_appointments') || localStorage.getItem('practo_clinical_appointments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_APPOINTMENTS;
  });

  const [appointmentId, setAppointmentId] = useState('');
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentResult, setAppointmentResult] = useState('');
  const [appointmentOffline, setAppointmentOffline] = useState(false);

  // Doctors & records state with persistent storage
  const [doctors] = useState<Doctor[]>(DOCTORS_DATABASE);
  const [records, setRecords] = useState<HealthRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cura_clinical_records') || localStorage.getItem('practo_clinical_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((r: any) => ({ ...r, date: new Date(r.date) }));
      }
    } catch {}
    return INITIAL_RECORDS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cura_clinical_appointments', JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('cura_clinical_records', JSON.stringify(records));
    } catch {}
  }, [records]);

  const [selectedRecordForPreview, setSelectedRecordForPreview] = useState<HealthRecord | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Booking state
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    patientName: user?.name || 'Chaitanya Sahu',
    patientPhone: user?.phone || '+91 98765 43210',
    consultationType: 'In-Clinic',
    symptoms: 'Routine checkup and clinical assessment',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [newAppointmentId, setNewAppointmentId] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Update booking data if user signs in or changes
  useEffect(() => {
    if (user) {
      setBookingData((prev) => ({
        ...prev,
        patientName: user.name,
        patientPhone: user.phone || prev.patientPhone,
      }));
    }
  }, [user]);

  // Chat / AI Assistant state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content:
        "Hello! I'm your CuraHealth Clinical Assistant. I can help answer queries regarding appointments, cancellation & reschedule policies, doctor qualifications, fasting requirements for lab tests, and clinical guidelines.",
      time: new Date(TODAY.getTime() - 10 * 60000),
      sources: ['CuraHealth Clinical Operations Protocol v4.2'],
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Notifications & toasts state
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (message: string, tone: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check backend health silently on mount
  useEffect(() => {
    let mounted = true;
    fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(1500) })
      .then((res) => {
        if (mounted && res.ok) setOfflineMode(false);
      })
      .catch(() => {
        if (mounted) setOfflineMode(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Send message to AI Assistant
  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: trimmed,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      // Process with comprehensive Clinical AI service
      const clinicalResult = await processClinicalQuery(
        trimmed,
        appointments,
        records,
        doctors,
        user?.name
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: clinicalResult.answer,
          time: new Date(),
          offline: false,
          sources: clinicalResult.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content:
            "I'm ready to assist with your medical questions, appointments, lab tests, or doctor consultations. How can I help you today?",
          time: new Date(),
          offline: true,
          sources: ['CuraHealth Clinical SOP'],
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Appointment lookup handler
  const handleCheckAppointment = async (customId?: string) => {
    const targetId = (customId || appointmentId).trim().toUpperCase();
    if (!targetId || appointmentLoading) return;

    setAppointmentLoading(true);
    setAppointmentResult('');
    setAppointmentOffline(false);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `What is the current status of appointment ${targetId}?`,
          thread_id: `frontend-appointment-${targetId}`,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) throw new Error('Backend failed');
      const data = await res.json();
      setAppointmentResult(data.answer || 'No appointment status returned.');
    } catch {
      setAppointmentOffline(true);
      await new Promise((r) => setTimeout(r, 600));
      const found = appointments.find((a) => a.id === targetId);
      if (found) {
        setAppointmentResult(
          `Appointment ${found.id} with ${found.doctor} (${found.specialty}) is ${found.status} for ${found.date} at ${found.time} at ${found.clinic}. Free cancellation and rescheduling are available anytime.`
        );
      } else {
        setAppointmentResult(
          `No active record was found for Appointment ID "${targetId}". Please verify the reference code (try APT-043 or APT-001) or schedule a new consultation.`
        );
      }
    } finally {
      setAppointmentLoading(false);
    }
  };

  // Complete booking
  const handleCompleteBooking = async () => {
    if (!bookingData.specialty || !bookingData.doctor || !bookingData.date || !bookingData.time) {
      return;
    }

    setBookingSubmitting(true);
    const doctorObj = doctors.find((d) => d.name === bookingData.doctor);
    const patientName = bookingData.patientName || 'Chaitanya Sahu';
    const consultationType = bookingData.consultationType || 'In-Clinic';
    const clinicName = doctorObj?.clinic || 'CareFirst Medical Center, Indiranagar';
    const fee = doctorObj?.fee || '₹800';

    try {
      const res = await fetch(`${API_URL}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName,
          specialty: bookingData.specialty,
          doctor: bookingData.doctor,
          appointment_date: bookingData.date,
          appointment_time: bookingData.time,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) throw new Error('Booking failed');
      const data = await res.json();
      const confirmedId = data.appointment_id || `APT-${Math.floor(100 + Math.random() * 900)}`;

      setNewAppointmentId(confirmedId);
      setBookingSuccess(true);
      const newBookingApt: Appointment = {
        id: confirmedId,
        doctor: bookingData.doctor,
        specialty: bookingData.specialty,
        date: bookingData.date,
        time: bookingData.time,
        status: 'Scheduled',
        clinic: clinicName,
        patientName: patientName,
        type: consultationType,
        fee: fee,
        symptoms: bookingData.symptoms,
        instructions: 'Please arrive 10 minutes prior to scheduled slot.',
      };
      setAppointments((prev) => [newBookingApt, ...prev]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Consultation Confirmed',
          desc: `${bookingData.doctor} (${bookingData.specialty}) on ${bookingData.date} at ${bookingData.time}`,
          time: 'Just now',
          unread: true,
          tone: 'green',
        },
        ...prev,
      ]);
      pushToast('Appointment confirmed and issued to clinic registry.');
    } catch {
      await new Promise((r) => setTimeout(r, 600));
      const fallbackId = `APT-${Math.floor(100 + Math.random() * 900)}`;
      setNewAppointmentId(fallbackId);
      setBookingSuccess(true);
      const fallbackApt: Appointment = {
        id: fallbackId,
        doctor: bookingData.doctor,
        specialty: bookingData.specialty,
        date: bookingData.date,
        time: bookingData.time,
        status: 'Scheduled',
        clinic: clinicName,
        patientName: patientName,
        type: consultationType,
        fee: fee,
        symptoms: bookingData.symptoms,
        instructions: 'Please arrive 10 minutes prior to scheduled slot.',
      };
      setAppointments((prev) => [fallbackApt, ...prev]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Consultation Confirmed',
          desc: `${bookingData.doctor} on ${bookingData.date} at ${bookingData.time} (#${fallbackId})`,
          time: 'Just now',
          unread: true,
          tone: 'green',
        },
        ...prev,
      ]);
      pushToast('Appointment confirmed and scheduled successfully.', 'success');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' as const } : a))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Consultation Cancelled',
        desc: `Appointment #${id} has been cancelled without penalty.`,
        time: 'Just now',
        unread: true,
        tone: 'blue',
      },
      ...prev,
    ]);
    pushToast(`Consultation ${id} has been cancelled without penalty.`, 'warning');
  };

  const handleRescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              date: newDate,
              time: newTime,
              status: 'Rescheduled' as const,
              instructions: `Rescheduled to ${newDate} at ${newTime}. Please arrive 10 minutes prior.`,
            }
          : a
      )
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Consultation Rescheduled',
        desc: `Appointment #${id} moved to ${newDate} at ${newTime}.`,
        time: 'Just now',
        unread: true,
        tone: 'amber',
      },
      ...prev,
    ]);
    pushToast(`Consultation ${id} successfully rescheduled to ${newDate} at ${newTime}.`, 'success');
  };

  const handleUpdateAppointmentStatus = (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Appointment ${status}`,
        desc: `Consultation #${id} is now marked as ${status}.`,
        time: 'Just now',
        unread: true,
        tone: status === 'Completed' ? 'green' : 'blue',
      },
      ...prev,
    ]);
    pushToast(`Appointment ${id} marked as ${status}.`, 'success');
  };

  const handleAddUploadedRecord = (newRec: HealthRecord) => {
    setRecords((prev) => [newRec, ...prev]);
    pushToast(`Document "${newRec.title}" uploaded to your health vault.`);
  };

  const handleDownloadRecord = (title: string) => {
    const matchedRecord = records.find((r) => r.title === title);
    if (matchedRecord) {
      const content = generateRecordSummary(matchedRecord);
      downloadTextFile(`${matchedRecord.id}_${matchedRecord.title.replace(/\s+/g, '_')}.txt`, content);
    } else {
      downloadTextFile(
        `${title.replace(/\s+/g, '_')}.txt`,
        `CuraHealth Medical Document: ${title}\nPatient: ${user?.name || 'Verified Patient'}\nDate: ${new Date().toLocaleDateString()}`
      );
    }
    pushToast(`Downloaded "${title}" to your device.`, 'success');
  };

  const bookedSlots = appointments
    .filter((a) => a.date === bookingData.date && a.status !== 'Cancelled')
    .map((a) => a.time);

  // If user is signed out, show the dedicated LoginPage
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <LoginPage
          onSuccess={() => {
            pushToast('Welcome to CuraHealth Clinical Portal!', 'success');
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Layout Wrapper */}
      <div className="flex flex-1">
        {/* Desktop Sticky Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            offlineMode={offlineMode}
            onOpenLogin={() => logout()}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col z-10 border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                      CuraHealth
                    </h1>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">PATIENT PORTAL</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 py-6 flex-1 overflow-y-auto">
                {[
                  { id: 'Home' as TabType, label: 'Dashboard', icon: Home },
                  { id: 'Doctors' as TabType, label: 'Doctor Directory', icon: Stethoscope },
                  { id: 'Book Appointment' as TabType, label: 'Book Visit', icon: CalendarPlus },
                  { id: 'Appointments' as TabType, label: 'My Consultations', icon: Calendar },
                  { id: 'Health Records' as TabType, label: 'Health Records', icon: FileText },
                  { id: 'AI Assistant' as TabType, label: 'Clinical AI Copilot', icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-slate-900 dark:bg-teal-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-teal-400 dark:text-teal-200' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Drawer Profile & Logout Footer */}
              {user && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {user.avatarText || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      pushToast('Signed out of health portal.', 'info');
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            activeTab={activeTab}
            notifications={notifications}
            onMarkNotificationRead={(id) =>
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
              )
            }
            onClearAllNotifications={() =>
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            }
            onOpenSearch={() => setSearchModalOpen(true)}
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
            onShowToast={(msg, tone) => pushToast(msg, tone)}
          />

          <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            {activeTab === 'Home' && (
              <HomeView
                appointments={appointments}
                records={records}
                offlineMode={offlineMode}
                onNavigate={(t) => setActiveTab(t)}
                onSelectPrompt={(p) => {
                  handleSendMessage(p);
                }}
              />
            )}

            {activeTab === 'Doctors' && (
              <DoctorsDirectoryView
                doctors={doctors}
                onSelectDoctorForBooking={(doctorName, specialty) => {
                  setBookingData((prev) => ({
                    ...prev,
                    specialty,
                    doctor: doctorName,
                    date: '',
                    time: '',
                  }));
                  setBookingStep(3);
                  setActiveTab('Book Appointment');
                }}
                onBookDoctor={(doc) => {
                  setBookingData((prev) => ({
                    ...prev,
                    specialty: doc.specialty,
                    doctor: doc.name,
                    date: '',
                    time: '',
                  }));
                  setBookingStep(3);
                  setActiveTab('Book Appointment');
                }}
                onAskAboutDoctor={(doctorName) => {
                  setActiveTab('AI Assistant');
                  handleSendMessage(
                    `Tell me about ${doctorName}, their specialty, clinic location, and consultation fees.`
                  );
                }}
              />
            )}

            {activeTab === 'AI Assistant' && (
              <AssistantView
                messages={messages}
                loading={chatLoading}
                offlineMode={offlineMode}
                onSendMessage={handleSendMessage}
                onResetChat={() => {
                  setMessages([
                    {
                      id: `init-${Date.now()}`,
                      role: 'assistant',
                      content: 'Conversation reset. How may I assist your healthcare needs today?',
                      time: new Date(),
                    },
                  ]);
                  pushToast('Chat session cleared.');
                }}
              />
            )}

            {activeTab === 'Appointments' && (
              <AppointmentsView
                appointments={appointments}
                appointmentId={appointmentId}
                appointmentLoading={appointmentLoading}
                appointmentResult={appointmentResult}
                appointmentOffline={appointmentOffline}
                onSetAppointmentId={setAppointmentId}
                onCheckAppointment={handleCheckAppointment}
                onNavigate={(t) => setActiveTab(t)}
                onCancelAppointment={handleCancelAppointment}
                onRescheduleAppointment={handleRescheduleAppointment}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              />
            )}

            {activeTab === 'Book Appointment' && (
              <BookAppointmentView
                bookingStep={bookingStep}
                bookingData={bookingData}
                bookingSuccess={bookingSuccess}
                newAppointmentId={newAppointmentId}
                bookingSubmitting={bookingSubmitting}
                doctors={doctors}
                bookedSlots={bookedSlots}
                onSetBookingStep={setBookingStep}
                onSetBookingData={setBookingData}
                onCompleteBooking={handleCompleteBooking}
                onResetBooking={() => {
                  setBookingStep(1);
                  setBookingData({
                    specialty: '',
                    doctor: '',
                    date: '',
                    time: '',
                    patientName: 'Chaitanya Sahu',
                    patientPhone: '+91 98765 43210',
                    consultationType: 'In-Clinic',
                    symptoms: 'Routine checkup and clinical assessment',
                  });
                  setBookingSuccess(false);
                  setNewAppointmentId('');
                }}
                onNavigate={(t) => setActiveTab(t)}
                onSelectPrompt={(p) => {
                  handleSendMessage(p);
                }}
              />
            )}

            {activeTab === 'Health Records' && (
              <HealthRecordsView
                records={records}
                onOpenPreview={(rec) => setSelectedRecordForPreview(rec)}
                onOpenUpload={() => setUploadModalOpen(true)}
                onOpenUploadModal={() => setUploadModalOpen(true)}
                onAddRecord={handleAddUploadedRecord}
                onDownload={handleDownloadRecord}
              />
            )}
          </main>
        </div>
      </div>

      {/* Record Preview Modal */}
      <RecordPreviewModal
        record={selectedRecordForPreview}
        onClose={() => setSelectedRecordForPreview(null)}
        onDownload={handleDownloadRecord}
      />

      {/* Upload Record Modal */}
      <UploadRecordModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleAddUploadedRecord}
        onAddRecord={handleAddUploadedRecord}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        onSelectDoctor={(doc) => {
          setBookingData((prev) => ({
            ...prev,
            specialty: doc.specialty,
            doctor: doc.name,
            date: '',
            time: '',
          }));
          setBookingStep(3);
          setActiveTab('Book Appointment');
        }}
        onSelectRecord={(rec) => {
          setSelectedRecordForPreview(rec);
          setActiveTab('Health Records');
        }}
        onSelectPrompt={(p) => {
          setActiveTab('AI Assistant');
          handleSendMessage(p);
        }}
        doctors={doctors}
        appointments={appointments}
        records={records}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
