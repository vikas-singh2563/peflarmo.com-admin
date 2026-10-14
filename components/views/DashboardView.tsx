'use client';

import React, { useState } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  Home,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  CalendarCheck,
  CreditCard,
  Percent,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Calendar,
  IndianRupee,
  Plus,
  FileSpreadsheet,
  Check,
  ExternalLink,
} from 'lucide-react';
import { NavSection } from '../Sidebar';

interface DashboardStats {
  totalCustomers: number;
  totalOwners: number;
  totalBrokers: number;
  totalProperties: number;
  pendingPropertyApprovals: number;
  approvedProperties: number;
  rejectedProperties: number;
  newCustomerInquiries: number;
  pendingBookingRequests: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalPaymentsAmount: number;
  pendingPaymentsAmount: number;
  totalCommissionsEarned: number;
  pendingCommissionPayouts: number;
  categoryCounts: {
    PG: number;
    Flat: number;
    Room: number;
    Hostel: number;
  };
  recentBookings: any[];
  recentInquiries: any[];
  recentApprovals: any[];
  recentActivity: any[];
}

interface DashboardViewProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  onRefresh: () => void;
  onNavigate: (section: NavSection) => void;
}

export default function DashboardView({
  stats,
  isLoading,
  onRefresh,
  onNavigate,
}: DashboardViewProps) {
  const [revenueTimeframe, setRevenueTimeframe] = useState('Last 7 Days');

  return (
    <div className="space-y-6">
      {/* Top Welcome Section matching peflarmo.png */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, Amit Sharma!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your Peflarmo platform today.
          </p>
        </div>

        {/* Date widget */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs self-start md:self-auto">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              11 Oct 2026
            </span>
            <span className="text-[11px] text-slate-500 block leading-tight">
              Monday, 11:24 AM
            </span>
          </div>
        </div>
      </div>

      {/* Row 1 KPI Cards (5 cards across on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Customers</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums block leading-tight">
                1,248
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 12% <span className="font-normal text-slate-400">vs last month</span></span>
          </div>
        </div>

        {/* Total Owners */}
        <div
          onClick={() => onNavigate('owners')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Owners</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums block leading-tight">
                286
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 8% <span className="font-normal text-slate-400">vs last month</span></span>
          </div>
        </div>

        {/* Total Brokers */}
        <div
          onClick={() => onNavigate('brokers')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Brokers</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums block leading-tight">
                142
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 5% <span className="font-normal text-slate-400">vs last month</span></span>
          </div>
        </div>

        {/* Total Properties */}
        <div
          onClick={() => onNavigate('properties')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Properties</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums block leading-tight">
                892
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 10% <span className="font-normal text-slate-400">vs last month</span></span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => onNavigate('property-approvals')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Pending Approvals</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums block leading-tight">
                48
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-2.5">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>↓ 6% <span className="font-normal text-slate-400">vs last month</span></span>
          </div>
        </div>
      </div>

      {/* Row 2 KPI Cards (7 cards matching screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* New Inquiries */}
        <div
          onClick={() => onNavigate('inquiries')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">New Inquiries</span>
          </div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">186</div>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 15% <span className="font-normal text-slate-400">vs last month</span></span>
        </div>

        {/* Pending Bookings */}
        <div
          onClick={() => onNavigate('bookings')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">Pending Bookings</span>
          </div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">124</div>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 9% <span className="font-normal text-slate-400">vs last month</span></span>
        </div>

        {/* Confirmed Bookings */}
        <div
          onClick={() => onNavigate('bookings')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">Confirmed Bookings</span>
          </div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">352</div>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 18% <span className="font-normal text-slate-400">vs last month</span></span>
        </div>

        {/* Total Payments */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">Total Payments</span>
          </div>
          <div className="text-base font-bold text-slate-900 tabular-nums truncate">₹ 18,75,000</div>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 22% <span className="font-normal text-slate-400">vs last month</span></span>
        </div>

        {/* Pending Payments */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">Pending Payments</span>
          </div>
          <div className="text-base font-bold text-slate-900 tabular-nums truncate">₹ 4,32,000</div>
          <span className="text-[10px] text-rose-600 font-bold">↓ 8% <span className="font-normal text-slate-400">vs last month</span></span>
        </div>

        {/* Total Commission */}
        <div
          onClick={() => onNavigate('commissions')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">Total Commission</span>
          </div>
          <div className="text-base font-bold text-slate-900 tabular-nums truncate">₹ 2,86,450</div>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 16% <span className="font-normal text-slate-400">vs last month</span></span>
        </div>

        {/* Pending Commission */}
        <div
          onClick={() => onNavigate('commissions')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">Pending Commission</span>
          </div>
          <div className="text-base font-bold text-slate-900 tabular-nums truncate">₹ 68,320</div>
          <span className="text-[10px] text-rose-600 font-bold">↓ 12% <span className="font-normal text-slate-400">vs last month</span></span>
        </div>
      </div>

      {/* Row 3: Revenue Overview, Property Categories, Booking Trends, Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Revenue Overview Line Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900">Revenue Overview</h3>
            <select
              value={revenueTimeframe}
              onChange={e => setRevenueTimeframe(e.target.value)}
              className="text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md px-2 py-0.5 bg-slate-50 focus:outline-hidden"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          {/* SVG Line Graph */}
          <div className="relative h-44 w-full my-2">
            <svg viewBox="0 0 300 150" className="w-full h-full">
              {/* Grid lines */}
              <line x1="30" y1="20" x2="290" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="60" x2="290" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="100" x2="290" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="140" x2="290" y2="140" stroke="#e2e8f0" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="5" y="24" fontSize="9" fill="#94a3b8">₹ 2L</text>
              <text x="5" y="64" fontSize="9" fill="#94a3b8">₹ 1.5L</text>
              <text x="5" y="104" fontSize="9" fill="#94a3b8">₹ 1L</text>
              <text x="5" y="144" fontSize="9" fill="#94a3b8">₹ 50K</text>

              {/* Line 1: Blue (Total Revenue) */}
              <path
                d="M 40 110 Q 75 90, 110 95 T 180 65 T 230 45 T 280 40"
                fill="none"
                stroke="#0070F3"
                strokeWidth="2.5"
              />
              <circle cx="280" cy="40" r="3.5" fill="#0070F3" />

              {/* Line 2: Purple (Platform Fees) */}
              <path
                d="M 40 130 Q 75 120, 110 115 T 180 95 T 230 80 T 280 75"
                fill="none"
                stroke="#9333EA"
                strokeWidth="2"
              />
              <circle cx="280" cy="75" r="3" fill="#9333EA" />

              {/* Line 3: Green (Commission) */}
              <path
                d="M 40 142 Q 75 138, 110 135 T 180 120 T 230 100 T 280 98"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
              />
              <circle cx="280" cy="98" r="3" fill="#10B981" />
            </svg>
          </div>

          {/* Revenue breakdown numbers */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#0070F3]" />
                <span>Total Revenue</span>
              </span>
              <span className="font-bold text-slate-900 tabular-nums">₹ 1,32,450</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#9333EA]" />
                <span>Platform Fees</span>
              </span>
              <span className="font-bold text-slate-900 tabular-nums">₹ 26,490</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Commission</span>
              </span>
              <span className="font-bold text-slate-900 tabular-nums">₹ 78,320</span>
            </div>
          </div>
        </div>

        {/* Property Categories Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900 mb-2">Property Categories</h3>

          {/* Donut Chart SVG */}
          <div className="relative w-36 h-36 mx-auto my-2">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* PG: 38% */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#0070F3"
                strokeWidth="14"
                strokeDasharray="90.7 238.7"
                strokeDashoffset="0"
              />
              {/* Flat: 32% */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#10B981"
                strokeWidth="14"
                strokeDasharray="76.4 238.7"
                strokeDashoffset="-90.7"
              />
              {/* Room: 20% */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="14"
                strokeDasharray="47.7 238.7"
                strokeDashoffset="-167.1"
              />
              {/* Hostel: 10% */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="14"
                strokeDasharray="23.9 238.7"
                strokeDashoffset="-214.8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-bold text-slate-900 leading-none">892</span>
              <span className="text-[9px] text-slate-400 font-medium">Total Properties</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#0070F3]" />
                <span>PG</span>
              </span>
              <span className="font-semibold text-slate-800">342 <span className="text-slate-400 font-normal">(38%)</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Flat</span>
              </span>
              <span className="font-semibold text-slate-800">287 <span className="text-slate-400 font-normal">(32%)</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span>Room</span>
              </span>
              <span className="font-semibold text-slate-800">178 <span className="text-slate-400 font-normal">(20%)</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>Hostel</span>
              </span>
              <span className="font-semibold text-slate-800">85 <span className="text-slate-400 font-normal">(10%)</span></span>
            </div>
          </div>
        </div>

        {/* Booking Trends Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900">Booking Trends</h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> Confirmed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Cancelled</span>
            </div>
          </div>

          {/* Bar Chart SVG */}
          <div className="relative h-44 w-full my-2">
            <svg viewBox="0 0 240 120" className="w-full h-full">
              {/* Y axis lines */}
              <line x1="20" y1="20" x2="230" y2="20" stroke="#f1f5f9" />
              <line x1="20" y1="50" x2="230" y2="50" stroke="#f1f5f9" />
              <line x1="20" y1="80" x2="230" y2="80" stroke="#f1f5f9" />
              <line x1="20" y1="110" x2="230" y2="110" stroke="#e2e8f0" />

              {/* Bars: May, Jun, Jul, Aug, Sep, Oct */}
              {/* May */}
              <rect x="35" y="45" width="10" height="65" fill="#0070F3" rx="2" />
              <rect x="47" y="98" width="6" height="12" fill="#EF4444" rx="1" />
              <text x="38" y="118" fontSize="8" fill="#94a3b8">May</text>

              {/* Jun */}
              <rect x="68" y="38" width="10" height="72" fill="#0070F3" rx="2" />
              <rect x="80" y="100" width="6" height="10" fill="#EF4444" rx="1" />
              <text x="71" y="118" fontSize="8" fill="#94a3b8">Jun</text>

              {/* Jul */}
              <rect x="101" y="42" width="10" height="68" fill="#0070F3" rx="2" />
              <rect x="113" y="102" width="6" height="8" fill="#EF4444" rx="1" />
              <text x="104" y="118" fontSize="8" fill="#94a3b8">Jul</text>

              {/* Aug */}
              <rect x="134" y="35" width="10" height="75" fill="#0070F3" rx="2" />
              <rect x="146" y="95" width="6" height="15" fill="#EF4444" rx="1" />
              <text x="137" y="118" fontSize="8" fill="#94a3b8">Aug</text>

              {/* Sep */}
              <rect x="167" y="30" width="10" height="80" fill="#0070F3" rx="2" />
              <rect x="179" y="101" width="6" height="9" fill="#EF4444" rx="1" />
              <text x="170" y="118" fontSize="8" fill="#94a3b8">Sep</text>

              {/* Oct */}
              <rect x="200" y="25" width="10" height="85" fill="#0070F3" rx="2" />
              <rect x="212" y="102" width="6" height="8" fill="#EF4444" rx="1" />
              <text x="203" y="118" fontSize="8" fill="#94a3b8">Oct</text>
            </svg>
          </div>
          <div className="pt-2 text-[10px] text-slate-400 text-center border-t border-slate-100">
            Peak booking momentum driven by Q3 tenant relocations
          </div>
        </div>

        {/* Recent Activities Feed matching peflarmo.png */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">Recent Activities</h3>
            <button
              onClick={() => onNavigate('audit-logs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 text-xs flex-1">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">New property submitted - Sunrise Apartments</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>By Rakesh Kumar (Broker)</span>
                  <span>10m ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">Booking confirmed - BK2026001</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>By Admin</span>
                  <span>32m ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">New inquiry received - INQ001</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>By Priya Sharma</span>
                  <span>1h ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">Payment received - ₹ 25,000</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>By Rohit Verma</span>
                  <span>2h ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">Broker approved - Neha Properties</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>By Admin</span>
                  <span>3h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Inquiries, Pending Approvals, Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Inquiries Table matching screenshot */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">Recent Inquiries</h3>
            <button
              onClick={() => onNavigate('inquiries')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-2">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Property</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 font-mono text-slate-700">INQ001</td>
                  <td className="py-2 font-semibold text-slate-900">Priya Sharma</td>
                  <td className="py-2 text-slate-600 truncate max-w-[100px]">Sunrise Apartments</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 font-mono text-slate-700">INQ002</td>
                  <td className="py-2 font-semibold text-slate-900">Rahul Mehta</td>
                  <td className="py-2 text-slate-600 truncate max-w-[100px]">Royal PG</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      Under Review
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 font-mono text-slate-700">INQ003</td>
                  <td className="py-2 font-semibold text-slate-900">Neha Singh</td>
                  <td className="py-2 text-slate-600 truncate max-w-[100px]">Comfort Stay</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      Assigned
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 font-mono text-slate-700">INQ004</td>
                  <td className="py-2 font-semibold text-slate-900">Vikram Verma</td>
                  <td className="py-2 text-slate-600 truncate max-w-[100px]">Green Valley Hostel</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Contacted
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 font-mono text-slate-700">INQ005</td>
                  <td className="py-2 font-semibold text-slate-900">Ritu Patel</td>
                  <td className="py-2 text-slate-600 truncate max-w-[100px]">City View PG</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                      Follow-up
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals Table matching screenshot */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">Pending Approvals</h3>
            <button
              onClick={() => onNavigate('property-approvals')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-2">
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">By</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 text-slate-500">Property</td>
                  <td className="py-2 font-semibold text-slate-900">Sunrise Apartments</td>
                  <td className="py-2 text-slate-500">Broker</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onNavigate('property-approvals')}
                      className="px-2 py-0.5 rounded-md bg-[#0070F3] text-white text-[10px] font-bold hover:bg-blue-600"
                    >
                      Review
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 text-slate-500">Property</td>
                  <td className="py-2 font-semibold text-slate-900">Green Valley Hostel</td>
                  <td className="py-2 text-slate-500">Owner</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onNavigate('property-approvals')}
                      className="px-2 py-0.5 rounded-md bg-[#0070F3] text-white text-[10px] font-bold hover:bg-blue-600"
                    >
                      Review
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 text-slate-500">Owner</td>
                  <td className="py-2 font-semibold text-slate-900">Rakesh Kumar</td>
                  <td className="py-2 text-slate-500">Owner</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onNavigate('owners')}
                      className="px-2 py-0.5 rounded-md bg-[#0070F3] text-white text-[10px] font-bold hover:bg-blue-600"
                    >
                      Review
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 text-slate-500">Broker</td>
                  <td className="py-2 font-semibold text-slate-900">Neha Properties</td>
                  <td className="py-2 text-slate-500">Broker</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onNavigate('brokers')}
                      className="px-2 py-0.5 rounded-md bg-[#0070F3] text-white text-[10px] font-bold hover:bg-blue-600"
                    >
                      Review
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 text-slate-500">Property</td>
                  <td className="py-2 font-semibold text-slate-900">Comfort Stay</td>
                  <td className="py-2 text-slate-500">Broker</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onNavigate('property-approvals')}
                      className="px-2 py-0.5 rounded-md bg-[#0070F3] text-white text-[10px] font-bold hover:bg-blue-600"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications Column matching screenshot */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Home className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">New inquiry for Royal PG</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>From: Priya Sharma</span>
                  <span>2h ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">Booking request for Sunrise Apartments</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>From: Aman Verma</span>
                  <span>4h ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">Property approval: Green Valley Hostel</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>By: Admin</span>
                  <span>6h ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">Commission updated for Booking #BK1234</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>By: Admin</span>
                  <span>8h ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">New inquiry for Comfort Stay (Room)</p>
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>From: Neha Singh</span>
                  <span>10h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Recent Bookings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Bookings (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">Recent Bookings</h3>
            <button
              onClick={() => onNavigate('bookings')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-2">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Property</th>
                  <th className="pb-2">Check-in</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 font-mono text-slate-700">BK001</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">SG</div>
                      <span className="font-semibold text-slate-900">Sneha Gupta</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-slate-600">Royal PG</td>
                  <td className="py-2.5 text-slate-500 tabular-nums">12 Oct 2026</td>
                  <td className="py-2.5 font-bold text-slate-900 tabular-nums">₹ 8,000</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Confirmed
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 font-mono text-slate-700">BK002</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">AV</div>
                      <span className="font-semibold text-slate-900">Aman Verma</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-slate-600">Sunrise Apartments</td>
                  <td className="py-2.5 text-slate-500 tabular-nums">15 Oct 2026</td>
                  <td className="py-2.5 font-bold text-slate-900 tabular-nums">₹ 25,000</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Under Review
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 font-mono text-slate-700">BK003</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">PS</div>
                      <span className="font-semibold text-slate-900">Pooja Sharma</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-slate-600">Comfort Stay</td>
                  <td className="py-2.5 text-slate-500 tabular-nums">18 Oct 2026</td>
                  <td className="py-2.5 font-bold text-slate-900 tabular-nums">₹ 7,000</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 font-mono text-slate-700">BK004</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">VS</div>
                      <span className="font-semibold text-slate-900">Vikram Singh</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-slate-600">Green Valley Hostel</td>
                  <td className="py-2.5 text-slate-500 tabular-nums">20 Oct 2026</td>
                  <td className="py-2.5 font-bold text-slate-900 tabular-nums">₹ 6,000</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Confirmed
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 font-mono text-slate-700">BK005</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">RP</div>
                      <span className="font-semibold text-slate-900">Ritu Patel</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-slate-600">City View PG</td>
                  <td className="py-2.5 text-slate-500 tabular-nums">22 Oct 2026</td>
                  <td className="py-2.5 font-bold text-slate-900 tabular-nums">₹ 9,500</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      Assigned
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions (1 col) matching screenshot */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900 mb-3">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-2.5 flex-1">
            <button
              onClick={() => onNavigate('properties')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-xs font-semibold text-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0070F3] flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span>Add Property</span>
            </button>

            <button
              onClick={() => onNavigate('owners')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-xs font-semibold text-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0070F3] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span>Manage Owners</span>
            </button>

            <button
              onClick={() => onNavigate('brokers')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-xs font-semibold text-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0070F3] flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <span>Manage Brokers</span>
            </button>

            <button
              onClick={() => onNavigate('inquiries')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-xs font-semibold text-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0070F3] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span>View Inquiries</span>
            </button>

            <button
              onClick={() => onNavigate('bookings')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-xs font-semibold text-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0070F3] flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span>View Bookings</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-xs font-semibold text-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0070F3] flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer matching screenshot */}
      <footer className="pt-6 pb-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© 2026 Peflarmo. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('content')} className="hover:text-slate-900 transition-colors">Privacy Policy</button>
          <span>|</span>
          <button onClick={() => onNavigate('content')} className="hover:text-slate-900 transition-colors">Terms & Conditions</button>
          <span>|</span>
          <button onClick={() => onNavigate('support')} className="hover:text-slate-900 transition-colors">Help & Support</button>
        </div>
      </footer>
    </div>
  );
}
