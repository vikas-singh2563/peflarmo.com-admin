'use client';

import React, { useState } from 'react';
import {
  Search,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCheck,
  Shield,
  Eye,
  X,
  UserCheck,
  UserX,
  Briefcase,
} from 'lucide-react';
import { Owner, Broker, OwnerStatus } from '@/lib/types';

interface OwnersViewProps {
  owners: Owner[];
  brokers: Broker[];
  onUpdateOwner: (params: {
    id: string;
    status?: OwnerStatus;
    rejectionReason?: string;
    suspensionReason?: string;
    assignedBrokerId?: string;
  }) => Promise<void>;
  onRefresh: () => void;
}

export default function OwnersView({
  owners,
  brokers,
  onUpdateOwner,
  onRefresh,
}: OwnersViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [decisionModal, setDecisionModal] = useState<{
    owner: Owner;
    type: 'Approve' | 'Reject' | 'Suspend' | 'Reactivate' | 'AssignBroker';
  } | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: (OwnerStatus | 'All')[] = [
    'All',
    'Pending Approval',
    'Pending Verification',
    'Approved',
    'Rejected',
    'Suspended',
  ];

  const filtered = owners.filter(o => {
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      o.name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleDecisionSubmit = async () => {
    if (!decisionModal) return;
    setIsSubmitting(true);
    const { owner, type } = decisionModal;

    if (type === 'Approve') {
      await onUpdateOwner({ id: owner.id, status: 'Approved' });
    } else if (type === 'Reject') {
      await onUpdateOwner({ id: owner.id, status: 'Rejected', rejectionReason: reasonInput });
    } else if (type === 'Suspend') {
      await onUpdateOwner({ id: owner.id, status: 'Suspended', suspensionReason: reasonInput });
    } else if (type === 'Reactivate') {
      await onUpdateOwner({ id: owner.id, status: 'Approved' });
    } else if (type === 'AssignBroker') {
      await onUpdateOwner({ id: owner.id, assignedBrokerId: selectedBrokerId });
    }

    setIsSubmitting(false);
    setDecisionModal(null);
    setReasonInput('');
    setSelectedBrokerId('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search owners by name, email, phone, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Owners Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Owner ID</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">KYC Documents</th>
                <th className="py-3 px-4">Assigned Broker</th>
                <th className="py-3 px-4 text-center">Properties</th>
                <th className="py-3 px-4 text-right">Total Earnings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching owner records found.
                  </td>
                </tr>
              ) : (
                filtered.map(owner => {
                  const assignedBroker = brokers.find(b => b.id === owner.assignedBrokerId);
                  return (
                    <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {owner.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{owner.name}</div>
                        <div className="text-[11px] text-slate-500">{owner.email} · {owner.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{owner.city}</td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{owner.kycDocType}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{owner.kycDocNumber}</div>
                        {owner.bankAccountVerified && (
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            ✓ Bank Verified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {assignedBroker ? (
                          <span className="font-medium text-slate-900">{assignedBroker.name}</span>
                        ) : (
                          <span className="text-slate-400 italic">None assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                        {owner.propertiesCount}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                        ₹{owner.totalEarnings.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            owner.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : owner.status === 'Pending Approval' || owner.status === 'Pending Verification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {owner.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOwner(owner)}
                          className="px-2 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {(owner.status === 'Pending Approval' || owner.status === 'Pending Verification') && (
                          <>
                            <button
                              onClick={() => setDecisionModal({ owner, type: 'Approve' })}
                              className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setDecisionModal({ owner, type: 'Reject' })}
                              className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {owner.status === 'Approved' && (
                          <>
                            <button
                              onClick={() => setDecisionModal({ owner, type: 'AssignBroker' })}
                              className="px-2 py-1 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50 font-medium inline-flex items-center gap-1"
                            >
                              <Briefcase className="w-3 h-3" />
                              <span>Broker</span>
                            </button>
                            <button
                              onClick={() => setDecisionModal({ owner, type: 'Suspend' })}
                              className="px-2 py-1 rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium"
                            >
                              Suspend
                            </button>
                          </>
                        )}

                        {owner.status === 'Suspended' && (
                          <button
                            onClick={() => setDecisionModal({ owner, type: 'Reactivate' })}
                            className="px-2 py-1 rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Owner Detail Modal */}
      {selectedOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Owner Profile: {selectedOwner.name}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedOwner.id}</p>
              </div>
              <button
                onClick={() => setSelectedOwner(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Email & Contact</span>
                <span className="font-semibold text-slate-900">{selectedOwner.email}</span>
                <div className="text-slate-600 mt-0.5">{selectedOwner.phone}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Operational City</span>
                <span className="font-semibold text-slate-900">{selectedOwner.city}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                <span className="text-slate-500 block text-[11px]">Submitted Verification Documents</span>
                <span className="font-bold text-slate-900">{selectedOwner.kycDocType}</span>
                <div className="text-[11px] font-mono text-slate-600 mt-0.5">Ref No: {selectedOwner.kycDocNumber}</div>
                <div className="mt-1 text-[10px] text-emerald-600 font-medium">
                  {selectedOwner.verificationDocsSubmitted ? '✓ Electronic copies on file' : '✗ Physical upload pending'}
                </div>
              </div>
              {selectedOwner.rejectionReason && (
                <div className="col-span-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                  <span className="font-bold block text-[11px]">Rejection Reason:</span>
                  <span>{selectedOwner.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedOwner(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {decisionModal.type === 'Approve' && 'Approve Property Owner Application'}
              {decisionModal.type === 'Reject' && 'Reject Owner Application'}
              {decisionModal.type === 'Suspend' && 'Suspend Owner Account'}
              {decisionModal.type === 'Reactivate' && 'Reactivate Owner Account'}
              {decisionModal.type === 'AssignBroker' && 'Assign Channel Broker to Owner'}
            </h3>
            <p className="text-xs text-slate-600">
              Owner: <strong>{decisionModal.owner.name}</strong> ({decisionModal.owner.id})
            </p>

            {decisionModal.type === 'AssignBroker' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Authorized Broker:
                </label>
                <select
                  value={selectedBrokerId}
                  onChange={e => setSelectedBrokerId(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="">-- Choose Broker --</option>
                  {brokers.filter(b => b.status === 'Approved').map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city}) - {b.licenseNumber}
                    </option>
                  ))}
                </select>
              </div>
            ) : decisionModal.type === 'Reject' || decisionModal.type === 'Suspend' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Documented Decision Reason (Required):
                </label>
                <textarea
                  rows={3}
                  required
                  value={reasonInput}
                  onChange={e => setReasonInput(e.target.value)}
                  placeholder="State clear operational reason for rejection or suspension..."
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Are you sure you want to {decisionModal.type.toLowerCase()} this owner? All property submissions will be subject to approval.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDecisionModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting || ((decisionModal.type === 'Reject' || decisionModal.type === 'Suspend') && !reasonInput.trim())}
                onClick={handleDecisionSubmit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
