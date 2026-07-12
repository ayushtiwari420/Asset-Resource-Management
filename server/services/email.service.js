const { createTransporter } = require('../config/nodemailer');

const FROM = process.env.EMAIL_FROM || 'AssetFlow <noreply@assetflow.com>';

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({ from: FROM, to, subject, html });
  return info;
};

const emailTemplates = {
  passwordReset: (name, resetUrl) => ({
    subject: 'AssetFlow — Password Reset Request',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1f2328">Password Reset Request</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>You requested a password reset for your AssetFlow account. Click the button below to reset your password:</p>
        <div style="margin:24px 0;text-align:center">
          <a href="${resetUrl}" style="background:#3b82d4;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">Reset Password</a>
        </div>
        <p style="color:#57606a;font-size:13px">This link expires in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#57606a;font-size:12px">AssetFlow ERP System</p>
      </div>
    `,
  }),

  allocationNotification: (name, assetName, assetTag, dueDate) => ({
    subject: `AssetFlow — Asset Allocated: ${assetName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1f2328">Asset Allocated to You</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>The following asset has been allocated to you:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#f7f8fa;font-weight:600">Asset</td><td style="padding:8px">${assetName}</td></tr>
          <tr><td style="padding:8px;background:#f7f8fa;font-weight:600">Tag</td><td style="padding:8px">${assetTag}</td></tr>
          ${dueDate ? `<tr><td style="padding:8px;background:#f7f8fa;font-weight:600">Return Due</td><td style="padding:8px">${new Date(dueDate).toLocaleDateString()}</td></tr>` : ''}
        </table>
        <p style="color:#57606a;font-size:12px">AssetFlow ERP System</p>
      </div>
    `,
  }),

  bookingApproved: (name, assetName, startDate, endDate) => ({
    subject: `AssetFlow — Booking Approved: ${assetName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#166534">✓ Booking Approved</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your booking request for <strong>${assetName}</strong> has been approved.</p>
        <p>Period: <strong>${new Date(startDate).toLocaleDateString()}</strong> — <strong>${new Date(endDate).toLocaleDateString()}</strong></p>
        <p style="color:#57606a;font-size:12px">AssetFlow ERP System</p>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
