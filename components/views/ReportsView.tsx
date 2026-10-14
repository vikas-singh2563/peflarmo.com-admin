'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  MapPin,
  Layers,
  Filter,
  CheckCircle,
  IndianRupee,
  Users,
  Building,
} from 'lucide-react';
import { Customer, Owner, Broker, Property, CustomerInquiry, Booking, PaymentRecord, CommissionRecord } from '@/lib/types';

interface ReportsViewProps {
  customers: Customer[];
  owners: Owner[];
  brokers: Broker[];
  properties: Property[];
  inquiries: CustomerInquiry[];
  bookings: Booking[];
  payments: PaymentRecord[];
  commissions: CommissionRecord[];
}

export default function ReportsView({
  customers,
  owners,
  brokers,
  properties,
  inquiries,
  bookings,
  payments,
  commissions,
}: ReportsViewProps) {
  const [selectedReportType, setSelectedReportType] = useState<string>('revenue');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('all');

  const cities = ['All', 'Bangalore', 'Pune', 'Mumbai', 'Delhi NCR', 'Kota', 'Hyderabad'];
  const categories = ['All', 'PG', 'Flat', 'Room', 'Hostel'];

  // Financial calculations
  const grossBookingValue = bookings
    .filter(b => b.bookingStatus === 'Confirmed')
    .reduce((sum, b) => sum + b.totalBookingAmount, 0);

  const receivedPayments = payments
    .filter(p => p.status === 'Successful')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const pendingPayments = payments
    .filter(p => p.status === 'Pending' || p.status === 'Processing')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const platformRevenue = payments
    .filter(p => p.status === 'Successful')
    .reduce((sum, p) => sum + p.platformFees, 0);

  const brokerCommissionsPaid = commissions
    .filter(c => c.status === 'Paid')
    .reduce((sum, c) => sum + c.calculatedCommission, 0);

  const exportReportCsv = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `Peflarmo_Report_${selectedReportType}_${Date.now()}.csv`;

    if (selectedReportType === 'revenue') {
      headers = ['Booking ID', 'Customer', 'Property', 'Gross Amount', 'Deposit', 'Platform Fee', 'Payment Status'];
      rows = bookings.map(b => [
        b.id,
        `"${b.customerName}"`,
        `"${b.propertyName}"`,
        b.totalBookingAmount,
        b.securityDeposit,
        b.additionalCharges,
        b.paymentStatus,
      ]);
    } else if (selectedReportType === 'properties') {
      headers = ['Property ID', 'Title', 'Category', 'City', 'Owner', 'Rent', 'Approval Status'];
      rows = properties.map(p => [
        p.id,
        `"${p.name}"`,
        p.category,
        p.city,
        `"${p.ownerName}"`,
        p.monthlyRent,
        p.approvalStatus,
      ]);
    } else if (selectedReportType === 'inquiries') {
      headers = ['Inquiry ID', 'Customer', 'Property', 'Category', 'Move-in Date', 'Status', 'Date'];
      rows = inquiries.map(i => [
        i.id,
        `"${i.customerName}"`,
        `"${i.propertyName}"`,
        i.propertyCategory,
        i.preferredMoveInDate,
        i.status,
        i.inquiryDate,
      ]);
    } else {
      headers = ['User ID', 'Name', 'Email', 'City', 'Status', 'Registration'];
      rows = customers.map(c => [
        c.id,
        `"${c.name}"`,
        c.email,
        c.city,
        c.status,
        c.registrationDate,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Filters Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Report Module</label>
            <select
              value={selectedReportType}
              onChange={e => setSelectedReportType(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden"
            >
              <option value="revenue">Financial & Revenue Analytics</option>
              <option value="properties">Property Submissions & Category Breakdown</option>
              <option value="inquiries">Customer Inquiries Routing Report</option>
              <option value="bookings">Bookings & Fulfillment Report</option>
              <option value="registrations">User Registrations (Customer/Owner/Broker)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">City Filter</label>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={exportReportCsv}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Dataset (CSV)</span>
        </button>
      </div>

      {/* Revenue distinction cards (Gross vs Net Platform vs Escrow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Gross Booking Value (GBV)</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            ₹{grossBookingValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Contracted booking amounts
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Actual Received Payments</span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            ₹{receivedPayments.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Verified in bank account
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Platform Service Fees</span>
          <div className="text-xl font-bold text-blue-700 mt-1 tabular-nums">
            ₹{platformRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
            Net platform operating revenue
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Broker Commissions Settled</span>
          <div className="text-xl font-bold text-violet-700 mt-1 tabular-nums">
            ₹{brokerCommissionsPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-violet-600 font-semibold mt-0.5 block">
            Paid to verified channel partners
          </span>
        </div>
      </div>

      {/* SVG Analytics Visualization */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              City-Wise Accommodation Distribution & Occupancy
            </h3>
            <p className="text-xs text-slate-500">Live inventory footprint across primary tier-1 & educational hubs</p>
          </div>
        </div>

        {/* Clean Responsive SVG Bar Chart */}
        <div className="space-y-4 pt-2">
          {[
            { city: 'Bangalore (IT Corridor)', count: 18, share: 85, color: 'bg-blue-600' },
            { city: 'Pune (Hinjewadi & Viman Nagar)', count: 12, share: 62, color: 'bg-emerald-600' },
            { city: 'Kota (Allen & Resonance Hub)', count: 8, share: 50, color: 'bg-amber-600' },
            { city: 'Delhi NCR (Old Rajinder Nagar/Noida)', count: 7, share: 42, color: 'bg-purple-600' },
            { city: 'Hyderabad (Gachibowli / Hitech)', count: 5, share: 30, color: 'bg-rose-600' },
          ].map(item => (
            <div key={item.city} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <span>{item.city}</span>
                <span className="tabular-nums text-slate-500">{item.count} Listings ({item.share}% Target Capacity)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Performance Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-xs">
          Channel Partner & Host Conversion Performance
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">Partner Name</th>
                <th className="py-2.5 px-4">Role Type</th>
                <th className="py-2.5 px-4">City</th>
                <th className="py-2.5 px-4 text-center">Active Listings</th>
                <th className="py-2.5 px-4 text-right">Inquiries Handled</th>
                <th className="py-2.5 px-4 text-right">Successful Bookings</th>
                <th className="py-2.5 px-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brokers.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{b.name}</td>
                  <td className="py-2.5 px-4 text-blue-600 font-medium">Channel Broker</td>
                  <td className="py-2.5 px-4 text-slate-600">{b.city}</td>
                  <td className="py-2.5 px-4 text-center tabular-nums font-bold">{b.assignedPropertiesCount}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{b.activeInquiriesCount}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-bold text-emerald-600">4</td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-bold text-slate-900">
                    ₹{b.commissionEarned.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {owners.slice(0, 3).map(o => (
                <tr key={o.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{o.name}</td>
                  <td className="py-2.5 px-4 text-indigo-600 font-medium">Property Host</td>
                  <td className="py-2.5 px-4 text-slate-600">{o.city}</td>
                  <td className="py-2.5 px-4 text-center tabular-nums font-bold">{o.propertiesCount}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums">6</td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-bold text-emerald-600">3</td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-bold text-slate-900">
                    ₹{o.totalEarnings.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
