import { NextRequest, NextResponse } from 'next/server';
import { getDb, recordAuditLog, checkDoubleBooking } from '@/lib/server-db';
import { Booking, CustomerInquiry, Property, SupportTicket } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  const { resource } = await params;
  const db = getDb();
  const searchParams = req.nextUrl.searchParams;

  switch (resource) {
    case 'stats': {
      const totalCustomers = db.customers.length;
      const totalOwners = db.owners.length;
      const totalBrokers = db.brokers.length;
      const totalProperties = db.properties.length;
      const pendingPropertyApprovals = db.properties.filter(p => p.approvalStatus === 'Pending Admin Approval').length;
      const approvedProperties = db.properties.filter(p => p.approvalStatus === 'Approved').length;
      const rejectedProperties = db.properties.filter(p => p.approvalStatus === 'Rejected').length;
      const newCustomerInquiries = db.inquiries.filter(i => i.status === 'Pending Admin Review').length;
      const pendingBookingRequests = db.bookings.filter(b => b.bookingStatus === 'Pending Admin Review' || b.bookingStatus === 'Under Review').length;
      const confirmedBookings = db.bookings.filter(b => b.bookingStatus === 'Confirmed').length;
      const cancelledBookings = db.bookings.filter(b => b.bookingStatus === 'Cancelled').length;
      
      const totalPaymentsAmount = db.payments
        .filter(p => p.status === 'Successful')
        .reduce((sum, p) => sum + p.totalAmount, 0);

      const pendingPaymentsAmount = db.payments
        .filter(p => p.status === 'Pending' || p.status === 'Processing')
        .reduce((sum, p) => sum + p.totalAmount, 0);

      const totalCommissionsEarned = db.commissions
        .reduce((sum, c) => sum + c.calculatedCommission, 0);

      const pendingCommissionPayouts = db.commissions
        .filter(c => c.status === 'Payable' || c.status === 'Pending' || c.status === 'Approved')
        .reduce((sum, c) => sum + c.calculatedCommission, 0);

      // Category breakdown
      const categoryCounts = {
        PG: db.properties.filter(p => p.category === 'PG').length,
        Flat: db.properties.filter(p => p.category === 'Flat').length,
        Room: db.properties.filter(p => p.category === 'Room').length,
        Hostel: db.properties.filter(p => p.category === 'Hostel').length,
      };

      return NextResponse.json({
        totalCustomers,
        totalOwners,
        totalBrokers,
        totalProperties,
        pendingPropertyApprovals,
        approvedProperties,
        rejectedProperties,
        newCustomerInquiries,
        pendingBookingRequests,
        confirmedBookings,
        cancelledBookings,
        totalPaymentsAmount,
        pendingPaymentsAmount,
        totalCommissionsEarned,
        pendingCommissionPayouts,
        categoryCounts,
        recentBookings: db.bookings.slice(0, 5),
        recentInquiries: db.inquiries.slice(0, 5),
        recentApprovals: db.properties.filter(p => p.approvalStatus === 'Pending Admin Approval').slice(0, 5),
        recentActivity: db.auditLogs.slice(0, 6),
      });
    }

    case 'customers': {
      const q = searchParams.get('q')?.toLowerCase();
      let list = [...db.customers];
      if (q) {
        list = list.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ data: list });
    }

    case 'owners': {
      const status = searchParams.get('status');
      let list = [...db.owners];
      if (status && status !== 'All') {
        list = list.filter(o => o.status === status);
      }
      return NextResponse.json({ data: list });
    }

    case 'brokers': {
      const status = searchParams.get('status');
      let list = [...db.brokers];
      if (status && status !== 'All') {
        list = list.filter(b => b.status === status);
      }
      return NextResponse.json({ data: list });
    }

    case 'properties': {
      const category = searchParams.get('category');
      const status = searchParams.get('status');
      let list = [...db.properties];
      if (category && category !== 'All') {
        list = list.filter(p => p.category === category);
      }
      if (status && status !== 'All') {
        list = list.filter(p => p.approvalStatus === status);
      }
      return NextResponse.json({ data: list });
    }

    case 'inquiries': {
      const status = searchParams.get('status');
      let list = [...db.inquiries];
      if (status && status !== 'All') {
        list = list.filter(i => i.status === status);
      }
      return NextResponse.json({ data: list });
    }

    case 'bookings': {
      const status = searchParams.get('status');
      let list = [...db.bookings];
      if (status && status !== 'All') {
        list = list.filter(b => b.bookingStatus === status);
      }
      return NextResponse.json({ data: list });
    }

    case 'payments': {
      const status = searchParams.get('status');
      let list = [...db.payments];
      if (status && status !== 'All') {
        list = list.filter(p => p.status === status);
      }
      return NextResponse.json({ data: list });
    }

    case 'commissions': {
      const status = searchParams.get('status');
      let list = [...db.commissions];
      if (status && status !== 'All') {
        list = list.filter(c => c.status === status);
      }
      return NextResponse.json({ data: list });
    }

    case 'notifications': {
      return NextResponse.json({ data: db.notifications });
    }

    case 'support': {
      const status = searchParams.get('status');
      let list = [...db.tickets];
      if (status && status !== 'All') {
        list = list.filter(t => t.status === status);
      }
      return NextResponse.json({ data: list });
    }

    case 'content': {
      return NextResponse.json({ data: db.content });
    }

    case 'settings': {
      return NextResponse.json({ data: db.settings });
    }

    case 'audit-logs': {
      return NextResponse.json({ data: db.auditLogs });
    }

    default:
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  const { resource } = await params;
  const db = getDb();
  const body = await req.json();
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const admin = db.admins[0]; // Active admin

  if (resource === 'properties') {
    // Add new property submission
    const newProp: Property = {
      ...body,
      id: `PROP-${Date.now().toString().slice(-4)}`,
      submissionDate: new Date().toISOString(),
      approvalStatus: 'Pending Admin Approval',
      availabilityStatus: 'Available',
    };
    db.properties.unshift(newProp);

    recordAuditLog(
      admin,
      'Property Submitted (Test)',
      newProp.id,
      'Property',
      `New property submission: ${newProp.name} in ${newProp.city}`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({ success: true, data: newProp });
  }

  if (resource === 'bookings') {
    // New booking submission with server-side double booking prevention!
    const { propertyId, roomBedId, checkInDate, checkOutDate, customerName, customerEmail, customerPhone } = body;

    const conflictCheck = checkDoubleBooking(propertyId, roomBedId, checkInDate, checkOutDate);
    if (conflictCheck.isConflict) {
      return NextResponse.json(
        { error: conflictCheck.message, conflict: conflictCheck.conflictingBooking },
        { status: 409 }
      );
    }

    const prop = db.properties.find(p => p.id === propertyId);
    if (!prop) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const bed = prop.roomBedOptions.find(b => b.id === roomBedId);
    const rent = bed ? bed.rent : prop.monthlyRent;
    const deposit = bed ? bed.deposit : prop.securityDeposit;

    const newBooking: Booking = {
      id: `BKG-${Date.now().toString().slice(-4)}`,
      customerId: body.customerId || `CUST-${Date.now().toString().slice(-4)}`,
      customerName: customerName || 'Prospective Resident',
      customerEmail: customerEmail || 'resident@example.com',
      customerPhone: customerPhone || '+91 99999 88888',
      propertyId: prop.id,
      propertyName: prop.name,
      propertyCategory: prop.category,
      ownerId: prop.ownerId,
      ownerName: prop.ownerName,
      assignedBrokerId: prop.brokerId,
      assignedBrokerName: prop.brokerName,
      roomBedType: bed ? bed.name : 'Standard Unit',
      roomBedId: roomBedId || 'GEN-UNIT-1',
      checkInDate,
      checkOutDate,
      monthlyRent: rent,
      securityDeposit: deposit,
      additionalCharges: 1000,
      totalBookingAmount: rent + deposit + 1000,
      paymentStatus: 'Pending',
      bookingStatus: 'Pending Admin Review',
      bookingCreationDate: new Date().toISOString(),
      activityHistory: [
        {
          timestamp: new Date().toISOString(),
          action: 'Booking Request Submitted',
          performedBy: customerName || 'Customer',
          note: 'Routing through Admin First Review queue.',
        },
      ],
    };

    db.bookings.unshift(newBooking);

    recordAuditLog(
      admin,
      'Booking Request Created',
      newBooking.id,
      'Booking',
      `Booking request submitted for ${prop.name}. Entered Admin First Review queue.`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({ success: true, data: newBooking });
  }

  if (resource === 'inquiries') {
    // New customer inquiry with mandatory Admin First workflow
    const prop = db.properties.find(p => p.id === body.propertyId);
    const newInquiry: CustomerInquiry = {
      id: `INQ-${Date.now().toString().slice(-4)}`,
      customerId: body.customerId || `CUST-${Date.now().toString().slice(-4)}`,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      propertyId: body.propertyId,
      propertyName: prop ? prop.name : 'Property Listing',
      propertyCategory: prop ? prop.category : 'PG',
      preferredMoveInDate: body.preferredMoveInDate,
      budgetMonthly: body.budgetMonthly || (prop ? prop.monthlyRent : 15000),
      message: body.message,
      inquiryDate: new Date().toISOString(),
      status: 'Pending Admin Review',
      adminReviewStatus: 'Unreviewed',
      activityHistory: [
        {
          timestamp: new Date().toISOString(),
          action: 'Inquiry Submitted',
          performedBy: body.customerName,
          note: 'Saved in backend. Mandatory Admin Review pending.',
        },
      ],
    };

    db.inquiries.unshift(newInquiry);

    recordAuditLog(
      admin,
      'Inquiry Received',
      newInquiry.id,
      'CustomerInquiry',
      `New inquiry from ${newInquiry.customerName} for ${newInquiry.propertyName}.`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({ success: true, data: newInquiry });
  }

  if (resource === 'support') {
    // Create new support ticket
    const newTicket: SupportTicket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      userId: body.userId || 'CUST-1001',
      userName: body.userName || 'Portal User',
      userType: body.userType || 'Customer',
      userEmail: body.userEmail || 'user@example.com',
      userPhone: body.userPhone || '+91 98000 00000',
      relatedPropertyId: body.relatedPropertyId,
      relatedBookingId: body.relatedBookingId,
      complaintCategory: body.complaintCategory || 'General Inquiry',
      description: body.description,
      submissionDate: new Date().toISOString(),
      priority: body.priority || 'Medium',
      status: 'Open',
      internalNotes: [],
    };

    db.tickets.unshift(newTicket);
    return NextResponse.json({ success: true, data: newTicket });
  }

  return NextResponse.json({ error: 'Action not supported' }, { status: 400 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  const { resource } = await params;
  const db = getDb();
  const body = await req.json();
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const admin = db.admins[0];

  switch (resource) {
    case 'customers': {
      const { id, status, suspensionReason } = body;
      const cust = db.customers.find(c => c.id === id);
      if (!cust) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      if (status) cust.status = status;
      if (suspensionReason !== undefined) cust.suspensionReason = suspensionReason;

      recordAuditLog(
        admin,
        `Customer Account ${status}`,
        cust.id,
        'Customer',
        `Account status updated to ${status}. Reason: ${suspensionReason || 'Routine review'}`,
        'SUCCESS',
        ip
      );

      return NextResponse.json({ success: true, data: cust });
    }

    case 'owners': {
      const { id, status, rejectionReason, suspensionReason, assignedBrokerId } = body;
      const owner = db.owners.find(o => o.id === id);
      if (!owner) return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
      if (status) owner.status = status;
      if (rejectionReason) owner.rejectionReason = rejectionReason;
      if (suspensionReason) owner.suspensionReason = suspensionReason;
      if (assignedBrokerId !== undefined) owner.assignedBrokerId = assignedBrokerId;

      recordAuditLog(
        admin,
        `Owner Account Decision: ${status}`,
        owner.id,
        'Owner',
        `Status set to ${status}. Notes: ${rejectionReason || suspensionReason || 'Approved by Admin'}`,
        'SUCCESS',
        ip
      );

      return NextResponse.json({ success: true, data: owner });
    }

    case 'brokers': {
      const { id, status, rejectionReason, suspensionReason } = body;
      const broker = db.brokers.find(b => b.id === id);
      if (!broker) return NextResponse.json({ error: 'Broker not found' }, { status: 404 });
      if (status) broker.status = status;
      if (rejectionReason) broker.rejectionReason = rejectionReason;
      if (suspensionReason) broker.suspensionReason = suspensionReason;

      recordAuditLog(
        admin,
        `Broker Account Decision: ${status}`,
        broker.id,
        'Broker',
        `Status set to ${status}. Notes: ${rejectionReason || suspensionReason || 'Approved by Admin'}`,
        'SUCCESS',
        ip
      );

      return NextResponse.json({ success: true, data: broker });
    }

    case 'properties': {
      const { id, approvalStatus, adminFeedback, assignedBrokerId, availabilityStatus } = body;
      const prop = db.properties.find(p => p.id === id);
      if (!prop) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

      if (approvalStatus) {
        prop.approvalStatus = approvalStatus;
        prop.reviewedBy = admin.name;
        prop.reviewedAt = new Date().toISOString();
        if (adminFeedback) prop.adminFeedback = adminFeedback;
      }
      if (assignedBrokerId !== undefined) {
        prop.brokerId = assignedBrokerId;
        const b = db.brokers.find(br => br.id === assignedBrokerId);
        if (b) prop.brokerName = b.name;
      }
      if (availabilityStatus) {
        prop.availabilityStatus = availabilityStatus;
      }

      recordAuditLog(
        admin,
        `Property Decision: ${approvalStatus || 'Updated'}`,
        prop.id,
        'Property',
        `Listing ${prop.name} set to ${approvalStatus || 'Updated'}. Feedback: ${adminFeedback || 'None'}`,
        'SUCCESS',
        ip
      );

      return NextResponse.json({ success: true, data: prop });
    }

    case 'inquiries': {
      // Mandatory Admin First Inquiry routing
      const { id, status, assignedOwnerId, assignedBrokerId, adminNotes, note } = body;
      const inq = db.inquiries.find(i => i.id === id);
      if (!inq) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });

      if (status) inq.status = status;
      if (adminNotes !== undefined) inq.adminNotes = adminNotes;
      if (assignedOwnerId !== undefined) {
        inq.assignedOwnerId = assignedOwnerId;
        const owner = db.owners.find(o => o.id === assignedOwnerId);
        inq.assignedOwnerName = owner ? owner.name : undefined;
      }
      if (assignedBrokerId !== undefined) {
        inq.assignedBrokerId = assignedBrokerId;
        const broker = db.brokers.find(b => b.id === assignedBrokerId);
        inq.assignedBrokerName = broker ? broker.name : undefined;
      }

      inq.adminReviewStatus = 'Reviewed';
      inq.activityHistory.push({
        timestamp: new Date().toISOString(),
        action: `Status: ${status || 'Assigned'}`,
        performedBy: admin.name,
        note: note || adminNotes || 'Admin processed routing',
      });

      recordAuditLog(
        admin,
        `Inquiry Updated: ${inq.id}`,
        inq.id,
        'CustomerInquiry',
        `Routed to Owner: ${inq.assignedOwnerName || 'None'}, Broker: ${inq.assignedBrokerName || 'None'}. Status: ${inq.status}`,
        'SUCCESS',
        ip
      );

      return NextResponse.json({ success: true, data: inq });
    }

    case 'bookings': {
      // Mandatory Admin First Booking routing & double booking enforcement!
      const { id, bookingStatus, paymentStatus, assignedBrokerId, adminNotes, note } = body;
      const bkg = db.bookings.find(b => b.id === id);
      if (!bkg) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

      // If moving to Confirmed, check double-booking!
      if (bookingStatus === 'Confirmed' && bkg.bookingStatus !== 'Confirmed') {
        const doubleCheck = checkDoubleBooking(bkg.propertyId, bkg.roomBedId, bkg.checkInDate, bkg.checkOutDate, bkg.id);
        if (doubleCheck.isConflict) {
          return NextResponse.json(
            { error: doubleCheck.message, conflict: doubleCheck.conflictingBooking },
            { status: 409 }
          );
        }
        bkg.confirmationDate = new Date().toISOString();
      }

      if (bookingStatus) bkg.bookingStatus = bookingStatus;
      if (paymentStatus) bkg.paymentStatus = paymentStatus;
      if (adminNotes !== undefined) bkg.adminNotes = adminNotes;
      if (assignedBrokerId !== undefined) {
        bkg.assignedBrokerId = assignedBrokerId;
        const b = db.brokers.find(br => br.id === assignedBrokerId);
        bkg.assignedBrokerName = b ? b.name : undefined;
      }

      bkg.activityHistory.push({
        timestamp: new Date().toISOString(),
        action: `Booking Status: ${bookingStatus || 'Updated'}`,
        performedBy: admin.name,
        note: note || adminNotes || 'Updated in Admin workflow',
      });

      recordAuditLog(
        admin,
        `Booking Status Changed: ${bkg.id}`,
        bkg.id,
        'Booking',
        `Status set to ${bookingStatus}. Payment: ${bkg.paymentStatus}. Notes: ${adminNotes || 'None'}`,
        'SUCCESS',
        ip
      );

      return NextResponse.json({ success: true, data: bkg });
    }

    case 'payments': {
      const { id, reconciliationStatus, status, notes } = body;
      const pay = db.payments.find(p => p.id === id);
      if (!pay) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

      if (reconciliationStatus) {
        pay.reconciliationStatus = reconciliationStatus;
        pay.verifiedBy = admin.name;
        pay.verifiedAt = new Date().toISOString();
      }
      if (status) pay.status = status;
      if (notes) pay.notes = notes;

      recordAuditLog(
        admin,
        `Payment Reconciliation: ${pay.id}`,
        pay.id,
        'PaymentRecord',
        `Reconciliation status: ${reconciliationStatus}. Payment: ₹${pay.totalAmount}`,
        'SUCCESS',
        ip
      );

      return NextResponse.json({ success: true, data: pay });
    }

    case 'commissions': {
      const { id, status, paymentReference, adjustmentNotes } = body;
      const comm = db.commissions.find(c => c.id === id);
      if (!comm) return NextResponse.json({ error: 'Commission not found' }, { status: 404 });

      if (status) {
        comm.status = status;
        if (status === 'Approved') {
          comm.approvedBy = admin.name;
          comm.approvedAt = new Date().toISOString();
        }
        if (status === 'Paid') {
          comm.paymentDate = new Date().toISOString();
          if (paymentReference) comm.paymentReference = paymentReference;
        }
      }
      if (adjustmentNotes) comm.adjustmentNotes = adjustmentNotes;

      recordAuditLog(
        admin,
        `Commission Status: ${status}`,
        comm.id,
        'CommissionRecord',
        `Commission for Broker ${comm.brokerName} updated to ${status}. Amount: ₹${comm.calculatedCommission}`,
        'SUCCESS',
        ip
      );

      return NextResponse.json({ success: true, data: comm });
    }

    case 'support': {
      const { id, status, priority, assignedStaff, noteText, resolutionSummary } = body;
      const ticket = db.tickets.find(t => t.id === id);
      if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

      if (status) {
        ticket.status = status;
        if (status === 'Resolved' || status === 'Closed') {
          ticket.resolvedAt = new Date().toISOString();
          if (resolutionSummary) ticket.resolutionSummary = resolutionSummary;
        }
      }
      if (priority) ticket.priority = priority;
      if (assignedStaff) ticket.assignedStaff = assignedStaff;
      if (noteText) {
        ticket.internalNotes.push({
          id: `NOTE-${Date.now().toString().slice(-4)}`,
          adminName: admin.name,
          timestamp: new Date().toISOString(),
          note: noteText,
        });
      }

      recordAuditLog(
        admin,
        `Support Ticket Updated: ${ticket.id}`,
        ticket.id,
        'SupportTicket',
        `Status: ${ticket.status}, Assigned: ${ticket.assignedStaff || 'Unassigned'}`,
        'SUCCESS',
        ip
      );

      return NextResponse.json({ success: true, data: ticket });
    }

    case 'notifications': {
      const { id, markAllRead } = body;
      if (markAllRead) {
        db.notifications.forEach(n => (n.isRead = true));
      } else if (id) {
        const notif = db.notifications.find(n => n.id === id);
        if (notif) notif.isRead = true;
      }
      return NextResponse.json({ success: true });
    }

    case 'content': {
      db.content = { ...db.content, ...body };
      recordAuditLog(
        admin,
        'Content Configuration Updated',
        'CONTENT-CFG',
        'ContentManagement',
        'Updated homepage banners, policies or FAQs.',
        'SUCCESS',
        ip
      );
      return NextResponse.json({ success: true, data: db.content });
    }

    case 'settings': {
      db.settings = { ...db.settings, ...body };
      recordAuditLog(
        admin,
        'System Settings Modified',
        'SYS-SETTINGS',
        'SystemSettings',
        'Updated platform parameters, approval policies or workflow settings.',
        'SUCCESS',
        ip
      );
      return NextResponse.json({ success: true, data: db.settings });
    }

    default:
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }
}
