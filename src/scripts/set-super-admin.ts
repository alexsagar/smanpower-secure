import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find((arg) => arg.startsWith("--email="))?.split("=")[1];
  
  const email = emailArg || "admin@smanpower.com";
  const password = crypto.randomBytes(8).toString("hex");
  const passwordHash = await bcrypt.hash(password, 12);

  const role = await prisma.role.findUnique({
    where: { name: "super_admin" },
  });

  if (!role) {
    console.error("Role 'super_admin' not found.");
    process.exit(1);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      roleId: role.id,
      isActive: true,
      accountStatus: "ACTIVE",
    },
    create: {
      name: "System Admin",
      email,
      passwordHash,
      roleId: role.id,
      isActive: true,
      accountStatus: "ACTIVE",
    },
  });

  console.log("=========================================");
  console.log("SUPER ADMIN CREATED / UPDATED");
  console.log(`Email:    ${email}`);
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
