import nodemailer from 'nodemailer';
import { EmailConfigStatus } from './types';

// In-memory record of recent email events for security auditing (WITHOUT secret OTP values)
export interface EmailDispatchLog {
  id: string;
  recipient: string;
  subject: string;
  timestamp: string;
  status: 'DELIVERED' | 'FAILED' | 'SIMULATED';
  errorMessage?: string;
}

const dispatchLogs: EmailDispatchLog[] = [];

// Track if delivery failure simulation is active for testing
let simulateDeliveryFailure = false;

export function setSimulateEmailDeliveryFailure(simulate: boolean) {
  simulateDeliveryFailure = simulate;
}

export function isSimulatingEmailDeliveryFailure(): boolean {
  return simulateDeliveryFailure;
}

export function getEmailDispatchLogs(): EmailDispatchLog[] {
  return [...dispatchLogs].slice(-30);
}

export function getEmailConfig(): EmailConfigStatus {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'peflarmo@gmail.com';
  const pass = process.env.SMTP_PASS || '';
  const senderFrom = process.env.SMTP_FROM || 'Peflarmo Admin Security <peflarmo@gmail.com>';
  const officialAdminEmail = process.env.ADMIN_OFFICIAL_EMAIL || 'peflarmo@gmail.com';

  const isConfigured = Boolean(pass && pass !== 'your-app-password-or-smtp-key');

  return {
    configured: isConfigured,
    smtpHost: host,
    smtpPort: port,
    smtpSecure: secure,
    smtpUserConfigured: Boolean(user),
    senderFrom,
    officialAdminEmail,
  };
}

