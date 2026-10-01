import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface AdminUser {
  email: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickOwnerLogin: () => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ code: string; email: string }>;
  verifyResetCodeAndChangePassword: (code: string, newPass: string) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to hash passwords using standard browser SubtleCrypto SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_shinikenvin_auth_salt_2026");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const DEFAULT_ADMIN_EMAIL = 'Shinikenvin@gmail.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  // Check persistent session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if admin is configured in Firestore
        const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
        const exists = adminDoc.exists() && !!adminDoc.data()?.passwordHash;
        setIsConfigured(exists);

        if (!exists) {
          localStorage.removeItem('admin_portfolio_session');
          setUser(null);
          return;
        }

        // Check local session
        const savedSession = localStorage.getItem('admin_portfolio_session');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.email && parsed.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
              setUser({ email: DEFAULT_ADMIN_EMAIL });
            } else {
              localStorage.removeItem('admin_portfolio_session');
              setUser(null);
            }
          } catch {
            localStorage.removeItem('admin_portfolio_session');
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (email: string, pass: string) => {
    const rawPass = (pass || '').trim();
    if (!rawPass || rawPass.length < 4) {
      throw new Error('Mật khẩu quản trị phải có ít nhất 4 ký tự.');
    }
    const adminEmail = (email || '').trim().toLowerCase() || DEFAULT_ADMIN_EMAIL.toLowerCase();
    if (adminEmail !== DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Chỉ email quản trị viên ủy quyền (${DEFAULT_ADMIN_EMAIL}) mới được phép tạo tài khoản.`);
    }

    const passwordHash = await hashPassword(rawPass);

    const authData = {
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'admin', 'auth_settings'), authData);
    
    // Save session
    const session = { email: DEFAULT_ADMIN_EMAIL, loginTime: Date.now() };
    localStorage.setItem('admin_portfolio_session', JSON.stringify(session));
    setUser({ email: DEFAULT_ADMIN_EMAIL });
    setIsConfigured(true);
  };

  const quickOwnerLogin = async () => {
    // Deprecated for strict security
  };

  const login = async (email: string, pass: string) => {
    const rawPass = (pass || '').trim();
    if (!rawPass) {
      throw new Error('Vui lòng nhập mật khẩu quản trị.');
    }

    const adminEmail = (email || '').trim().toLowerCase() || DEFAULT_ADMIN_EMAIL.toLowerCase();
    if (adminEmail !== DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Email quản trị không đúng. Chỉ chấp nhận tài khoản ${DEFAULT_ADMIN_EMAIL}.`);
    }

    const passwordHash = await hashPassword(rawPass);

    const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));

    // If admin is not initialized yet
    if (!adminDoc.exists() || !adminDoc.data()?.passwordHash) {
      throw new Error('Hệ thống chưa được khởi tạo tài khoản quản trị. Vui lòng bấm sang tab "Khởi tạo tài khoản Admin" để thiết lập mật khẩu đầu tiên.');
    }

    const data = adminDoc.data();
    
    // STRICT VALIDATION: Password hash MUST match exactly!
    if (data.passwordHash !== passwordHash) {
      throw new Error('Mật khẩu quản trị không chính xác. Vui lòng kiểm tra lại hoặc chọn "Quên mật khẩu?" để khôi phục.');
    }

    // Success - establish persistent admin session
    const session = { email: DEFAULT_ADMIN_EMAIL, loginTime: Date.now() };
    localStorage.setItem('admin_portfolio_session', JSON.stringify(session));
    setUser({ email: DEFAULT_ADMIN_EMAIL });
    setIsConfigured(true);
  };

  const logout = async () => {
    localStorage.removeItem('admin_portfolio_session');
    if (localStorage.getItem('admin_remember_password') !== 'true') {
      localStorage.removeItem('admin_saved_password');
      localStorage.removeItem('admin_saved_email');
    }
    setUser(null);
  };

  const changePassword = async (newPass: string) => {
    const rawPass = (newPass || '').trim();
    if (!rawPass || rawPass.length < 4) {
      throw new Error('Mật khẩu mới phải có ít nhất 4 ký tự.');
    }
    const passwordHash = await hashPassword(rawPass);
    await updateDoc(doc(db, 'admin', 'auth_settings'), {
      passwordHash,
      updatedAt: new Date().toISOString(),
    });
  };

  const resetPassword = async (email: string) => {
    const targetEmail = (email || '').trim().toLowerCase() || DEFAULT_ADMIN_EMAIL.toLowerCase();
    if (targetEmail !== DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Chỉ hỗ trợ khôi phục mật khẩu cho email quản trị ${DEFAULT_ADMIN_EMAIL}.`);
    }

    const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
    if (!adminDoc.exists() || !adminDoc.data()?.passwordHash) {
      throw new Error('Hệ thống chưa có tài khoản admin. Vui lòng chọn "Khởi tạo tài khoản Admin".');
    }

    // Generate a secure 6-digit recovery PIN
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    await setDoc(doc(db, 'admin', 'auth_settings'), {
      resetCode,
      resetCodeExpiry: expiry,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return { code: resetCode, email: DEFAULT_ADMIN_EMAIL };
  };

  const verifyResetCodeAndChangePassword = async (code: string, newPass: string) => {
    const rawCode = (code || '').trim();
    const rawPass = (newPass || '').trim();

    if (!rawCode) {
      throw new Error('Vui lòng nhập mã xác thực gồm 6 số.');
    }
    if (!rawPass || rawPass.length < 4) {
      throw new Error('Mật khẩu mới phải có ít nhất 4 ký tự.');
    }

    const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
    if (!adminDoc.exists()) {
      throw new Error('Chưa thiết lập tài khoản admin.');
    }

    const data = adminDoc.data();
    if (!data.resetCode || data.resetCode !== rawCode) {
      throw new Error('Mã xác thực khôi phục mật khẩu không chính xác.');
    }

    if (data.resetCodeExpiry && Date.now() > data.resetCodeExpiry) {
      throw new Error('Mã xác thực đã hết hạn (quá 15 phút). Vui lòng yêu cầu mã mới.');
    }

    const passwordHash = await hashPassword(rawPass);
    await updateDoc(doc(db, 'admin', 'auth_settings'), {
      passwordHash,
      resetCode: null,
      resetCodeExpiry: null,
      updatedAt: new Date().toISOString(),
    });

    // Auto login
    const session = { email: DEFAULT_ADMIN_EMAIL, loginTime: Date.now() };
    localStorage.setItem('admin_portfolio_session', JSON.stringify(session));
    setUser({ email: DEFAULT_ADMIN_EMAIL });
    setIsConfigured(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin: !!user,
      isConfigured,
      login,
      quickOwnerLogin,
      register,
      logout,
      changePassword,
      resetPassword,
      verifyResetCodeAndChangePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
