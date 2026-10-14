'use client';

import React, { useState } from 'react';
import {
  Search,
  Percent,
  CheckCircle,
  Clock,
  XCircle,
  FileCheck,
  Send,
  Eye,
  X,
  FileSpreadsheet,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import { CommissionRecord, CommissionStatus } from '@/lib/types';

interface CommissionsViewProps {
  commissions: CommissionRecord[];
  onUpdateCommission: (params: {
    id: string;
    status?: CommissionStatus;
    paymentReference?: string;
    adjustmentNotes?: string;
  }) => Promise<void>;
  onRefresh: () => void;
}

export default function CommissionsView({
  commissions,
  onUpdateCommission,
  onRefresh,
}: CommissionsViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommission, setSelectedCommission] = useState<CommissionRecord | null>(null);
  const [payoutModalComm, setPayoutModalComm] = useState<CommissionRecord | null>(null);
  const [targetStatus, setTargetStatus] = useState<CommissionStatus>('Paid');
  const [payoutRef, setPayoutRef] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: (CommissionStatus | 'All')[] = [
    'All',
    'Pending',
    'Approved',
    'Payable',
    'Paid',
    'Disputed',
    'Cancelled',
  ];

  const filtered = commissions.filter(c => {
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      c.brokerName.toLowerCase().includes(q) ||
      c.propertyName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.bookingId.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const totalCalculated = commissions.reduce((sum, c) => sum + c.calculatedCommission, 0);
  const totalPaid = commissions.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.calculatedCommission, 0);
  const totalPayable = commissions.filter(c => c.status === 'Payable' || c.status === 'Approved' || c.status === 'Pending').reduce((sum, c) => sum + c.calculatedCommission, 0);

  const handlePayoutSubmit = async () => {
    if (!payoutModalComm) return;
    setIsSubmitting(true);
    await onUpdateCommission({
      id: payoutModalComm.id,
      status: targetStatus,
      paymentReference: payoutRef,
      adjustmentNotes: notesInput,
    });
    setIsSubmitting(false);
    setPayoutModalComm(null);
    setPayoutRef('');
    setNotesInput('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Metrics strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Total Calculated Commissions</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            ₹{totalCalculated.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Across all authorized bookings
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Paid Out to Channel Partners</span>
          <div className="text-xl font-bold text-emerald-800 mt-1 tabular-nums">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Verified with bank IMPS/NEFT references
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Pending / Payable Balance</span>
          <div className="text-xl font-bold text-amber-800 mt-1 tabular-nums">
            ₹{totalPayable.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
            Due after resident check-in clearance
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search by broker, property, ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Commission ID</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Broker Partner</th>
                <th className="py-3 px-4">Property & Owner</th>
                <th className="py-3 px-4 text-right">Booking Base</th>
                <th className="py-3 px-4 text-center">Rule / Rate</th>
                <th className="py-3 px-4 text-right">Commission (INR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payout Ref</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No matching commission records found.
                  </td>
                </tr>
              ) : (
                filtered.map(comm => (
                  <tr key={comm.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {comm.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-medium">
                      {comm.bookingId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{comm.brokerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{comm.brokerId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{comm.propertyName}</div>
                      <div className="text-[11px] text-slate-500">Host: {comm.ownerName}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      ₹{comm.bookingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700 tabular-nums">
                      {comm.commissionRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums text-sm">
                      ₹{comm.calculatedCommission.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        comm.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comm.status === 'Approved' || comm.status === 'Payable'
                          ? 'bg-blue-100 text-blue-800'
                          : comm.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {comm.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {comm.paymentReference || <span className="text-slate-400 italic">Unprocessed</span>}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCommission(comm)}
                        className="px-2 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Rule Details</span>
                      </button>
                      <button
                        onClick={() => {
                          setPayoutModalComm(comm);
                          setTargetStatus(comm.status === 'Pending' ? 'Approved' : 'Paid');
                          setPayoutRef(comm.paymentReference || '');
                          setNotesInput(comm.adjustmentNotes || '');
                        }}
                        className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        Process / Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Commission Record: {selectedCommission.id}</h3>
                <p className="text-xs text-slate-500 font-mono">Agreement: {selectedCommission.applicableAgreement}</p>
              </div>
              <button
                onClick={() => setSelectedCommission(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Broker</span>
                <span className="font-semibold text-slate-900">{selectedCommission.brokerName} ({selectedCommission.brokerId})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Property Host</span>
                <span className="font-semibold text-slate-900">{selectedCommission.ownerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Base Booking Value</span>
                <span className="font-bold text-slate-900 tabular-nums">₹{selectedCommission.bookingAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Commission Rate Applied</span>
                <span className="font-bold text-blue-700">{selectedCommission.commissionRate}%</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>Calculated Payout</span>
                <span className="tabular-nums">₹{selectedCommission.calculatedCommission.toLocaleString('en-IN')}</span>
              </div>
              {selectedCommission.paymentReference && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Bank UTR / IMPS Ref</span>
                  <span className="font-mono text-slate-900">{selectedCommission.paymentReference}</span>
                </div>
              )}
            </div>

            {selectedCommission.adjustmentNotes && (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                <span className="font-bold block text-slate-900 mb-0.5">Adjustment Audit Notes:</span>
                <p>{selectedCommission.adjustmentNotes}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCommission(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout / Adjust Modal */}
      {payoutModalComm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Process Commission Payout ({payoutModalComm.id})
            </h3>
            <p className="text-xs text-slate-600">
              Payee: <strong>{payoutModalComm.brokerName}</strong> (₹{payoutModalComm.calculatedCommission.toLocaleString('en-IN')})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Commission Status:
                </label>
                <select
                  value={targetStatus}
                  onChange={e => setTargetStatus(e.target.value as CommissionStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved (Queued for Payout)</option>
                  <option value="Payable">Payable (Ready for Transfer)</option>
                  <option value="Paid">Paid (Transfer Completed)</option>
                  <option value="Disputed">Disputed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank UTR / IMPS Transfer Reference:
                </label>
                <input
                  type="text"
                  value={payoutRef}
                  onChange={e => setPayoutRef(e.target.value)}
                  placeholder="e.g. IMPS/HDFC/20261013/88912"
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Audit Notes / Reason for Adjustment:
                </label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  placeholder="State transaction clearance details..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPayoutModalComm(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handlePayoutSubmit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Save & Record Audit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
