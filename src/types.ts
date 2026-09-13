export type TabType =
  | 'Home'
  | 'AI Assistant'
  | 'Appointments'
  | 'Book Appointment'
  | 'Health Records'
  | 'Doctors';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  uhid: string;
  role: 'patient' | 'doctor';
  avatarText: string;
  bloodGroup?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
}

export type AppointmentStatus = 'Scheduled' | 'Rescheduled' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  clinic?: string;
  patientName?: string;
  fee?: string;
  type?: 'In-Clinic' | 'Video Consultation';
  symptoms?: string;
  instructions?: string;
}

export interface Doctor {
  name: string;
  specialty: string;
  qualification: string;
  rating: number;
  reviews: number;
  years: number;
  nextSlot: string;
  status: 'Available' | 'Limited' | 'Busy';
  clinic: string;
  location: string;
  avatarText: string;
  fee: string;
  consultationType: 'In-Clinic & Video' | 'In-Clinic Only' | 'Video Only';
  languages: string[];
  about: string;
}

export interface HealthRecord {
  id: string;
  icon: 'Rx' | 'PDF' | 'LAB' | 'SCAN';
  title: string;
  subtitle: string;
  date: Date;
  type: 'Prescription' | 'Report' | 'Lab Report' | 'Summary';
  tone: 'purple' | 'blue' | 'emerald' | 'amber';
  size: string;
  doctorName?: string;
  downloadUrl?: string;
  doctorSpecialty?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: Date;
  offline?: boolean;
  sources?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'appointment' | 'report' | 'prescription' | 'alert';
}

export interface ToastItem {
  id: number;
  message: string;
  tone?: 'success' | 'warning' | 'error' | 'info';
}

export interface BookingFormData {
  specialty: string;
  doctor: string;
  date: string;
  time: string;
  consultationType?: 'In-Clinic' | 'Video Consultation';
  patientName?: string;
  patientPhone?: string;
  patientAge?: string;
  patientGender?: 'Male' | 'Female' | 'Other';
  symptoms?: string;
}
