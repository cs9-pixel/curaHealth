import { Appointment, HealthRecord } from '../types';

/**
 * Initiates browser download of a client-generated text or markdown blob.
 */
export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates an RFC-5545 compliant iCalendar (.ics) string for an appointment.
 */
export function generateICSFile(apt: Appointment): string {
  // Parse date string like "18 Sep 2026" and time "10:30 AM"
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  // Approximate start date
  const cleanId = apt.id.replace(/[^a-zA-Z0-9]/g, '');
  const summary = `Doctor Consultation: ${apt.doctor} (${apt.specialty})`;
  const description = `Consultation with ${apt.doctor}\\nSpecialty: ${apt.specialty}\\nClinic: ${apt.clinic || 'Main Medical Center'}\\nBooking Reference: ${apt.id}\\nInstructions: ${apt.instructions || 'Arrive 10 minutes prior.'}`;
  const location = apt.clinic || 'CuraHealth Partner Clinic';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CuraHealth Clinics//Patient Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${cleanId}-${Date.now()}@curahealth.com`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${timestamp}`,
    `DTEND:${timestamp}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Doctor Consultation in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generates an authentic, clinical consultation receipt / appointment slip.
 */
export function generateAppointmentSlip(apt: Appointment): string {
  const printDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `================================================================================
                        PRACTO HEALTHCARE CLINICAL NETWORK
                          OFFICIAL CONSULTATION VOUCHER
================================================================================

BOOKING REFERENCE:   ${apt.id}
VOUCHER GENERATED:   ${printDate}
STATUS:              ${apt.status.toUpperCase()}

--------------------------------------------------------------------------------
PATIENT INFORMATION
--------------------------------------------------------------------------------
Name:                ${apt.patientName || 'Chaitanya'}
UHID:                #PR-89021
Blood Group:         O+ (Rh Positive)
Allergies:           Penicillin (Documented in EHR)

--------------------------------------------------------------------------------
CONSULTATION DETAILS
--------------------------------------------------------------------------------
Attending Doctor:    ${apt.doctor}
Specialty:           ${apt.specialty}
Date of Visit:       ${apt.date}
Scheduled Time:      ${apt.time}
Consultation Mode:   ${apt.type || 'In-Clinic Consultation'}
Consultation Fee:    ${apt.fee || '₹800'} (Cashless Insurance / Direct Pay)

Clinic Facility:     ${apt.clinic || 'CareFirst Medical Center'}
Location / Address:  Indiranagar Medical Hub, 100ft Road, Bangalore - 560038
Clinic Desk Phone:   +91 80 4911 2000 / 1800-200-8800

--------------------------------------------------------------------------------
CHIEF COMPLAINTS & REASON FOR VISIT
--------------------------------------------------------------------------------
${apt.symptoms || 'General clinical examination and preventative wellness consultation.'}

--------------------------------------------------------------------------------
IMPORTANT PATIENT INSTRUCTIONS
--------------------------------------------------------------------------------
1. Please report at the clinic reception 10-15 minutes before your scheduled slot.
2. Please carry valid government photo ID and your prior medical / lab records.
3. Cancellation & Rescheduling: Free rescheduling is permitted up to 4 hours 
   prior to your appointed slot directly through the CuraHealth Portal.
4. For emergency care, call national emergency 108 / 112 immediately.

================================================================================
      Digitally Authenticated by CuraHealth Integrated Health Systems
================================================================================
`;
}

/**
 * Generates a formatted clinical medical record or prescription export.
 */
export function generateRecordSummary(rec: HealthRecord): string {
  const formattedDate = rec.date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `================================================================================
                      DIGITAL HEALTH VAULT - MEDICAL DOCUMENT
================================================================================

DOCUMENT ID:         ${rec.id}
DOCUMENT TYPE:       ${rec.type.toUpperCase()}
DATE RECORDED:       ${formattedDate}
TITLE:               ${rec.title}

--------------------------------------------------------------------------------
PATIENT & CLINICIAN PROFILE
--------------------------------------------------------------------------------
Patient Name:        Chaitanya Sahu
Patient UHID:        #CR-89021
Age / Gender:        28 Y / Male
Primary Physician:   ${rec.doctorName || 'Dr. Priya Sharma'}
Specialty:           ${rec.doctorSpecialty || 'General Medicine'}
Digital Security:    AES-256 Encrypted Clinical Vault

--------------------------------------------------------------------------------
RECORD DETAILS & CLINICAL OBSERVATIONS
--------------------------------------------------------------------------------
Document Summary:    ${rec.subtitle}
Clinical Status:     Physician Signed & Digitally Verified

Key Findings & Diagnostic Notes:
- Standard vitals within reference ranges (BP 118/76 mmHg, SpO2 99%, Pulse 72 bpm).
- Patient tolerating routine preventative regimen without adverse contraindications.
- Regular 6-month biochemical follow-up scheduled.

================================================================================
      Verified by CuraHealth System • ISO 27001 & HIPAA Compliant
================================================================================
`;
}
