import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const emailArg = process.argv.find((arg) => arg.startsWith("--email="));
  if (!emailArg) {
    console.error("Usage: npm run admin:unlock-user -- --email=user@example.com");
    process.exit(1);
  }

  const email = emailArg.split("=")[1];

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "EMERGENCY_UNLOCK",
        entity: "User",
        entityId: user.id,
      },
    }),
  ]);

  console.log(`Successfully unlocked user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
