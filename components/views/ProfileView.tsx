'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  KeyRound,
  Lock,
  History,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  Save,
  Check,
  Mail,
  LogOut,
  Laptop,
} from 'lucide-react';
import { AdminUser, AdminRole } from '@/lib/types';

interface ProfileViewProps {
  currentUser: AdminUser;
  onSwitchRole: (role: AdminRole) => void;
  onLogout: () => void;
  onUpdatePhone?: (newPhone: string) => Promise<void>;
}

export default function ProfileView({
  currentUser,
  onSwitchRole,
  onLogout,
  onUpdatePhone,
}: ProfileViewProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Admin contact phone state
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '+91 93183 22388');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneSuccessMsg, setPhoneSuccessMsg] = useState(false);

  // Session termination state
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [logoutAllMsg, setLogoutAllMsg] = useState<string | null>(null);

  const roles: AdminRole[] = [
    'Super Admin',
    'Property Approval Admin',
    'Booking Admin',
    'Finance Admin',
    'Support Admin',
  ];

  const permissionsMatrix: {
    [role in AdminRole]: {
      canApproveProps: boolean;
      canManageBookings: boolean;
      canReconcileFinance: boolean;
      canManageSettings: boolean;
    };
  } = {
    'Super Admin': { canApproveProps: true, canManageBookings: true, canReconcileFinance: true, canManageSettings: true },
    'Property Approval Admin': { canApproveProps: true, canManageBookings: false, canReconcileFinance: false, canManageSettings: false },
    'Booking Admin': { canApproveProps: false, canManageBookings: true, canReconcileFinance: false, canManageSettings: false },
    'Finance Admin': { canApproveProps: false, canManageBookings: false, canReconcileFinance: true, canManageSettings: false },
    'Support Admin': { canApproveProps: false, canManageBookings: false, canReconcileFinance: false, canManageSettings: false },
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'Password must be at least 8 characters long.', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          currentPassword: oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ text: data.error || 'Failed to update password.', isError: true });
      } else {
        setPasswordMsg({ text: data.message || 'Password updated and hashed with Bcrypt. Confirmation email sent.' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordMsg({ text: 'Network error while updating password.', isError: true });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPhone(true);
    try {
      if (onUpdatePhone) {
        await onUpdatePhone(phoneInput);
      } else {
        await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneInput }),
        });
      }
      setPhoneSuccessMsg(true);
      setTimeout(() => setPhoneSuccessMsg(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!confirm('Are you sure you want to terminate all active sessions across all devices? You will be signed out.')) {
      return;
    }
    setIsLoggingOutAll(true);
    try {
      const res = await fetch('/api/auth/logout-all-devices', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLogoutAllMsg(data.message || 'All sessions terminated.');
        setTimeout(() => {
          onLogout();
        }, 1200);
      }
    } catch {
      setIsLoggingOutAll(false);
    }
  };

  const currentPerms = permissionsMatrix[currentUser.role] || permissionsMatrix['Super Admin'];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner / Account Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser.email} · <span className="font-mono font-semibold text-slate-900">{phoneInput}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Account ID: {currentUser.id} · Active Session: {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLogoutAllDevices}
            disabled={isLoggingOutAll}
            className="px-3.5 py-2 text-xs font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{isLoggingOutAll ? 'Terminating...' : 'Logout from All Devices'}</span>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {logoutAllMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-amber-600" />
          <span>{logoutAllMsg}</span>
        </div>
      )}

      {/* Official Admin Contact Number Management Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>Administrator Contact Number</span>
          </h3>
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Registered: {currentUser.phone || '+91 93183 22388'}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          This registered phone number is designated for administrative communications, verified host escalations, and platform operations.
        </p>

        {phoneSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Administrator contact number updated to <strong>{phoneInput}</strong> and recorded in audit log.</span>
          </div>
        )}

        <form onSubmit={handlePhoneSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              Phone:
            </span>
            <input
              type="text"
              required
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              placeholder="e.g. +91 93183 22388 or 9318322388"
              className="w-full pl-16 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingPhone}
            className="flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-[#0070F3] hover:bg-blue-600 text-white shadow-xs transition-colors disabled:opacity-50 shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingPhone ? 'Updating...' : 'Save Contact Number'}</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Permissions Matrix */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Role-Based Access Control (RBAC)</span>
          </h3>

          <p className="text-xs text-slate-500">
            Administrative privileges and operational boundaries configured for your account:
          </p>

          <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs border border-slate-200">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-600">Property Verification & Approvals:</span>
              <span className={currentPerms.canApproveProps ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {currentPerms.canApproveProps ? '✓ Permitted' : '✗ Restricted'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-600">Customer Booking Confirmations:</span>
              <span className={currentPerms.canManageBookings ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {currentPerms.canManageBookings ? '✓ Permitted' : '✗ Restricted'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-600">Payment & Escrow Reconciliation:</span>
              <span className={currentPerms.canReconcileFinance ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {currentPerms.canReconcileFinance ? '✓ Permitted' : '✗ Restricted'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">System Configuration & Audit Oversight:</span>
              <span className={currentPerms.canManageSettings ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {currentPerms.canManageSettings ? '✓ Permitted' : '✗ Restricted'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-700 block mb-2">Switch Active Role (Testing Utility):</span>
            <div className="grid grid-cols-1 gap-1.5">
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => onSwitchRole(r)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg text-left flex items-center justify-between transition-colors ${
                    currentUser.role === r
                      ? 'bg-blue-50 border border-blue-300 text-blue-800'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{r}</span>
                  {currentUser.role === r && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Password & Security Configuration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Password Security & Email OTP</span>
          </h3>

          {/* Mandatory Email OTP Security Banner */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-blue-900">Mandatory Email OTP Protection</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Every admin sign-in requires a single-use 6-digit OTP code dispatched to <strong>{currentUser.email}</strong>. OTPs expire strictly in 5 minutes with rate-limited submission protection.
            </p>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Change Master Password</h4>

            {passwordMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  passwordMsg.isError
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {passwordMsg.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                New Password (Min. 8 chars) <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
            >
              {isChangingPass ? 'Verifying & Hashing with Bcrypt...' : 'Update Password & Notify Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