function createTransporter() {
  const config = getEmailConfig();
  const user = process.env.SMTP_USER || 'peflarmo@gmail.com';
  const pass = process.env.SMTP_PASS || '';

  if (!pass || pass === 'your-app-password-or-smtp-key') {
    // Transporter not configured with actual secret
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
}

/**
 * Send 6-Digit Email OTP for Admin Login
 * Note: Never log the OTP to audit logs or system logs
 */
export async function sendLoginOtpEmail({
  toEmail,
  adminName,
  otpCode,
  ipAddress,
}: {
  toEmail: string;
  adminName: string;
  otpCode: string;
  ipAddress: string;
}): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  const logId = `EML-${Date.now().toString(36).toUpperCase()}`;

  // Testing Hook: deliberate delivery failure simulation
  if (simulateDeliveryFailure) {
    const errorMsg = 'SMTP Connection Failed: Simulated transport failure (Test Mode active).';
    dispatchLogs.push({
      id: logId,
      recipient: toEmail,
      subject: 'Admin Login Security OTP',
      timestamp: new Date().toISOString(),
      status: 'FAILED',
      errorMessage: errorMsg,
    });
    return { success: false, error: errorMsg };
  }

  const config = getEmailConfig();
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Peflarmo Admin Security Verification</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #091122; padding: 24px; text-align: center; }
          .brand-title { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; }
          .brand-sub { color: #94a3b8; font-size: 12px; margin-top: 4px; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
          .desc { font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
          .otp-container { background: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #1d4ed8; letter-spacing: 1px; margin-bottom: 8px; }
          .otp-code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; color: #1e3a8a; letter-spacing: 6px; }
          .otp-expiry { font-size: 12px; color: #dc2626; font-weight: 600; margin-top: 8px; }
          .security-box { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin-top: 24px; font-size: 12px; color: #64748b; line-height: 1.5; }
          .meta-item { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand-title">PEFLARMO</h1>
            <div class="brand-sub">Enterprise Administration & Security Gateway</div>
          </div>
          <div class="body">
            <div class="greeting">Hello, ${adminName}</div>
            <p class="desc">
              A login attempt to the <strong>Peflarmo Admin Dashboard</strong> was initiated. To verify your authorized administrative identity and complete your sign in, please enter the one-time security code below:
            </p>
            <div class="otp-container">
              <div class="otp-label">Your One-Time Passcode (OTP)</div>
              <div class="otp-code">${otpCode}</div>
              <div class="otp-expiry">&#9200; Valid for 5 minutes only. Single-use.</div>
            </div>
            <div class="security-box">
              <div class="meta-item"><strong>Requested From IP:</strong> <span>${ipAddress}</span></div>
              <div class="meta-item"><strong>Timestamp:</strong> <span>${new Date().toUTCString()}</span></div>
              <div style="margin-top: 8px; color: #b91c1c; font-weight: 500;">
                If you did not initiate this login attempt, please change your administrative password immediately and alert the security operations team.
              </div>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 Peflarmo Technologies Pvt Ltd. Confidential & Privileged Administrative Notification.
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    // In environments without live external SMTP password set yet:
    // We treat as simulated delivery for development verification, but we record it cleanly.
    dispatchLogs.push({
      id: logId,
      recipient: toEmail,
      subject: 'Admin Login Security OTP',
      timestamp: new Date().toISOString(),
      status: 'SIMULATED',
    });

    return {
      success: true,
      simulated: true,
    };
  }

  try {
    await transporter.sendMail({
      from: config.senderFrom,
      to: toEmail,
      subject: `[Peflarmo Admin Security] One-Time Login Code (${otpCode.substring(0, 2)}****)`,
      text: `Your Peflarmo Admin Login OTP is: ${otpCode}. It is valid for 5 minutes only. If you did not request this code, contact operations immediately.`,
      html,
    });

    dispatchLogs.push({
      id: logId,
      recipient: toEmail,
      subject: 'Admin Login Security OTP',
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    });

    return { success: true, simulated: false };
  } catch (err: any) {
    const errorMsg = err?.message || 'SMTP transport transmission error';
    dispatchLogs.push({
      id: logId,
      recipient: toEmail,
      subject: 'Admin Login Security OTP',
      timestamp: new Date().toISOString(),
      status: 'FAILED',
      errorMessage: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
}

/**
 * Send Password Changed Security Notification
 */
export async function sendPasswordChangedNotification({
  toEmail,
  adminName,
  ipAddress,
}: {
  toEmail: string;
  adminName: string;
  ipAddress: string;
}): Promise<{ success: boolean; error?: string }> {
  const config = getEmailConfig();
  const transporter = createTransporter();
  const logId = `EML-${Date.now().toString(36).toUpperCase()}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 10px; border: 1px solid #e2e8f0; padding: 24px;">
          <div style="background: #091122; padding: 16px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 18px;">Peflarmo Security Alert</h2>
          </div>
          <h3 style="color: #0f172a; margin-top: 20px;">Password Changed Successfully</h3>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            Dear ${adminName}, the password for your Peflarmo Admin account (<strong>${toEmail}</strong>) was recently changed.
          </p>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 12px; color: #334155; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toUTCString()}</p>
            <p style="margin: 4px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
            <p style="margin: 4px 0;"><strong>Hashing Algorithm:</strong> Bcrypt (Cost 10)</p>
          </div>
          <p style="font-size: 12px; color: #dc2626;">
            If you did not authorize this change, please immediately trigger a password reset or inform the Super Administrator.
          </p>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    dispatchLogs.push({
      id: logId,
      recipient: toEmail,
      subject: 'Security Alert: Password Changed',
      timestamp: new Date().toISOString(),
      status: 'SIMULATED',
    });
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: config.senderFrom,
      to: toEmail,
      subject: '[Peflarmo Admin] Security Alert: Password Changed',
      text: `The password for ${toEmail} was changed from IP ${ipAddress} at ${new Date().toISOString()}.`,
      html,
    });
    dispatchLogs.push({
      id: logId,
      recipient: toEmail,
      subject: 'Security Alert: Password Changed',
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Send Password Reset Token Email
 */
export async function sendPasswordResetEmail({
  toEmail,
  adminName,
  resetToken,
  ipAddress,
}: {
  toEmail: string;
  adminName: string;
  resetToken: string;
  ipAddress: string;
}): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  if (simulateDeliveryFailure) {
    return { success: false, error: 'Simulated SMTP transmission error.' };
  }

  const config = getEmailConfig();
  const transporter = createTransporter();
  const logId = `EML-${Date.now().toString(36).toUpperCase()}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 10px; border: 1px solid #e2e8f0; padding: 24px;">
          <div style="background: #091122; padding: 16px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 18px;">Peflarmo Admin Security</h2>
          </div>
          <h3 style="color: #0f172a; margin-top: 20px;">Password Reset Request</h3>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            Hello ${adminName}, we received a request to reset the administrator password for <strong>${toEmail}</strong>.
          </p>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #1e40af; margin-bottom: 6px;">
              Your Expiring Reset Security Token
            </div>
            <div style="font-family: monospace; font-size: 20px; font-weight: bold; color: #1e3a8a; word-break: break-all;">
              ${resetToken}
            </div>
            <div style="font-size: 11px; color: #dc2626; margin-top: 6px;">
              Expires in 15 minutes. Single-use only.
            </div>
          </div>
          <p style="font-size: 12px; color: #64748b;">
            Requested from IP: <strong>${ipAddress}</strong> on ${new Date().toUTCString()}.
          </p>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    dispatchLogs.push({
      id: logId,
      recipient: toEmail,
      subject: 'Password Reset Request',
      timestamp: new Date().toISOString(),
      status: 'SIMULATED',
    });
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: config.senderFrom,
      to: toEmail,
      subject: '[Peflarmo Admin] Password Reset Request',
      text: `Your password reset token for ${toEmail} is: ${resetToken}. Valid for 15 minutes.`,
      html,
    });
    dispatchLogs.push({
      id: logId,
      recipient: toEmail,
      subject: 'Password Reset Request',
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    });
    return { success: true, simulated: false };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Verify Live SMTP Connection
 */
export async function testSmtpConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const config = getEmailConfig();
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (!pass || pass === 'your-app-password-or-smtp-key') {
    return {
      success: false,
      message: `SMTP password not configured in environment variables (process.env.SMTP_PASS). Using simulated sandbox transporter for dev testing.`,
      details: {
        host: config.smtpHost,
        port: config.smtpPort,
        configured: false,
      },
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: { user, pass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
    });

    await transporter.verify();
    return {
      success: true,
      message: `Connected successfully to SMTP server at ${config.smtpHost}:${config.smtpPort} via ${user}.`,
      details: {
        host: config.smtpHost,
        port: config.smtpPort,
        user,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `SMTP Connection test failed: ${err?.message || 'Handshake timeout'}`,
      details: {
        error: err?.message,
        code: err?.code,
      },
    };
  }
}
