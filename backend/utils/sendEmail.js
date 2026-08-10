import nodemailer from "nodemailer";
import logger from "./logger.js";

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const tp = await getTransporter();
    const info = await tp.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Don't crash the request flow if email fails - just log it
    logger.error(`Email send failed to ${to}: ${err.message}`);
  }
};

export const verificationEmailTemplate = (name, link) => `
  <div style="font-family:sans-serif;max-width:520px;margin:auto">
    <h2>Welcome to InterviewAI, ${name} 👋</h2>
    <p>Please verify your email to activate your account.</p>
    <a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Verify Email</a>
    <p>This link expires in 24 hours.</p>
  </div>
`;

export const resetPasswordEmailTemplate = (name, link) => `
  <div style="font-family:sans-serif;max-width:520px;margin:auto">
    <h2>Password Reset Requested</h2>
    <p>Hi ${name}, click below to reset your password. This link expires in 1 hour.</p>
    <a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Reset Password</a>
    <p>If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

export default sendEmail;
