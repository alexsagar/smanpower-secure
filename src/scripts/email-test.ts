import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { sendEmail } from "../services/email.service";

async function main() {
  const args = process.argv.slice(2);
  let to = args.find((a) => a.startsWith("--to="))?.split("=")[1];
  
  if (!to && args.length > 0 && !args[0].startsWith("--")) {
    to = args[0];
  }

  if (!to) {
    console.error('Error: Please provide an email address, e.g. npm run email:test -- your-email@example.com');
    process.exit(1);
  }

  console.log(`Sending test email to ${to} using provider: ${process.env.EMAIL_PROVIDER || "smtp"}...`);

  try {
    await sendEmail({
      to,
      subject: "Seven Seas Intercontinental - SMTP Test",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>SMTP Test Successful</h2>
          <p>Hello,</p>
          <p>If you are receiving this email, your SMTP configuration for <strong>Seven Seas Intercontinental</strong> is working correctly.</p>
          <p>You can now proceed to use the email service for Super Admin invitations and password resets.</p>
          <br/>
          <p>Best regards,<br/>Seven Seas Intercontinental System</p>
        </div>
      `,
      text: "SMTP Test Successful. If you are receiving this email, your SMTP configuration is working correctly.",
    });

    console.log("✅ Test email sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send test email:", error);
    process.exit(1);
  }
}

main().catch(console.error);
