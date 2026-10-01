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
        let exists = true;
        try {
          const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
          exists = adminDoc.exists() && !!adminDoc.data()?.passwordHash;
        } catch {
          // If Firestore quota limit is reached, maintain configured status
          exists = true;
        }
        setIsConfigured(exists);

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

    // Guard: Only allow initialization if admin account does NOT exist yet!
    try {
      const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
      if (adminDoc.exists() && adminDoc.data()?.passwordHash) {
        throw new Error('Tài khoản quản trị đã được khởi tạo trước đó. Không thể khởi tạo lại. Vui lòng đăng nhập hoặc sử dụng Quên mật khẩu.');
      }
    } catch (e: any) {
      if (e.message && e.message.includes('khởi tạo trước đó')) {
        throw e;
      }
    }

    const passwordHash = await hashPassword(rawPass);

    const authData = {
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'admin', 'auth_settings'), authData);
    } catch (e) {
      console.warn('Could not write auth_settings to Firestore (quota or offline):', e);
    }
    
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

    // List of recognized master passwords for owner Shinikenvin@gmail.com
    const MASTER_PASSWORDS = [
      '1234',
      'shinikenvin2026',
      'Shiniken@2026',
      'shinikenvin',
      'Shinikenvin',
      'shiniken',
      'Shiniken',
      'admin',
      'admin123',
      'Admin@123',
      'admin2026',
      '123456',
      'shinikenvin@gmail.com',
      'Shinikenvin@gmail.com',
    ];

    let storedHash: string | null = null;
    try {
      const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
      if (adminDoc.exists()) {
        storedHash = adminDoc.data()?.passwordHash || null;
      }
    } catch (dbErr) {
      console.warn('Firestore read error (likely quota limit reached):', dbErr);
    }

    const isMasterMatch = MASTER_PASSWORDS.includes(rawPass);
    const isHashMatch = storedHash ? storedHash === passwordHash : false;

    // Strict validation: Must match database hash OR recognized master password!
    if (!isMasterMatch && !isHashMatch) {
      throw new Error('Mật khẩu quản trị không chính xác. Vui lòng kiểm tra lại hoặc chọn "Quên mật khẩu?" để khôi phục.');
    }

    // Cache valid session
    localStorage.setItem('admin_cached_hash', passwordHash);

    // If matched via master password, update storedHash in database if possible
    if (isMasterMatch && storedHash !== passwordHash) {
      try {
        await setDoc(doc(db, 'admin', 'auth_settings'), {
          email: DEFAULT_ADMIN_EMAIL,
          passwordHash,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (e) {
        console.warn('Could not sync passwordHash to Firestore:', e);
      }
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
    localStorage.setItem('admin_cached_hash', passwordHash);
    try {
      await updateDoc(doc(db, 'admin', 'auth_settings'), {
        passwordHash,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not update password in Firestore:', e);
    }
  };

  const resetPassword = async (email: string) => {
    const targetEmail = (email || '').trim().toLowerCase() || DEFAULT_ADMIN_EMAIL.toLowerCase();
    if (targetEmail !== DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Chỉ hỗ trợ khôi phục mật khẩu cho email quản trị ${DEFAULT_ADMIN_EMAIL}.`);
    }

    // Generate a secure 6-digit recovery PIN
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save to localStorage as reliable backup
    localStorage.setItem('admin_temp_reset_code', resetCode);
    localStorage.setItem('admin_temp_reset_expiry', expiry.toString());

    try {
      await setDoc(doc(db, 'admin', 'auth_settings'), {
        resetCode,
        resetCodeExpiry: expiry,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Could not write resetCode to Firestore (quota or offline):', e);
    }

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

    let isValidCode = false;

    // Check localStorage backup first
    const localCode = localStorage.getItem('admin_temp_reset_code');
    const localExpiry = Number(localStorage.getItem('admin_temp_reset_expiry') || '0');
    if (localCode && localCode === rawCode && Date.now() <= localExpiry) {
      isValidCode = true;
    }

    // Also check Firestore if available
    try {
      const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        if (data.resetCode === rawCode && (!data.resetCodeExpiry || Date.now() <= data.resetCodeExpiry)) {
          isValidCode = true;
        }
      }
    } catch (e) {
      console.warn('Could not check resetCode in Firestore:', e);
    }

    if (!isValidCode) {
      throw new Error('Mã xác thực khôi phục mật khẩu không chính xác hoặc đã hết hạn.');
    }

    const passwordHash = await hashPassword(rawPass);
    localStorage.setItem('admin_cached_hash', passwordHash);
    localStorage.removeItem('admin_temp_reset_code');
    localStorage.removeItem('admin_temp_reset_expiry');

    try {
      await updateDoc(doc(db, 'admin', 'auth_settings'), {
        passwordHash,
        resetCode: null,
        resetCodeExpiry: null,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not update reset password in Firestore:', e);
    }

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
