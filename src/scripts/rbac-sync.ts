import { PrismaClient } from "@prisma/client";
import { seedPermissions } from "./seed-permissions";
import { ROLE_PERMISSIONS, ALL_PERMISSIONS } from "../lib/permissions.constants";

const prisma = new PrismaClient();

async function syncRbac() {
  console.log("RBAC SYNC");

  await seedPermissions(prisma);

  const orphans = await prisma.permission.findMany({
    where: { name: { notIn: ALL_PERMISSIONS } },
    select: { name: true },
  });
  if (orphans.length > 0) {
    console.log(
      `Legacy/orphan permissions left untouched: ${orphans.map((p) => p.name).join(", ")}`
    );
  }

  const roles = await prisma.role.findMany({ include: { users: { select: { id: true } } } });
  const byName = new Map(roles.map((r) => [r.name, r]));

  for (const role of roles) {
    const canonicalName = role.name.toLowerCase();
    if (role.name === canonicalName) continue;
    if (!ROLE_PERMISSIONS[canonicalName]) continue;

    const canonical = byName.get(canonicalName);
    if (!canonical) {
      await prisma.role.update({ where: { id: role.id }, data: { name: canonicalName } });
      console.log(`Renamed role "${role.name}" -> "${canonicalName}"`);
      continue;
    }

    const moved = await prisma.user.updateMany({
      where: { roleId: role.id },
      data: { roleId: canonical.id },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.role.delete({ where: { id: role.id } });
    console.log(
      `Migrated "${role.name}" -> "${canonicalName}": moved ${moved.count} user(s), deleted duplicate role.`
    );
  }

  const stranded = await prisma.user.findMany({
    where: { isActive: true, accountStatus: "ACTIVE" },
    include: { role: { include: { permissions: true } } },
  });
  const strandedNames = stranded
    .filter((u) => !u.role || u.role.permissions.length === 0)
    .map((u) => `${u.email} (role: ${u.role?.name ?? "none"})`);

  if (strandedNames.length > 0) {
    console.log("Active users on a permissionless role (review manually):");
    for (const n of strandedNames) console.log(`- ${n}`);
  }

  console.log("RBAC sync complete.");
}

syncRbac()
  .catch((e) => {
    console.error("RBAC sync failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
