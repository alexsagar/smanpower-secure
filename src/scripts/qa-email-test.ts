import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { sendEmail } from "../services/email.service";
import crypto from "crypto";

async function main() {
  const args = process.argv.slice(2);
  let to = args.find((a) => a.startsWith("--to="))?.split("=")[1];
  
  if (!to && args.length > 0 && !args[0].startsWith("--")) {
    to = args[0];
  }

  if (!to) {
    console.error('Error: Please provide a QA email address, e.g. npx tsx src/scripts/qa-email-test.ts --to=your-email@example.com');
    process.exit(1);
  }

  console.log(`Starting QA email tests to ${to} using provider: ${process.env.EMAIL_PROVIDER || "smtp"}...`);

  try {
    // 1. Admin Invitation Email
    const dummyInviteToken = crypto.randomBytes(16).toString("hex");
    const inviteLink = `http://localhost:3000/admin/accept-invite?token=${dummyInviteToken}&email=${encodeURIComponent(to)}`;
    
    await sendEmail({
      to,
      subject: "You have been invited to join Seven Seas Intercontinental as an Admin",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #cda85a;">Seven Seas Intercontinental</h2>
          <p>Hello,</p>
          <p>You have been invited to access the Seven Seas Intercontinental admin dashboard.</p>
          <p>Please click the button below to complete your registration and set up your account:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #cda85a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
          </p>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 0.9em; color: #666;">${inviteLink}</p>
          <br/>
          <p>Best regards,<br/>Seven Seas Intercontinental System</p>
        </div>
      `,
      text: `You have been invited to access the Seven Seas Intercontinental admin dashboard. \n\nPlease use this link to complete your registration: ${inviteLink}`,
    });
    console.log("✅ Admin Invitation email sent via API.");

    // Respect Resend rate limits (2 per second)
    await new Promise(r => setTimeout(r, 1000));

    // 2. Password Reset Email
    const dummyResetToken = crypto.randomBytes(16).toString("hex");
    const resetLink = `http://localhost:3000/admin/reset-password?token=${dummyResetToken}`;
    
    await sendEmail({
      to,
      subject: "Password Reset Request - Seven Seas Intercontinental",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #cda85a;">Password Reset</h2>
          <p>Hello,</p>
          <p>We received a request to reset the password for your account.</p>
          <p>Please click the button below to choose a new password. This link will expire in 2 hours.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #cda85a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </p>
          <p>If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
          <br/>
          <p>Best regards,<br/>Seven Seas Intercontinental System</p>
        </div>
      `,
      text: `We received a request to reset your password. \n\nPlease use this link to choose a new password: ${resetLink}\n\nThis link will expire in 2 hours. If you did not request this, please ignore this email.`,
    });
    console.log("✅ Password Reset email sent via API.");

    // Respect Resend rate limits (2 per second)
    await new Promise(r => setTimeout(r, 1000));

    // 3. Security Notification Email
    await sendEmail({
      to,
      subject: "Security Alert: Suspicious Login Attempt - Seven Seas Intercontinental",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #d9534f;">Security Alert</h2>
          <p>Hello,</p>
          <p>We detected a suspicious login attempt on your account from a new IP address or unrecognized device.</p>
          <ul>
            <li><strong>Time:</strong> ${new Date().toUTCString()}</li>
            <li><strong>IP Address:</strong> 192.168.1.1 (Test)</li>
          </ul>
          <p>If this was you, you can safely ignore this email.</p>
          <p>If you do not recognize this activity, we strongly recommend resetting your password immediately and enabling Two-Factor Authentication.</p>
          <br/>
          <p>Best regards,<br/>Seven Seas Intercontinental System</p>
        </div>
      `,
      text: `Security Alert: We detected a suspicious login attempt on your account from a new IP address or unrecognized device at ${new Date().toUTCString()}. If this was not you, please reset your password immediately.`,
    });
    console.log("✅ Security Notification email sent via API.");

    console.log("\nAll emails successfully dispatched. Please check the inbox (and spam folder) for 'alexsagar07@gmail.com'.");
    console.log("Verify the 'From' address is: Seven Seas Intercontinental <admin@notify.smanpower.com>");
    console.log("Verify the 'Reply-To' address is: admin@smanpower.com");
    console.log("\nNote: Zero sensitive tokens were logged to this console.");

  } catch (error) {
    console.error("❌ Failed to send QA test emails:", error);
    process.exit(1);
  }
}

main().catch(console.error);
