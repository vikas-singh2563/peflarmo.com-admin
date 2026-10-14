export type AdminRole = 
  | 'Super Admin'
  | 'Property Approval Admin'
  | 'Booking Admin'
  | 'Finance Admin'
  | 'Support Admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  phone: string;
  avatar?: string;
  passwordHash: string;
  isActive: boolean;
  lastLogin?: string;
  lastLoginIp?: string;
  createdAt: string;
}

export type AccountStatus = 'Active' | 'Suspended';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  registrationDate: string;
  totalInquiries: number;
  totalBookings: number;
  status: AccountStatus;
  suspensionReason?: string;
  kycVerified: boolean;
  idProofType?: string;
  idProofNumber?: string;
  emergencyContact?: string;
}

export type OwnerStatus = 
  | 'Pending Verification'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Suspended';

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  registrationDate: string;
  status: OwnerStatus;
  kycDocType: string;
  kycDocNumber: string;
  verificationDocsSubmitted: boolean;
  propertiesCount: number;
  totalEarnings: number;
  bankAccountVerified: boolean;
  assignedBrokerId?: string;
  rejectionReason?: string;
  suspensionReason?: string;
}

export type BrokerStatus = 
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Suspended';

export interface Broker {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  licenseNumber: string;
  experienceYears: number;
  registrationDate: string;
  status: BrokerStatus;
  assignedPropertiesCount: number;
  commissionEarned: number;
  commissionRateDefault: number; // e.g. 10%
  activeInquiriesCount: number;
  rejectionReason?: string;
  suspensionReason?: string;
}

export type PropertyCategory = 'PG' | 'Flat' | 'Room' | 'Hostel';

export type PropertyApprovalStatus = 
  | 'Draft'
  | 'Pending Admin Approval'
  | 'Approved'
  | 'Rejected'
  | 'Suspended'
  | 'Unavailable';

export type PropertyAvailability = 'Available' | 'Occupied' | 'Reserved' | 'Unavailable';

export interface RoomBedOption {
  id: string;
  name: string;
  type: string; // 'Single Sharing', 'Double Sharing', '1BHK Unit', etc.
  rent: number;
  deposit: number;
  totalUnits: number;
  occupiedUnits: number;
}

export interface Property {
  id: string;
  name: string;
  category: PropertyCategory;
  ownerId: string;
  ownerName: string;
  brokerId?: string;
  brokerName?: string;
  city: string;
  locality: string;
  address: string;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceFee: number;
  submissionDate: string;
  approvalStatus: PropertyApprovalStatus;
  availabilityStatus: PropertyAvailability;
  genderPreference: 'All' | 'Boys' | 'Girls' | 'Family';
  furnishing: 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished';
  amenities: string[];
  images: string[];
  description: string;
  roomBedOptions: RoomBedOption[];
  reviewedBy?: string;
  reviewedAt?: string;
  adminFeedback?: string;
}

export type InquiryStatus = 
  | 'Pending Admin Review'
  | 'Under Review'
  | 'Assigned to Owner'
  | 'Assigned to Broker'
  | 'Contact in Progress'
  | 'Follow-up Required'
  | 'Resolved'
  | 'Rejected'
  | 'Closed';

export interface InquiryActivity {
  timestamp: string;
  action: string;
  performedBy: string;
  note?: string;
}

export interface CustomerInquiry {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyId: string;
  propertyName: string;
  propertyCategory: PropertyCategory;
  preferredMoveInDate: string;
  budgetMonthly: number;
  message: string;
  inquiryDate: string;
  assignedOwnerId?: string;
  assignedOwnerName?: string;
  assignedBrokerId?: string;
  assignedBrokerName?: string;
  status: InquiryStatus;
  adminReviewStatus: 'Unreviewed' | 'Reviewed' | 'Escalated';
  adminNotes?: string;
  activityHistory: InquiryActivity[];
}

export type BookingStatus = 
  | 'Pending Admin Review'
  | 'Under Review'
  | 'Assigned to Owner'
  | 'Assigned to Broker'
  | 'Awaiting Confirmation'
  | 'Confirmed'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed';

export type PaymentStatus = 
  | 'Pending'
  | 'Processing'
  | 'Successful'
  | 'Failed'
  | 'Refunded'
  | 'Partially Refunded';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyId: string;
  propertyName: string;
  propertyCategory: PropertyCategory;
  ownerId: string;
  ownerName: string;
  assignedBrokerId?: string;
  assignedBrokerName?: string;
  roomBedType: string;
  roomBedId: string;
  checkInDate: string;
  checkOutDate?: string;
  monthlyRent: number;
  securityDeposit: number;
  additionalCharges: number;
  totalBookingAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  bookingCreationDate: string;
  assignedDate?: string;
  confirmationDate?: string;
  adminNotes?: string;
  activityHistory: InquiryActivity[];
}

