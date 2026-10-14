'use client';

import React, { useState } from 'react';
import {
  Search,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  X,
  FileCheck,
  Percent,
  Home,
  MessageSquare,
} from 'lucide-react';
import { Broker, BrokerStatus } from '@/lib/types';

interface BrokersViewProps {
  brokers: Broker[];
  onUpdateBroker: (params: {
    id: string;
    status?: BrokerStatus;
    rejectionReason?: string;
    suspensionReason?: string;
  }) => Promise<void>;
  onRefresh: () => void;
}

export default function BrokersView({
  brokers,
  onUpdateBroker,
  onRefresh,
}: BrokersViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [decisionModal, setDecisionModal] = useState<{
    broker: Broker;
    type: 'Approve' | 'Reject' | 'Suspend' | 'Reactivate';
  } | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: (BrokerStatus | 'All')[] = [
    'All',
    'Pending Approval',
    'Approved',
    'Rejected',
    'Suspended',
  ];

  const filtered = brokers.filter(b => {
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.licenseNumber.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleDecisionSubmit = async () => {
    if (!decisionModal) return;
    setIsSubmitting(true);
    const { broker, type } = decisionModal;

    if (type === 'Approve') {
      await onUpdateBroker({ id: broker.id, status: 'Approved' });
    } else if (type === 'Reject') {
      await onUpdateBroker({ id: broker.id, status: 'Rejected', rejectionReason: reasonInput });
    } else if (type === 'Suspend') {
      await onUpdateBroker({ id: broker.id, status: 'Suspended', suspensionReason: reasonInput });
    } else if (type === 'Reactivate') {
      await onUpdateBroker({ id: broker.id, status: 'Approved' });
    }

    setIsSubmitting(false);
    setDecisionModal(null);
    setReasonInput('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Filters and search */}
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
            placeholder="Search brokers by name, RERA license, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Brokers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Broker ID</th>
                <th className="py-3 px-4">Broker Name</th>
                <th className="py-3 px-4">RERA License / Credentials</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4 text-center">Assigned Listings</th>
                <th className="py-3 px-4 text-center">Active Inquiries</th>
                <th className="py-3 px-4 text-right">Commission Earned</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching broker accounts found.
                  </td>
                </tr>
              ) : (
                filtered.map(broker => (
                  <tr key={broker.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {broker.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{broker.name}</div>
                      <div className="text-[11px] text-slate-500">{broker.email} · {broker.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 text-[11px] font-semibold">{broker.licenseNumber}</div>
                      <div className="text-[10px] text-slate-500">{broker.experienceYears} Years Exp · {broker.commissionRateDefault}% Default Comm.</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{broker.city}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                      {broker.assignedPropertiesCount}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                      {broker.activeInquiriesCount}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      ₹{broker.commissionEarned.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          broker.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : broker.status === 'Pending Approval'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {broker.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedBroker(broker)}
                        className="px-2 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {broker.status === 'Pending Approval' && (
                        <>
                          <button
                            onClick={() => setDecisionModal({ broker, type: 'Approve' })}
                            className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setDecisionModal({ broker, type: 'Reject' })}
                            className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {broker.status === 'Approved' && (
                        <button
                          onClick={() => setDecisionModal({ broker, type: 'Suspend' })}
                          className="px-2 py-1 rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium"
                        >
                          Suspend
                        </button>
                      )}

                      {broker.status === 'Suspended' && (
                        <button
                          onClick={() => setDecisionModal({ broker, type: 'Reactivate' })}
                          className="px-2 py-1 rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broker Profile Modal */}
      {selectedBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Broker Dossier: {selectedBroker.name}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedBroker.id}</p>
              </div>
              <button
                onClick={() => setSelectedBroker(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">RERA License Number</span>
                <span className="font-mono font-bold text-slate-900">{selectedBroker.licenseNumber}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Operational City</span>
                <span className="font-semibold text-slate-900">{selectedBroker.city}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Experience</span>
                <span className="font-semibold text-slate-900">{selectedBroker.experienceYears} Years</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Agreed Commission Rate</span>
                <span className="font-semibold text-slate-900">{selectedBroker.commissionRateDefault}%</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedBroker(null)}
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
              {decisionModal.type === 'Approve' && 'Approve Broker Application'}
              {decisionModal.type === 'Reject' && 'Reject Broker Application'}
              {decisionModal.type === 'Suspend' && 'Suspend Broker Account'}
              {decisionModal.type === 'Reactivate' && 'Reactivate Broker Account'}
            </h3>
            <p className="text-xs text-slate-600">
              Broker: <strong>{decisionModal.broker.name}</strong> ({decisionModal.broker.id})
            </p>

            {(decisionModal.type === 'Reject' || decisionModal.type === 'Suspend') && (
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
