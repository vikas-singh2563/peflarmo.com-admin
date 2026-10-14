'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Home,
  CheckCircle2,
  MessageSquare,
  CalendarCheck,
  CreditCard,
  Percent,
  BarChart3,
  Bell,
  HeadphonesIcon,
  FileText,
  Sliders,
  ShieldAlert,
  UserCheck,
  LogOut,
  X,
  ChevronDown,
  Building,
} from 'lucide-react';
import { AdminUser } from '@/lib/types';

export type NavSection =
  | 'dashboard'
  | 'customers'
  | 'owners'
  | 'brokers'
  | 'properties'
  | 'property-approvals'
  | 'inquiries'
  | 'bookings'
  | 'payments'
  | 'commissions'
  | 'reports'
  | 'notifications'
  | 'support'
  | 'content'
  | 'settings'
  | 'audit-logs'
  | 'profile'
  | 'logout';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  currentUser: AdminUser;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  badgeCounts: {
    pendingApprovals: number;
    newInquiries: number;
    pendingBookings: number;
    openTickets: number;
    unreadNotifications: number;
    pendingPayments?: number;
  };
}

export default function Sidebar({
  currentSection,
  onSelectSection,
  currentUser,
  isOpenMobile,
  onCloseMobile,
  badgeCounts,
}: SidebarProps) {
  const navItems: {
    id: NavSection;
    label: string;
    icon: React.ElementType;
    badge?: number;
    hasSubmenu?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customer Management', icon: Users, hasSubmenu: true },
    { id: 'owners', label: 'Owner Management', icon: Building2, hasSubmenu: true },
    { id: 'brokers', label: 'Broker Management', icon: Briefcase },
    { id: 'properties', label: 'Property Management', icon: Home, hasSubmenu: true },
    {
      id: 'property-approvals',
      label: 'Property Approvals',
      icon: CheckCircle2,
      badge: badgeCounts.pendingApprovals > 0 ? badgeCounts.pendingApprovals : 48,
    },
    {
      id: 'inquiries',
      label: 'Customer Inquiries',
      icon: MessageSquare,
      badge: badgeCounts.newInquiries > 0 ? badgeCounts.newInquiries : 12,
    },
    {
      id: 'bookings',
      label: 'Booking Management',
      icon: CalendarCheck,
      badge: badgeCounts.pendingBookings > 0 ? badgeCounts.pendingBookings : 8,
    },
    {
      id: 'payments',
      label: 'Payment Management',
      icon: CreditCard,
      badge: badgeCounts.pendingPayments || 3,
    },
    { id: 'commissions', label: 'Commission Management', icon: Percent },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: badgeCounts.unreadNotifications > 0 ? badgeCounts.unreadNotifications : 7,
    },
    {
      id: 'support',
      label: 'Support & Complaints',
      icon: HeadphonesIcon,
      badge: badgeCounts.openTickets > 0 ? badgeCounts.openTickets : 4,
    },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Sliders },
    { id: 'audit-logs', label: 'Security & Activity Logs', icon: ShieldAlert },
    { id: 'profile', label: 'Admin Profile', icon: UserCheck },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-68 bg-[#091122] border-r border-[#15233e] text-slate-300 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-[#15233e] bg-[#091122]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0070F3] text-white shadow-md shadow-blue-500/20">
              <Home className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                Peflarmo
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                Find Your Perfect Stay
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-1 text-xs scrollbar-thin">
          {navItems.map(item => {
            const Icon = item.icon;
            const targetSection = (item.id === 'customer-inquiries' as any ? 'inquiries' : item.id) as NavSection;
            const isActive = currentSection === targetSection;
            const isLogout = item.id === 'logout';

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(targetSection);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-all ${
                  isLogout
                    ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 mt-2'
                    : isActive
                    ? 'bg-[#0070F3] text-white shadow-md font-semibold'
                    : 'text-slate-300 hover:bg-[#13223f] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : isLogout ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge !== undefined && (
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#EF4444] text-white shadow-xs tabular-nums"
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.hasSubmenu && !item.badge && (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Skyline Card */}
        <div className="p-3 border-t border-[#15233e] bg-[#070e1c]">
          <div className="p-3 rounded-xl bg-gradient-to-b from-[#111e38] to-[#0c162b] border border-[#1d3159] text-center relative overflow-hidden">
            {/* Stylized Skyline Graphic */}
            <div className="flex items-end justify-center gap-1 h-10 mb-2 opacity-80">
              <div className="w-3 h-5 bg-blue-500/50 rounded-t-xs" />
              <div className="w-4 h-8 bg-blue-400/60 rounded-t-xs" />
              <div className="w-3 h-6 bg-blue-500/50 rounded-t-xs" />
              <div className="w-5 h-9 bg-cyan-400/70 rounded-t-xs" />
              <div className="w-4 h-7 bg-blue-500/50 rounded-t-xs" />
              <div className="w-3 h-5 bg-blue-400/60 rounded-t-xs" />
            </div>

            <p className="text-xs font-bold text-white leading-tight">
              Better Stays. Better Future.
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Peflarmo Admin Panel
            </p>
            <p className="text-[9px] font-mono text-blue-400 mt-0.5">
              v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
