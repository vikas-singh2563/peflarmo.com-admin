'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Save,
  CheckCircle,
  Building,
  MapPin,
  Lock,
  Percent,
  Check,
  Server,
} from 'lucide-react';
import { SystemSettingsData } from '@/lib/types';

interface SettingsViewProps {
  settings: SystemSettingsData;
  onUpdateSettings: (updated: Partial<SystemSettingsData>) => Promise<void>;
  onRefresh: () => void;
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  onRefresh,
}: SettingsViewProps) {
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [brandTagline, setBrandTagline] = useState(settings.brandTagline);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);

  const [approvalRules, setApprovalRules] = useState(settings.propertyApprovalRules);
  const [workflowSettings, setWorkflowSettings] = useState(settings.bookingWorkflowSettings);
  const [commissionRules, setCommissionRules] = useState(settings.commissionRules);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateSettings({
      platformName,
      brandTagline,
      supportEmail,
      supportPhone,
      propertyApprovalRules: approvalRules,
      bookingWorkflowSettings: workflowSettings,
      commissionRules: commissionRules,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefresh();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Peflarmo Enterprise Platform Parameters</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational policies enforced across customer portal, host submissions, and booking engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Parameters Saved to Core
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Save System Settings'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Branding & Identity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Platform Identity & Contacts</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Control Title</label>
            <input
              type="text"
              value={platformName}
              onChange={e => setPlatformName(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
            <input
              type="text"
              value={brandTagline}
              onChange={e => setBrandTagline(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operations Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Helpline Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={e => setSupportPhone(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">Supported Indian Cities</span>
            <div className="flex flex-wrap gap-1.5">
              {settings.supportedCities.map(city => (
                <span key={city} className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-700">
                  <MapPin className="w-3 h-3 inline mr-1 text-slate-400" />
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Property Approval Gate Rules */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Listing Approval Gate Policies</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer">
              <span className="font-medium text-slate-800">Require Physical Field Verification</span>
              <input
                type="checkbox"
                checked={approvalRules.requirePhysicalVerification}
                onChange={e => setApprovalRules({ ...approvalRules, requirePhysicalVerification: e.target.checked })}
                className="rounded border-slate-300 text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer">
              <span className="font-medium text-slate-800">Mandatory Host Aadhaar / PAN Verification</span>
              <input
                type="checkbox"
                checked={approvalRules.requireOwnerAadhaarPan}
                onChange={e => setApprovalRules({ ...approvalRules, requireOwnerAadhaarPan: e.target.checked })}
                className="rounded border-slate-300 text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer">
              <span className="font-medium text-slate-800">Mandatory Channel Partner RERA Registration</span>
              <input
                type="checkbox"
                checked={approvalRules.requireBrokerReraNumber}
                onChange={e => setApprovalRules({ ...approvalRules, requireBrokerReraNumber: e.target.checked })}
                className="rounded border-slate-300 text-blue-600"
              />
            </label>

            <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="font-medium text-slate-800">Minimum High-Res Photos Required:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={approvalRules.minimumImagesRequired}
                onChange={e => setApprovalRules({ ...approvalRules, minimumImagesRequired: parseInt(e.target.value) || 3 })}
                className="w-16 p-1 text-center border border-slate-300 rounded text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Booking Workflow Engine Settings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Booking Engine & Anti-Collision Protocols</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
              <span className="font-bold text-blue-950 block">Mandatory Admin First Review: ENABLED</span>
              <span className="text-[11px] text-blue-800 mt-0.5 block">
                All customer booking requests and inquiries must pass Admin review before dispatch to owners.
              </span>
            </div>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer">
              <span className="font-medium text-slate-800">Strict Double-Booking Lock (Zero Collisions)</span>
              <input
                type="checkbox"
                checked={!workflowSettings.allowDoubleBookingOverride}
                onChange={e => setWorkflowSettings({ ...workflowSettings, allowDoubleBookingOverride: !e.target.checked })}
                className="rounded border-slate-300 text-blue-600"
              />
            </label>

            <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="font-medium text-slate-800">Full Refund Cancellation Window (Hours):</span>
              <input
                type="number"
                value={workflowSettings.cancellationWindowHours}
                onChange={e => setWorkflowSettings({ ...workflowSettings, cancellationWindowHours: parseInt(e.target.value) || 48 })}
                className="w-16 p-1 text-center border border-slate-300 rounded text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Commission Engine & Gateway Integrations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Percent className="w-4 h-4 text-violet-600" />
            <span>Commission Rules & Gateway Connectivity</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Default Broker %</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={commissionRules.defaultBrokerPercentage}
                  onChange={e => setCommissionRules({ ...commissionRules, defaultBrokerPercentage: parseInt(e.target.value) || 10 })}
                  className="w-16 p-1 text-center border border-slate-300 rounded font-bold text-slate-900"
                />
                <span className="font-bold">%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Platform Convenience Fee %</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={commissionRules.defaultPlatformFeePercentage}
                  onChange={e => setCommissionRules({ ...commissionRules, defaultPlatformFeePercentage: parseInt(e.target.value) || 3 })}
                  className="w-16 p-1 text-center border border-slate-300 rounded font-bold text-slate-900"
                />
                <span className="font-bold">%</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span>Integration Statuses:</span>
            </span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600">Razorpay Payment Gateway (Escrow)</span>
              <span className="font-bold text-emerald-600">✓ Connected (Sandbox/Live)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600">Transactional Email Service</span>
              <span className="font-bold text-emerald-600">✓ Connected (Notifications & Alerts)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600">UIDAI / Aadhaar Verification API</span>
              <span className="font-bold text-emerald-600">✓ Verified</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
