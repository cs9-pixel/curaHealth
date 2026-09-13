# CuraHealth

**CuraHealth** is a modern, responsive clinical healthcare portal and medical consultation copilot. Designed for patients, doctors, and healthcare administrators, CuraHealth provides digital appointment booking, electronic health records management, doctor directory browsing, and an intelligent AI clinical triage copilot.

---

## 🌟 Key Features

### 1. 🏥 Patient Clinical Dashboard

- **Patient Overview:** Real-time consultation countdown, upcoming doctor appointments, and vital metrics.
- **Quick Clinical Actions:** Instant 1-click access to book appointments, upload medical reports, consult the AI assistant, or emergency medical hotlines.
- **Recent Medical Activity:** View prescriptions, consultation slips, and physician notes at a glance.

### 2. 🤖 Intelligent Clinical AI Copilot

- **Medical Consultation Assistant:** Triage symptoms, clarify diagnostic questions, and receive reliable healthcare guidance with source citations.
- **Emergency Triage Alerting:** Automatically detects critical symptoms (e.g., chest pain, acute respiratory distress) and displays immediate national emergency helpline guidelines.
- **Appointment Lookup:** Query appointment IDs (e.g., `APT-001`) to retrieve real-time consultation status, instructions, and clinic locations.
- **Prescription & Medication Guidance:** Inquire about medication schedules, interactions, and dietary recommendations.

### 3. 📅 Appointment Scheduling & Consultations

- **Doctor Booking:** Browse verified physicians by specialty (Cardiology, Neurology, Pediatrics, Orthopedics, Dermatology, etc.).
- **Slot Selection:** Choose consultation mode (In-Person OPD or Telehealth Video), pick dates and times, and enter clinical reasons.
- **Digital Consultation Slips:** Download standardized consultation receipts and appointment confirmations directly.

### 4. 📂 Digital Health Records & Reports

- **Electronic Health Records (EHR):** Store lab reports, prescriptions, radiology scans, and discharge summaries.
- **Interactive Record Viewer:** Preview report summaries, diagnostic metrics, and doctor observations in a modal.
- **Secure Upload:** Drag-and-drop or file selection for PDF, JPG, and PNG records with metadata tagging.

### 5. 🔍 Global Search & Navigation

- **Command Palette (`⌘K` / `Ctrl+K`):** Rapid search across doctors, appointments, medical records, and clinical FAQs.
- **Theme Support:** Seamless Light and Dark mode with custom clinical color palettes.
- **Multi-Device Responsive:** Optimized for desktop monitors, laptops, tablets, and mobile smartphones.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Motion](https://motion.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **AI Integration:** [@google/genai](https://www.npmjs.com/package/@google/genai) SDK for Google Gemini
- **Typography:** Plus Jakarta Sans & Outfit (Google Fonts)

---

## 📁 Project Structure

```text
├── public/                  # Static assets and favicons
├── src/
│   ├── components/          # Modular UI views and dialogs
│   │   ├── AppointmentsView.tsx       # Consultations schedule & cancellation
│   │   ├── AssistantView.tsx           # Clinical AI assistant conversation interface
│   │   ├── BookAppointmentView.tsx     # Multi-step booking form
│   │   ├── DoctorsDirectoryView.tsx    # Filterable specialist physician directory
│   │   ├── GlobalSearchModal.tsx       # ⌘K Command palette search
│   │   ├── HealthRecordsView.tsx       # EHR records, lab reports, & filtering
│   │   ├── HomeView.tsx                # Patient dashboard & health stats
│   │   ├── LoginPage.tsx               # Patient/Doctor portal authentication
│   │   ├── RecordPreviewModal.tsx      # Detailed document inspection modal
│   │   ├── Sidebar.tsx                 # Desktop navigation & collapse controls
│   │   ├── ThemeToggle.tsx             # Light/Dark mode switcher
│   │   ├── ToastContainer.tsx           # Notification toast alerts
│   │   ├── Topbar.tsx                  # Header with time, status, and profile
│   │   └── UploadRecordModal.tsx        # Document upload modal with validation
│   ├── context/
│   │   └── AuthContext.tsx              # User session, role state & demo profiles
│   ├── data/
│   │   └── mockData.ts                  # Sample doctors, appointments, & records
│   ├── services/
│   │   └── clinicalAI.ts                # Triage logic, emergency checks & AI routing
│   ├── utils/
│   │   └── downloadUtils.ts             # Prescription & consultation slip generators
│   ├── types.ts                          # Central TypeScript data interfaces
│   ├── App.tsx                           # Root application layout & route state
│   ├── main.tsx                          # React DOM entry point
│   └── index.css                         # Tailwind CSS imports & theme definitions
├── .env.example                          # Sample environment variables
├── index.html                            # HTML shell with meta tags & web fonts
├── package.json                          # Node.js dependencies & scripts
├── tsconfig.json                         # TypeScript configuration
└── vite.config.ts                        # Vite configuration
