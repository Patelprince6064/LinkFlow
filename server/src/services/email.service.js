import { Resend } from "resend";
import env from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

const FROM_ADDRESS = env.EMAIL_FROM || "LinkHub <onboarding@resend.dev>";
const APP_NAME = "LinkHub";

// ─── HTML Email Templates ──────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">${APP_NAME}</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Branded Short-Links &amp; Bio Pages</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 32px;text-align:center;border-top:1px solid #2a2a2a;">
              <p style="margin:0;color:#555;font-size:12px;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
              <p style="margin:6px 0 0;color:#555;font-size:12px;">If you didn't request this email, you can safely ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const verificationTemplate = (name, verifyUrl) =>
  baseTemplate(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:600;">Verify your email</h2>
    <p style="margin:0 0 24px;color:#888;font-size:15px;line-height:1.6;">
      Hi <strong style="color:#c4b5fd;">${name}</strong>, welcome to ${APP_NAME}!<br/>
      Click the button below to verify your email address and activate your account.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verifyUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;
                padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
        Verify Email Address
      </a>
    </div>
    <p style="margin:24px 0 0;color:#555;font-size:13px;text-align:center;">
      Or copy this link into your browser:<br/>
      <span style="color:#8b5cf6;word-break:break-all;">${verifyUrl}</span>
    </p>
    <p style="margin:16px 0 0;color:#555;font-size:12px;text-align:center;">This link expires in <strong style="color:#888;">24 hours</strong>.</p>
  `);

const passwordResetTemplate = (name, resetUrl) =>
  baseTemplate(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:600;">Reset your password</h2>
    <p style="margin:0 0 24px;color:#888;font-size:15px;line-height:1.6;">
      Hi <strong style="color:#c4b5fd;">${name}</strong>,<br/>
      We received a request to reset your password. Click the button below to choose a new one.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;text-decoration:none;
                padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
        Reset Password
      </a>
    </div>
    <p style="margin:24px 0 0;color:#555;font-size:13px;text-align:center;">
      Or copy this link into your browser:<br/>
      <span style="color:#8b5cf6;word-break:break-all;">${resetUrl}</span>
    </p>
    <p style="margin:16px 0 0;color:#555;font-size:12px;text-align:center;">This link expires in <strong style="color:#888;">1 hour</strong>.</p>
  `);

// ─── Send Helpers ──────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html }) => {
  if (!env.RESEND_API_KEY) {
    console.warn("[EMAIL] RESEND_API_KEY not set — skipping email send.");
    return;
  }
  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  if (error) {
    console.error("[EMAIL] Failed to send email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
};

export const sendVerificationEmail = async ({ name, email, token }) => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html: verificationTemplate(name, verifyUrl),
  });
};

export const sendPasswordResetEmail = async ({ name, email, token }) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html: passwordResetTemplate(name, resetUrl),
  });
};
