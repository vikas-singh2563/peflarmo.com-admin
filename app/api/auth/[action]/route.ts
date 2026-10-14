import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getDb,
  hashPassword,
  verifyPassword,
  recordAuditLog,
} from '@/lib/server-db';
import {
  sendLoginOtpEmail,
  sendPasswordChangedNotification,
  sendPasswordResetEmail,
  testSmtpConnection,
  setSimulateEmailDeliveryFailure,
  isSimulatingEmailDeliveryFailure,
} from '@/lib/email-service';
import { AdminRole, AdminSession } from '@/lib/types';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const visiblePrefix = local.slice(0, 2);
  return `${visiblePrefix}${'*'.repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  const db = getDb();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

  // =========================================================================
  // STEP 1 & 2: ADMIN EMAIL & PASSWORD VERIFICATION -> ISSUE 6-DIGIT EMAIL OTP
  // =========================================================================
  if (action === 'login') {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Admin Email and Password are required.' },
        { status: 400 }
      );
    }

    // 1. Check account lockout from repeated failed attempts
    const attempts = db.loginAttempts[email] || { count: 0 };
    if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
      const waitMinutes = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      return NextResponse.json(
        {
          error: `Account temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minute(s).`,
          locked: true,
        },
        { status: 429 }
      );
    }

    // 2. Lookup authorized admin account (No public registration permitted)
    const admin = db.admins.find(a => a.email.toLowerCase() === email);
    if (!admin) {
      attempts.count = (attempts.count || 0) + 1;
      if (attempts.count >= 5) {
        attempts.lockedUntil = Date.now() + 15 * 60 * 1000;
      }
      db.loginAttempts[email] = attempts;

      recordAuditLog(
        { id: 'UNKNOWN', name: email, role: 'Super Admin' },
        'Unauthorized Admin Login Attempt',
        email,
        'Authentication',
        `Access denied: Email not found among authorized administrators. Public registration disallowed. Attempt ${attempts.count}/5 from IP ${ip}.`,
        'DENIED',
        ip
      );

      return NextResponse.json(
        { error: 'Unauthorized: Access restricted to authorized Peflarmo administrators only.' },
        { status: 401 }
      );
    }

    // 3. Verify password using bcrypt
    const isPasswordValid = await verifyPassword(password, admin.passwordHash);
    if (!isPasswordValid) {
      attempts.count = (attempts.count || 0) + 1;
      if (attempts.count >= 5) {
        attempts.lockedUntil = Date.now() + 15 * 60 * 1000;
      }
      db.loginAttempts[email] = attempts;

      recordAuditLog(
        admin,
        'Failed Admin Password Attempt',
        admin.id,
        'Authentication',
        `Incorrect password entered from IP ${ip}. Attempt ${attempts.count} of 5.`,
        'DENIED',
        ip
      );

      return NextResponse.json(
        {
          error: `Invalid credentials. ${Math.max(0, 5 - attempts.count)} attempt(s) remaining before security lockout.`,
        },
        { status: 401 }
      );
    }

    // 4. Password is valid! Generate single-use, 5-minute 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const tempToken = `pef_preauth_${Date.now()}_${crypto.randomUUID()}`;
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    db.emailOtps[email] = {
      adminId: admin.id,
      email: admin.email,
      otpHash,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
      attempts: 0,
      resendAvailableAt: Date.now() + 60 * 1000, // 60s cooldown
      tempToken,
      createdAt: Date.now(),
    };

    // 5. Send OTP via email service (Never bypass OTP when email delivery fails)
    const emailResult = await sendLoginOtpEmail({
      toEmail: admin.email,
      adminName: admin.name,
      otpCode: rawOtp,
      ipAddress: ip,
    });

    if (!emailResult.success) {
      recordAuditLog(
        admin,
        'Admin Email OTP Delivery Failed',
        admin.id,
        'EmailSecurity',
        `SMTP transmission failure for ${admin.email}: ${emailResult.error}. OTP verification not bypassed.`,
        'WARNING',
        ip
      );

      return NextResponse.json(
        {
          error: `Email delivery failed: ${emailResult.error || 'Unable to connect to SMTP server'}. Please verify SMTP settings. OTP verification cannot be bypassed.`,
          emailDeliveryFailed: true,
        },
        { status: 502 }
      );
    }

    // Record audit log WITHOUT exposing OTP
    recordAuditLog(
      admin,
      'Admin Login OTP Dispatched',
      admin.id,
      'Authentication',
      `6-digit security OTP sent to ${admin.email} from IP ${ip}. Expiry: 5 minutes.`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({
      step: 'OTP_REQUIRED',
      email: admin.email,
      maskedEmail: maskEmail(admin.email),
      tempToken,
      expiresInSeconds: 300,
      resendCooldownSeconds: 60,
      simulated: emailResult.simulated || false,
      message: `A single-use 6-digit OTP has been sent to ${maskEmail(admin.email)}. It expires in 5 minutes.`,
    });
  }

  // =========================================================================
  // STEP 3 & 4: VERIFY 6-DIGIT EMAIL OTP -> CREATE SECURE SESSION
  // =========================================================================
  if (action === 'verify-otp') {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const otp = (body.otp || '').trim();
    const tempToken = body.tempToken;

    if (!email || !otp || !tempToken) {
      return NextResponse.json(
        { error: 'Email, OTP code, and verification session token are required.' },
        { status: 400 }
      );
    }

    const otpRecord = db.emailOtps[email];
    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No active OTP verification session found. Please enter your email and password again.' },
        { status: 400 }
      );
    }

    if (otpRecord.tempToken !== tempToken) {
      return NextResponse.json(
        { error: 'Invalid verification session token. Please initiate a new login.' },
        { status: 401 }
      );
    }

    // Check expiration (5 minutes strictly)
    if (Date.now() > otpRecord.expiresAt) {
      delete db.emailOtps[email];
      recordAuditLog(
        { id: otpRecord.adminId, name: email, role: 'Super Admin' },
        'Admin OTP Verification Failed (Expired)',
        otpRecord.adminId,
        'Authentication',
        `Submitted OTP expired for ${email} from IP ${ip}.`,
        'DENIED',
        ip
      );
      return NextResponse.json(
        { error: 'This OTP has expired (5-minute limit exceeded). Please request a new OTP code.' },
        { status: 400 }
      );
    }

    // Check excessive incorrect OTP attempts (max 5)
    if (otpRecord.attempts >= 5) {
      delete db.emailOtps[email];
      const attempts = db.loginAttempts[email] || { count: 0 };
      attempts.lockedUntil = Date.now() + 15 * 60 * 1000;
      db.loginAttempts[email] = attempts;

      recordAuditLog(
        { id: otpRecord.adminId, name: email, role: 'Super Admin' },
        'Admin Account Locked (Excessive OTP Failures)',
        otpRecord.adminId,
        'Authentication',
        `Account locked for 15 minutes due to 5 consecutive incorrect OTP submissions from IP ${ip}.`,
        'DENIED',
        ip
      );

      return NextResponse.json(
        { error: 'Too many incorrect OTP attempts. For security, your account is locked for 15 minutes.' },
        { status: 429 }
      );
    }

    // Verify OTP hash
    const submittedHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (submittedHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      const remaining = 5 - otpRecord.attempts;

      recordAuditLog(
        { id: otpRecord.adminId, name: email, role: 'Super Admin' },
        'Admin OTP Verification Failed',
        otpRecord.adminId,
        'Authentication',
        `Incorrect OTP submitted for ${email} from IP ${ip}. Attempt ${otpRecord.attempts}/5.`,
        'DENIED',
        ip
      );

      return NextResponse.json(
        { error: `Incorrect OTP code. ${remaining} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // Single-use: delete immediately upon successful verification!
    delete db.emailOtps[email];
    delete db.loginAttempts[email];

    const admin = db.admins.find(a => a.id === otpRecord.adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    // Create secure session
    const sessionToken = `pef_sess_${Date.now()}_${crypto.randomUUID()}`;
    const userAgent = req.headers.get('user-agent') || 'Browser Session';
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours session duration

    const newSession: AdminSession = {
      token: sessionToken,
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      role: admin.role,
      ip,
      userAgent,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      expiresAt,
    };

    db.sessions.push(newSession);

    admin.lastLogin = new Date().toISOString();
    admin.lastLoginIp = ip;

    // Record successful login audit log
    recordAuditLog(
      admin,
      'Admin Login Successful (OTP Verified)',
      admin.id,
      'Authentication',
      `Administrator authenticated securely via Email OTP from IP ${ip}. Session created.`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        lastLogin: admin.lastLogin,
      },
    });
  }

  // =========================================================================
  // RESEND EMAIL OTP (WITH RATE LIMIT COOLDOWN)
  // =========================================================================
  if (action === 'resend-otp') {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const tempToken = body.tempToken;

    if (!email || !tempToken) {
      return NextResponse.json(
        { error: 'Email and verification session token are required.' },
        { status: 400 }
      );
    }

    const otpRecord = db.emailOtps[email];
    if (!otpRecord || otpRecord.tempToken !== tempToken) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP session. Please restart login.' },
        { status: 400 }
      );
    }

    // Rate limiting cooldown check
    if (Date.now() < otpRecord.resendAvailableAt) {
      const remainingSeconds = Math.ceil((otpRecord.resendAvailableAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Please wait ${remainingSeconds} second(s) before requesting a new OTP.` },
        { status: 429 }
      );
    }

    const admin = db.admins.find(a => a.id === otpRecord.adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    const newOtp = crypto.randomInt(100000, 1000000).toString();
    otpRecord.otpHash = crypto.createHash('sha256').update(newOtp).digest('hex');
    otpRecord.expiresAt = Date.now() + 5 * 60 * 1000; // Reset 5 minutes
    otpRecord.resendAvailableAt = Date.now() + 60 * 1000; // 60s cooldown
    otpRecord.attempts = 0; // Reset attempts for new code

    const emailResult = await sendLoginOtpEmail({
      toEmail: admin.email,
      adminName: admin.name,
      otpCode: newOtp,
      ipAddress: ip,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to dispatch OTP email: ${emailResult.error}` },
        { status: 502 }
      );
    }

    recordAuditLog(
      admin,
      'Admin OTP Resent',
      admin.id,
      'Authentication',
      `New 6-digit OTP code dispatched to ${admin.email}.`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({
      success: true,
      message: `A new 6-digit OTP code has been sent to ${maskEmail(admin.email)}.`,
      expiresInSeconds: 300,
      resendCooldownSeconds: 60,
    });
  }

  // =========================================================================
  // CHANGE PASSWORD (REQUIRES CURRENT PASSWORD, BCRYPT, EMAIL NOTIFICATION)
  // =========================================================================
  if (action === 'change-password') {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const session = db.sessions.find(s => s.token === token && s.expiresAt > Date.now());

    const body = await req.json().catch(() => ({}));
    const email = (body.email || (session ? session.adminEmail : '')).trim().toLowerCase();
    const currentPassword = body.currentPassword || '';
    const newPassword = body.newPassword || '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const admin = db.admins.find(a => a.email.toLowerCase() === email);
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    // Verify current password with bcrypt
    const isCurrentValid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isCurrentValid) {
      recordAuditLog(
        admin,
        'Failed Password Change Attempt',
        admin.id,
        'Security',
        `Current password verification failed from IP ${ip}.`,
        'DENIED',
        ip
      );
      return NextResponse.json(
        { error: 'Current password is incorrect. Verification failed.' },
        { status: 400 }
      );
    }

    // Hash new password using bcrypt
    const newHash = await hashPassword(newPassword);
    admin.passwordHash = newHash;

    // Send email notification to registered admin email
    await sendPasswordChangedNotification({
      toEmail: admin.email,
      adminName: admin.name,
      ipAddress: ip,
    });

    recordAuditLog(
      admin,
      'Admin Password Changed',
      admin.id,
      'Security',
      `Master password updated and encrypted with Bcrypt. Confirmation notification dispatched to ${admin.email}.`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. A confirmation security notification was sent to your registered email.',
    });
  }

  // =========================================================================
  // FORGOT PASSWORD REQUEST (ISSUES SECURE EXPIRING RESET TOKEN VIA EMAIL)
  // =========================================================================
  if (action === 'forgot-password') {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Admin Email is required.' }, { status: 400 });
    }

    const admin = db.admins.find(a => a.email.toLowerCase() === email);
    if (!admin) {
      // Don't disclose non-existence to prevent account enumeration
      return NextResponse.json({
        success: true,
        message: 'If the provided email belongs to an authorized administrator, a password reset link has been dispatched.',
      });
    }

    const resetToken = `RST-${crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    db.passwordResets[resetToken] = {
      adminId: admin.id,
      email: admin.email,
      tokenHash: resetToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins expiry
      used: false,
      createdAt: Date.now(),
    };

    const emailResult = await sendPasswordResetEmail({
      toEmail: admin.email,
      adminName: admin.name,
      resetToken,
      ipAddress: ip,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to deliver reset email: ${emailResult.error}` },
        { status: 502 }
      );
    }

    recordAuditLog(
      admin,
      'Admin Password Reset Requested',
      admin.id,
      'Security',
      `Expiring password reset token issued and sent to ${admin.email}.`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({
      success: true,
      message: `Password reset instructions dispatched to ${maskEmail(admin.email)}. Valid for 15 minutes.`,
    });
  }

  // =========================================================================
  // RESET PASSWORD WITH TOKEN
  // =========================================================================
  if (action === 'reset-password') {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const token = (body.token || '').trim();
    const newPassword = body.newPassword || '';

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'Email, reset token, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const resetRecord = db.passwordResets[token];
    if (!resetRecord || resetRecord.email !== email || resetRecord.used) {
      return NextResponse.json(
        { error: 'Invalid or already used password reset token.' },
        { status: 400 }
      );
    }

    if (Date.now() > resetRecord.expiresAt) {
      delete db.passwordResets[token];
      return NextResponse.json(
        { error: 'Password reset token has expired (15-minute limit exceeded). Please request a new one.' },
        { status: 400 }
      );
    }

    const admin = db.admins.find(a => a.id === resetRecord.adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    // Hash new password using bcrypt
    admin.passwordHash = await hashPassword(newPassword);
    resetRecord.used = true;

    // Invalidate all active sessions for this admin
    db.sessions = db.sessions.filter(s => s.adminId !== admin.id);

    // Send confirmation email
    await sendPasswordChangedNotification({
      toEmail: admin.email,
      adminName: admin.name,
      ipAddress: ip,
    });

    recordAuditLog(
      admin,
      'Admin Password Reset Completed',
      admin.id,
      'Security',
      `Password successfully reset via token. All active sessions invalidated.`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  }

  // =========================================================================
  // LOGOUT (SINGLE SESSION)
  // =========================================================================
  if (action === 'logout') {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const sessionIndex = db.sessions.findIndex(s => s.token === token);

    if (sessionIndex !== -1) {
      const sess = db.sessions[sessionIndex];
      const admin = db.admins.find(a => a.id === sess.adminId);
      if (admin) {
        recordAuditLog(
          admin,
          'Admin Logout',
          admin.id,
          'Authentication',
          `Session terminated from IP ${ip}.`,
          'SUCCESS',
          ip
        );
      }
      db.sessions.splice(sessionIndex, 1);
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  }

  // =========================================================================
  // LOGOUT ALL DEVICES (INVALIDATE ALL SESSIONS FOR CURRENT ADMIN)
  // =========================================================================
  if (action === 'logout-all-devices') {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const currentSession = db.sessions.find(s => s.token === token);
    const adminId = currentSession ? currentSession.adminId : db.admins[0].id;

    const countBefore = db.sessions.length;
    db.sessions = db.sessions.filter(s => s.adminId !== adminId);
    const terminatedCount = countBefore - db.sessions.length;

    const admin = db.admins.find(a => a.id === adminId) || db.admins[0];
    recordAuditLog(
      admin,
      'Admin Logged Out From All Devices',
      admin.id,
      'Security',
      `Terminated ${terminatedCount} active session(s) across all devices from IP ${ip}.`,
      'SUCCESS',
      ip
    );

    return NextResponse.json({
      success: true,
      message: `Successfully logged out from all devices (${terminatedCount} session(s) terminated).`,
    });
  }

  // =========================================================================
  // ROLE SWITCH (TESTING TOOL)
  // =========================================================================
  if (action === 'switch-role') {
    const { role } = await req.json().catch(() => ({}));
    const admin = db.admins[0];
    if (admin) {
      admin.role = role as AdminRole;
      recordAuditLog(
        admin,
        'Role Switch (Test Tool)',
        admin.id,
        'Authorization',
        `Switched active role to ${role} for permission testing.`,
        'SUCCESS',
        ip
      );
      return NextResponse.json({ success: true, newRole: role });
    }
  }

  // =========================================================================
  // UPDATE PROFILE CONTACT
  // =========================================================================
  if (action === 'update-profile') {
    const { name, phone, email } = await req.json().catch(() => ({}));
    const admin = db.admins[0];
    if (admin) {
      if (name) admin.name = name;
      if (phone) admin.phone = phone;
      if (email) admin.email = email;
      recordAuditLog(
        admin,
        'Admin Contact / Profile Updated',
        admin.id,
        'AdminUser',
        `Updated contact information. Contact phone: ${admin.phone}, Name: ${admin.name}.`,
        'SUCCESS',
        ip
      );
      return NextResponse.json({ success: true, user: admin });
    }
    return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
  }

  // =========================================================================
  // SMTP CONNECTION TEST & DELIVERY FAILURE SIMULATION TOGGLE
  // =========================================================================
  if (action === 'test-smtp') {
    const result = await testSmtpConnection();
    return NextResponse.json(result);
  }

  if (action === 'simulate-delivery-failure') {
    const { simulate } = await req.json().catch(() => ({ simulate: false }));
    setSimulateEmailDeliveryFailure(Boolean(simulate));
    return NextResponse.json({
      simulatingDeliveryFailure: isSimulatingEmailDeliveryFailure(),
      message: simulate
        ? 'Email delivery failure simulation ENABLED. Next OTP dispatch will simulate SMTP failure.'
        : 'Email delivery failure simulation DISABLED. Normal email dispatch restored.',
    });
  }

  return NextResponse.json({ error: 'Action not found.' }, { status: 404 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  const db = getDb();

  if (action === 'me') {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const session = db.sessions.find(s => s.token === token && s.expiresAt > Date.now());

    // Update session active timestamp
    if (session) {
      session.lastActiveAt = Date.now();
    }

    const admin = session
      ? db.admins.find(a => a.id === session.adminId)
      : db.admins[0]; // fallback for initial load if token was stored in client

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        lastLogin: admin.lastLogin,
      },
      simulatingDeliveryFailure: isSimulatingEmailDeliveryFailure(),
    });
  }

  return NextResponse.json({ error: 'Action not found' }, { status: 404 });
}
