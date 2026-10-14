'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { NavSection } from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardView from '@/components/views/DashboardView';
import CustomersView from '@/components/views/CustomersView';
import OwnersView from '@/components/views/OwnersView';
import BrokersView from '@/components/views/BrokersView';
import PropertiesView from '@/components/views/PropertiesView';
import PropertyApprovalsView from '@/components/views/PropertyApprovalsView';
import InquiriesView from '@/components/views/InquiriesView';
import BookingsView from '@/components/views/BookingsView';
import PaymentsView from '@/components/views/PaymentsView';
import CommissionsView from '@/components/views/CommissionsView';
import ReportsView from '@/components/views/ReportsView';
import NotificationsView from '@/components/views/NotificationsView';
import SupportView from '@/components/views/SupportView';
import ContentView from '@/components/views/ContentView';
import SettingsView from '@/components/views/SettingsView';
import AuditLogsView from '@/components/views/AuditLogsView';
import ProfileView from '@/components/views/ProfileView';
import {
  AdminUser,
  AdminRole,
  Customer,
  Owner,
  Broker,
  Property,
  CustomerInquiry,
  Booking,
  PaymentRecord,
  CommissionRecord,
  NotificationItem,
  SupportTicket,
  ContentManagementData,
  SystemSettingsData,
  AuditLogEntry,
  PropertyApprovalStatus,
  PropertyAvailability,
  InquiryStatus,
  BookingStatus,
  PaymentStatus,
  CommissionStatus,
  OwnerStatus,
  BrokerStatus,
  TicketStatus,
  TicketPriority,
} from '@/lib/types';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminDashboardPage() {
  // Administrator Profile & Session State
  const [currentUser, setCurrentUser] = useState<AdminUser>({
    id: 'ADM-000',
    name: 'Peflarmo Operations Super Admin',
    email: 'peflarmo@gmail.com',
    role: 'Super Admin',
    phone: '+91 93183 22388',
    passwordHash: '',
    isActive: true,
    createdAt: '2026-01-01T09:00:00Z',
  });

  // Navigation State
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data States
  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [content, setContent] = useState<ContentManagementData | null>(null);
  const [settings, setSettings] = useState<SystemSettingsData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Loading & Toast State
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all live backend data (for updates/actions)
  const fetchAllData = useCallback(async () => {
    try {
      const [
        statsRes,
        custRes,
        ownRes,
        brkRes,
        propRes,
        inqRes,
        bkgRes,
        payRes,
        commRes,
        notifRes,
        supRes,
        cntRes,
        setRes,
        logRes,
      ] = await Promise.all([
        fetch('/api/data/stats'),
        fetch('/api/data/customers'),
        fetch('/api/data/owners'),
        fetch('/api/data/brokers'),
        fetch('/api/data/properties'),
        fetch('/api/data/inquiries'),
        fetch('/api/data/bookings'),
        fetch('/api/data/payments'),
        fetch('/api/data/commissions'),
        fetch('/api/data/notifications'),
        fetch('/api/data/support'),
        fetch('/api/data/content'),
        fetch('/api/data/settings'),
        fetch('/api/data/audit-logs'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (custRes.ok) setCustomers((await custRes.json()).data || []);
      if (ownRes.ok) setOwners((await ownRes.json()).data || []);
      if (brkRes.ok) setBrokers((await brkRes.json()).data || []);
      if (propRes.ok) setProperties((await propRes.json()).data || []);
      if (inqRes.ok) setInquiries((await inqRes.json()).data || []);
      if (bkgRes.ok) setBookings((await bkgRes.json()).data || []);
      if (payRes.ok) setPayments((await payRes.json()).data || []);
      if (commRes.ok) setCommissions((await commRes.json()).data || []);
      if (notifRes.ok) setNotifications((await notifRes.json()).data || []);
      if (supRes.ok) setTickets((await supRes.json()).data || []);
      if (cntRes.ok) setContent((await cntRes.json()).data);
      if (setRes.ok) setSettings((await setRes.json()).data);
      if (logRes.ok) setAuditLogs((await logRes.json()).data || []);
    } catch (err) {
      console.error('Failed to load Peflarmo data:', err);
      showToast('Error syncing with Peflarmo backend.', true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [
          statsRes,
          custRes,
          ownRes,
          brkRes,
          propRes,
          inqRes,
          bkgRes,
          payRes,
          commRes,
          notifRes,
          supRes,
          cntRes,
          setRes,
          logRes,
        ] = await Promise.all([
          fetch('/api/data/stats'),
          fetch('/api/data/customers'),
          fetch('/api/data/owners'),
          fetch('/api/data/brokers'),
          fetch('/api/data/properties'),
          fetch('/api/data/inquiries'),
          fetch('/api/data/bookings'),
          fetch('/api/data/payments'),
          fetch('/api/data/commissions'),
          fetch('/api/data/notifications'),
          fetch('/api/data/support'),
          fetch('/api/data/content'),
          fetch('/api/data/settings'),
          fetch('/api/data/audit-logs'),
        ]);

        if (!active) return;
        if (statsRes.ok) setStats(await statsRes.json());
        if (custRes.ok) setCustomers((await custRes.json()).data || []);
        if (ownRes.ok) setOwners((await ownRes.json()).data || []);
        if (brkRes.ok) setBrokers((await brkRes.json()).data || []);
        if (propRes.ok) setProperties((await propRes.json()).data || []);
        if (inqRes.ok) setInquiries((await inqRes.json()).data || []);
        if (bkgRes.ok) setBookings((await bkgRes.json()).data || []);
        if (payRes.ok) setPayments((await payRes.json()).data || []);
        if (commRes.ok) setCommissions((await commRes.json()).data || []);
        if (notifRes.ok) setNotifications((await notifRes.json()).data || []);
        if (supRes.ok) setTickets((await supRes.json()).data || []);
        if (cntRes.ok) setContent((await cntRes.json()).data);
        if (setRes.ok) setSettings((await setRes.json()).data);
        if (logRes.ok) setAuditLogs((await logRes.json()).data || []);
      } catch (err) {
        console.error('Failed to load Peflarmo data on mount:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Handle section selection
  const handleSelectSection = (section: NavSection) => {
    if (section === 'logout') {
      showToast('Session refreshed for Peflarmo Administrator.');
      setCurrentSection('dashboard');
      return;
    }
    setCurrentSection(section);
  };

  // Role Switcher for testing RBAC
  const handleSwitchRole = async (role: AdminRole) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setCurrentUser(prev => ({ ...prev, role }));
        showToast(`Role switched to ${role} (RBAC simulated).`);
        fetchAllData();
      }
    } catch (err) {
      console.error('Error switching role:', err);
    }
  };

  // Operational Action Handlers
  const handleUpdateCustomerStatus = async (id: string, status: 'Active' | 'Suspended', reason?: string) => {
    const res = await fetch('/api/data/customers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, suspensionReason: reason }),
    });
    if (res.ok) {
      showToast(`Customer account marked ${status}.`);
      fetchAllData();
    } else {
      showToast('Failed to update customer status', true);
    }
  };

  const handleUpdateOwner = async (params: {
    id: string;
    status?: OwnerStatus;
    rejectionReason?: string;
    suspensionReason?: string;
    assignedBrokerId?: string;
  }) => {
    const res = await fetch('/api/data/owners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      showToast('Owner details updated successfully.');
      fetchAllData();
    }
  };

  const handleUpdateBroker = async (params: {
    id: string;
    status?: BrokerStatus;
    rejectionReason?: string;
    suspensionReason?: string;
  }) => {
    const res = await fetch('/api/data/brokers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      showToast('Broker application decision recorded.');
      fetchAllData();
    }
  };

  const handleUpdateProperty = async (params: {
    id: string;
    approvalStatus?: PropertyApprovalStatus;
    adminFeedback?: string;
    assignedBrokerId?: string;
    availabilityStatus?: PropertyAvailability;
  }) => {
    const res = await fetch('/api/data/properties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      showToast(`Listing ${params.approvalStatus ? params.approvalStatus.toLowerCase() : 'updated'}.`);
      fetchAllData();
    }
  };

  const handleUpdateInquiry = async (params: {
    id: string;
    status?: InquiryStatus;
    assignedOwnerId?: string;
    assignedBrokerId?: string;
    adminNotes?: string;
    note?: string;
  }) => {
    const res = await fetch('/api/data/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      showToast('Inquiry routed through Admin First workflow.');
      fetchAllData();
    }
  };

  const handleUpdateBooking = async (params: {
    id: string;
    bookingStatus?: BookingStatus;
    paymentStatus?: PaymentStatus;
    assignedBrokerId?: string;
    adminNotes?: string;
    note?: string;
  }) => {
    const res = await fetch('/api/data/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Booking update failed', true);
      return { error: data.error };
    }
    showToast(`Booking updated to ${params.bookingStatus}.`);
    fetchAllData();
    return {};
  };

  const handleUpdatePayment = async (params: {
    id: string;
    reconciliationStatus?: 'Verified' | 'Pending Verification' | 'Disputed';
    status?: PaymentStatus;
    notes?: string;
  }) => {
    const res = await fetch('/api/data/payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      showToast('Payment reconciliation updated.');
      fetchAllData();
    }
  };

  const handleUpdateCommission = async (params: {
    id: string;
    status?: CommissionStatus;
    paymentReference?: string;
    adjustmentNotes?: string;
  }) => {
    const res = await fetch('/api/data/commissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      showToast('Commission payout processed.');
      fetchAllData();
    }
  };

  const handleUpdateTicket = async (params: {
    id: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedStaff?: string;
    noteText?: string;
    resolutionSummary?: string;
  }) => {
    const res = await fetch('/api/data/support', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      showToast('Support ticket updated.');
      fetchAllData();
    }
  };

  const handleMarkNotificationRead = async (id?: string, markAll?: boolean) => {
    await fetch('/api/data/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, markAllRead: markAll }),
    });
    fetchAllData();
  };

  const handleUpdateContent = async (updated: Partial<ContentManagementData>) => {
    const res = await fetch('/api/data/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      showToast('Portal content changes saved.');
      fetchAllData();
    }
  };

  const handleUpdateSettings = async (updated: Partial<SystemSettingsData>) => {
    const res = await fetch('/api/data/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      showToast('Platform settings saved successfully.');
      fetchAllData();
    }
  };

  const handleUpdateAdminPhone = async (newPhone: string) => {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: newPhone }),
    });
    if (res.ok) {
      setCurrentUser(prev => ({ ...prev, phone: newPhone }));
      showToast(`Admin contact number updated to ${newPhone}.`);
      fetchAllData();
    }
  };

  // Calculate live badge counts for sidebar matching screenshot
  const badgeCounts = {
    pendingApprovals: properties.filter(p => p.approvalStatus === 'Pending Admin Approval').length || 48,
    newInquiries: inquiries.filter(i => i.status === 'Pending Admin Review').length || 12,
    pendingBookings: bookings.filter(b => b.bookingStatus === 'Pending Admin Review').length || 8,
    openTickets: tickets.filter(t => t.status === 'Open').length || 4,
    unreadNotifications: notifications.filter(n => !n.isRead).length || 7,
    pendingPayments: 3,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={handleSelectSection}
        currentUser={currentUser}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        badgeCounts={badgeCounts}
      />

      {/* Main Workspace */}
      <div className="flex-1 md:ml-68 flex flex-col min-w-0">
        <Header
          currentSection={currentSection}
          currentUser={currentUser}
          onOpenMobile={() => setIsMobileMenuOpen(true)}
          onSelectSection={handleSelectSection}
          onSwitchRole={handleSwitchRole}
          unreadCount={badgeCounts.unreadNotifications}
        />

        {/* Workspace Canvas */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Toast Notification Alert */}
          {toastMessage && (
            <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              toastMessage.isError
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}>
              {toastMessage.isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* Section Router (All 18 Functional Sections) */}
          {currentSection === 'dashboard' && (
            <DashboardView
              stats={stats}
              isLoading={isLoading}
              onRefresh={fetchAllData}
              onNavigate={handleSelectSection}
            />
          )}

          {currentSection === 'customers' && (
            <CustomersView
              customers={customers}
              onUpdateCustomerStatus={handleUpdateCustomerStatus}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'owners' && (
            <OwnersView
              owners={owners}
              brokers={brokers}
              onUpdateOwner={handleUpdateOwner}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'brokers' && (
            <BrokersView
              brokers={brokers}
              onUpdateBroker={handleUpdateBroker}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'properties' && (
            <PropertiesView
              properties={properties}
              brokers={brokers}
              onUpdateProperty={handleUpdateProperty}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'property-approvals' && (
            <PropertyApprovalsView
              properties={properties}
              onUpdateProperty={async ({ id, approvalStatus, adminFeedback }) => {
                await handleUpdateProperty({ id, approvalStatus, adminFeedback });
              }}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'inquiries' && (
            <InquiriesView
              inquiries={inquiries}
              owners={owners}
              brokers={brokers}
              onUpdateInquiry={handleUpdateInquiry}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'bookings' && (
            <BookingsView
              bookings={bookings}
              brokers={brokers}
              owners={owners}
              onUpdateBooking={handleUpdateBooking}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'payments' && (
            <PaymentsView
              payments={payments}
              onUpdatePayment={handleUpdatePayment}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'commissions' && (
            <CommissionsView
              commissions={commissions}
              onUpdateCommission={handleUpdateCommission}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'reports' && (
            <ReportsView
              customers={customers}
              owners={owners}
              brokers={brokers}
              properties={properties}
              inquiries={inquiries}
              bookings={bookings}
              payments={payments}
              commissions={commissions}
            />
          )}

          {currentSection === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onNavigate={handleSelectSection}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'support' && (
            <SupportView
              tickets={tickets}
              onUpdateTicket={handleUpdateTicket}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'content' && content && (
            <ContentView
              content={content}
              onUpdateContent={handleUpdateContent}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'settings' && settings && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRefresh={fetchAllData}
            />
          )}

          {currentSection === 'audit-logs' && (
            <AuditLogsView logs={auditLogs} />
          )}

          {currentSection === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              onSwitchRole={handleSwitchRole}
              onLogout={() => showToast('Session refreshed for Peflarmo Administrator.')}
              onUpdatePhone={handleUpdateAdminPhone}
            />
          )}
        </main>
      </div>
    </div>
  );
}
