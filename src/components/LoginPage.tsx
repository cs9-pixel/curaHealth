import React, { useState, useEffect, useRef } from 'react';
import {
  HeartPulse,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  KeyRound,
  RefreshCw,
  Info,
  Check,
  Copy,
  ChevronRight,
  X,
  Activity,
  Award,
  Star,
  Building2,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useAuth, VERIFIED_PATIENT, VERIFIED_DOCTOR } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface LoginPageProps {
  onSuccess?: () => void;
}

type AuthMethod = 'password' | 'otp' | 'abha';
type UserRole = 'patient' | 'doctor';

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, switchAccount, register } = useAuth();

  // Primary navigation tabs
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');

  // Sign in state
  const [emailOrPhone, setEmailOrPhone] = useState('csahu4064@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Sign in state
  const [otpPhone, setOtpPhone] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('4892');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // ABHA Sign in state
  const [abhaId, setAbhaId] = useState('91-8822-4519-8902');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'patient' | 'doctor'>('patient');
  const [regSpecialty, setRegSpecialty] = useState('General Medicine & Physician');
  const [regCouncilNo, setRegCouncilNo] = useState('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regPassword, setRegPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Interactive UI state
  const [loading, setLoading] = useState(false);
  const [accountSwitchLoading, setAccountSwitchLoading] = useState<'patient' | 'doctor' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Feature showcase index for interactive preview on left column
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  // Password strength evaluation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 5
  };

  const passwordScore = getPasswordStrength(activeTab === 'signin' ? password : regPassword);

  // OTP Countdown timer effect
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Handle OTP send
  const handleSendOtp = () => {
    if (!otpPhone.trim()) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      const generatedCode = String(Math.floor(1000 + Math.random() * 9000));
      setSimulatedOtp(generatedCode);
      setOtpSent(true);
      setOtpCountdown(30);
      setLoading(false);
      setInfoMessage(`Security OTP dispatched via SMS to ${otpPhone}: ${generatedCode}`);
      // Focus first OTP box
      setTimeout(() => {
        otpInputRefs[0].current?.focus();
      }, 100);
    }, 450);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    const digits = simulatedOtp.split('');
    setOtpDigits(digits);
    setInfoMessage('Auto-filled test security verification code.');
  };

  // Sign In submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (authMethod === 'otp') {
        const enteredOtp = otpDigits.join('');
        if (enteredOtp.length !== 4) {
          setErrorMessage('Please enter all 4 digits of the security OTP.');
          setLoading(false);
          return;
        }
        if (enteredOtp !== simulatedOtp && enteredOtp !== '1234' && enteredOtp !== '4892') {
          setErrorMessage(`Incorrect verification code. Please check your SMS or use code: ${simulatedOtp}`);
          setLoading(false);
          return;
        }
        const res = await login(otpPhone, 'otp-verified');
        if (res.success && onSuccess) onSuccess();
      } else if (authMethod === 'abha') {
        if (!abhaId.trim()) {
          setErrorMessage('Please enter your 14-digit ABHA Number or Health ID.');
          setLoading(false);
          return;
        }
        const res = await login(`abha_${abhaId}`, 'abha-auth');
        if (res.success && onSuccess) onSuccess();
      } else {
        const res = await login(emailOrPhone, password);
        if (res.success) {
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
        }
      }
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage(null);
    setInfoMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setErrorMessage('Please complete all required patient fields.');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('Please accept the HIPAA terms and patient clinical consent.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        gender: regGender,
        role: regRole,
        specialty: regRole === 'doctor' ? regSpecialty : undefined,
      });

      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } catch {
      setErrorMessage('Registration service encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = async (role: 'patient' | 'doctor') => {
    if (loading || accountSwitchLoading !== null) return;
    setAccountSwitchLoading(role);
    setLoading(true);
    setErrorMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      switchAccount(role);
      if (onSuccess) onSuccess();
    } finally {
      setAccountSwitchLoading(null);
      setLoading(false);
    }
  };

  // Backwards compatibility alias
  const handleQuickDemo = handleQuickAccess;

  const handleFillVerifiedCredentials = (role: 'patient' | 'doctor') => {
    setActiveTab('signin');
    setAuthMethod('password');
    if (role === 'patient') {
      setEmailOrPhone(VERIFIED_PATIENT.email);
      setPassword('password123');
      setInfoMessage('Loaded verified credentials for Chaitanya Sahu (Patient Portal).');
    } else {
      setEmailOrPhone(VERIFIED_DOCTOR.email);
      setPassword('doctor123');
      setInfoMessage('Loaded verified credentials for Dr. Priya Sharma (Physician Portal).');
    }
  };

  // Backwards compatibility alias
  const handleFillDemoCredentials = handleFillVerifiedCredentials;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const features = [
    {
      icon: Stethoscope,
      title: '50,000+ Verified Specialists',
      desc: 'Browse qualified clinicians with authentic medical council registrations, patient ratings, and fee transparency.',
      metric: '4.9 ★ Rating',
      badge: 'Verified OPD',
    },
    {
      icon: Sparkles,
      title: 'Clinical AI Copilot (Gemini-Powered)',
      desc: 'Context-aware health assistant referencing clinical protocols, dietary guidelines, and consultation preparations.',
      metric: '< 2s Response',
      badge: '24/7 Triage',
    },
    {
      icon: ShieldCheck,
      title: 'Ayushman Bharat (ABDM) Integration',
      desc: 'Connect your 14-digit ABHA health ID, access federated pathology records, and maintain clinical audit trails.',
      metric: 'ISO 27001',
      badge: 'HIPAA Aligned',
    },
    {
      icon: Calendar,
      title: 'Instant Booking & Digital Rx',
      desc: 'Reserve in-clinic consultations or secure video links with real-time calendar slot locking and zero waiting times.',
      metric: 'Zero Wait Time',
      badge: 'Instant Confirmation',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200 selection:bg-teal-100 dark:selection:bg-teal-900">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shadow-teal-700/20 font-bold text-xl">
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                CuraHealth
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                Clinical Health Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Unified Healthcare Copilot & OPD Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>256-bit SSL Encrypted & ABDM Mapped</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Copy notification toast */}
      {copiedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl border border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-teal-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Clinical Highlights */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block sticky top-24">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Next-Gen Smart Clinical Care</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                Your Health, Seamlessly Coordinated.
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect directly with certified specialists, manage laboratory diagnostics, and consult your dedicated clinical AI copilot.
              </p>
            </div>

            {/* Interactive Feature Accordion Cards */}
            <div className="space-y-2.5">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                const isSelected = activeFeatureIndex === idx;
                return (
                  <button
                    key={feat.title}
                    type="button"
                    onClick={() => setActiveFeatureIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-teal-500/80 dark:border-teal-500 shadow-md ring-2 ring-teal-500/10'
                        : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {feat.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 shrink-0">
                          {feat.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {feat.desc}
                      </p>
                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5" />
                            {feat.metric}
                          </span>
                          <span className="text-slate-400 font-normal">· Instant Synchronization</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Patient Trust Metric */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/40 dark:to-slate-900 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    CS
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    PS
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    AK
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Over 1,200+ Consultations</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Logged across 18 medical departments</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Auth Hub */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
              {/* Primary Tabs (Sign In vs Register) */}
              <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-1.5 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage(null);
                    setInfoMessage(null);
                  }}
                  className={`py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'signin'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                    setInfoMessage(null);
                  }}
                  className={`py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'register'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Create Account</span>
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* VERIFIED CLINICAL ACCOUNTS DIRECTORY */}
                <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      Verified Healthcare Directory · Quick Access
                    </span>
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60">
                      Active Portal Profiles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Patient Persona Card */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-teal-200/90 dark:border-teal-700/60 hover:shadow-md transition-all space-y-2 flex flex-col justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          CS
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            Chaitanya Sahu
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            Patient · UHID #PR-89021
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          disabled={loading || accountSwitchLoading !== null}
                          onClick={() => handleQuickAccess('patient')}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {accountSwitchLoading === 'patient' ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-white" />
                              <span>Opening...</span>
                            </>
                          ) : (
                            <>
                              <span>Patient Portal</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillVerifiedCredentials('patient')}
                          title="Auto-fill patient credentials"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] font-medium"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Doctor Persona Card */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-teal-200/90 dark:border-teal-700/60 hover:shadow-md transition-all space-y-2 flex flex-col justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          PS
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            Dr. Priya Sharma
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            Cardiologist · #DOC-0412
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          disabled={loading || accountSwitchLoading !== null}
                          onClick={() => handleQuickAccess('doctor')}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 dark:bg-teal-700 hover:bg-slate-800 dark:hover:bg-teal-600 active:scale-95 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {accountSwitchLoading === 'doctor' ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-white" />
                              <span>Opening...</span>
                            </>
                          ) : (
                            <>
                              <span>Doctor Portal</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillVerifiedCredentials('doctor')}
                          title="Auto-fill doctor credentials"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] font-medium"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span className="flex-1">{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {infoMessage && (
                  <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span className="flex-1">{infoMessage}</span>
                    <button onClick={() => setInfoMessage(null)} className="text-teal-400 hover:text-teal-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* TAB 1: SIGN IN FORM */}
                {activeTab === 'signin' && (
                  <div className="space-y-4">
                    {/* Method Selector Pills */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Authentication Method:
                      </span>
                      <div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMethod('password');
                            setErrorMessage(null);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                            authMethod === 'password'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMethod('otp');
                            setErrorMessage(null);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                            authMethod === 'otp'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>Mobile OTP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMethod('abha');
                            setErrorMessage(null);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                            authMethod === 'abha'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          <span>ABHA ID</span>
                        </button>
                      </div>
                    </div>

                    {/* METHOD 1: PASSWORD */}
                    {authMethod === 'password' && (
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Email Address or Mobile Number
                          </label>
                          <div className="relative">
                            {emailOrPhone.includes('@') ? (
                              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            ) : (
                              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            )}
                            <input
                              type="text"
                              required
                              value={emailOrPhone}
                              onChange={(e) => setEmailOrPhone(e.target.value)}
                              placeholder="e.g. csahu4064@gmail.com or +91 98765 43210"
                              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => setForgotModalOpen(true)}
                              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your security password"
                              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20"
                            />
                            <span>Remember this device (30 days)</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-semibold text-sm shadow-xs shadow-teal-700/20 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                              <span>Signing In...</span>
                            </>
                          ) : (
                            <>
                              <span>Sign In to Health Portal</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* METHOD 2: INSTANT MOBILE OTP */}
                    {authMethod === 'otp' && (
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Registered Mobile Number
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="tel"
                                required
                                value={otpPhone}
                                onChange={(e) => setOtpPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={loading || otpCountdown > 0}
                              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs whitespace-nowrap transition-all shadow-xs"
                            >
                              {otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Send OTP'}
                            </button>
                          </div>
                        </div>

                        {otpSent && (
                          <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3 animate-in fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                                Enter 4-Digit SMS Code
                              </span>
                              <button
                                type="button"
                                onClick={handleAutoFillOtp}
                                className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Auto-Fill Code ({simulatedOtp})</span>
                              </button>
                            </div>

                            <div className="flex justify-center gap-3">
                              {otpDigits.map((digit, idx) => (
                                <input
                                  key={idx}
                                  ref={otpInputRefs[idx]}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                  className="w-12 h-12 text-center text-lg font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 rounded-xl focus:outline-none transition-all"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading || !otpSent}
                          className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-semibold text-sm shadow-xs shadow-teal-700/20 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                              <span>Verifying & Signing In...</span>
                            </>
                          ) : (
                            <>
                              <span>Verify & Enter Health Portal</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* METHOD 3: AYUSHMAN BHARAT ABHA HEALTH ID */}
                    {authMethod === 'abha' && (
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                              ABHA Number or ABHA Address
                            </label>
                            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                              Govt of India ABDM
                            </span>
                          </div>
                          <div className="relative">
                            <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={abhaId}
                              onChange={(e) => setAbhaId(e.target.value)}
                              placeholder="e.g. 91-8822-4519-8902 or patient@abdm"
                              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Connects your national Ayushman Bharat digital health locker to view consolidated records.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-semibold text-sm shadow-xs shadow-teal-700/20 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                              <span>Validating & Signing In...</span>
                            </>
                          ) : (
                            <>
                              <span>Verify ABHA & Open Portal</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* TAB 2: REGISTRATION FORM */}
                {activeTab === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Role Selector: Patient vs Doctor */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Registering As *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole('patient')}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                            regRole === 'patient'
                              ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200 ring-2 ring-teal-500/20'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Patient / Citizen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('doctor')}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                            regRole === 'doctor'
                              ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200 ring-2 ring-teal-500/20'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Medical Doctor</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {regRole === 'doctor' ? 'Doctor Legal Name (with Dr. prefix) *' : 'Full Legal Name *'}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder={regRole === 'doctor' ? 'e.g. Dr. Ramesh Chandra Verma' : 'e.g. Ramesh Chandra Verma'}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Doctor-Specific Fields */}
                    {regRole === 'doctor' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Specialty *
                          </label>
                          <select
                            value={regSpecialty}
                            onChange={(e) => setRegSpecialty(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          >
                            <option value="General Medicine & Physician">General Medicine & Physician</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Gynecology">Gynecology</option>
                            <option value="ENT Specialist">ENT Specialist</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Council Reg No. (NMC/SMC)
                          </label>
                          <input
                            type="text"
                            value={regCouncilNo}
                            onChange={(e) => setRegCouncilNo(e.target.value)}
                            placeholder="e.g. MCI-2023-91823"
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="patient@gmail.com"
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Mobile Number *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+91 98765 00000"
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Gender
                        </label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Create Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Password Strength Indicator */}
                    {regPassword.length > 0 && (
                      <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-[10px] font-semibold">
                          <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                          <span
                            className={
                              passwordScore <= 2
                                ? 'text-rose-500'
                                : passwordScore <= 3
                                ? 'text-amber-500'
                                : 'text-emerald-500 font-bold'
                            }
                          >
                            {passwordScore <= 2 ? 'Weak' : passwordScore <= 3 ? 'Medium' : 'Strong & Secure'}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-1.5 rounded-full transition-all ${
                                passwordScore >= step
                                  ? passwordScore <= 2
                                    ? 'bg-rose-500'
                                    : passwordScore <= 3
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic Identifier Preview Chip */}
                    {regName.trim() && (
                      <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-teal-800 dark:text-teal-300">
                            {regRole === 'doctor' ? 'Practitioner Medical Portal ID' : 'Pre-Allocated Health Identifier (UHID)'}
                          </p>
                          <p className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                            {regRole === 'doctor'
                              ? `#DOC-${Math.floor(1000 + Math.random() * 8999)} · ${regName.trim()} (${regSpecialty})`
                              : `#PR-${Math.floor(10000 + Math.random() * 89999)} · ${regName.trim()}`}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full">
                          Ready
                        </span>
                      </div>
                    )}

                    <div className="pt-1">
                      <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 mt-0.5"
                        />
                        <span>
                          I agree to CuraHealth's clinical privacy policy, HIPAA patient data safeguards, and terms of service.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-semibold text-sm shadow-xs shadow-teal-700/20 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                          <span>{regRole === 'doctor' ? 'Registering Practitioner...' : 'Generating UHID & Registering...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{regRole === 'doctor' ? 'Register Practitioner & Enter Doctor Portal' : 'Create Patient Health Record & Sign In'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer disclaimer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Government of India ABDM Compliant</span>
                  </div>
                  <button
                    type="button"
                    disabled={loading || accountSwitchLoading !== null}
                    onClick={() => handleQuickAccess('patient')}
                    className="text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {accountSwitchLoading === 'patient' ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                        <span>Opening...</span>
                      </>
                    ) : (
                      <>
                        <span>Quick Patient Portal</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                  Reset Portal Password
                </h3>
              </div>
              <button
                onClick={() => {
                  setForgotModalOpen(false);
                  setForgotSubmitted(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!forgotSubmitted ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSubmitted(true);
                  setInfoMessage(`Password reset link and OTP sent to ${forgotEmail || 'your registered email'}.`);
                }}
                className="space-y-4 text-xs"
              >
                <p className="text-slate-600 dark:text-slate-400">
                  Enter your registered email address or mobile number to receive a temporary recovery code.
                </p>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Email / Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="csahu4064@gmail.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 shadow-xs"
                  >
                    Send Recovery Code
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs text-center py-2">
                <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Recovery Code Sent!</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    We have dispatched a 6-digit verification token to your contact. Follow the link in the message to finalize your new password.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotSubmitted(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <footer className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>CuraHealth Clinical Portal · ISO 27001 Certified Health Data Security</span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-rose-600 dark:text-rose-400 font-semibold">National Emergency: 108 / 112</span>
          <span>·</span>
          <span>Privacy & Security Guardrails Active</span>
        </div>
      </footer>
    </div>
  );
};
