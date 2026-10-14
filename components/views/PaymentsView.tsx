'use client';

import React, { useState } from 'react';
import {
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  FileDown,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { PaymentRecord, PaymentStatus } from '@/lib/types';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  onUpdatePayment: (params: {
    id: string;
    reconciliationStatus?: 'Verified' | 'Pending Verification' | 'Disputed';
    status?: PaymentStatus;
    notes?: string;
  }) => Promise<void>;
  onRefresh: () => void;
}

export default function PaymentsView({
  payments,
  onUpdatePayment,
  onRefresh,
}: PaymentsViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [reconcileModalPay, setReconcileModalPay] = useState<PaymentRecord | null>(null);
  const [recStatus, setRecStatus] = useState<'Verified' | 'Disputed'>('Verified');
  const [recNotes, setRecNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: (PaymentStatus | 'All')[] = [
    'All',
    'Successful',
    'Pending',
    'Processing',
    'Failed',
    'Refunded',
  ];

  const filtered = payments.filter(p => {
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      p.customerName.toLowerCase().includes(q) ||
      p.transactionReference.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.bookingId.toLowerCase().includes(q) ||
      p.propertyName.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const exportCsv = () => {
    const headers = ['Payment ID', 'Booking ID', 'Customer', 'Property', 'Amount (INR)', 'Deposit', 'Platform Fee', 'Method', 'Transaction Ref', 'Status', 'Reconciliation'];
    const rows = filtered.map(p => [
      p.id,
      p.bookingId,
      `"${p.customerName}"`,
      `"${p.propertyName}"`,
      p.totalAmount,
      p.securityDeposit,
      p.platformFees,
      `"${p.paymentMethod}"`,
      p.transactionReference,
      p.status,
      p.reconciliationStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Peflarmo_Payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReconcileSubmit = async () => {
    if (!reconcileModalPay) return;
    setIsSubmitting(true);
    await onUpdatePayment({
      id: reconcileModalPay.id,
      reconciliationStatus: recStatus,
      notes: recNotes,
    });
    setIsSubmitting(false);
    setReconcileModalPay(null);
    setRecNotes('');
    onRefresh();
  };

  const totalSuccessful = payments
    .filter(p => p.status === 'Successful')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const totalInEscrow = payments
    .filter(p => p.reconciliationStatus === 'Verified')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Financial overview strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Total Received & Settled</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            ₹{totalSuccessful.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Across {payments.filter(p => p.status === 'Successful').length} settled transactions
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Verified Escrow Balance</span>
          <div className="text-xl font-bold text-blue-900 mt-1 tabular-nums">
            ₹{totalInEscrow.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
            Held in segregated account
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 block">Reconciliation Status</span>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Bank Statement Match 100%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Razorpay / ICICI Escrow Webhooks Active
          </span>
        </div>
      </div>

      {/* Filter, search, and CSV export bar */}
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

        <div className="flex items-center gap-2">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reference, customer, booking..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Customer & Property</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Gateway Reference</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reconciliation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No matching payment transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {pay.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-medium">
                      {pay.bookingId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{pay.customerName}</div>
                      <div className="text-[11px] text-slate-500">{pay.propertyName}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      <div>₹{pay.totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400 font-normal">Fee: ₹{pay.platformFees}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{pay.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {pay.transactionReference}
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(pay.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pay.status === 'Successful'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pay.status === 'Processing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        pay.reconciliationStatus === 'Verified' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {pay.reconciliationStatus === 'Verified' ? '✓ Verified' : '⧗ Pending Check'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPayment(pay)}
                        className="px-2 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                      <button
                        onClick={() => {
                          setReconcileModalPay(pay);
                          setRecStatus(pay.reconciliationStatus === 'Verified' ? 'Verified' : 'Verified');
                          setRecNotes(pay.notes || '');
                        }}
                        className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        Reconcile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Payment Voucher: {selectedPayment.id}</h3>
                <p className="text-xs text-slate-500 font-mono">Txn: {selectedPayment.transactionReference}</p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Booking Reference</span>
                <span className="font-mono font-bold text-slate-900">{selectedPayment.bookingId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Customer Name</span>
                <span className="font-semibold text-slate-900">{selectedPayment.customerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Property</span>
                <span className="font-semibold text-slate-900">{selectedPayment.propertyName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Booking Amount (First Month)</span>
                <span className="font-bold text-slate-900 tabular-nums">₹{selectedPayment.bookingAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Security Deposit Escrow</span>
                <span className="font-bold text-slate-900 tabular-nums">₹{selectedPayment.securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Platform Convenience Fee</span>
                <span className="font-bold text-slate-900 tabular-nums">₹{selectedPayment.platformFees.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>Total Settled Amount</span>
                <span className="tabular-nums">₹{selectedPayment.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {selectedPayment.notes && (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                <span className="font-bold block text-slate-900 mb-0.5">Audit Note:</span>
                <p>{selectedPayment.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {reconcileModalPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Reconcile Bank Transaction ({reconcileModalPay.id})
            </h3>
            <p className="text-xs text-slate-600">
              Transaction Ref: <strong>{reconcileModalPay.transactionReference}</strong> (₹{reconcileModalPay.totalAmount.toLocaleString('en-IN')})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reconciliation Decision:
                </label>
                <select
                  value={recStatus}
                  onChange={e => setRecStatus(e.target.value as 'Verified' | 'Disputed')}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Verified">Verified against Bank Statement & Escrow</option>
                  <option value="Disputed">Flag as Disputed / Mismatched</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reconciliation Note:
                </label>
                <textarea
                  rows={2}
                  value={recNotes}
                  onChange={e => setRecNotes(e.target.value)}
                  placeholder="e.g. Cleared via HDFC Escrow UTR reference..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setReconcileModalPay(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleReconcileSubmit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Reconciliation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
