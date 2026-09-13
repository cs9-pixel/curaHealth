import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

export interface StoredUserAccount extends UserProfile {
  password?: string;
  specialty?: string;
  qualification?: string;
  registeredAt?: string;
}

export const VERIFIED_PATIENT: StoredUserAccount = {
  id: 'usr_pat_89021',
  name: 'Chaitanya Sahu',
  email: 'csahu4064@gmail.com',
  phone: '+91 98765 43210',
  uhid: '#PR-89021',
  role: 'patient',
  avatarText: 'CS',
  bloodGroup: 'B+',
  gender: 'Male',
  age: 28,
  password: 'password123',
  registeredAt: '2025-01-15',
};

export const VERIFIED_DOCTOR: StoredUserAccount = {
  id: 'usr_doc_0412',
  name: 'Dr. Priya Sharma',
  email: 'dr.priya@curahealth.com',
  phone: '+91 98111 22334',
  uhid: '#DOC-0412',
  role: 'doctor',
  avatarText: 'PS',
  bloodGroup: 'O+',
  gender: 'Female',
  age: 41,
  password: 'doctor123',
  specialty: 'Cardiology & Internal Medicine',
  qualification: 'MBBS, MD (Cardiology) - AIIMS New Delhi',
  registeredAt: '2024-06-10',
};

// Aliases for compatibility
export const DEMO_PATIENT = VERIFIED_PATIENT;
export const DEMO_DOCTOR = VERIFIED_DOCTOR;

export const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  VERIFIED_PATIENT,
  VERIFIED_DOCTOR,
];

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  registeredAccounts: StoredUserAccount[];
  login: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (type: 'patient' | 'doctor') => void;
  switchAccount: (roleOrId: string) => void;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role?: 'patient' | 'doctor';
    gender?: 'Male' | 'Female' | 'Other';
    specialty?: string;
    age?: number;
    bloodGroup?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REGISTRY_KEY = 'cura_clinical_user_registry';
