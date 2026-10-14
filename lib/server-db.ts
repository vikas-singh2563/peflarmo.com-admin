import bcrypt from 'bcryptjs';
import {
  AdminUser,
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
  AdminRole,
  AdminSession,
  EmailOtpRecord,
  PasswordResetRecord,
} from './types';

// Password hashing using Bcrypt with cost factor 10
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Password verification using Bcrypt (with legacy fallback)
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    return bcrypt.compare(password, hash);
  }
  // Fallback for sha256 if applicable
  const enc = new TextEncoder();
  const data = enc.encode(`peflarmo_salt_2026_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return sha === hash;
}

// Pre-computed Bcrypt hash for default admin password "Peflarmo@Admin2026!"
const DEFAULT_ADMIN_HASH = '$2b$10$jlD1tmIWSe9hHRzwhOct0.OIS5SeEMbFr7qX.KrSOIq6ZGsPCkD5q';

interface DatabaseState {
  admins: AdminUser[];
  customers: Customer[];
  owners: Owner[];
  brokers: Broker[];
  properties: Property[];
  inquiries: CustomerInquiry[];
  bookings: Booking[];
  payments: PaymentRecord[];
  commissions: CommissionRecord[];
  notifications: NotificationItem[];
  tickets: SupportTicket[];
  content: ContentManagementData;
  settings: SystemSettingsData;
  auditLogs: AuditLogEntry[];
  sessions: AdminSession[];
  emailOtps: { [email: string]: EmailOtpRecord };
  passwordResets: { [token: string]: PasswordResetRecord };
  loginAttempts: {
    [email: string]: {
      count: number;
      lockedUntil?: number;
    };
  };
}

// Global in-memory singleton for Next.js dev & runtime persistence
declare global {
  var __peflarmo_db__: DatabaseState | undefined;
}

function getInitialDbState(): DatabaseState {
  const admins: AdminUser[] = [
    {
      id: 'ADM-000',
      name: 'Peflarmo Operations Super Admin',
      email: 'peflarmo@gmail.com',
      role: 'Super Admin',
      phone: '+91 93183 22388',
      passwordHash: DEFAULT_ADMIN_HASH,
      isActive: true,
      lastLogin: new Date().toISOString(),
      lastLoginIp: '103.21.244.12',
      createdAt: '2026-01-01T09:00:00Z',
    },
    {
      id: 'ADM-001',
      name: 'Amit Sharma',
      email: 'admin@peflarmo.com',
      role: 'Super Admin',
      phone: '+91 93183 22388',
      passwordHash: DEFAULT_ADMIN_HASH,
      isActive: true,
      lastLogin: new Date().toISOString(),
      lastLoginIp: '103.21.244.12',
      createdAt: '2026-01-10T09:00:00Z',
    },
    {
      id: 'ADM-002',
      name: 'Rohan Sharma',
      email: 'rohan.approvals@peflarmo.com',
      role: 'Property Approval Admin',
      phone: '+91 98765 43210',
      passwordHash: DEFAULT_ADMIN_HASH,
      isActive: true,
      lastLogin: '2026-10-12T14:30:00Z',
      lastLoginIp: '49.207.210.88',
      createdAt: '2026-02-15T10:00:00Z',
    },
    {
      id: 'ADM-003',
      name: 'Ananya Verma',
      email: 'ananya.finance@peflarmo.com',
      role: 'Finance Admin',
      phone: '+91 91234 56789',
      passwordHash: DEFAULT_ADMIN_HASH,
      isActive: true,
      lastLogin: '2026-10-13T10:15:00Z',
      lastLoginIp: '157.49.18.23',
      createdAt: '2026-03-01T11:00:00Z',
    },
  ];

  const customers: Customer[] = [
    {
      id: 'CUST-1001',
      name: 'Aarav Patel',
      email: 'aarav.patel@gmail.com',
      phone: '+91 98201 11223',
      city: 'Bangalore',
      registrationDate: '2026-08-14T10:30:00Z',
      totalInquiries: 4,
      totalBookings: 2,
      status: 'Active',
      kycVerified: true,
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-4812',
      emergencyContact: '+91 98201 99887 (Father)',
    },
    {
      id: 'CUST-1002',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@outlook.com',
      phone: '+91 97412 33445',
      city: 'Hyderabad',
      registrationDate: '2026-09-02T15:20:00Z',
      totalInquiries: 3,
      totalBookings: 1,
      status: 'Active',
      kycVerified: true,
      idProofType: 'PAN Card',
      idProofNumber: 'ABCDE1234F',
      emergencyContact: '+91 97412 11223 (Mother)',
    },
    {
      id: 'CUST-1003',
      name: 'Vikram Malhotra',
      email: 'vikram.m@gmail.com',
      phone: '+91 99880 55667',
      city: 'Pune',
      registrationDate: '2026-09-18T08:45:00Z',
      totalInquiries: 5,
      totalBookings: 1,
      status: 'Active',
      kycVerified: true,
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-9021',
      emergencyContact: '+91 99880 77889 (Brother)',
    },
    {
      id: 'CUST-1004',
      name: 'Divya Iyer',
      email: 'divya.iyer@gmail.com',
      phone: '+91 94440 77889',
      city: 'Chennai',
      registrationDate: '2026-10-01T11:10:00Z',
      totalInquiries: 2,
      totalBookings: 0,
      status: 'Active',
      kycVerified: false,
    },
    {
      id: 'CUST-1005',
      name: 'Rajesh Kulkarni',
      email: 'rajesh.kulkarni@yahoo.com',
      phone: '+91 91670 88990',
      city: 'Mumbai',
      registrationDate: '2026-07-22T13:00:00Z',
      totalInquiries: 1,
      totalBookings: 0,
      status: 'Suspended',
      suspensionReason: 'Repeated non-payment of booking token and abusive messaging to property host',
      kycVerified: false,
    },
    {
      id: 'CUST-1006',
      name: 'Manish Meena',
      email: 'manish.meena@gmail.com',
      phone: '+91 94140 22334',
      city: 'Kota',
      registrationDate: '2026-10-05T16:40:00Z',
      totalInquiries: 3,
      totalBookings: 1,
      status: 'Active',
      kycVerified: true,
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-3344',
      emergencyContact: '+91 94140 55667 (Father)',
    },
  ];

  const owners: Owner[] = [
    {
      id: 'OWN-201',
      name: 'Suresh Narayana',
      email: 'suresh.narayana@gmail.com',
      phone: '+91 98451 99887',
      city: 'Bangalore',
      registrationDate: '2026-05-10T11:00:00Z',
      status: 'Approved',
      kycDocType: 'Aadhaar & Property Deed',
      kycDocNumber: 'BLR/BBMP/2024/9912',
      verificationDocsSubmitted: true,
      propertiesCount: 3,
      totalEarnings: 345000,
      bankAccountVerified: true,
      assignedBrokerId: 'BRK-301',
    },
    {
      id: 'OWN-202',
      name: 'Kavita Joshi',
      email: 'kavita.joshi@punehomes.com',
      phone: '+91 98220 44556',
      city: 'Pune',
      registrationDate: '2026-06-18T14:15:00Z',
      status: 'Approved',
      kycDocType: 'Aadhaar & Electricity Bill',
      kycDocNumber: 'PUN/MSEDCL/66712',
      verificationDocsSubmitted: true,
      propertiesCount: 2,
      totalEarnings: 180000,
      bankAccountVerified: true,
      assignedBrokerId: 'BRK-302',
    },
    {
      id: 'OWN-203',
      name: 'Mukesh Bansal',
      email: 'bansal.hostels@kotastudy.com',
      phone: '+91 94141 88776',
      city: 'Kota',
      registrationDate: '2026-09-25T10:00:00Z',
      status: 'Pending Approval',
      kycDocType: 'Trade License & Commercial Tax',
      kycDocNumber: 'KOT/MUNICIPAL/2026/4401',
      verificationDocsSubmitted: true,
      propertiesCount: 1,
      totalEarnings: 0,
      bankAccountVerified: true,
    },
    {
      id: 'OWN-204',
      name: 'Amitabh Sengupta',
      email: 'amitabh.s@gmail.com',
      phone: '+91 98300 22331',
      city: 'Delhi NCR',
      registrationDate: '2026-10-08T09:30:00Z',
      status: 'Pending Verification',
      kycDocType: 'PAN Card Pending',
      kycDocNumber: 'DOC-SUBMIT-AWAITING',
      verificationDocsSubmitted: false,
      propertiesCount: 0,
      totalEarnings: 0,
      bankAccountVerified: false,
    },
    {
      id: 'OWN-205',
      name: 'Rameshwar Chander',
      email: 'r.chander@delhiflats.com',
      phone: '+91 98110 55443',
      city: 'Delhi NCR',
      registrationDate: '2026-07-04T12:00:00Z',
      status: 'Rejected',
      kycDocType: 'Forged Electricity Bill',
      kycDocNumber: 'INVALID_REF_99',
      verificationDocsSubmitted: true,
      propertiesCount: 0,
      totalEarnings: 0,
      bankAccountVerified: false,
      rejectionReason: 'Address proofs could not be matched during physical verification check.',
    },
  ];

  const brokers: Broker[] = [
    {
      id: 'BRK-301',
      name: 'Pradeep Gowda',
      email: 'pradeep.realty@blrpgs.in',
      phone: '+91 99001 22334',
      city: 'Bangalore',
      licenseNumber: 'PRM/KA/RERA/1251/2022/AG00491',
      experienceYears: 6,
      registrationDate: '2026-04-12T10:00:00Z',
      status: 'Approved',
      assignedPropertiesCount: 8,
      commissionEarned: 84000,
      commissionRateDefault: 10,
      activeInquiriesCount: 5,
    },
    {
      id: 'BRK-302',
      name: 'Nitin Deshmukh',
      email: 'nitin.broker@puneestates.in',
      phone: '+91 98230 66778',
      city: 'Pune',
      licenseNumber: 'MAHARERA/AG/2023/11094',
      experienceYears: 4,
      registrationDate: '2026-06-01T15:30:00Z',
      status: 'Approved',
      assignedPropertiesCount: 5,
      commissionEarned: 45000,
      commissionRateDefault: 10,
      activeInquiriesCount: 3,
    },
    {
      id: 'BRK-303',
      name: 'Gaurav Aggarwal',
      email: 'gaurav.realtors@delhincr.com',
      phone: '+91 98100 88991',
      city: 'Delhi NCR',
      licenseNumber: 'HARERA/GGM/2024/771',
      experienceYears: 3,
      registrationDate: '2026-10-02T11:00:00Z',
      status: 'Pending Approval',
      assignedPropertiesCount: 0,
      commissionEarned: 0,
      commissionRateDefault: 12,
      activeInquiriesCount: 0,
    },
  ];

  const properties: Property[] = [
    {
      id: 'PROP-501',
      name: 'Green Glen Elite Co-Living PG',
      category: 'PG',
      ownerId: 'OWN-201',
      ownerName: 'Suresh Narayana',
      brokerId: 'BRK-301',
      brokerName: 'Pradeep Gowda',
      city: 'Bangalore',
      locality: 'Bellandur (Outer Ring Road)',
      address: 'Plot 44, Green Glen Layout, Behind EcoSpace Tech Park, Bellandur',
      monthlyRent: 14500,
      securityDeposit: 25000,
      maintenanceFee: 1000,
      submissionDate: '2026-08-01T10:00:00Z',
      approvalStatus: 'Approved',
      availabilityStatus: 'Available',
      genderPreference: 'All',
      furnishing: 'Fully Furnished',
      amenities: ['High Speed WiFi', 'Air Conditioner', 'Daily Housekeeping', '3 Meals Veg/Non-Veg', 'Power Backup', 'RO Water', 'CCTV Security'],
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Modern co-living space designed for IT professionals working along Outer Ring Road Bellandur. High-speed fiber, dedicated workstation desks, and hygienic chef-cooked meals.',
      roomBedOptions: [
        { id: 'BED-101', name: 'Private Single Room (AC)', type: 'Single Sharing', rent: 18500, deposit: 30000, totalUnits: 10, occupiedUnits: 8 },
        { id: 'BED-102', name: 'Twin Sharing Room (AC)', type: 'Double Sharing', rent: 14500, deposit: 25000, totalUnits: 20, occupiedUnits: 15 },
        { id: 'BED-103', name: 'Triple Sharing Room', type: 'Triple Sharing', rent: 11000, deposit: 18000, totalUnits: 15, occupiedUnits: 10 },
      ],
      reviewedBy: 'Peflarmo Super Admin',
      reviewedAt: '2026-08-02T16:00:00Z',
      adminFeedback: 'Verified with physical owner inspection. All fire & safety compliance documents uploaded.',
    },
    {
      id: 'PROP-502',
      name: 'Sunlight Heights 2BHK Luxury Flat',
      category: 'Flat',
      ownerId: 'OWN-202',
      ownerName: 'Kavita Joshi',
      brokerId: 'BRK-302',
      brokerName: 'Nitin Deshmukh',
      city: 'Pune',
      locality: 'Hinjewadi Phase 1',
      address: 'Flat 702, Tower B, Sunlight Heights, Near Rajiv Gandhi Infotech Park',
      monthlyRent: 28000,
      securityDeposit: 60000,
      maintenanceFee: 2500,
      submissionDate: '2026-08-15T12:00:00Z',
      approvalStatus: 'Approved',
      availabilityStatus: 'Available',
      genderPreference: 'Family',
      furnishing: 'Fully Furnished',
      amenities: ['Modular Kitchen', 'Covered Car Parking', 'Swimming Pool & Gym', '24/7 Security', 'Piped Gas', 'Balcony with View'],
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Spacious 2BHK apartment with Italian marble flooring, master bedroom with wooden parquet, and modular kitchen equipped with chimney and hob.',
      roomBedOptions: [
        { id: 'FLAT-201', name: 'Entire 2BHK Apartment (702)', type: '2BHK Unit', rent: 28000, deposit: 60000, totalUnits: 1, occupiedUnits: 0 },
      ],
      reviewedBy: 'Peflarmo Super Admin',
      reviewedAt: '2026-08-16T11:00:00Z',
      adminFeedback: 'Society NOC & owner title deed verified.',
    },
    {
      id: 'PROP-503',
      name: 'Lakshya Scholars Residency (Boys Hostel)',
      category: 'Hostel',
      ownerId: 'OWN-203',
      ownerName: 'Mukesh Bansal',
      city: 'Kota',
      locality: 'Landmark City (Kunarhari)',
      address: 'Plot 18, Coral Park, Opp. Allen SAMYAK Campus, Landmark City',
      monthlyRent: 13000,
      securityDeposit: 20000,
      maintenanceFee: 500,
      submissionDate: '2026-10-10T09:00:00Z',
      approvalStatus: 'Pending Admin Approval',
      availabilityStatus: 'Available',
      genderPreference: 'Boys',
      furnishing: 'Fully Furnished',
      amenities: ['Study Desk & Ergonomic Chair', 'Biometric Entry', 'Dietitian Planned Student Meals', 'Library Room', 'Power Backup', 'Counsellor Support'],
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Peaceful, discipline-oriented boys hostel specially curated for NEET/JEE aspirants. Soundproof study hours, nutritious home-style meals, and 2 minutes walk to Allen coaching campus.',
      roomBedOptions: [
        { id: 'HSTL-301', name: 'Single Deluxe Student Room', type: 'Single Sharing', rent: 15500, deposit: 25000, totalUnits: 30, occupiedUnits: 0 },
        { id: 'HSTL-302', name: 'Twin Student Room', type: 'Double Sharing', rent: 13000, deposit: 20000, totalUnits: 40, occupiedUnits: 0 },
      ],
    },
    {
      id: 'PROP-504',
      name: 'CyberCity Studio Room with Terrace',
      category: 'Room',
      ownerId: 'OWN-201',
      ownerName: 'Suresh Narayana',
      brokerId: 'BRK-301',
      brokerName: 'Pradeep Gowda',
      city: 'Bangalore',
      locality: 'Koramangala 4th Block',
      address: 'Terrace Suite, 14th Cross, 80 Feet Road, Koramangala 4th Block',
      monthlyRent: 16000,
      securityDeposit: 32000,
      maintenanceFee: 800,
      submissionDate: '2026-10-11T14:20:00Z',
      approvalStatus: 'Pending Admin Approval',
      availabilityStatus: 'Available',
      genderPreference: 'All',
      furnishing: 'Semi Furnished',
      amenities: ['Private Terrace', 'Attached Bathroom', 'Geyser', 'Independent Entry', 'Bike Parking'],
      images: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Private terrace studio room with independent entry, overlooking trees in central Koramangala. Perfect for remote professionals or startup founders.',
      roomBedOptions: [
        { id: 'ROOM-401', name: 'Terrace Studio Unit', type: 'Private Room', rent: 16000, deposit: 32000, totalUnits: 1, occupiedUnits: 0 },
      ],
    },
    {
      id: 'PROP-505',
      name: 'Viman Nagar Comfort 1BHK Flat',
      category: 'Flat',
      ownerId: 'OWN-202',
      ownerName: 'Kavita Joshi',
      city: 'Pune',
      locality: 'Viman Nagar',
      address: 'B-304, Phoenix Nest, Near Symbiosis International School',
      monthlyRent: 22000,
      securityDeposit: 45000,
      maintenanceFee: 1500,
      submissionDate: '2026-09-01T10:00:00Z',
      approvalStatus: 'Approved',
      availabilityStatus: 'Available',
      genderPreference: 'All',
      furnishing: 'Fully Furnished',
      amenities: ['AC', 'WiFi', 'Kitchen Appliances', 'Washing Machine', 'Lift', 'Security'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Chic 1BHK in Viman Nagar walking distance from Phoenix Marketcity and Symbiosis campus. Fully furnished with Smart TV and high speed internet.',
      roomBedOptions: [
        { id: 'FLAT-105', name: '1BHK Unit B-304', type: '1BHK Unit', rent: 22000, deposit: 45000, totalUnits: 1, occupiedUnits: 0 },
      ],
      reviewedBy: 'Rohan Sharma',
      reviewedAt: '2026-09-03T11:00:00Z',
    },
    {
      id: 'PROP-506',
      name: 'Old Rajinder Nagar Civil Services PG',
      category: 'PG',
      ownerId: 'OWN-205',
      ownerName: 'Rameshwar Chander',
      city: 'Delhi NCR',
      locality: 'Old Rajinder Nagar',
      address: 'House 19, Shankar Road, Near Metro Station',
      monthlyRent: 12000,
      securityDeposit: 20000,
      maintenanceFee: 1000,
      submissionDate: '2026-07-01T15:00:00Z',
      approvalStatus: 'Rejected',
      availabilityStatus: 'Unavailable',
      genderPreference: 'Boys',
      furnishing: 'Semi Furnished',
      amenities: ['WiFi', 'Mess Food'],
      images: [
        'https://images.unsplash.com/photo-1540518614846-7ede433c4b12?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'PG for civil services aspirants.',
      roomBedOptions: [],
      reviewedBy: 'Peflarmo Super Admin',
      reviewedAt: '2026-07-05T10:00:00Z',
      adminFeedback: 'Building lacked mandated emergency fire exits and basement was illegally occupied. Submission rejected for safety non-compliance.',
    },
  ];

  const inquiries: CustomerInquiry[] = [
    {
      id: 'INQ-7001',
      customerId: 'CUST-1001',
      customerName: 'Aarav Patel',
      customerEmail: 'aarav.patel@gmail.com',
      customerPhone: '+91 98201 11223',
      propertyId: 'PROP-501',
      propertyName: 'Green Glen Elite Co-Living PG',
      propertyCategory: 'PG',
      preferredMoveInDate: '2026-11-01',
      budgetMonthly: 15000,
      message: 'Looking for a private single room with AC. Does the monthly rent include food and daily housekeeping?',
      inquiryDate: '2026-10-12T11:30:00Z',
      status: 'Pending Admin Review',
      adminReviewStatus: 'Unreviewed',
      activityHistory: [
        {
          timestamp: '2026-10-12T11:30:00Z',
          action: 'Inquiry Submitted',
          performedBy: 'Customer (Aarav Patel)',
          note: 'Inquiry received through Peflarmo portal. Awaiting Admin First Review.',
        },
      ],
    },
    {
      id: 'INQ-7002',
      customerId: 'CUST-1002',
      customerName: 'Sneha Reddy',
      customerEmail: 'sneha.reddy@outlook.com',
      customerPhone: '+91 97412 33445',
      propertyId: 'PROP-502',
      propertyName: 'Sunlight Heights 2BHK Luxury Flat',
      propertyCategory: 'Flat',
      preferredMoveInDate: '2026-11-15',
      budgetMonthly: 28000,
      message: 'Family of 3 relocating from Hyderabad. Can we arrange a physical walkthrough visit on Saturday morning?',
      inquiryDate: '2026-10-11T09:15:00Z',
      assignedOwnerId: 'OWN-202',
      assignedOwnerName: 'Kavita Joshi',
      assignedBrokerId: 'BRK-302',
      assignedBrokerName: 'Nitin Deshmukh',
      status: 'Assigned to Broker',
      adminReviewStatus: 'Reviewed',
      adminNotes: 'Verified customer details. Assigned to authorized broker Nitin Deshmukh for site inspection arrangement.',
      activityHistory: [
        {
          timestamp: '2026-10-11T09:15:00Z',
          action: 'Inquiry Submitted',
          performedBy: 'Customer (Sneha Reddy)',
        },
        {
          timestamp: '2026-10-11T10:45:00Z',
          action: 'Admin Approved & Assigned',
          performedBy: 'Super Admin',
          note: 'Assigned to Broker Nitin Deshmukh & Owner Kavita Joshi',
        },
      ],
    },
    {
      id: 'INQ-7003',
      customerId: 'CUST-1006',
      customerName: 'Manish Meena',
      customerEmail: 'manish.meena@gmail.com',
      customerPhone: '+91 94140 22334',
      propertyId: 'PROP-503',
      propertyName: 'Lakshya Scholars Residency (Boys Hostel)',
      propertyCategory: 'Hostel',
      preferredMoveInDate: '2026-10-25',
      budgetMonthly: 13000,
      message: 'Student enrolling in Allen target batch. Need single room with attached bath and silence hours compliance.',
      inquiryDate: '2026-10-13T08:00:00Z',
      status: 'Pending Admin Review',
      adminReviewStatus: 'Unreviewed',
      activityHistory: [
        {
          timestamp: '2026-10-13T08:00:00Z',
          action: 'Inquiry Submitted',
          performedBy: 'Customer (Manish Meena)',
        },
      ],
    },
    {
      id: 'INQ-7004',
      customerId: 'CUST-1003',
      customerName: 'Vikram Malhotra',
      customerEmail: 'vikram.m@gmail.com',
      customerPhone: '+91 99880 55667',
      propertyId: 'PROP-505',
      propertyName: 'Viman Nagar Comfort 1BHK Flat',
      propertyCategory: 'Flat',
      preferredMoveInDate: '2026-11-01',
      budgetMonthly: 22000,
      message: 'Inquiring regarding car parking availability for sedan and pet policy.',
      inquiryDate: '2026-10-09T14:20:00Z',
      assignedOwnerId: 'OWN-202',
      assignedOwnerName: 'Kavita Joshi',
      status: 'Assigned to Owner',
      adminReviewStatus: 'Reviewed',
      adminNotes: 'Directly assigned to property host Kavita Joshi.',
      activityHistory: [
        {
          timestamp: '2026-10-09T14:20:00Z',
          action: 'Inquiry Submitted',
          performedBy: 'Customer',
        },
        {
          timestamp: '2026-10-09T16:00:00Z',
          action: 'Routed to Owner',
          performedBy: 'Admin',
        },
      ],
    },
  ];

  const bookings: Booking[] = [
    {
      id: 'BKG-8001',
      customerId: 'CUST-1001',
      customerName: 'Aarav Patel',
      customerEmail: 'aarav.patel@gmail.com',
      customerPhone: '+91 98201 11223',
      propertyId: 'PROP-501',
      propertyName: 'Green Glen Elite Co-Living PG',
      propertyCategory: 'PG',
      ownerId: 'OWN-201',
      ownerName: 'Suresh Narayana',
      assignedBrokerId: 'BRK-301',
      assignedBrokerName: 'Pradeep Gowda',
      roomBedType: 'Twin Sharing Room (AC)',
      roomBedId: 'BED-102',
      checkInDate: '2026-10-20',
      checkOutDate: '2027-04-20',
      monthlyRent: 14500,
      securityDeposit: 25000,
      additionalCharges: 1000,
      totalBookingAmount: 40500,
      paymentStatus: 'Successful',
      bookingStatus: 'Confirmed',
      bookingCreationDate: '2026-10-05T10:00:00Z',
      confirmationDate: '2026-10-06T12:00:00Z',
      adminNotes: 'Booking verified by Super Admin after token payment verification and owner confirmation.',
      activityHistory: [
        { timestamp: '2026-10-05T10:00:00Z', action: 'Booking Request Created', performedBy: 'Customer' },
        { timestamp: '2026-10-05T11:30:00Z', action: 'Admin Reviewed & Validated', performedBy: 'Super Admin' },
        { timestamp: '2026-10-05T12:00:00Z', action: 'Token Payment Received', performedBy: 'Payment Gateway' },
        { timestamp: '2026-10-06T12:00:00Z', action: 'Confirmed & Agreement Dispatched', performedBy: 'Super Admin' },
      ],
    },
    {
      id: 'BKG-8002',
      customerId: 'CUST-1003',
      customerName: 'Vikram Malhotra',
      customerEmail: 'vikram.m@gmail.com',
      customerPhone: '+91 99880 55667',
      propertyId: 'PROP-505',
      propertyName: 'Viman Nagar Comfort 1BHK Flat',
      propertyCategory: 'Flat',
      ownerId: 'OWN-202',
      ownerName: 'Kavita Joshi',
      roomBedType: '1BHK Unit B-304',
      roomBedId: 'FLAT-105',
      checkInDate: '2026-11-01',
      checkOutDate: '2027-10-31',
      monthlyRent: 22000,
      securityDeposit: 45000,
      additionalCharges: 1500,
      totalBookingAmount: 68500,
      paymentStatus: 'Processing',
      bookingStatus: 'Pending Admin Review',
      bookingCreationDate: '2026-10-12T16:20:00Z',
      activityHistory: [
        { timestamp: '2026-10-12T16:20:00Z', action: 'Booking Request Submitted', performedBy: 'Customer (Vikram Malhotra)' },
      ],
    },
    {
      id: 'BKG-8003',
      customerId: 'CUST-1006',
      customerName: 'Manish Meena',
      customerEmail: 'manish.meena@gmail.com',
      customerPhone: '+91 94140 22334',
      propertyId: 'PROP-503',
      propertyName: 'Lakshya Scholars Residency (Boys Hostel)',
      propertyCategory: 'Hostel',
      ownerId: 'OWN-203',
      ownerName: 'Mukesh Bansal',
      roomBedType: 'Single Deluxe Student Room',
      roomBedId: 'HSTL-301',
      checkInDate: '2026-10-25',
      checkOutDate: '2027-04-30',
      monthlyRent: 15500,
      securityDeposit: 25000,
      additionalCharges: 500,
      totalBookingAmount: 41000,
      paymentStatus: 'Pending',
      bookingStatus: 'Under Review',
      bookingCreationDate: '2026-10-13T09:30:00Z',
      activityHistory: [
        { timestamp: '2026-10-13T09:30:00Z', action: 'Booking Request Created', performedBy: 'Customer' },
        { timestamp: '2026-10-13T10:00:00Z', action: 'Admin Review Commenced', performedBy: 'Booking Admin' },
      ],
    },
  ];

  const payments: PaymentRecord[] = [
    {
      id: 'PAY-9001',
      bookingId: 'BKG-8001',
      customerId: 'CUST-1001',
      customerName: 'Aarav Patel',
      propertyId: 'PROP-501',
      propertyName: 'Green Glen Elite Co-Living PG',
      bookingAmount: 14500,
      securityDeposit: 25000,
      platformFees: 1000,
      totalAmount: 40500,
      paymentMethod: 'Razorpay (UPI / Card)',
      transactionReference: 'pay_RAZOR_98412948124',
      paymentDate: '2026-10-05T12:00:00Z',
      status: 'Successful',
      reconciliationStatus: 'Verified',
      verifiedBy: 'Ananya Verma (Finance Admin)',
      verifiedAt: '2026-10-05T14:00:00Z',
      notes: 'Token & deposit verified against HDFC Escrow account.',
    },
    {
      id: 'PAY-9002',
      bookingId: 'BKG-8002',
      customerId: 'CUST-1003',
      customerName: 'Vikram Malhotra',
      propertyId: 'PROP-505',
      propertyName: 'Viman Nagar Comfort 1BHK Flat',
      bookingAmount: 22000,
      securityDeposit: 45000,
      platformFees: 1500,
      totalAmount: 68500,
      paymentMethod: 'Direct UPI',
      transactionReference: 'UPI/20261012/9900112233',
      paymentDate: '2026-10-12T16:25:00Z',
      status: 'Processing',
      reconciliationStatus: 'Pending Verification',
      notes: 'UPI intent initiated, awaiting webhook callback confirmation.',
    },
  ];

  const commissions: CommissionRecord[] = [
    {
      id: 'COMM-6001',
      bookingId: 'BKG-8001',
      propertyId: 'PROP-501',
      propertyName: 'Green Glen Elite Co-Living PG',
      ownerId: 'OWN-201',
      ownerName: 'Suresh Narayana',
      brokerId: 'BRK-301',
      brokerName: 'Pradeep Gowda',
      bookingAmount: 14500,
      applicableAgreement: 'Standard Peflarmo Broker Agreement (10%)',
      commissionRate: 10,
      calculatedCommission: 1450,
      status: 'Paid',
      paymentReference: 'IMPS/HDFC/20261008/489112',
      paymentDate: '2026-10-08T11:00:00Z',
      calculatedDate: '2026-10-06T12:00:00Z',
      approvedBy: 'Ananya Verma (Finance Admin)',
      approvedAt: '2026-10-07T10:00:00Z',
      adjustmentNotes: 'Payout approved post move-in token verification.',
    },
    {
      id: 'COMM-6002',
      bookingId: 'BKG-8002',
      propertyId: 'PROP-505',
      propertyName: 'Viman Nagar Comfort 1BHK Flat',
      ownerId: 'OWN-202',
      ownerName: 'Kavita Joshi',
      brokerId: 'BRK-302',
      brokerName: 'Nitin Deshmukh',
      bookingAmount: 22000,
      applicableAgreement: 'Standard Peflarmo Broker Agreement (10%)',
      commissionRate: 10,
      calculatedCommission: 2200,
      status: 'Pending',
      calculatedDate: '2026-10-12T16:20:00Z',
      adjustmentNotes: 'Subject to booking confirmation and payment settlement.',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'NOTIF-101',
      title: 'New Customer Inquiry Requires Review',
      message: 'Aarav Patel submitted an inquiry for Green Glen Elite Co-Living PG (Bellandur). Requires Admin routing.',
      type: 'customer_inquiry',
      referenceId: 'INQ-7001',
      referenceType: 'inquiry',
      createdAt: '2026-10-12T11:30:00Z',
      isRead: false,
      priority: 'high',
    },
    {
      id: 'NOTIF-102',
      title: 'New Property Submitted for Approval',
      message: 'Lakshya Scholars Residency (Boys Hostel, Kota) submitted by Mukesh Bansal. Verify compliance & fire documents.',
      type: 'property_submission',
      referenceId: 'PROP-503',
      referenceType: 'property',
      createdAt: '2026-10-10T09:00:00Z',
      isRead: false,
      priority: 'high',
    },
    {
      id: 'NOTIF-103',
      title: 'New Booking Request Pending',
      message: 'Vikram Malhotra submitted booking request BKG-8002 for Viman Nagar 1BHK. Awaiting Admin verification.',
      type: 'booking_request',
      referenceId: 'BKG-8002',
      referenceType: 'booking',
      createdAt: '2026-10-12T16:20:00Z',
      isRead: false,
      priority: 'high',
    },
    {
      id: 'NOTIF-104',
      title: 'Payment Settlement Completed',
      message: '₹40,500 settled successfully for BKG-8001 via Razorpay Escrow.',
      type: 'payment_status',
      referenceId: 'PAY-9001',
      referenceType: 'payment',
      createdAt: '2026-10-05T14:00:00Z',
      isRead: true,
      priority: 'normal',
    },
    {
      id: 'NOTIF-105',
      title: 'Security Alert: Failed Login Threshold',
      message: 'IP 185.220.101.5 attempted 3 invalid logins on admin portal. Rate limiting engaged.',
      type: 'security_alert',
      createdAt: '2026-10-13T04:12:00Z',
      isRead: false,
      priority: 'critical',
    },
  ];

  const tickets: SupportTicket[] = [
    {
      id: 'TKT-4001',
      userId: 'CUST-1001',
      userName: 'Aarav Patel',
      userType: 'Customer',
      userEmail: 'aarav.patel@gmail.com',
      userPhone: '+91 98201 11223',
      relatedPropertyId: 'PROP-501',
      relatedPropertyName: 'Green Glen Elite Co-Living PG',
      relatedBookingId: 'BKG-8001',
      complaintCategory: 'Maintenance',
      description: 'WiFi speed on the 3rd floor is dropping below 10 Mbps during evening peak hours. Requested router check.',
      submissionDate: '2026-10-11T16:00:00Z',
      assignedStaff: 'Rohan Sharma',
      priority: 'Medium',
      status: 'Under Review',
      internalNotes: [
        {
          id: 'NOTE-1',
          adminName: 'Rohan Sharma',
          timestamp: '2026-10-11T16:30:00Z',
          note: 'Spoke with property manager Suresh Narayana; ACT Fibernet technician scheduled for visit tomorrow 11 AM.',
        },
      ],
    },
    {
      id: 'TKT-4002',
      userId: 'OWN-203',
      userName: 'Mukesh Bansal',
      userType: 'Owner',
      userEmail: 'bansal.hostels@kotastudy.com',
      userPhone: '+91 94141 88776',
      relatedPropertyId: 'PROP-503',
      relatedPropertyName: 'Lakshya Scholars Residency (Boys Hostel)',
      complaintCategory: 'Listing Dispute',
      description: 'Submitted property deed and municipal trade license 3 days ago. Requesting expedited approval before admission season starts.',
      submissionDate: '2026-10-12T09:00:00Z',
      assignedStaff: 'Peflarmo Super Admin',
      priority: 'High',
      status: 'Open',
      internalNotes: [
        {
          id: 'NOTE-2',
          adminName: 'Super Admin',
          timestamp: '2026-10-12T09:30:00Z',
          note: 'Physical inspection agent Kota team needs to clear room dimensions first.',
        },
      ],
    },
  ];

  const content: ContentManagementData = {
    banners: [
      {
        id: 'BAN-01',
        title: 'Verified PGs & Rooms with Zero Hidden Brokerage',
        subtitle: 'Over 12,000 students & IT professionals trust Peflarmo across India',
        ctaText: 'Explore Bellandur & Koramangala',
        ctaLink: '/search?city=Bangalore',
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        category: 'PG',
        city: 'Bangalore',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'BAN-02',
        title: 'Premium Hostels for Kota & Pune Aspirants',
        subtitle: 'Quiet study atmospheres, hygienic meals & 24/7 security near major institutes',
        ctaText: 'View Kota Hostels',
        ctaLink: '/search?city=Kota&category=Hostel',
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
        category: 'Hostel',
        city: 'Kota',
        isActive: true,
        sortOrder: 2,
      },
    ],
    featuredPropertyIds: ['PROP-501', 'PROP-502'],
    faqs: [
      {
        id: 'FAQ-1',
        category: 'Booking',
        question: 'How does Peflarmo guarantee no double-booking?',
        answer: 'All booking requests go through Admin validation and real-time bed inventory reservation. A bed or flat is locked immediately once token payment is verified.',
        isActive: true,
      },
      {
        id: 'FAQ-2',
        category: 'Rent & Deposit',
        question: 'Is my security deposit held safely?',
        answer: 'Yes, Peflarmo holds security deposits in a segregated escrow account and only releases it to owners upon verified check-in inspection.',
        isActive: true,
      },
      {
        id: 'FAQ-3',
        category: 'Verification',
        question: 'What documents are required to approve a PG or Hostel?',
        answer: 'Property owners must submit government identity (Aadhaar/PAN), municipal property deeds/tax receipts, and commercial fire & safety clearances.',
        isActive: true,
      },
    ],
    aboutUsText: 'Peflarmo is India’s foremost verified managed accommodation platform catering to young professionals, university students, and families looking for PGs, flats, shared rooms, and hostels.',
    supportHelpline: '+91 93183 22388',
    supportEmail: 'support@peflarmo.com',
    termsAndConditions: 'All property transactions, tenancy agreements, and token deposits are subject to the Peflarmo Tenant Protection Charter 2026.',
    privacyPolicy: 'We strictly protect customer, broker, and owner sensitive documents in compliance with India’s Digital Personal Data Protection (DPDP) Act 2023.',
    cancellationPolicy: '100% refund of token deposit if cancellation is requested within 48 hours of booking and at least 7 days before move-in date.',
  };

  const settings: SystemSettingsData = {
    platformName: 'Peflarmo Admin Control Center',
    brandTagline: 'India’s Verified PG, Flat, Room & Hostel Operations Hub',
    supportEmail: 'ops@peflarmo.com',
    supportPhone: '+91 93183 22388',
    supportedCities: ['Bangalore', 'Pune', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Jaipur', 'Kota', 'Chennai', 'Ahmedabad'],
    currencySymbol: '₹',
    propertyApprovalRules: {
      requirePhysicalVerification: true,
      requireOwnerAadhaarPan: true,
      minimumImagesRequired: 3,
      requireBrokerReraNumber: true,
    },
    bookingWorkflowSettings: {
      adminFirstReviewMandatory: true,
      autoAssignToOwnerAfterHours: 24,
      allowDoubleBookingOverride: false,
      cancellationWindowHours: 48,
    },
    commissionRules: {
      defaultBrokerPercentage: 10,
      defaultPlatformFeePercentage: 3,
      minimumPayoutThreshold: 1000,
      payoutCycleDays: 7,
    },
    apiStatus: {
      razorpayGateway: 'Active',
      smsOtpGateway: 'Active',
      aadhaarVerificationApi: 'Active',
    },
  };

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'LOG-001',
      eventId: 'EVT-AUTH-101',
      adminId: 'ADM-001',
      adminName: 'Peflarmo Super Admin',
      adminRole: 'Super Admin',
      action: 'Admin Login',
      recordId: 'ADM-001',
      entityType: 'Authentication',
      timestamp: '2026-10-13T16:00:00Z',
      result: 'SUCCESS',
      ipAddress: '103.21.244.12',
      details: 'Super Admin authenticated with primary session credentials.',
    },
    {
      id: 'LOG-002',
      eventId: 'EVT-PROP-102',
      adminId: 'ADM-001',
      adminName: 'Peflarmo Super Admin',
      adminRole: 'Super Admin',
      action: 'Property Approved',
      recordId: 'PROP-501',
      entityType: 'Property',
      timestamp: '2026-08-02T16:00:00Z',
      result: 'SUCCESS',
      ipAddress: '103.21.244.12',
      details: 'Green Glen Elite Co-Living PG marked Approved for public customer portal.',
    },
    {
      id: 'LOG-003',
      eventId: 'EVT-INQ-103',
      adminId: 'ADM-001',
      adminName: 'Peflarmo Super Admin',
      adminRole: 'Super Admin',
      action: 'Inquiry Assigned to Broker',
      recordId: 'INQ-7002',
      entityType: 'CustomerInquiry',
      timestamp: '2026-10-11T10:45:00Z',
      result: 'SUCCESS',
      ipAddress: '103.21.244.12',
      details: 'Inquiry assigned to Broker Nitin Deshmukh following Admin First Review workflow.',
    },
    {
      id: 'LOG-004',
      eventId: 'EVT-BKG-104',
      adminId: 'ADM-001',
      adminName: 'Peflarmo Super Admin',
      adminRole: 'Super Admin',
      action: 'Booking Confirmed',
      recordId: 'BKG-8001',
      entityType: 'Booking',
      timestamp: '2026-10-06T12:00:00Z',
      result: 'SUCCESS',
      ipAddress: '103.21.244.12',
      details: 'Booking confirmed after Escrow token payment verified and double-booking check passed.',
    },
  ];

  return {
    admins,
    customers,
    owners,
    brokers,
    properties,
    inquiries,
    bookings,
    payments,
    commissions,
    notifications,
    tickets,
    content,
    settings,
    auditLogs,
    sessions: [],
    emailOtps: {},
    passwordResets: {},
    loginAttempts: {},
  };
}

export function getDb(): DatabaseState {
  if (!global.__peflarmo_db__) {
    global.__peflarmo_db__ = getInitialDbState();
  }
  return global.__peflarmo_db__;
}

// Strict audit log text sanitizer to guarantee no OTPs, passwords, or secret tokens are ever logged
function sanitizeAuditDetails(text: string): string {
  if (!text) return '';
  return text
    .replace(/(?:otp|code|token|password|passcode)\s*[:=]\s*[0-9a-zA-Z\-_]+/gi, 'token: [PROTECTED]')
    .replace(/\b\d{6}\b/g, '[REDACTED_CODE]');
}

// Helper to record audit log
export function recordAuditLog(
  admin: { id: string; name: string; role: AdminRole },
  action: string,
  recordId: string,
  entityType: string,
  details: string,
  result: 'SUCCESS' | 'DENIED' | 'WARNING' = 'SUCCESS',
  ipAddress: string = '127.0.0.1'
) {
  const db = getDb();
  const entry: AuditLogEntry = {
    id: `LOG-${Date.now().toString().slice(-6)}`,
    eventId: `EVT-${Date.now()}`,
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role,
    action,
    recordId,
    entityType,
    timestamp: new Date().toISOString(),
    result,
    ipAddress,
    details: sanitizeAuditDetails(details),
  };
  db.auditLogs.unshift(entry);
  return entry;
}

// Double booking prevention check
export function checkDoubleBooking(
  propertyId: string,
  roomBedId: string,
  newCheckIn: string,
  newCheckOut?: string,
  excludeBookingId?: string
): { isConflict: boolean; conflictingBooking?: Booking; message?: string } {
  const db = getDb();
  const checkIn = new Date(newCheckIn).getTime();
  const checkOut = newCheckOut ? new Date(newCheckOut).getTime() : checkIn + 30 * 24 * 60 * 60 * 1000;

  // Check confirmed or awaiting confirmation bookings for the same roomBedId
  const conflicts = db.bookings.filter(b => {
    if (b.id === excludeBookingId) return false;
    if (b.propertyId !== propertyId) return false;
    if (b.roomBedId !== roomBedId) return false;
    if (b.bookingStatus !== 'Confirmed' && b.bookingStatus !== 'Awaiting Confirmation') return false;

    const bCheckIn = new Date(b.checkInDate).getTime();
    const bCheckOut = b.checkOutDate ? new Date(b.checkOutDate).getTime() : bCheckIn + 30 * 24 * 60 * 60 * 1000;

    // Overlapping condition: (StartA <= EndB) and (EndA >= StartB)
    return checkIn <= bCheckOut && checkOut >= bCheckIn;
  });

  if (conflicts.length > 0) {
    const conflict = conflicts[0];
    return {
      isConflict: true,
      conflictingBooking: conflict,
      message: `Double-booking prevention: Unit ${roomBedId} is already locked for Booking #${conflict.id} (${conflict.customerName}) from ${conflict.checkInDate} to ${conflict.checkOutDate || 'Ongoing'}.`,
    };
  }

  return { isConflict: false };
}
