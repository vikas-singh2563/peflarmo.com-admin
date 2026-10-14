'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  FileSpreadsheet,
  Clock,
  Filter,
} from 'lucide-react';
import { AuditLogEntry } from '@/lib/types';

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
}

export default function AuditLogsView({ logs }: AuditLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<'All' | 'SUCCESS' | 'DENIED' | 'WARNING'>('All');

  const filtered = logs.filter(log => {
    const matchesResult = resultFilter === 'All' || log.result === resultFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      log.action.toLowerCase().includes(q) ||
      log.adminName.toLowerCase().includes(q) ||
      log.adminRole.toLowerCase().includes(q) ||
      log.recordId.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.ipAddress.includes(q);
    return matchesResult && matchesQuery;
  });

  const exportLogsCsv = () => {
    const headers = ['Event ID', 'Log ID', 'Timestamp', 'Admin Name', 'Role', 'Action', 'Target Record', 'Result', 'IP Address', 'Details'];
    const rows = filtered.map(l => [
      l.eventId,
      l.id,
      l.timestamp,
      `"${l.adminName}"`,
      l.adminRole,
      `"${l.action}"`,
      l.recordId,
      l.result,
      l.ipAddress,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Peflarmo_AuditLogs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Security Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold">
              Tamper-Evident Administrative Audit Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Every administrative session, approval decision, customer status modification, inquiry routing, and payment verification is immutably logged with admin credentials and origin IP.
          </p>
        </div>
        <button
          onClick={exportLogsCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          {(['All', 'SUCCESS', 'DENIED', 'WARNING'] as const).map(res => (
            <button
              key={res}
              onClick={() => setResultFilter(res)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                resultFilter === res ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {res} ({res === 'All' ? logs.length : logs.filter(l => l.result === res).length})
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search action, admin, record ID, IP..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Origin IP</th>
                <th className="py-3 px-4">Details / Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No matching audit log entries found.
                  </td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 text-[11px]">
                      {log.eventId}
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.adminName}</div>
                      <div className="text-[10px] text-blue-600 font-medium">{log.adminRole}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {log.recordId}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.result === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.result === 'DENIED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 tabular-nums">
                      {log.ipAddress}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
