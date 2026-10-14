'use client';

import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  UserCheck,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  X,
  Send,
} from 'lucide-react';
import { CustomerInquiry, InquiryStatus, Owner, Broker } from '@/lib/types';

interface InquiriesViewProps {
  inquiries: CustomerInquiry[];
  owners: Owner[];
  brokers: Broker[];
  onUpdateInquiry: (params: {
    id: string;
    status?: InquiryStatus;
    assignedOwnerId?: string;
    assignedBrokerId?: string;
    adminNotes?: string;
    note?: string;
  }) => Promise<void>;
  onRefresh: () => void;
}

export default function InquiriesView({
  inquiries,
  owners,
  brokers,
  onUpdateInquiry,
  onRefresh,
}: InquiriesViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [assignModalInq, setAssignModalInq] = useState<CustomerInquiry | null>(null);
  const [assignOwnerId, setAssignOwnerId] = useState('');
  const [assignBrokerId, setAssignBrokerId] = useState('');
  const [assignStatus, setAssignStatus] = useState<InquiryStatus>('Assigned to Broker');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: (InquiryStatus | 'All')[] = [
    'All',
    'Pending Admin Review',
    'Under Review',
    'Assigned to Owner',
    'Assigned to Broker',
    'Contact in Progress',
    'Follow-up Required',
    'Resolved',
    'Rejected',
    'Closed',
  ];

  const filtered = inquiries.filter(inq => {
    const matchesStatus = selectedStatus === 'All' || inq.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      inq.customerName.toLowerCase().includes(q) ||
      inq.propertyName.toLowerCase().includes(q) ||
      inq.id.toLowerCase().includes(q) ||
      inq.customerEmail.toLowerCase().includes(q) ||
      inq.customerPhone.includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleAssignSubmit = async () => {
    if (!assignModalInq) return;
    setIsSubmitting(true);
    await onUpdateInquiry({
      id: assignModalInq.id,
      status: assignStatus,
      assignedOwnerId: assignOwnerId || undefined,
      assignedBrokerId: assignBrokerId || undefined,
      adminNotes: adminNoteInput,
      note: `Admin routed inquiry to: ${assignOwnerId ? 'Owner' : ''} ${assignBrokerId ? 'Broker' : ''}. Note: ${adminNoteInput}`,
    });

    setIsSubmitting(false);
    setAssignModalInq(null);
    setAssignOwnerId('');
    setAssignBrokerId('');
    setAdminNoteInput('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Admin First Workflow Banner */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-indigo-950">
              Admin-First Customer Inquiry Routing Protocol
            </h2>
          </div>
          <p className="text-xs text-indigo-800 mt-1 max-w-2xl">
            All customer inquiries arrive in Admin review first. No broker or owner receives customer contact details until Admin authorizes and routes the request.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 shrink-0">
          <span>{inquiries.filter(i => i.status === 'Pending Admin Review').length} New Unrouted Inquiries</span>
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
            placeholder="Search inquiries by customer, property, ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Inquiry ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Target Property</th>
                <th className="py-3 px-4">Move-in Date</th>
                <th className="py-3 px-4">Assigned Personnel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Inquiry Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No matching customer inquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map(inq => (
                  <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {inq.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inq.customerName}</div>
                      <div className="text-[11px] text-slate-500">{inq.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inq.propertyName}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{inq.propertyCategory}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium tabular-nums">
                      {inq.preferredMoveInDate}
                    </td>
                    <td className="py-3 px-4">
                      {inq.assignedBrokerName ? (
                        <div className="text-slate-800 font-medium">Broker: {inq.assignedBrokerName}</div>
                      ) : inq.assignedOwnerName ? (
                        <div className="text-slate-800 font-medium">Host: {inq.assignedOwnerName}</div>
                      ) : (
                        <span className="text-amber-600 font-bold text-[11px]">Unassigned (Admin Review)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inq.status === 'Pending Admin Review'
                            ? 'bg-amber-100 text-amber-800'
                            : inq.status === 'Resolved' || inq.status === 'Closed'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(inq.inquiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                      <button
                        onClick={() => {
                          setAssignModalInq(inq);
                          setAssignOwnerId(inq.assignedOwnerId || '');
                          setAssignBrokerId(inq.assignedBrokerId || '');
                          setAssignStatus(inq.status);
                        }}
                        className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Route / Assign</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Activity Timeline Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Inquiry Dossier: {selectedInquiry.id}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedInquiry.customerName} for {selectedInquiry.propertyName}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5">
              <div>
                <span className="text-slate-500">Customer Message:</span>
                <p className="font-semibold text-slate-900 mt-0.5">&quot;{selectedInquiry.message}&quot;</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-700">
                <div>Email: {selectedInquiry.customerEmail}</div>
                <div>Phone: {selectedInquiry.customerPhone}</div>
                <div>Preferred Move-in: {selectedInquiry.preferredMoveInDate}</div>
                <div>Monthly Budget: ₹{selectedInquiry.budgetMonthly.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {selectedInquiry.adminNotes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                <span className="font-bold block">Internal Admin Notes:</span>
                <p className="mt-0.5">{selectedInquiry.adminNotes}</p>
              </div>
            )}

            {/* Audit History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Synchronized Activity Log</span>
              </h4>
              <div className="space-y-2">
                {selectedInquiry.activityHistory.map((act, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{act.action}</span>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">By: {act.performedBy}</div>
                    {act.note && <div className="text-[11px] text-slate-700 mt-1 italic">&quot;{act.note}&quot;</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route / Assign Modal */}
      {assignModalInq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Route Customer Inquiry (Admin First Workflow)
            </h3>
            <p className="text-xs text-slate-600">
              Inquiry: <strong>{assignModalInq.id}</strong> ({assignModalInq.customerName} for {assignModalInq.propertyName})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Authorized Host / Owner:
                </label>
                <select
                  value={assignOwnerId}
                  onChange={e => setAssignOwnerId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="">-- Do Not Assign Owner --</option>
                  {owners.filter(o => o.status === 'Approved').map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.city}) - {o.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Channel Broker / Partner:
                </label>
                <select
                  value={assignBrokerId}
                  onChange={e => setAssignBrokerId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="">-- Do Not Assign Broker --</option>
                  {brokers.filter(b => b.status === 'Approved').map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city}) - RERA: {b.licenseNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Update Inquiry Workflow Status:
                </label>
                <select
                  value={assignStatus}
                  onChange={e => setAssignStatus(e.target.value as InquiryStatus)}
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
                  Admin Internal Routing Notes:
                </label>
                <textarea
                  rows={2}
                  value={adminNoteInput}
                  onChange={e => setAdminNoteInput(e.target.value)}
                  placeholder="e.g. Host requested to schedule visit for Saturday 11 AM..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAssignModalInq(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleAssignSubmit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Routing...' : 'Confirm Routing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
