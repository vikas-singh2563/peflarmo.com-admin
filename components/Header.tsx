'use client';

import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Shield,
  User,
  ChevronDown,
} from 'lucide-react';
import { AdminUser, AdminRole } from '@/lib/types';
import { NavSection } from './Sidebar';

interface HeaderProps {
  currentSection: NavSection;
  currentUser: AdminUser;
  onOpenMobile: () => void;
  onSelectSection: (section: NavSection) => void;
  onSwitchRole: (role: AdminRole) => void;
  unreadCount: number;
}

const availableRoles: AdminRole[] = [
  'Super Admin',
  'Property Approval Admin',
  'Booking Admin',
  'Finance Admin',
  'Support Admin',
];

export default function Header({
  currentSection,
  currentUser,
  onOpenMobile,
  onSelectSection,
  onSwitchRole,
  unreadCount,
}: HeaderProps) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left side: Mobile trigger + Global Search input matching screenshot */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenMobile}
          className="p-1.5 -ml-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search customers, properties, bookings, etc..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right side: Notifications bell with red badge + Amit Sharma profile */}
      <div className="flex items-center gap-4 ml-4">
        {/* Notifications Icon Button with Red Badge */}
        <button
          onClick={() => onSelectSection('notifications')}
          className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 0 ? unreadCount : 7}
          </span>
        </button>

        {/* Profile Dropdown / Trigger matching peflarmo.png */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            {/* Avatar circle */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-200 shrink-0 flex items-center justify-center text-white font-bold text-xs">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt={currentUser.name}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-semibold">{currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 leading-tight mt-0.5">
                <span>{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{currentUser.phone}</p>
                <p className="text-[11px] text-slate-400">{currentUser.email}</p>
              </div>

              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 tracking-wider">
                ADMIN ROLE SWITCHER (RBAC)
              </div>
              {availableRoles.map(role => (
                <button
                  key={role}
                  onClick={() => {
                    onSwitchRole(role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    currentUser.role === role ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{role}</span>
                  {currentUser.role === role && <span className="text-[10px] text-blue-600 font-bold">Active</span>}
                </button>
              ))}

              <div className="border-t border-slate-100 mt-2 pt-1">
                <button
                  onClick={() => {
                    onSelectSection('profile');
                    setRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Manage Admin Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
