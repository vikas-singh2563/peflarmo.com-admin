'use client';

import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  adminName: string;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  adminName,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <LogOut className="w-5 h-5" />
        </div>

        <div className="text-center">
          <h3 className="text-sm font-bold text-slate-900">
            Terminate Administrative Session?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{adminName}</strong>. Your session token will be invalidated and an audit event recorded.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            Stay Signed In
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
          >
            Confirm Logout
          </button>
        </div>
      </div>
    </div>
  );
}
