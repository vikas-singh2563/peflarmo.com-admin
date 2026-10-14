'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Lock,
  Mail,
  Shield,
  KeyRound,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Clock,
  Send,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { AdminUser } from '@/lib/types';

interface LoginViewProps {
  onLoginSuccess: (user: AdminUser, token: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  // Login form state
  const [email, setEmail] = useState('peflarmo@gmail.com');
  const [password, setPassword] = useState('Peflarmo@Admin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Step 3 & 4: Email OTP state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpExpiresIn, setOtpExpiresIn] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 60s cooldown
  const [isResending, setIsResending] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Forgot password & reset password state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('peflarmo@gmail.com');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [resetStatusMsg, setResetStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // SMTP diagnostics & failure simulation test state
  const [smtpDiagnostics, setSmtpDiagnostics] = useState<{ message: string; success?: boolean } | null>(null);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);

  // Countdown timer for 5-minute OTP expiry
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpStep && otpExpiresIn > 0) {
      timer = setInterval(() => {
        setOtpExpiresIn(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, otpExpiresIn]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpStep && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, resendCooldown]);

  // Step 1 & 2: Submit Email and Password to get 6-digit OTP
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Authentication failed. Please verify credentials.');
        setIsLoading(false);
        return;
      }

      if (data.step === 'OTP_REQUIRED') {
        setIsOtpStep(true);
        setTempToken(data.tempToken);
        setMaskedEmail(data.maskedEmail);
        setOtpExpiresIn(data.expiresInSeconds || 300);
        setResendCooldown(data.resendCooldownSeconds || 60);
        setInfoMsg(data.message || `A single-use 6-digit OTP code has been dispatched to ${data.maskedEmail}.`);
        setOtpCode('');
      }
    } catch {
      setErrorMsg('Network error connecting to Peflarmo authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 & 4: Verify 6-digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }
    if (otpExpiresIn <= 0) {
      setErrorMsg('This OTP code has expired. Please request a new code.');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode.trim(),
          tempToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid OTP code. Please try again.');
        setIsVerifyingOtp(false);
        return;
      }

      // Step 5: Success -> Open Admin Dashboard
      localStorage.setItem('peflarmo_admin_token', data.token);
      onLoginSuccess(data.user, data.token);
    } catch {
      setErrorMsg('Network error verifying OTP code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          tempToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to resend OTP code.');
      } else {
        setInfoMsg(data.message || 'A new 6-digit OTP has been dispatched to your email.');
        setOtpExpiresIn(300);
        setResendCooldown(60);
        setOtpCode('');
      }
    } catch {
      setErrorMsg('Network error requesting new OTP.');
    } finally {
      setIsResending(false);
    }
  };

  // Forgot Password: Step 1 (Request Token)
  const handleRequestResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);
    setResetStatusMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetStatusMsg({ text: data.error || 'Failed to process request.', isError: true });
      } else {
        setResetStatusMsg({ text: data.message || 'Reset token dispatched to registered address.' });
        setResetStep('reset');
      }
    } catch {
      setResetStatusMsg({ text: 'Network error requesting password reset.', isError: true });
    } finally {
      setIsResetLoading(false);
    }
  };

  // Forgot Password: Step 2 (Reset with Token & Bcrypt Hash)
  const handlePerformReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.length < 8) {
      setResetStatusMsg({ text: 'New password must be at least 8 characters long.', isError: true });
      return;
    }
    setIsResetLoading(true);
    setResetStatusMsg(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          token: resetTokenInput.trim(),
          newPassword: newPasswordInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetStatusMsg({ text: data.error || 'Password reset failed.', isError: true });
      } else {
        setResetStatusMsg({ text: data.message || 'Password reset successfully!' });
        setPassword(newPasswordInput);
        setEmail(forgotEmail);
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setResetStep('request');
          setResetStatusMsg(null);
          setResetTokenInput('');
          setNewPasswordInput('');
          setInfoMsg('Password reset successfully. Please log in with your new credentials.');
        }, 1500);
      }
    } catch {
      setResetStatusMsg({ text: 'Network error resetting password.', isError: true });
    } finally {
      setIsResetLoading(false);
    }
  };

  // Test live SMTP connection
  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    setSmtpDiagnostics(null);
    try {
      const res = await fetch('/api/auth/test-smtp', { method: 'POST' });
      const data = await res.json();
      setSmtpDiagnostics(data);
    } catch {
      setSmtpDiagnostics({ message: 'Failed to reach SMTP test endpoint.', success: false });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Toggle delivery failure simulation (to prove OTP verification is never bypassed)
  const handleToggleFailureSimulation = async () => {
    const nextState = !isSimulatingFailure;
    try {
      const res = await fetch('/api/auth/simulate-delivery-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate: nextState }),
      });
      const data = await res.json();
      setIsSimulatingFailure(data.simulatingDeliveryFailure);
    } catch {
      // ignore
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#070d18] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md space-y-5">
        {/* Brand identity header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0070F3] text-white shadow-xl shadow-blue-500/20 mb-3 border border-blue-400/30">
            <Building className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            PEFLARMO
          </h1>
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">
            Admin Operations & Control Console
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            Strictly restricted to authorized administrative personnel
          </p>
        </div>

        {/* 5-Step Process Progress Indicator */}
        <div className="bg-[#0e172a] border border-[#1e293b] rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
            <span className={!isOtpStep ? 'text-blue-400 font-bold' : 'text-emerald-400 font-bold'}>
              {!isOtpStep ? 'Step 1 & 2: Credentials' : '✓ Credentials Verified'}
            </span>
            <span className={isOtpStep ? 'text-blue-400 font-bold' : 'text-slate-500'}>
              Step 3 & 4: Email OTP
            </span>
            <span className="text-slate-600">Step 5: Dashboard</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                isOtpStep ? 'w-4/5 bg-blue-500' : 'w-2/5 bg-blue-600'
              }`}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#0b1324] border border-[#1a2640] rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Subtle top glow line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-blue-950/80 border border-blue-800/80 flex items-start gap-2.5 text-xs text-blue-200">
              <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{infoMsg}</span>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 1 & 2: ENTER ADMIN EMAIL & PASSWORD                      */}
          {/* ============================================================= */}
          {!isOtpStep ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Admin Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. peflarmo@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#111c33] border border-[#203052] rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Admin Password <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(true);
                      setForgotEmail(email);
                      setResetStatusMsg(null);
                    }}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#111c33] border border-[#203052] rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 text-xs font-bold rounded-xl bg-[#0070F3] hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying & Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Credentials & Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Authorized account pre-fills for testing */}
              <div className="pt-4 border-t border-[#1a2640]">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-medium">
                  <span>Authorized Admin Profiles:</span>
                  <span className="text-slate-500">Public signup disabled</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('peflarmo@gmail.com');
                      setPassword('Peflarmo@Admin2026!');
                    }}
                    className="p-2 text-left rounded-lg bg-[#111c33] border border-[#203052] hover:border-blue-500 text-[11px] transition-colors"
                  >
                    <div className="font-bold text-white truncate">peflarmo@gmail.com</div>
                    <div className="text-[10px] text-blue-400">Super Admin (Primary)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@peflarmo.com');
                      setPassword('Peflarmo@Admin2026!');
                    }}
                    className="p-2 text-left rounded-lg bg-[#111c33] border border-[#203052] hover:border-blue-500 text-[11px] transition-colors"
                  >
                    <div className="font-bold text-white truncate">admin@peflarmo.com</div>
                    <div className="text-[10px] text-blue-400">Super Admin (Enterprise)</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ============================================================= */
            /* STEP 3 & 4: RECEIVE & VERIFY 6-DIGIT EMAIL OTP               */
            /* ============================================================= */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-900/50 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Enter 6-Digit Email OTP</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sent to <strong className="text-blue-300 font-mono">{maskedEmail}</strong>
                </p>
              </div>

              <div>
                <label className="block text-center text-xs font-bold text-slate-300 mb-2">
                  Single-Use Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  pattern="[0-9]{6}"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full py-3 text-center text-2xl font-mono font-black tracking-[0.5em] bg-[#111c33] border-2 border-blue-500/60 rounded-xl text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
              </div>

              {/* Countdown & validity timer */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-[#111c33] px-3.5 py-2.5 rounded-xl border border-[#203052]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Valid for:{' '}
                    <strong className={otpExpiresIn < 60 ? 'text-rose-400' : 'text-slate-200'}>
                      {formatSeconds(otpExpiresIn)}
                    </strong>
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Single-use</span>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.length !== 6 || otpExpiresIn <= 0}
                  className="w-full py-3 text-xs font-bold rounded-xl bg-[#0070F3] hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Security Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP & Open Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpStep(false);
                      setOtpCode('');
                      setErrorMsg('');
                    }}
                    className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending || resendCooldown > 0}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 disabled:text-slate-600 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend 6-Digit OTP'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Security & SMTP Testing Diagnostics Tray */}
        <div className="bg-[#0b1324]/80 border border-[#1a2640] rounded-xl p-3.5 text-xs text-slate-400 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              SMTP Delivery & Security Test Panel
            </span>
            <button
              onClick={handleTestSmtp}
              disabled={isTestingSmtp}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-900/60 border border-blue-700/60 text-blue-300 hover:bg-blue-800 transition-colors"
            >
              {isTestingSmtp ? 'Testing...' : 'Test SMTP Connection'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#1a2640] text-[11px]">
            <span>Simulate Delivery Failure (Test OTP Strictness):</span>
            <button
              onClick={handleToggleFailureSimulation}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                isSimulatingFailure
                  ? 'bg-rose-900 text-rose-200 border border-rose-700'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {isSimulatingFailure ? 'Failure Active (On)' : 'Normal (Off)'}
            </button>
          </div>

          {smtpDiagnostics && (
            <div
              className={`p-2 rounded-lg text-[11px] leading-relaxed border ${
                smtpDiagnostics.success
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-800 text-amber-300'
              }`}
            >
              {smtpDiagnostics.message}
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="text-center text-[11px] text-slate-500">
          &copy; 2026 Peflarmo Technologies Pvt Ltd · Secured by Bcrypt & Email OTP
        </div>
      </div>

      {/* ============================================================= */}
      {/* FORGOT PASSWORD MODAL (EMAIL VERIFICATION & EXPIRING TOKEN)    */}
      {/* ============================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b1324] border border-[#1e2c4a] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a2640] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Reset Administrative Password</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {resetStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  resetStatusMsg.isError
                    ? 'bg-rose-950/80 border border-rose-800 text-rose-200'
                    : 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                }`}
              >
                {resetStatusMsg.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                )}
                <span className="leading-relaxed">{resetStatusMsg.text}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestResetToken} className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered Admin email. A secure, single-use reset token will be dispatched to your inbox (valid for 15 minutes).
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="e.g. peflarmo@gmail.com"
                    className="w-full p-2.5 text-xs bg-[#111c33] border border-[#203052] rounded-xl text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="px-4 py-2 text-xs font-bold bg-[#0070F3] hover:bg-blue-600 text-white rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isResetLoading ? 'Sending...' : 'Send Reset Token'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePerformReset} className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter the token received in your email and specify your new password (minimum 8 characters).
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reset Token (from Email)
                  </label>
                  <input
                    type="text"
                    required
                    value={resetTokenInput}
                    onChange={e => setResetTokenInput(e.target.value)}
                    placeholder="e.g. RST-XXXX..."
                    className="w-full p-2.5 text-xs font-mono font-bold bg-[#111c33] border border-[#203052] rounded-xl text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Master Password (Min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-2.5 text-xs bg-[#111c33] border border-[#203052] rounded-xl text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Re-send Token
                  </button>
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {isResetLoading ? 'Updating...' : 'Update Password & Return'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
