'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Eye,
  FileCheck,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { Property, PropertyApprovalStatus } from '@/lib/types';

interface PropertyApprovalsViewProps {
  properties: Property[];
  onUpdateProperty: (params: {
    id: string;
    approvalStatus: PropertyApprovalStatus;
    adminFeedback: string;
  }) => Promise<void>;
  onRefresh: () => void;
}

export default function PropertyApprovalsView({
  properties,
  onUpdateProperty,
  onRefresh,
}: PropertyApprovalsViewProps) {
  const pending = properties.filter(p => p.approvalStatus === 'Pending Admin Approval');
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review checklist state for the active property
  const [checklist, setChecklist] = useState({
    identityVerified: true,
    propertyDeedMatched: true,
    fireSafetyCheck: true,
    noCommercialDispute: true,
    accuratePricing: true,
  });

  const handleDecision = async (status: 'Approved' | 'Rejected' | 'Pending Admin Approval') => {
    if (!selectedProp) return;
    setIsSubmitting(true);
    await onUpdateProperty({
      id: selectedProp.id,
      approvalStatus: status,
      adminFeedback: feedback || (status === 'Approved' ? 'All verification criteria cleared by Admin.' : 'Corrections requested.'),
    });
    setIsSubmitting(false);
    setSelectedProp(null);
    setFeedback('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Workflow Explanation Banner */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-blue-900">
              Mandatory Admin Property Approval Gate
            </h2>
          </div>
          <p className="text-xs text-blue-700 mt-1 max-w-2xl">
            In compliance with Peflarmo safety standards, all properties submitted by owners or brokers must clear Admin inspection. Only approved listings are published to the public Customer Website and Mobile App.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 shrink-0">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{pending.length} Submissions Awaiting Decision</span>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">All submissions have been reviewed!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            There are currently no property listings waiting in the approval queue. New submissions from hosts will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of pending submissions */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pending Submissions Queue ({pending.length})
            </h3>
            {pending.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProp(p);
                  setFeedback('');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedProp?.id === p.id
                    ? 'bg-blue-50/50 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                    {p.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">{p.name}</h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {p.locality}, {p.city}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">Host: {p.ownerName}</span>
                  <span className="font-bold text-slate-900">₹{p.monthlyRent.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active submission inspection panel */}
          <div className="lg:col-span-2">
            {selectedProp ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{selectedProp.name}</h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                        {selectedProp.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedProp.address} · Submitted on {new Date(selectedProp.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900">
                      ₹{selectedProp.monthlyRent.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Security Deposit: ₹{selectedProp.securityDeposit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Images Preview */}
                {selectedProp.images && selectedProp.images.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2">Submitted Photographs</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProp.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={selectedProp.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-44 object-cover rounded-lg border border-slate-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Description & Amenities */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1">Host Description</h4>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg leading-relaxed">
                      {selectedProp.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1.5">Amenities Reported</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProp.amenities.map(am => (
                        <span key={am} className="px-2 py-1 bg-slate-100 rounded-md text-xs text-slate-700">
                          ✓ {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Mandatory Administrative Compliance Checklist
                  </h4>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.identityVerified}
                        onChange={e => setChecklist({ ...checklist, identityVerified: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-slate-700">Owner identity (Aadhaar/PAN) matched against registered host profile</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.propertyDeedMatched}
                        onChange={e => setChecklist({ ...checklist, propertyDeedMatched: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-slate-700">Electricity bill / property tax document verified for location correctness</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.fireSafetyCheck}
                        onChange={e => setChecklist({ ...checklist, fireSafetyCheck: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-slate-700">Emergency exits and commercial safety regulations confirmed for PG/Hostel</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.accuratePricing}
                        onChange={e => setChecklist({ ...checklist, accuratePricing: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-slate-700">Rent, security deposit & lock-in terms adhere to fair tenancy guidelines</span>
                    </label>
                  </div>
                </div>

                {/* Admin Feedback Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inspection Feedback / Correction Notes (Sent to Owner):
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Enter compliance observations or notes..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDecision('Pending Admin Approval')}
                    className="px-3 py-2 rounded-lg border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-semibold"
                  >
                    Request Corrections
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDecision('Rejected')}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    Reject Submission
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDecision('Approved')}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    Approve & Publish to Public Portal
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <Eye className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">Select a property from the queue to start review</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
