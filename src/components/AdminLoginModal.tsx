import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Shield, ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, 
  KeyRound, UserCheck, Check, Send, Eye, EyeOff, Zap, Trash2, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const { login, register, resetPassword, verifyResetCodeAndChangePassword, isConfigured } = useAuth();
  
  // Saved credentials state - strictly default to FALSE
  const [savedPasswordExists, setSavedPasswordExists] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify_otp'>('login');
  const [email, setEmail] = useState('Shinikenvin@gmail.com');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedForOpenRef = useRef(false);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Initialize ONLY once when modal opens, NEVER wiping user typed input on re-renders
  useEffect(() => {
    if (isOpen) {
      if (!hasInitializedForOpenRef.current) {
        hasInitializedForOpenRef.current = true;
        setError(null);
        setSuccessMsg(null);
        setOtpCode('');
        setNewPassword('');

        if (typeof window !== 'undefined') {
          const rememberPref = localStorage.getItem('admin_remember_password') === 'true';
          setRememberPassword(rememberPref);

          if (rememberPref) {
            const savedEmail = localStorage.getItem('admin_saved_email');
            const savedPass = localStorage.getItem('admin_saved_password');
            if (savedEmail) {
              setEmail(savedEmail);
              if (emailInputRef.current) emailInputRef.current.value = savedEmail;
            }
            if (savedPass) {
              setPassword(savedPass);
              if (passwordInputRef.current) passwordInputRef.current.value = savedPass;
              setSavedPasswordExists(true);
            }
          } else {
            if (passwordInputRef.current) passwordInputRef.current.value = '';
          }
        }

        setMode(isConfigured ? 'login' : 'register');
      }
    } else {
      hasInitializedForOpenRef.current = false;
    }
  }, [isOpen, isConfigured]);

  if (!isOpen) return null;

  const handleSaveCredentials = (emailVal: string, passVal: string) => {
    if (rememberPassword === true) {
      localStorage.setItem('admin_saved_email', emailVal.trim());
      localStorage.setItem('admin_saved_password', passVal);
      localStorage.setItem('admin_remember_password', 'true');
      setSavedPasswordExists(true);
    } else {
      localStorage.removeItem('admin_saved_password');
      localStorage.removeItem('admin_saved_email');
      localStorage.setItem('admin_remember_password', 'false');
      setSavedPasswordExists(false);
    }
  };

  const handleClearSavedPassword = () => {
    localStorage.removeItem('admin_saved_password');
    localStorage.removeItem('admin_saved_email');
    localStorage.setItem('admin_remember_password', 'false');
    setPassword('');
    if (passwordInputRef.current) passwordInputRef.current.value = '';
    setRememberPassword(false);
    setSavedPasswordExists(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const finalEmail = (emailInputRef.current?.value ?? email).trim() || 'Shinikenvin@gmail.com';
    const finalPass = (passwordInputRef.current?.value ?? password).trim();
    const finalOtp = (otpInputRef.current?.value ?? otpCode).trim();
    const finalNewPass = (newPasswordInputRef.current?.value ?? newPassword).trim();

    try {
      if (mode === 'login') {
        await login(finalEmail, finalPass);
        handleSaveCredentials(finalEmail, finalPass);
        if (!rememberPassword) {
          setPassword('');
          if (passwordInputRef.current) passwordInputRef.current.value = '';
        }
        onSuccess();
      } else if (mode === 'register') {
        await register(finalEmail, finalPass);
        handleSaveCredentials(finalEmail, finalPass);
        if (!rememberPassword) {
          setPassword('');
          if (passwordInputRef.current) passwordInputRef.current.value = '';
        }
        onSuccess();
      } else if (mode === 'forgot') {
        await resetPassword(finalEmail);
        setMode('verify_otp');
        setSuccessMsg(`Mã xác thực bảo mật gồm 6 chữ số đã được gửi tới email ${finalEmail}. Vui lòng mở hộp thư để kiểm tra.`);
        setResendCountdown(60);
      } else if (mode === 'verify_otp') {
        await verifyResetCodeAndChangePassword(finalOtp, finalNewPass);
        handleSaveCredentials(finalEmail, finalNewPass);
        if (!rememberPassword) {
          setPassword('');
          setNewPassword('');
          if (passwordInputRef.current) passwordInputRef.current.value = '';
          if (newPasswordInputRef.current) newPasswordInputRef.current.value = '';
        }
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      if (typeof window !== 'undefined' && err.message?.includes('không chính xác')) {
        localStorage.removeItem('admin_saved_password');
        setSavedPasswordExists(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const finalEmail = (emailInputRef.current?.value ?? email).trim() || 'Shinikenvin@gmail.com';
      await resetPassword(finalEmail);
      setSuccessMsg(`Mã xác thực bảo mật mới đã được gửi lại tới email ${finalEmail}. Vui lòng kiểm tra hộp thư đến.`);
      setResendCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {mode === 'login' && 'Đăng Nhập Quản Trị Viên'}
                {mode === 'register' && 'Khởi Tạo Tài Khoản Quản Trị'}
                {mode === 'forgot' && 'Khôi Phục Mật Khẩu Admin'}
                {mode === 'verify_otp' && 'Xác Thực & Đặt Mật Khẩu Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login' && 'Hệ thống xác thực chủ sở hữu Portfolio CMS'}
                {mode === 'register' && 'Thiết lập mật khẩu quản trị ban đầu cho tài khoản'}
                {mode === 'forgot' && 'Gửi mã xác thực bảo mật về địa chỉ Email'}
                {mode === 'verify_otp' && 'Hệ thống quản lý nội dung Portfolio CMS'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Saved Password Banner in Login Mode ONLY if explicitly saved */}
          {mode === 'login' && savedPasswordExists && rememberPassword && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyan-300">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Mật khẩu đã được ghi nhớ theo yêu cầu của bạn</span>
              </div>
              <button
                type="button"
                onClick={handleClearSavedPassword}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors ml-2 cursor-pointer"
                title="Xóa mật khẩu đã lưu"
              >
                <Trash2 className="w-3 h-3" />
                <span>Không lưu nữa</span>
              </button>
            </div>
          )}

          {/* Security Email Notice Card - ZERO CODE LEAK - Strictly Secure */}
          {mode === 'verify_otp' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Mã xác thực đã được gửi tới email quản trị:</span>
              </div>
              <div className="text-xs font-mono text-white bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between">
                <span>{email}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Đã gửi email
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Vui lòng kiểm tra hộp thư email (bao gồm cả thư mục <strong>Hộp thư đến</strong> và <strong>Spam / Thư rác</strong>) để lấy mã xác thực 6 số và nhập vào bên dưới.
              </p>
            </div>
          )}

          <form 
            onSubmit={handleSubmit} 
            className="space-y-4" 
            autoComplete="off"
          >
            {mode !== 'verify_otp' && (
              <div className="space-y-1.5">
                <label htmlFor="admin_user_account" className="text-xs font-medium text-slate-300 flex items-center justify-between cursor-pointer">
                  <span>Email quản trị</span>
                  <span className="text-[11px] font-mono text-cyan-400">Shinikenvin@gmail.com</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none select-none" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="admin_user_account"
                    id="admin_user_account"
                    defaultValue={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Shinikenvin@gmail.com"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                    required
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="admin_passcode" className="font-medium text-slate-300 cursor-pointer">
                    {mode === 'register' ? 'Nhập mật khẩu mong muốn (tối thiểu 4 ký tự)' : 'Mật khẩu quản trị'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none select-none" />
                  <input
                    key={mode}
                    ref={passwordInputRef}
                    type="text"
                    style={{
                      WebkitTextSecurity: showPassword ? 'none' : 'disc',
                    } as any}
                    name="admin_passcode"
                    id="admin_passcode"
                    defaultValue={mode === 'login' ? password : ''}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={mode === 'register' ? 'Nhập mật khẩu mong muốn...' : 'Nhập mật khẩu quản trị...'}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans tracking-normal"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Remember Password Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberPassword}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setRememberPassword(checked);
                        if (!checked) {
                          localStorage.removeItem('admin_saved_password');
                          localStorage.setItem('admin_remember_password', 'false');
                          setSavedPasswordExists(false);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0 accent-cyan-400 cursor-pointer"
                    />
                    <span>Ghi nhớ mật khẩu trên thiết bị này</span>
                  </label>
                </div>
              </div>
            )}

            {mode === 'verify_otp' && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="admin_otp_token" className="text-xs font-medium text-slate-300 cursor-pointer">
                    Nhập mã xác thực 6 số nhận từ Email
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    maxLength={6}
                    name="admin_otp_token"
                    id="admin_otp_token"
                    defaultValue={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    autoComplete="off"
                    className="w-full text-center py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="admin_new_passcode" className="text-xs font-medium text-slate-300 cursor-pointer">
                    Mật khẩu mới (tối thiểu 4 ký tự)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none select-none" />
                    <input
                      ref={newPasswordInputRef}
                      type="text"
                      style={{
                        WebkitTextSecurity: showPassword ? 'none' : 'disc',
                      } as any}
                      name="admin_new_passcode"
                      id="admin_new_passcode"
                      defaultValue={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans tracking-normal"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Resend OTP button */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Chưa nhận được mã qua email?</span>
                  <button
                    type="button"
                    disabled={resendCountdown > 0 || loading}
                    onClick={handleResendOtp}
                    className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resendCountdown > 0 ? `Gửi lại sau (${resendCountdown}s)` : 'Gửi lại mã OTP'}</span>
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' && (
                    <>
                      {savedPasswordExists && rememberPassword ? (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Đăng Nhập Nhanh 1-Chạm</span>
                        </>
                      ) : (
                        <>
                          <span>Đăng Nhập Quản Trị</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </>
                  )}
                  {mode === 'register' && (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Khởi Tạo Tài Khoản Admin</span>
                    </>
                  )}
                  {mode === 'forgot' && (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi Mã Khôi Phục Đến Email</span>
                    </>
                  )}
                  {mode === 'verify_otp' && (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Cập Nhật Mật Khẩu &amp; Đăng Nhập</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Footer Modes Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            {mode === 'login' && (
              <>
                {!isConfigured ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    Khởi tạo tài khoản Admin
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500">Bảo mật hệ thống Portfolio CMS</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="hover:text-cyan-300 transition-colors ml-auto cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </>
            )}

            {mode === 'register' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Đã có tài khoản? Đăng nhập ngay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </>
            )}

            {(mode === 'forgot' || mode === 'verify_otp') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                ← Quay lại Đăng nhập
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
