// src/pages/LoginPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginWithCredentials,
  verifyOtp,
  resendOtp,
  requestPasswordReset,
  verifyPasswordResetOtp,
  confirmPasswordReset,
} from '../services/api/authApi';
import { useAuth } from '../context/useAuth';

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 120;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, checkAuth } = useAuth();

  const [step, setStep] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ── OTP state ──
  const [otpCode, setOtpCode] = useState(Array(OTP_LENGTH).fill(''));
  const [tempToken, setTempToken] = useState('');

  // ── Forgot password state ──
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── UI state ──
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT);
  const [resendDisabled, setResendDisabled] = useState(true);

  const otpInputRefs = useRef([]);

  // ── Countdown timer ──
  useEffect(() => {
    if (
      (step !== 'otp' && step !== 'forgot-otp') ||
      countdown <= 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  // ── Redirect if already logged in ──
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) navigate('/', { replace: true });
  }, [navigate]);

  // ============================================
  // Login — Submit
  // ============================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const result = await loginWithCredentials(username, password);

      if (result.requires_otp) {
        setTempToken(result.temp_token);
        setStep('otp');
        setCountdown(RESEND_TIMEOUT);
        setResendDisabled(true);
        setOtpCode(Array(OTP_LENGTH).fill(''));
        setSuccessMsg('کد تایید به شماره موبایل شما ارسال شد');
      } else if (result.success) {
        login(result.user);
        await checkAuth();
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          'خطا در ورود به سیستم',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // OTP — Submit
  // ============================================
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length !== OTP_LENGTH) {
      setError(`لطفا کد ${OTP_LENGTH} رقمی را وارد کنید`);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await verifyOtp(tempToken, code);
      if (result.success) {
        login(result.user);
        await checkAuth();
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          'کد تایید نامعتبر است',
      );
      setOtpCode(Array(OTP_LENGTH).fill(''));
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // OTP — Resend
  // ============================================
  const handleResendOtp = async () => {
    if (resendDisabled) return;
    setIsLoading(true);
    setError('');

    try {
      await resendOtp(tempToken);
      setCountdown(RESEND_TIMEOUT);
      setResendDisabled(true);
      setSuccessMsg('کد جدید ارسال شد');
    } catch (err) {
      setError(
        err.response?.data?.detail || 'خطا در ارسال مجدد کد',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // OTP — Input handlers
  // ============================================
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value.slice(-1);
    setOtpCode(newOtpCode);
    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpCode[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // ============================================
  // Forgot Password — Request
  // ============================================
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('نام کاربری را وارد کنید');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(username);
      setSuccessMsg(
        result.message ||
          'اگر این نام کاربری وجود داشته باشد، کد بازیابی ارسال می‌شود',
      );
      setStep('forgot-otp');
      setCountdown(RESEND_TIMEOUT);
      setResendDisabled(true);
      setOtpCode(Array(OTP_LENGTH).fill(''));
    } catch (err) {
      setError(
        err.response?.data?.detail || 'خطا در درخواست بازیابی رمز',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Forgot Password — Verify + Confirm
  // ============================================
  const handleForgotVerify = async (e) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length !== OTP_LENGTH) {
      setError(`لطفا کد ${OTP_LENGTH} رقمی را وارد کنید`);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('رمز جدید باید حداقل ۶ کاراکتر باشد');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('رمزها مطابقت ندارند');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 1. Verify OTP → reset_token
      const verifyResult = await verifyPasswordResetOtp(
        username,
        code,
      );
      const token = verifyResult.reset_token;
      setResetToken(token);

      // 2. Confirm password reset
      await confirmPasswordReset(token, newPassword);

      setSuccessMsg('رمز عبور با موفقیت تغییر یافت. حالا وارد شوید.');
      setTimeout(() => {
        setStep('login');
        setOtpCode(Array(OTP_LENGTH).fill(''));
        setNewPassword('');
        setConfirmPassword('');
        setPassword('');
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          'خطا در بازیابی رمز',
      );
      setOtpCode(Array(OTP_LENGTH).fill(''));
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Back to login
  // ============================================
  const handleBackToLogin = () => {
    setStep('login');
    setOtpCode(Array(OTP_LENGTH).fill(''));
    setTempToken('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
    setCountdown(RESEND_TIMEOUT);
    setResendDisabled(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-5 font-vazir bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-9 border border-white/10 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/android-chrome-512x512.png"
            alt="آب خوان"
            className="w-28 h-28 mx-auto mb-2 rounded-3xl"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="text-3xl font-bold bg-gradient-to-br from-green-400 to-green-700 bg-clip-text text-transparent">
            آب خوان
          </div>
          <h1 className="text-base font-normal text-slate-400 mt-2">
            سامانه مدیریت آب و اراضی کشاورزی
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="px-4 py-3 mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center">
            {successMsg}
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* Step 1: Login                                */}
        {/* ═══════════════════════════════════════════ */}
        {step === 'login' && (
          <form
            onSubmit={handleLoginSubmit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                نام کاربری
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                className="
                  px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                  text-slate-100 text-sm font-vazir outline-none
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30
                  transition-all duration-200
                "
                style={{ direction: 'ltr' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                رمز عبور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="
                  px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                  text-slate-100 text-sm font-vazir outline-none
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30
                  transition-all duration-200
                "
                style={{ direction: 'ltr' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="
                mt-1 px-5 py-3.5 bg-primary-600 text-white
                rounded-xl font-semibold text-base font-vazir
                hover:bg-primary-700 transition-colors duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isLoading ? 'در حال ورود...' : 'ورود به سیستم'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('forgot');
                setError('');
                setSuccessMsg('');
              }}
              className="
                text-xs text-slate-400 hover:text-primary-400
                transition-colors font-vazir
              "
            >
              رمز عبور خود را فراموش کرده‌اید؟
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* Step 2: OTP                                  */}
        {/* ═══════════════════════════════════════════ */}
        {step === 'otp' && (
          <form
            onSubmit={handleOtpSubmit}
            className="flex flex-col gap-6"
          >
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                کد تایید را وارد کنید
              </h2>
              <p className="text-sm text-slate-400">
                کد {OTP_LENGTH} رقمی ارسال شده به شماره موبایل خود را
                وارد نمایید
              </p>
            </div>

            <div
              className="flex gap-2.5 justify-center my-2"
              dir="ltr"
            >
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={isLoading}
                  autoFocus={index === 0}
                  className="
                    w-12 h-14 text-center text-2xl font-bold
                    bg-white/5 border border-white/10 rounded-xl
                    text-slate-100 outline-none font-vazir
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30
                    transition-all duration-200
                  "
                />
              ))}
            </div>

            <div className="text-center text-sm text-slate-400">
              {countdown > 0 ? (
                <span>ارسال مجدد کد تا {formatTime(countdown)}</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendDisabled || isLoading}
                  className="bg-transparent border-none text-primary-400 text-sm font-medium cursor-pointer font-vazir hover:text-primary-300 transition-colors"
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  otpCode.join('').length !== OTP_LENGTH
                }
                className="
                  flex-1 px-5 py-3.5 bg-primary-600 text-white
                  rounded-xl font-semibold text-base font-vazir
                  hover:bg-primary-700 transition-colors duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isLoading ? 'در حال تایید...' : 'تایید'}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={isLoading}
                className="
                  px-5 py-3.5 bg-transparent border border-white/10
                  text-slate-400 rounded-xl font-medium text-sm font-vazir
                  hover:bg-white/5 transition-colors duration-200
                  disabled:opacity-60
                "
              >
                بازگشت
              </button>
            </div>
          </form>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* Step 3: Forgot Password — Request            */}
        {/* ═══════════════════════════════════════════ */}
        {step === 'forgot' && (
          <form
            onSubmit={handleForgotRequest}
            className="flex flex-col gap-5"
          >
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                بازیابی رمز عبور
              </h2>
              <p className="text-sm text-slate-400">
                نام کاربری خود را وارد کنید تا کد بازیابی برای شما
                ارسال شود
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                نام کاربری
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                className="
                  px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                  text-slate-100 text-sm font-vazir outline-none
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30
                  transition-all duration-200
                "
                style={{ direction: 'ltr' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !username}
              className="
                px-5 py-3.5 bg-primary-600 text-white
                rounded-xl font-semibold text-base font-vazir
                hover:bg-primary-700 transition-colors duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isLoading ? 'در حال ارسال...' : 'ارسال کد بازیابی'}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              disabled={isLoading}
              className="
                text-xs text-slate-400 hover:text-primary-400
                transition-colors font-vazir
              "
            >
              بازگشت به صفحه ورود
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* Step 4: Forgot — OTP + New Password          */}
        {/* ═══════════════════════════════════════════ */}
        {step === 'forgot-otp' && (
          <form
            onSubmit={handleForgotVerify}
            className="flex flex-col gap-5"
          >
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                کد بازیابی را وارد کنید
              </h2>
              <p className="text-sm text-slate-400">
                کد {OTP_LENGTH} رقمی ارسال شده به شماره موبایل خود را
                وارد کنید
              </p>
            </div>

            <div
              className="flex gap-2.5 justify-center my-2"
              dir="ltr"
            >
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={isLoading}
                  autoFocus={index === 0}
                  className="
                    w-12 h-14 text-center text-2xl font-bold
                    bg-white/5 border border-white/10 rounded-xl
                    text-slate-100 outline-none font-vazir
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30
                    transition-all duration-200
                  "
                />
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                رمز عبور جدید
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
                placeholder="حداقل ۶ کاراکتر"
                className="
                  px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                  text-slate-100 text-sm font-vazir outline-none
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30
                  transition-all duration-200
                "
                style={{ direction: 'ltr' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                تکرار رمز عبور جدید
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
                className="
                  px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                  text-slate-100 text-sm font-vazir outline-none
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30
                  transition-all duration-200
                "
                style={{ direction: 'ltr' }}
              />
            </div>

            <div className="text-center text-sm text-slate-400">
              {countdown > 0 ? (
                <span>ارسال مجدد کد تا {formatTime(countdown)}</span>
              ) : (
                <button
                  type="button"
                  onClick={handleForgotRequest}
                  disabled={resendDisabled || isLoading}
                  className="bg-transparent border-none text-primary-400 text-sm font-medium cursor-pointer font-vazir hover:text-primary-300 transition-colors"
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  otpCode.join('').length !== OTP_LENGTH ||
                  !newPassword ||
                  !confirmPassword
                }
                className="
                  flex-1 px-5 py-3.5 bg-primary-600 text-white
                  rounded-xl font-semibold text-base font-vazir
                  hover:bg-primary-700 transition-colors duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isLoading ? 'در حال تغییر...' : 'تغییر رمز'}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={isLoading}
                className="
                  px-5 py-3.5 bg-transparent border border-white/10
                  text-slate-400 rounded-xl font-medium text-sm font-vazir
                  hover:bg-white/5 transition-colors duration-200
                  disabled:opacity-60
                "
              >
                بازگشت
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;