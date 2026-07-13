/**
 * Email Service Abstraction
 * Handles sending emails via preferred provider (e.g., SMTP or Resend).
 */

import nodemailer from "nodemailer";
import { logger } from "@/lib/logger";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailParams): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER || "smtp";
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || "Seven Seas Intercontinental <admin@notify.smanpower.com>";

  if (provider === "mock") {
    logger.debug("=== MOCK EMAIL SENT ===");
    logger.debug(`To: ${to}`);
    logger.debug(`Subject: ${subject}`);
    logger.debug(`Body: ${html}`);
    logger.debug("=======================");
    return;
  }

  if (provider === "resend") {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured.");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Seven Seas Intercontinental <admin@notify.smanpower.com>",
        reply_to: replyTo || "admin@smanpower.com",
        to,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error("Resend Error:", err);
      throw new Error("Failed to send email via Resend.");
    }
    return;
  }

  if (provider === "smtp") {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass) {
      throw new Error("SMTP variables (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) are missing in environment.");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
      logger: true,
      debug: true,
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });
    
    return;
  }
}

