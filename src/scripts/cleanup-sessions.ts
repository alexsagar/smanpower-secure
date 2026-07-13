import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const isExecute = args.includes("--execute");
  const isDryRun = args.includes("--dry-run");

  if (!isExecute && !isDryRun) {
    console.log("Usage: npm run admin:cleanup-sessions -- --dry-run | --execute");
    console.log("  --dry-run: Show counts of sessions to delete without deleting");
    console.log("  --execute: Actually delete the sessions");
    process.exit(1);
  }

  const now = new Date();
  
  // A session is considered garbage if:
  // 1. absoluteExpiresAt is past
  // 2. OR idleExpiresAt is past
  // 3. OR revokedAt is more than 30 days ago (retention period)
  
  const retentionDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filter = {
    OR: [
      { absoluteExpiresAt: { lt: retentionDate } },
      { idleExpiresAt: { lt: retentionDate } },
      { revokedAt: { lt: retentionDate } }
    ]
  };

  const count = await prisma.adminSession.count({ where: filter });

  if (isDryRun) {
    console.log(`[DRY RUN] Found ${count} expired or old revoked sessions to delete.`);
  } else if (isExecute) {
    console.log(`Deleting ${count} expired or old revoked sessions...`);
    const result = await prisma.adminSession.deleteMany({ where: filter });
    console.log(`Deleted ${result.count} sessions successfully.`);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
