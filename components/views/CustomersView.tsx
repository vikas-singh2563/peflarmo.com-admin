'use client';

import React, { useState } from 'react';
import {
  Search,
  UserCheck,
  UserX,
  Eye,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  X,
  FileText,
  Lock,
} from 'lucide-react';
import { Customer } from '@/lib/types';

interface CustomersViewProps {
  customers: Customer[];
  onUpdateCustomerStatus: (id: string, status: 'Active' | 'Suspended', reason?: string) => Promise<void>;
  onRefresh: () => void;
}

export default function CustomersView({
  customers,
  onUpdateCustomerStatus,
  onRefresh,
}: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [suspendModalCust, setSuspendModalCust] = useState<Customer | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [maskPii, setMaskPii] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  const handleConfirmSuspend = async () => {
    if (!suspendModalCust) return;
    setIsSubmitting(true);
    await onUpdateCustomerStatus(
      suspendModalCust.id,
      suspendModalCust.status === 'Active' ? 'Suspended' : 'Active',
      suspensionReason
    );
    setIsSubmitting(false);
    setSuspendModalCust(null);
    setSuspensionReason('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top action / filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, phone, ID, or city..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={maskPii}
              onChange={e => setMaskPii(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Mask Customer PII (Privacy Mode)</span>
            </span>
          </label>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4 text-center">Inquiries</th>
                <th className="py-3 px-4 text-center">Bookings</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching customer accounts found.
                  </td>
                </tr>
              ) : (
                filtered.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {cust.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{cust.name}</div>
                      {cust.kycVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                          <Shield className="w-3 h-3" /> KYC Verified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>
                        {maskPii ? cust.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : cust.email}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {maskPii ? cust.phone.replace(/(\+91\s\d{2})\d{4}(\d{4})/, '$1****$2') : cust.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{cust.city}</td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(cust.registrationDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800 tabular-nums">
                      {cust.totalInquiries}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800 tabular-nums">
                      {cust.totalBookings}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium inline-flex items-center gap-1"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => setSuspendModalCust(cust)}
                        className={`px-2.5 py-1 rounded-md font-medium text-xs ${
                          cust.status === 'Active'
                            ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                            : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {cust.status === 'Active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Customer Profile: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedCustomer.id}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Email Address</span>
                <span className="font-semibold text-slate-900 break-all">{selectedCustomer.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Phone Number</span>
                <span className="font-semibold text-slate-900">{selectedCustomer.phone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Current City</span>
                <span className="font-semibold text-slate-900">{selectedCustomer.city}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">KYC Verification</span>
                <span className={`font-semibold ${selectedCustomer.kycVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedCustomer.kycVerified ? `Verified (${selectedCustomer.idProofType || 'Aadhaar'})` : 'Unverified'}
                </span>
              </div>
              {selectedCustomer.emergencyContact && (
                <div className="col-span-2 p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block text-[11px]">Emergency Contact</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.emergencyContact}</span>
                </div>
              )}
              {selectedCustomer.suspensionReason && (
                <div className="col-span-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                  <span className="font-bold block text-[11px]">Account Suspension Reason:</span>
                  <span>{selectedCustomer.suspensionReason}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between text-xs">
              <div>
                <span className="text-slate-500">Inquiry Count: </span>
                <span className="font-bold text-slate-900">{selectedCustomer.totalInquiries}</span>
                <span className="mx-2">·</span>
                <span className="text-slate-500">Confirmed Bookings: </span>
                <span className="font-bold text-slate-900">{selectedCustomer.totalBookings}</span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend / Reactivate Reason Modal */}
      {suspendModalCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {suspendModalCust.status === 'Active' ? 'Suspend Customer Account' : 'Reactivate Customer Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  Customer: {suspendModalCust.name} ({suspendModalCust.id})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Administrative action will be documented in the permanent audit logs with your administrator ID and timestamp.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Documented Reason / Administrative Notes:
              </label>
              <textarea
                required
                rows={3}
                value={suspensionReason}
                onChange={e => setSuspensionReason(e.target.value)}
                placeholder="State specific reason for suspension or reactivation..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSuspendModalCust(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || !suspensionReason.trim()}
                onClick={handleConfirmSuspend}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-50 ${
                  suspendModalCust.status === 'Active'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? 'Recording...' : suspendModalCust.status === 'Active' ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
