import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import readline from "readline";

const prisma = new PrismaClient();

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("=== Super Admin Bootstrapping ===");

  // Read from args if provided (e.g. npm run admin:invite-super-admin -- --email="x" --name="y")
  const args = process.argv.slice(2);
  let email = args.find((arg) => arg.startsWith("--email="))?.split("=")[1];
  let name = args.find((arg) => arg.startsWith("--name="))?.split("=")[1];

  if (!email) {
    email = await prompt("Enter real email for the Super Admin: ");
  }
  if (!name) {
    name = await prompt("Enter full name for the Super Admin: ");
  }

  if (!email || !name) {
    console.error("Email and name are required.");
    process.exit(1);
  }

  email = email.toLowerCase();

  // Find Super Admin role
  let role = await prisma.role.findUnique({
    where: { name: "super_admin" },
  });

  if (!role) {
    console.log("Role 'super_admin' not found. Creating it...");
    role = await prisma.role.create({
      data: {
        name: "super_admin",
        displayName: "Super Administrator",
        description: "Full system access",
      },
    });
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Upsert user (in case they already exist but need role/invite reset)
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        roleId: role.id,
        accountStatus: "INVITED",
      },
    });
    console.log("Created new user record.");
  } else {
    await prisma.user.update({
      where: { email },
      data: { roleId: role.id, accountStatus: "INVITED" },
    });
    console.log("Updated existing user to Super Admin role.");
  }

  // Create invitation record
  await prisma.adminInvitation.create({
    data: {
      email,
      roleId: role.id,
      tokenHash,
      expiresAt,
    },
  });

  // Log action
  await prisma.auditLog.create({
    data: {
      action: "SUPER_ADMIN_INVITED",
      entity: "AdminInvitation",
      details: { email },
      userId: user.id,
    },
  });

  // Since email service might not be fully configured, we output the invitation link
  // The token is NEVER stored in plain text. We output it here strictly for bootstrapping.
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const inviteLink = `${appUrl}/admin/accept-invite?token=${token}&email=${encodeURIComponent(
    email
  )}`;

  console.log("\n=== Success ===");
  console.log("Invitation created securely.");
  console.log("Token hash stored in database. Token is NOT stored in plain text.");
  console.log("Please send the following link to the user to complete setup:");
  console.log("\n--------------------------------------------------");
  console.log(inviteLink);
  console.log("--------------------------------------------------\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