const CURRENT_USER_KEY = 'cura_auth_user';
const LOGOUT_FLAG_KEY = 'cura_auth_logged_out';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or initialize persistent user registry
  const [registeredAccounts, setRegisteredAccounts] = useState<StoredUserAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(REGISTRY_KEY) || localStorage.getItem('practo_clinical_user_registry');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // Fallback to defaults
        }
      }
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    }
    return DEFAULT_ACCOUNTS;
  });

  // Current session user
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const explicitLogout = localStorage.getItem(LOGOUT_FLAG_KEY) || localStorage.getItem('practo_auth_logged_out');
      if (explicitLogout === 'true') {
        return null;
      }
      const saved = localStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem('practo_auth_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return VERIFIED_PATIENT;
        }
      }
      return VERIFIED_PATIENT;
    }
    return VERIFIED_PATIENT;
  });

  // Keep localStorage in sync with user state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.removeItem(LOGOUT_FLAG_KEY);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.setItem(LOGOUT_FLAG_KEY, 'true');
      }
    }
  }, [user]);

  // Keep localStorage registry in sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(registeredAccounts));
    }
  }, [registeredAccounts]);

  const login = async (
    emailOrPhone: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((res) => setTimeout(res, 450));

    const input = emailOrPhone.trim().toLowerCase();
    if (!input) {
      return { success: false, error: 'Please enter your registered email address or mobile number.' };
    }

    // Check against persistent registry
    const found = registeredAccounts.find(
      (acc) =>
        acc.email.toLowerCase() === input ||
        acc.phone.replace(/[\s-]/g, '') === input.replace(/[\s-]/g, '') ||
        acc.uhid.toLowerCase() === input
    );

    if (found) {
      // Validate password if user set one
      if (password && password !== 'otp-verified' && password !== 'abha-auth') {
        if (found.password && found.password !== password) {
          return {
            success: false,
            error: 'Incorrect security password. Please check your credentials or reset your password.',
          };
        }
      }
      setUser(found);
      return { success: true };
    }

    // If logging in with OTP or ABHA and not found, auto-create a real profile
    if (password === 'otp-verified' || password === 'abha-auth') {
      const isPhone = /^\+?\d[\d\s-]{8,}$/.test(input);
      const isAbha = input.startsWith('abha_') || input.includes('-');
      const initials = isAbha ? 'AB' : 'PT';
      
      const newAcc: StoredUserAccount = {
        id: `usr_${Date.now()}`,
        name: isAbha ? 'Ayushman Bharat Beneficiary' : `Patient ${input.slice(-4)}`,
        email: isPhone ? `patient_${input.replace(/\D/g, '').slice(-6)}@curahealth.com` : input,
        phone: isPhone ? input : '+91 98765 43210',
        uhid: `#CR-${Math.floor(10000 + Math.random() * 90000)}`,
        role: 'patient',
        avatarText: initials,
        bloodGroup: 'B+',
        gender: 'Male',
        age: 28,
        registeredAt: new Date().toISOString().split('T')[0],
      };

      setRegisteredAccounts((prev) => [...prev, newAcc]);
      setUser(newAcc);
      return { success: true };
    }

    // If email contains doctor keywords, match doctor
    if (input.includes('priya') || input.includes('dr.') || input.includes('doctor')) {
      setUser(VERIFIED_DOCTOR);
      return { success: true };
    }

    // Dynamic registered account creation for real world usage
    let initials = 'U';
    const emailPrefix = (input || '').split('@')[0] || '';
    const parts = emailPrefix.split('.');
    if (parts.length > 1 && parts[0] && parts[1]) {
      initials = ((parts[0][0] || '') + (parts[1][0] || '')).toUpperCase() || 'U';
    } else if (parts[0] && parts[0].length >= 2) {
      initials = parts[0].slice(0, 2).toUpperCase();
    } else if (parts[0] && parts[0].length === 1) {
      initials = parts[0].toUpperCase();
    }

    const newAcc: StoredUserAccount = {
      id: `usr_${Date.now()}`,
      name: (emailPrefix || 'User').replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      email: input.includes('@') ? input : `${input}@curahealth.com`,
      phone: input.startsWith('+') || /^\d+$/.test(input) ? input : '+91 98765 43210',
      uhid: `#CR-${Math.floor(10000 + Math.random() * 90000)}`,
      role: 'patient',
      avatarText: initials,
      bloodGroup: 'B+',
      gender: 'Male',
      age: 29,
      password: password || 'password123',
      registeredAt: new Date().toISOString().split('T')[0],
    };

    setRegisteredAccounts((prev) => [...prev, newAcc]);
    setUser(newAcc);
    return { success: true };
  };

  const switchAccount = (roleOrId: string) => {
    if (roleOrId === 'doctor') {
      setUser(VERIFIED_DOCTOR);
      return;
    }
    if (roleOrId === 'patient') {
      setUser(VERIFIED_PATIENT);
      return;
    }
    const found = registeredAccounts.find((a) => a.id === roleOrId || a.role === roleOrId);
    if (found) {
      setUser(found);
    }
  };

  const loginAsDemo = (type: 'patient' | 'doctor') => {
    switchAccount(type);
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role?: 'patient' | 'doctor';
    gender?: 'Male' | 'Female' | 'Other';
    specialty?: string;
    age?: number;
    bloodGroup?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    await new Promise((res) => setTimeout(res, 500));

    if (!data.name.trim() || !data.email.trim() || !data.phone.trim()) {
      return { success: false, error: 'Please enter your full name, email, and phone number.' };
    }

    // Check duplicate email in registry
    const existing = registeredAccounts.find(
      (a) => a.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (existing) {
      // If existing with same credentials, sign in
      setUser(existing);
      return { success: true };
    }

    const initials = (data.name || '')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

    const role = data.role || 'patient';
    const uhidPrefix = role === 'doctor' ? '#DOC-' : '#PR-';

    const newUser: StoredUserAccount = {
      id: `usr_${role}_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      uhid: `${uhidPrefix}${Math.floor(10000 + Math.random() * 90000)}`,
      role,
      avatarText: initials,
      bloodGroup: data.bloodGroup || 'O+',
      gender: data.gender || 'Male',
      age: data.age || (role === 'doctor' ? 38 : 28),
      password: data.password || 'password123',
      specialty: data.specialty || (role === 'doctor' ? 'General Medicine & Family Physician' : undefined),
      registeredAt: new Date().toISOString().split('T')[0],
    };

    setRegisteredAccounts((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    setRegisteredAccounts((prev) =>
      prev.map((acc) => (acc.id === user.id ? { ...acc, ...data } : acc))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        registeredAccounts,
        login,
        loginAsDemo,
        switchAccount,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: VERIFIED_PATIENT,
      isAuthenticated: true,
      registeredAccounts: DEFAULT_ACCOUNTS,
      login: async () => ({ success: true }),
      loginAsDemo: () => {},
      switchAccount: () => {},
      register: async () => ({ success: true }),
      logout: () => {},
      updateProfile: () => {},
    };
  }
  return context;
};
