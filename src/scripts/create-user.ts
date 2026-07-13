import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find((arg) => arg.startsWith("--email="))?.split("=")[1];
  const roleArg = args.find((arg) => arg.startsWith("--role="))?.split("=")[1];
  const nameArg = args.find((arg) => arg.startsWith("--name="))?.split("=")[1];
  
  if (!emailArg || !roleArg) {
    console.error("Usage: npm run admin:create-user -- --email=\"user@smanpower.com\" --role=\"content_manager\" [--name=\"User Name\"]");
    console.error("Available Roles: super_admin, executive_admin, content_manager, recruitment_manager, compliance_manager, training_manager, hr_manager, analyst, viewer");
    process.exit(1);
  }

  const role = await prisma.role.findUnique({
    where: { name: roleArg },
  });

  if (!role) {
    console.error(`Role '${roleArg}' not found in the database.`);
    process.exit(1);
  }

  const email = emailArg.toLowerCase();
  const password = crypto.randomBytes(8).toString("hex");
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      roleId: role.id,
      isActive: true,
      accountStatus: "ACTIVE",
    },
    create: {
      name: nameArg || email.split("@")[0],
      email,
      passwordHash,
      roleId: role.id,
      isActive: true,
      accountStatus: "ACTIVE",
    },
  });

  console.log("=========================================");
  console.log("USER ACCOUNT CREATED / UPDATED");
  console.log(`Email:    ${email}`);
  console.log(`Role:     ${role.displayName}`);
  console.log(`Password: ${password}`);
  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
