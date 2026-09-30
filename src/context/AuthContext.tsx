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
        if (adminDoc.exists()) {
          setIsConfigured(true);
        }

        // Check local session
        const savedSession = localStorage.getItem('admin_portfolio_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.email) {
            setUser({ email: parsed.email });
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
    if (!pass || pass.length < 6) {
      throw new Error('Mật khẩu quản trị phải có ít nhất 6 ký tự.');
    }
    const adminEmail = email.trim() || DEFAULT_ADMIN_EMAIL;
    const passwordHash = await hashPassword(pass);

    const authData = {
      email: adminEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'admin', 'auth_settings'), authData);
    
    // Save session
    const session = { email: adminEmail, loginTime: Date.now() };
    localStorage.setItem('admin_portfolio_session', JSON.stringify(session));
    setUser({ email: adminEmail });
    setIsConfigured(true);
  };

  const login = async (email: string, pass: string) => {
    const adminEmail = email.trim() || DEFAULT_ADMIN_EMAIL;
    const passwordHash = await hashPassword(pass);

    let adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));

    // If never initialized yet, initialize right now with this password
    if (!adminDoc.exists()) {
      await register(adminEmail, pass);
      return;
    }

    const data = adminDoc.data();
    if (data?.passwordHash !== passwordHash) {
      throw new Error('Mật khẩu quản trị không chính xác. Vui lòng thử lại hoặc chọn Quên mật khẩu.');
    }

    // Success
    const session = { email: adminEmail, loginTime: Date.now() };
    localStorage.setItem('admin_portfolio_session', JSON.stringify(session));
    setUser({ email: adminEmail });
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
    if (!newPass || newPass.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }
    const passwordHash = await hashPassword(newPass);
    await updateDoc(doc(db, 'admin', 'auth_settings'), {
      passwordHash,
      updatedAt: new Date().toISOString(),
    });
  };

  const resetPassword = async (email: string) => {
    const targetEmail = email.trim() || DEFAULT_ADMIN_EMAIL;
    
    // Generate a secure 6-digit recovery PIN
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    await setDoc(doc(db, 'admin', 'auth_settings'), {
      email: targetEmail,
      resetCode,
      resetCodeExpiry: expiry,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return { code: resetCode, email: targetEmail };
  };

  const verifyResetCodeAndChangePassword = async (code: string, newPass: string) => {
    if (!newPass || newPass.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
    if (!adminDoc.exists()) {
      throw new Error('Chưa thiết lập tài khoản admin.');
    }

    const data = adminDoc.data();
    if (!data.resetCode || data.resetCode !== code.trim()) {
      throw new Error('Mã xác thực khôi phục mật khẩu không đúng hoặc đã hết hạn.');
    }

    if (data.resetCodeExpiry && Date.now() > data.resetCodeExpiry) {
      throw new Error('Mã xác thực đã hết hạn (quá 15 phút). Vui lòng yêu cầu mã mới.');
    }

    const passwordHash = await hashPassword(newPass);
    await updateDoc(doc(db, 'admin', 'auth_settings'), {
      passwordHash,
      resetCode: null,
      resetCodeExpiry: null,
      updatedAt: new Date().toISOString(),
    });

    // Auto login
    const session = { email: data.email || DEFAULT_ADMIN_EMAIL, loginTime: Date.now() };
    localStorage.setItem('admin_portfolio_session', JSON.stringify(session));
    setUser({ email: data.email || DEFAULT_ADMIN_EMAIL });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin: !!user,
      isConfigured,
      login,
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
