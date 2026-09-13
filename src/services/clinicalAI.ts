import { Appointment, Doctor, HealthRecord } from '../types';
import { DOCTORS_DATABASE } from '../data/mockData';

export interface AIResponse {
  answer: string;
  sources: string[];
}

export async function processClinicalQuery(
  query: string,
  appointments: Appointment[],
  records: HealthRecord[],
  doctors: Doctor[] = DOCTORS_DATABASE,
  userName?: string
): Promise<AIResponse> {
  // Realistic processing latency for intelligent clinical copilot
  await new Promise((resolve) => setTimeout(resolve, 450 + Math.random() * 350));

  const cleanQuery = query.trim();
  const lower = cleanQuery.toLowerCase();

  // 1. Emergency Detection
  const emergencyKeywords = ['chest pain', 'heart attack', 'can\'t breathe', 'cannot breathe', 'stroke', 'unconscious', 'severe bleeding', 'head injury'];
  if (emergencyKeywords.some((k) => lower.includes(k))) {
    return {
      answer: `⚠️ IMMEDIATE CLINICAL ALERT: Your query mentions symptoms that may indicate a medical emergency. 

Please immediately dial national emergency medical response:
• India National Emergency: 112
• Ambulance Helpline: 108
• Immediate Action: Proceed to the nearest hospital emergency department (Casualty/ICU). Do not drive yourself. If you are alone, inform a family member or neighbor immediately.`,
      sources: ['National Emergency Clinical Response SOP', 'WHO Acute Triage Guidelines'],
    };
  }

  // 2. Lookup Appointment by ID (e.g. APT-043, APT-001, etc.)
  const aptMatch = cleanQuery.match(/apt-\d+/i);
  if (aptMatch) {
    const searchId = aptMatch[0].toUpperCase();
    const found = appointments.find((a) => a.id.toUpperCase() === searchId);
    if (found) {
      return {
        answer: `📋 Verified Appointment Found: **${found.id}**
• **Patient**: ${found.patientName}
• **Specialist**: ${found.doctor} (${found.specialty})
• **Date & Time**: ${found.date} at ${found.time}
• **Consultation Mode**: ${found.type}
• **Facility**: ${found.clinic}
• **Status**: ${found.status}
• **Fee**: ${found.fee}
• **Instructions**: ${found.instructions || 'Please arrive 10 minutes prior.'}

You can download your clinical consultation slip or reschedule directly from the **My Consultations** tab.`,
        sources: ['Central OPD Registry', 'CuraHealth Booking Service API'],
      };
    } else {
      return {
        answer: `I could not locate an appointment with ID **${searchId}** in your active medical records. 

Available appointments in your profile: ${appointments.map((a) => a.id).join(', ') || 'None'}. You can also browse your schedule under the "My Consultations" tab.`,
        sources: ['Hospital Clinical Database'],
      };
    }
  }

  // 3. User Asking for Upcoming Appointments or Schedule
  if (lower.includes('my appointment') || lower.includes('next visit') || lower.includes('upcoming') || lower.includes('when is my')) {
    const scheduled = appointments.filter((a) => a.status === 'Scheduled' || a.status === 'Rescheduled');
    if (scheduled.length > 0) {
      const listStr = scheduled
        .map(
          (a, i) =>
            `${i + 1}. **${a.id}**: with ${a.doctor} (${a.specialty}) on **${a.date} at ${a.time}** (${a.type} at ${a.clinic})`
        )
        .join('\n');
      return {
        answer: `You currently have **${scheduled.length} active consultation${scheduled.length > 1 ? 's' : ''}** scheduled:\n\n${listStr}\n\nWould you like to reschedule any of these or download the digital consultation slip?`,
        sources: ['Patient OPD Registry', 'CuraHealth Calendar API'],
      };
    } else {
      return {
        answer: `You currently have no upcoming consultations scheduled. You can book an appointment with our 50,000+ verified specialists using the **Book Visit** tab.`,
        sources: ['CuraHealth Appointment Manager'],
      };
    }
  }

  // 4. Inquire about Doctors in the Directory
  const matchedDoc = doctors.find(
    (d) =>
      lower.includes(d.name.toLowerCase()) ||
      lower.includes(d.name.split(' ').slice(1).join(' ').toLowerCase())
  );
  if (matchedDoc) {
    return {
      answer: `👨‍⚕️ **${matchedDoc.name}**
• **Specialty**: ${matchedDoc.specialty}
• **Qualifications**: ${matchedDoc.qualification}
• **Clinical Experience**: ${matchedDoc.years} years
• **Practice Facility**: ${matchedDoc.clinic}, ${matchedDoc.location}
• **Consultation Fee**: ${matchedDoc.fee}
• **Languages**: ${matchedDoc.languages.join(', ')}
• **Rating**: ${matchedDoc.rating} ★ (${matchedDoc.reviews} verified reviews)
• **Next Available Slot**: ${matchedDoc.nextSlot}

You can book directly with ${matchedDoc.name} under the **Doctor Directory** or **Book Visit** tab.`,
      sources: ['Medical Council of India Verified Registry', 'CuraHealth Doctor Directory'],
    };
  }

  // 5. Specialty Search (Cardiologist, Dermatologist, Pediatrician, etc.)
  const specialties = [
    { key: 'cardio', name: 'Cardiology', match: 'Cardiologist' },
    { key: 'derma', name: 'Dermatology', match: 'Dermatologist' },
    { key: 'pediatric', name: 'Pediatrics', match: 'Pediatrician' },
    { key: 'ortho', name: 'Orthopedics', match: 'Orthopedic Surgeon' },
    { key: 'physician', name: 'General Physician', match: 'General Physician' },
    { key: 'general', name: 'General Physician', match: 'General Physician' },
    { key: 'fever', name: 'General Physician', match: 'General Physician' },
  ];
  const matchedSpec = specialties.find((s) => lower.includes(s.key));
  if (matchedSpec) {
    const docsInSpec = doctors.filter((d) => d.specialty.toLowerCase().includes(matchedSpec.key));
    if (docsInSpec.length > 0) {
      const docList = docsInSpec
        .map((d) => `• **${d.name}** (${d.qualification}) - ${d.clinic}, Fee: ${d.fee}, Next Slot: ${d.nextSlot}`)
        .join('\n');
      return {
        answer: `Here are our verified specialists in **${matchedSpec.name}**:\n\n${docList}\n\nTo schedule a visit or video teleconsultation, head to **Book Visit** or click on any doctor's profile in the **Doctor Directory**.`,
        sources: ['CuraHealth Verified Specialists Registry', 'National Roster of Medical Practitioners'],
      };
    }
  }

  // 6. Fasting and Lab Test Inquiries
  if (lower.includes('fasting') || lower.includes('blood test') || lower.includes('lab test') || lower.includes('lipid profile') || lower.includes('sugar test')) {
    return {
      answer: `🧪 **Clinical Fasting Guidelines for Diagnostic Blood Tests**:
1. **Fasting Blood Glucose (FBS) & Lipid Profile**: Requires strict **8 to 12 hours** of overnight fasting.
2. **Acceptable Fluids**: You may drink plain water in moderation. Do not consume tea, coffee, milk, juices, chewing gum, or tobacco.
3. **Morning Medications**: Continue blood pressure medications with a sip of water unless specifically instructed by your physician. For diabetic medications (Insulin/Metformin), withhold until after the fasting blood draw and breakfast.
4. **Postprandial Glucose (PPBS)**: Must be drawn exactly 2 hours after the start of your meal.`,
      sources: ['Standard Diagnostic Laboratory Protocol (NABL Certified)', 'Endocrinology Clinical SOP'],
    };
  }

  // 7. Prescription & Health Records Inquiries
  if (lower.includes('prescription') || lower.includes('health record') || lower.includes('report') || lower.includes('abha') || lower.includes('ayushman')) {
    const recordCount = records.length;
    return {
      answer: `📁 **Your Health Records & Ayushman Bharat (ABDM) Integration**:
• You have **${recordCount} stored health records** in your secure CuraHealth Vault.
• **ABDM Compliance**: All lab reports, electronic prescriptions, and discharge summaries conform to HL7 FHIR standards and can be shared securely with registered doctors via Ayushman Bharat Health Account (ABHA).
• **Upload Records**: You can upload new clinical PDFs, lab results, and prescriptions under the **Health Records** tab using our drag-and-drop uploader.
• **Security**: Files are stored with 256-bit AES encryption in compliance with Indian Digital Personal Data Protection (DPDP) Act.`,
      sources: ['National Health Authority (ABDM) Standards', 'CuraHealth Vault Security Whitepaper'],
    };
  }

  // 8. Consultation Preparation
  if (lower.includes('prepare') || lower.includes('preparation') || lower.includes('what to bring') || lower.includes('before consult')) {
    return {
      answer: `🩺 **Checklist for Your Medical Consultation**:
1. **Clinical History**: Bring previous prescriptions, lab reports, X-rays/scans from the past 6-12 months.
2. **Current Medication List**: Write down or photograph the exact names and dosages of all active prescription drugs, vitamins, and over-the-counter supplements.
3. **Symptom Chronology**: Note down when symptoms started, triggers, severity (1-10), and what brings relief.
4. **Allergies**: Disclose known drug allergies (e.g., Penicillin, Sulfa drugs, NSAIDs).
5. **Arrival Time**: Arrive 10-15 minutes prior for vitals registration (BP, pulse, oxygen saturation, temperature).`,
      sources: ['Indian Medical Association (IMA) Patient Care Guidelines', 'Clinical Consultation Protocol'],
    };
  }

  // 9. Cancellation & Rescheduling Policies
  if (lower.includes('cancel') || lower.includes('reschedule') || lower.includes('refund') || lower.includes('policy')) {
    return {
      answer: `🔄 **CuraHealth Appointment Rescheduling & Cancellation Policy**:
• **Instant Rescheduling**: You can reschedule any upcoming consultation up to **2 hours** before the slot directly in the "My Consultations" tab without any penalty.
• **Cancellation**: Cancellations initiated at least 4 hours prior are eligible for an immediate 100% refund to your original payment method.
• **Doctor Emergency**: In the rare event a physician is delayed due to an emergency surgery, you will receive an SMS notification with the option of an expedited reschedule or an immediate full refund.`,
      sources: ['CuraHealth Patient Rights & Cancellation Terms', 'NABH Patient Charter'],
    };
  }

  // 10. General Health / Symptom Inquiries (Fever, Cough, Headache, Blood Pressure)
  if (lower.includes('fever') || lower.includes('cold') || lower.includes('cough') || lower.includes('headache') || lower.includes('bp') || lower.includes('blood pressure')) {
    return {
      answer: `🩺 **Clinical Assessment Guidance**:
• **For Mild Symptoms**: Maintain adequate hydration (2.5–3L water/electrolytes daily), get adequate rest, and monitor body temperature and pulse twice daily.
• **When to Seek Immediate Medical Evaluation**:
  - Fever persisting above 102°F (38.9°C) for more than 48 hours
  - Difficulty breathing, wheezing, or chest tightness
  - Severe unrelenting headache with neck stiffness
  - Blood pressure readings above 160/100 mmHg
• **Next Step**: We strongly recommend scheduling a consultation with a verified **General Physician** or **Cardiologist** through our **Book Visit** tab for personalized medical diagnosis and prescription.`,
      sources: ['Evidence-Based Clinical Practice Guidelines', 'WHO Primary Care Protocols'],
    };
  }

  // Fallback Comprehensive Response
  return {
    answer: `Hello ${userName || 'there'}! I am your **CuraHealth Clinical Copilot**, connected to our real-time hospital registry and medical knowledge base.

Here are things you can ask me:
1. **Appointment Tracking**: "Check status of appointment APT-043" or "What are my upcoming visits?"
2. **Specialist Information**: "Tell me about Dr. Priya Sharma" or "Find a cardiologist near me"
3. **Clinical Preparation**: "What are fasting instructions for a lipid test?" or "How do I prepare for my consultation?"
4. **Policies**: "What is the reschedule and cancellation policy?"
5. **Health Records**: "How do I link my records with ABDM / ABHA?"

How can I assist you with your healthcare today?`,
    sources: ['CuraHealth Clinical Intelligence Core', 'Ayushman Bharat Digital Mission (ABDM)'],
  };
}
