import { prisma } from "../lib/prisma";
// Import from the dependency-free constants module (not "../lib/permissions",
// which pulls in next-auth) so this runs cleanly inside `npx tsx prisma/seed.ts`.
import { ROLE_PERMISSIONS, ALL_PERMISSIONS } from "../lib/permissions.constants";

/** Split a permission name into (module, action) on the FIRST dot. */
function splitPermission(name: string): { module: string; action: string } {
  const idx = name.indexOf(".");
  if (idx === -1) return { module: name, action: "manage" };
  return { module: name.slice(0, idx), action: name.slice(idx + 1) };
}

export async function seedPermissions(prismaClient = prisma) {
  console.log("Seeding real permissions into PostgreSQL...");

  // 0. Ensure EVERY permission in the catalog exists, even ones not
  //    yet attached to a role, so the DB always has the full vocabulary.
  for (const permName of ALL_PERMISSIONS) {
    const { module, action } = splitPermission(permName);
    await prismaClient.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName, displayName: permName, module, action },
    });
  }

  // For every role in the canonical ROLE_PERMISSIONS map
  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    // 1. Ensure Role exists
    const role = await prismaClient.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        displayName: roleName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: "Generated from ROLE_PERMISSIONS",
      },
    });

    console.log(`Processing Role: ${roleName}`);

    // 2. Ensure each Permission exists and link it
    for (const permName of permissions) {
      const { module: moduleName, action: actionName } = splitPermission(permName);

      const permission = await prismaClient.permission.upsert({
        where: { name: permName },
        update: {},
        create: {
          name: permName,
          displayName: permName,
          module: moduleName,
          action: actionName,
        },
      });

      // Link them
      await prismaClient.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("Permission sync complete.");
}

// If executed directly
if (require.main === module) {
  seedPermissions()
    .catch((e) => {
      console.error("❌ Permission seed failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
