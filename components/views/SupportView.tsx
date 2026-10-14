'use client';

import React, { useState } from 'react';
import {
  HeadphonesIcon,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  Eye,
  X,
  MessageSquare,
  Shield,
  User,
} from 'lucide-react';
import { SupportTicket, TicketStatus, TicketPriority } from '@/lib/types';

interface SupportViewProps {
  tickets: SupportTicket[];
  onUpdateTicket: (params: {
    id: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedStaff?: string;
    noteText?: string;
    resolutionSummary?: string;
  }) => Promise<void>;
  onRefresh: () => void;
}

export default function SupportView({
  tickets,
  onUpdateTicket,
  onRefresh,
}: SupportViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [staffInput, setStaffInput] = useState('');
  const [statusInput, setStatusInput] = useState<TicketStatus>('Under Review');
  const [resolutionInput, setResolutionInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: (TicketStatus | 'All')[] = [
    'All',
    'Open',
    'Under Review',
    'Awaiting Response',
    'Resolved',
    'Closed',
  ];

  const filtered = tickets.filter(t => {
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      t.userName.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.complaintCategory.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleTicketUpdate = async () => {
    if (!selectedTicket) return;
    setIsSubmitting(true);
    await onUpdateTicket({
      id: selectedTicket.id,
      status: statusInput,
      assignedStaff: staffInput || selectedTicket.assignedStaff,
      noteText: noteInput || undefined,
      resolutionSummary: resolutionInput || undefined,
    });
    setIsSubmitting(false);
    setNoteInput('');
    setSelectedTicket(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HeadphonesIcon className="w-4 h-4 text-blue-600" />
            <span>Support & Grievance Resolution Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal administrative notes are strictly encrypted and invisible to external tenants and hosts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            {tickets.filter(t => t.priority === 'Urgent' || t.priority === 'High').length} High Priority
          </span>
          <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            {tickets.filter(t => t.status === 'Open').length} Open Tickets
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
            placeholder="Search tickets by user, category, keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Submitter</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Related Listing / Booking</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching support tickets found.
                  </td>
                </tr>
              ) : (
                filtered.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {ticket.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ticket.userName}</div>
                      <div className="text-[11px] text-slate-400">{ticket.userType} · {ticket.userPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {ticket.complaintCategory}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ticket.relatedPropertyName || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {ticket.assignedStaff || <span className="text-amber-600 font-semibold">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.priority === 'Urgent' || ticket.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : ticket.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.status === 'Resolved' || ticket.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ticket.status === 'Open'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(ticket.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setStatusInput(ticket.status);
                          setStaffInput(ticket.assignedStaff || '');
                          setResolutionInput(ticket.resolutionSummary || '');
                        }}
                        className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        Manage & Notes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Private Notes Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Grievance Dossier: {selectedTicket.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Submitter: {selectedTicket.userName} ({selectedTicket.userType}) · Priority: {selectedTicket.priority}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <span className="font-bold text-slate-900">Issue Description:</span>
              <p className="text-slate-700 leading-relaxed">&quot;{selectedTicket.description}&quot;</p>
              {selectedTicket.relatedPropertyName && (
                <div className="text-[11px] text-slate-500 pt-1 mt-1 border-t border-slate-200">
                  Associated Listing: <strong>{selectedTicket.relatedPropertyName}</strong>
                </div>
              )}
            </div>

            {/* Secret Internal Admin Notes (Hidden from customers/owners/brokers) */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Confidential Internal Administrative Notes (Hidden from User)</span>
                </span>
                <span className="text-[10px] text-amber-700 font-semibold uppercase">Admin Only</span>
              </div>

              <div className="space-y-2">
                {selectedTicket.internalNotes.length === 0 ? (
                  <p className="text-xs text-amber-800/80 italic">No internal notes added yet.</p>
                ) : (
                  selectedTicket.internalNotes.map(n => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-xs">
                      <div className="flex justify-between font-semibold text-slate-900">
                        <span>{n.adminName}</span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {new Date(n.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-0.5">{n.note}</p>
                    </div>
                  ))
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  Append Internal Operational Note:
                </label>
                <textarea
                  rows={2}
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Record internal inspection findings or legal notes..."
                  className="w-full p-2 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Update Controls */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Status:</label>
                <select
                  value={statusInput}
                  onChange={e => setStatusInput(e.target.value as TicketStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  {statuses.filter(s => s !== 'All').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Support Staff:</label>
                <input
                  type="text"
                  value={staffInput}
                  onChange={e => setStaffInput(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {(statusInput === 'Resolved' || statusInput === 'Closed') && (
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Resolution Summary for Submitter:</label>
                  <textarea
                    rows={2}
                    value={resolutionInput}
                    onChange={e => setResolutionInput(e.target.value)}
                    placeholder="State resolution reached with host or refund processed..."
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleTicketUpdate}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Ticket Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
