'use client';

import React, { useState } from 'react';
import {
  Search,
  CalendarCheck,
  Building2,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Shield,
  X,
  CreditCard,
  User,
  Send,
  Lock,
} from 'lucide-react';
import { Booking, BookingStatus, PaymentStatus, Broker, Owner } from '@/lib/types';

interface BookingsViewProps {
  bookings: Booking[];
  brokers: Broker[];
  owners: Owner[];
  onUpdateBooking: (params: {
    id: string;
    bookingStatus?: BookingStatus;
    paymentStatus?: PaymentStatus;
    assignedBrokerId?: string;
    adminNotes?: string;
    note?: string;
  }) => Promise<{ error?: string }>;
  onRefresh: () => void;
}

export default function BookingsView({
  bookings,
  brokers,
  owners,
  onUpdateBooking,
  onRefresh,
}: BookingsViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [routeModalBooking, setRouteModalBooking] = useState<Booking | null>(null);
  const [targetBookingStatus, setTargetBookingStatus] = useState<BookingStatus>('Confirmed');
  const [targetPaymentStatus, setTargetPaymentStatus] = useState<PaymentStatus>('Successful');
  const [targetBrokerId, setTargetBrokerId] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: (BookingStatus | 'All')[] = [
    'All',
    'Pending Admin Review',
    'Under Review',
    'Assigned to Owner',
    'Assigned to Broker',
    'Awaiting Confirmation',
    'Confirmed',
    'Rejected',
    'Cancelled',
    'Completed',
  ];

  const filtered = bookings.filter(b => {
    const matchesStatus = selectedStatus === 'All' || b.bookingStatus === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      b.customerName.toLowerCase().includes(q) ||
      b.propertyName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.customerEmail.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleRouteSubmit = async () => {
    if (!routeModalBooking) return;
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await onUpdateBooking({
      id: routeModalBooking.id,
      bookingStatus: targetBookingStatus,
      paymentStatus: targetPaymentStatus,
      assignedBrokerId: targetBrokerId || undefined,
      adminNotes: adminNoteInput,
      note: `Admin workflow update to ${targetBookingStatus}. Note: ${adminNoteInput}`,
    });

    setIsSubmitting(false);

    if (res?.error) {
      setErrorMessage(res.error);
      return;
    }

    setRouteModalBooking(null);
    setAdminNoteInput('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Workflow protocol banner */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-bold text-emerald-950">
              Admin-First Booking Verification & Double-Booking Guard
            </h2>
          </div>
          <p className="text-xs text-emerald-800 mt-1 max-w-2xl">
            Every booking request enters Admin review first. The system automatically performs server-side date collision checks on bed & room allocations to guarantee zero double-bookings.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-900 shrink-0">
          <span>{bookings.filter(b => b.bookingStatus === 'Pending Admin Review').length} Pending Admin First Review</span>
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
            placeholder="Search bookings by customer, property, ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Property & Room/Bed</th>
                <th className="py-3 px-4">Check-in Dates</th>
                <th className="py-3 px-4 text-right">Rent & Deposit</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Booking Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No matching booking records found.
                  </td>
                </tr>
              ) : (
                filtered.map(bkg => (
                  <tr key={bkg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {bkg.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{bkg.customerName}</div>
                      <div className="text-[11px] text-slate-500">{bkg.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{bkg.propertyName}</div>
                      <div className="text-[11px] text-blue-600 font-medium">
                        {bkg.roomBedType} ({bkg.propertyCategory})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 tabular-nums">
                      <div>In: {bkg.checkInDate}</div>
                      <div className="text-[10px] text-slate-400">Out: {bkg.checkOutDate || 'Ongoing'}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      <div>₹{bkg.totalBookingAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        Rent: ₹{bkg.monthlyRent.toLocaleString('en-IN')} · Dep: ₹{bkg.securityDeposit.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bkg.paymentStatus === 'Successful'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bkg.paymentStatus === 'Processing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {bkg.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bkg.bookingStatus === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bkg.bookingStatus === 'Pending Admin Review'
                          ? 'bg-amber-100 text-amber-800'
                          : bkg.bookingStatus === 'Cancelled' || bkg.bookingStatus === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {bkg.bookingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedBooking(bkg)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                      <button
                        onClick={() => {
                          setRouteModalBooking(bkg);
                          setTargetBookingStatus(bkg.bookingStatus);
                          setTargetPaymentStatus(bkg.paymentStatus);
                          setTargetBrokerId(bkg.assignedBrokerId || '');
                          setErrorMessage('');
                        }}
                        className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium inline-flex items-center gap-1"
                      >
                        <span>Manage & Confirm</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Booking Dossier: {selectedBooking.id}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Created: {new Date(selectedBooking.bookingCreationDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Customer</span>
                <span className="font-semibold text-slate-900">{selectedBooking.customerName}</span>
                <div className="text-slate-500 text-[11px] mt-0.5">{selectedBooking.customerPhone}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Property & Bed Unit</span>
                <span className="font-semibold text-slate-900">{selectedBooking.propertyName}</span>
                <div className="text-blue-600 font-medium text-[11px] mt-0.5">{selectedBooking.roomBedType}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Stay Tenure</span>
                <span className="font-bold text-slate-900 tabular-nums">From {selectedBooking.checkInDate}</span>
                <div className="text-slate-500 text-[11px]">To: {selectedBooking.checkOutDate || 'Ongoing'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Financial Breakdown</span>
                <span className="font-bold text-slate-900">Total: ₹{selectedBooking.totalBookingAmount.toLocaleString('en-IN')}</span>
                <div className="text-[10px] text-slate-500 mt-0.5">Rent: ₹{selectedBooking.monthlyRent} + Dep: ₹{selectedBooking.securityDeposit}</div>
              </div>
            </div>

            {selectedBooking.adminNotes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                <span className="font-bold block">Internal Admin Notes:</span>
                <p className="mt-0.5">{selectedBooking.adminNotes}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Workflow Activity History</h4>
              <div className="space-y-1.5">
                {selectedBooking.activityHistory.map((act, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>{act.action}</span>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">By: {act.performedBy}</div>
                    {act.note && <div className="text-[11px] text-slate-600 italic mt-0.5">{act.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route & Confirm Booking Modal */}
      {routeModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Manage Booking & Process Confirmation
            </h3>
            <p className="text-xs text-slate-600">
              Booking: <strong>{routeModalBooking.id}</strong> ({routeModalBooking.customerName} for {routeModalBooking.propertyName})
            </p>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Collision Detected:</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Broker / Channel Partner:
                </label>
                <select
                  value={targetBrokerId}
                  onChange={e => setTargetBrokerId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="">-- Direct Booking (No Broker) --</option>
                  {brokers.filter(b => b.status === 'Approved').map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.licenseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Update Booking Status:
                </label>
                <select
                  value={targetBookingStatus}
                  onChange={e => setTargetBookingStatus(e.target.value as BookingStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  {statuses.filter(s => s !== 'All').map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Status:
                </label>
                <select
                  value={targetPaymentStatus}
                  onChange={e => setTargetPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Successful">Successful (Token/Full Received)</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Admin Verification Notes:
                </label>
                <textarea
                  rows={2}
                  value={adminNoteInput}
                  onChange={e => setAdminNoteInput(e.target.value)}
                  placeholder="Record verification details, agreement serial number or host signoff..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setRouteModalBooking(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleRouteSubmit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Validating...' : 'Save & Enforce'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
