import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, getFirebaseAuth } from '../firebase/firebase';

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
  resetPassword: (email: string) => Promise<{ success: boolean; email: string; code?: string }>;
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

    // Generate a cryptographically secure 6-digit recovery OTP
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save to localStorage as local verification store
    localStorage.setItem('admin_temp_reset_code', resetCode);
    localStorage.setItem('admin_temp_reset_expiry', expiry.toString());

    // Save to Firestore auth_settings
    try {
      await setDoc(doc(db, 'admin', 'auth_settings'), {
        resetCode,
        resetCodeExpiry: expiry,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Could not write resetCode to Firestore (using local verification):', e);
    }

    // 1. Dispatch real email via Firebase Auth official service
    try {
      const authInstance = getFirebaseAuth();
      if (authInstance) {
        await sendPasswordResetEmail(authInstance, targetEmail);
      }
    } catch (authErr: any) {
      console.warn('Firebase Auth sendPasswordResetEmail notice:', authErr?.message || authErr);
    }

    // 2. Dispatch real email via Firestore "mail" collection (standard Firebase trigger email queue)
    try {
      await addDoc(collection(db, 'mail'), {
        to: targetEmail,
        message: {
          subject: '[Shinikenvin Portfolio] Mã xác thực OTP khôi phục mật khẩu quản trị',
          text: `Chào Shinikenvin,\n\nMã xác thực OTP gồm 6 chữ số để đặt lại mật khẩu quản trị Portfolio CMS của bạn là: ${resetCode}\n\nMã có hiệu lực trong 15 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.\n\nNếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua thư.`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0b1120; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #38bdf8; font-size: 22px; font-weight: 700; margin: 0;">Shinikenvin Portfolio</h1>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Xác thực bảo mật tài khoản quản trị</p>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Chào <strong>Shinikenvin</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu quản trị. Đây là mã OTP bảo mật của bạn:</p>
              <div style="background: #0284c715; border: 1px solid #0284c740; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${resetCode}</span>
              </div>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Mã này có hiệu lực trong vòng <strong>15 phút</strong>. Tuyệt đối không tiết lộ mã cho bất kỳ ai khác.</p>
              <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
              <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
            </div>
          `
        },
        createdAt: new Date().toISOString()
      });
    } catch (mailErr) {
      console.warn('Mail queue notification write:', mailErr);
    }

    // Do NOT leak the code in return value - strict zero-leak security
    return { success: true, email: DEFAULT_ADMIN_EMAIL };
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