export type PaymentMethod = 
  | 'Razorpay (UPI / Card)'
  | 'Direct UPI'
  | 'Net Banking'
  | 'Bank Transfer (IMPS/NEFT)';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  propertyId: string;
  propertyName: string;
  bookingAmount: number;
  securityDeposit: number;
  platformFees: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  paymentDate: string;
  status: PaymentStatus;
  reconciliationStatus: 'Verified' | 'Pending Verification' | 'Disputed';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export type CommissionStatus = 
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Payable'
  | 'Paid'
  | 'Disputed'
  | 'Cancelled';

export interface CommissionRecord {
  id: string;
  bookingId: string;
  propertyId: string;
  propertyName: string;
  ownerId: string;
  ownerName: string;
  brokerId: string;
  brokerName: string;
  bookingAmount: number;
  applicableAgreement: string; // e.g., "Standard Peflarmo Broker Agreement (10%)"
  commissionRate: number; // percentage, e.g. 10
  calculatedCommission: number;
  status: CommissionStatus;
  paymentReference?: string;
  paymentDate?: string;
  calculatedDate: string;
  approvedBy?: string;
  approvedAt?: string;
  adjustmentNotes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 
    | 'customer_registration'
    | 'owner_registration'
    | 'broker_registration'
    | 'property_submission'
    | 'property_decision'
    | 'customer_inquiry'
    | 'booking_request'
    | 'booking_status'
    | 'payment_status'
    | 'commission_update'
    | 'complaint'
    | 'security_alert';
  referenceId?: string;
  referenceType?: 'customer' | 'owner' | 'broker' | 'property' | 'inquiry' | 'booking' | 'payment' | 'commission' | 'support';
  createdAt: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketStatus = 'Open' | 'Under Review' | 'Awaiting Response' | 'Resolved' | 'Closed';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userType: 'Customer' | 'Owner' | 'Broker';
  userEmail: string;
  userPhone: string;
  relatedPropertyId?: string;
  relatedPropertyName?: string;
  relatedBookingId?: string;
  complaintCategory: string; // 'Maintenance', 'Refund & Deposit', 'Misleading Information', 'Noise & Rules', etc.
  description: string;
  submissionDate: string;
  assignedStaff?: string;
  priority: TicketPriority;
  status: TicketStatus;
  internalNotes: {
    id: string;
    adminName: string;
    timestamp: string;
    note: string;
  }[];
  resolutionSummary?: string;
  resolvedAt?: string;
}

export interface ContentBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  category: PropertyCategory | 'All';
  city: string;
  isActive: boolean;
  sortOrder: number;
}

export interface FaqItem {
  id: string;
  category: 'General' | 'Booking' | 'Rent & Deposit' | 'Verification';
  question: string;
  answer: string;
  isActive: boolean;
}

export interface ContentManagementData {
  banners: ContentBanner[];
  featuredPropertyIds: string[];
  faqs: FaqItem[];
  aboutUsText: string;
  supportHelpline: string;
  supportEmail: string;
  termsAndConditions: string;
  privacyPolicy: string;
  cancellationPolicy: string;
}

export interface SystemSettingsData {
  platformName: string;
  brandTagline: string;
  supportEmail: string;
  supportPhone: string;
  supportedCities: string[];
  currencySymbol: string;
  propertyApprovalRules: {
    requirePhysicalVerification: boolean;
    requireOwnerAadhaarPan: boolean;
    minimumImagesRequired: number;
    requireBrokerReraNumber: boolean;
  };
  bookingWorkflowSettings: {
    adminFirstReviewMandatory: boolean;
    autoAssignToOwnerAfterHours: number;
    allowDoubleBookingOverride: boolean;
    cancellationWindowHours: number;
  };
  commissionRules: {
    defaultBrokerPercentage: number;
    defaultPlatformFeePercentage: number;
    minimumPayoutThreshold: number;
    payoutCycleDays: number;
  };
  apiStatus: {
    razorpayGateway: 'Active' | 'Sandbox' | 'Inactive';
    smsOtpGateway: 'Active' | 'Sandbox' | 'Inactive';
    aadhaarVerificationApi: 'Active' | 'Sandbox' | 'Inactive';
  };
}

export interface AuditLogEntry {
  id: string;
  eventId: string;
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  action: string;
  recordId: string;
  entityType: string;
  timestamp: string;
  result: 'SUCCESS' | 'DENIED' | 'WARNING';
  ipAddress: string;
  details: string;
}

export interface AdminSession {
  token: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  role: AdminRole;
  ip: string;
  userAgent?: string;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
}

export interface EmailOtpRecord {
  adminId: string;
  email: string;
  otpHash: string;
  expiresAt: number; // 5 minutes (300,000 ms)
  attempts: number; // max 5 incorrect attempts
  resendAvailableAt: number; // rate limit cooldown
  tempToken: string; // pre-auth session token
  createdAt: number;
}

export interface PasswordResetRecord {
  adminId: string;
  email: string;
  tokenHash: string;
  expiresAt: number; // 15 mins
  used: boolean;
  createdAt: number;
}

export interface EmailConfigStatus {
  configured: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUserConfigured: boolean;
  senderFrom: string;
  officialAdminEmail: string;
  lastTestStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  lastTestMessage?: string;
}

