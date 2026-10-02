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

// Initial sovereign default password hash for '1234' with salt '_shinikenvin_auth_salt_2026'
const INITIAL_DEFAULT_PASSWORD_HASH = '2245e5d514feefecc00d560c8357fefcc337cca7aa048ef7fa22371ba3767d98';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);

  // Check persistent session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Sync active sovereign password hash from Firestore if available
        try {
          const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
          if (adminDoc.exists() && adminDoc.data()?.passwordHash) {
            localStorage.setItem('admin_cached_hash', adminDoc.data()!.passwordHash);
            setIsConfigured(true);
          } else {
            // First time initialization: seed Firestore with 1234
            await setDoc(doc(db, 'admin', 'auth_settings'), {
              email: DEFAULT_ADMIN_EMAIL,
              passwordHash: INITIAL_DEFAULT_PASSWORD_HASH,
              isCustomized: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }, { merge: true });
            localStorage.setItem('admin_cached_hash', INITIAL_DEFAULT_PASSWORD_HASH);
            setIsConfigured(true);
          }
        } catch (dbErr) {
          console.warn('Firestore initial check error (using cached/default hash):', dbErr);
          if (!localStorage.getItem('admin_cached_hash')) {
            localStorage.setItem('admin_cached_hash', INITIAL_DEFAULT_PASSWORD_HASH);
          }
          setIsConfigured(true);
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
      isCustomized: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'admin', 'auth_settings'), authData, { merge: true });
    } catch (e) {
      console.warn('Could not write auth_settings to Firestore (quota or offline):', e);
    }
    
    // Save session & cache hash
    localStorage.setItem('admin_cached_hash', passwordHash);
    const session = { email: DEFAULT_ADMIN_EMAIL, loginTime: Date.now() };
    localStorage.setItem('admin_portfolio_session', JSON.stringify(session));
    setUser({ email: DEFAULT_ADMIN_EMAIL });
    setIsConfigured(true);
  };

  const quickOwnerLogin = async () => {
    // Deprecated for strict sovereign security
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

    // Retrieve active sovereign password hash:
    // 1. Fresh from Firestore
    // 2. Cached in localStorage (if DB is offline/quota)
    // 3. Fallback to initial sovereign password '1234'
    let activePasswordHash: string | null = null;
    try {
      const adminDoc = await getDoc(doc(db, 'admin', 'auth_settings'));
      if (adminDoc.exists() && adminDoc.data()?.passwordHash) {
        activePasswordHash = adminDoc.data()?.passwordHash;
      }
    } catch (dbErr) {
      console.warn('Firestore read error during login (using cached hash):', dbErr);
    }

    if (!activePasswordHash) {
      activePasswordHash = localStorage.getItem('admin_cached_hash');
    }

    if (!activePasswordHash) {
      activePasswordHash = INITIAL_DEFAULT_PASSWORD_HASH;
    }

    // STRICT SOVEREIGN VALIDATION:
    // Accepts EXCLUSIVELY the active password (initial 1234 OR the newly changed password).
    // Once changed, only the changed password is recognized!
    if (passwordHash !== activePasswordHash) {
      throw new Error('Mật khẩu quản trị không chính xác. Vui lòng kiểm tra lại hoặc chọn "Quên mật khẩu?" để khôi phục.');
    }

    // Cache valid active hash
    localStorage.setItem('admin_cached_hash', activePasswordHash);

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
    const newHash = await hashPassword(rawPass);
    
    // Update local cache immediately
    localStorage.setItem('admin_cached_hash', newHash);

    // If remember password was active, update saved password
    if (localStorage.getItem('admin_remember_password') === 'true') {
      localStorage.setItem('admin_saved_password', rawPass);
    }

    // Persist new sovereign password exclusively to Firestore
    try {
      await setDoc(doc(db, 'admin', 'auth_settings'), {
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash: newHash,
        isCustomized: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Could not update password in Firestore (saved locally):', e);
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
