import { PrismaClient } from "@prisma/client";
import {
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  USER_PERMISSIONS,
} from "../lib/permissions.constants";

const prisma = new PrismaClient();

type Finding = { level: "FAIL" | "WARN"; message: string };

const LEGACY_PERMISSIONS = new Set([
  "applications.change_status",
  "demands.view_applications",
  "demands.update_application_status",
  "demands.export_applications",
]);

async function auditRbac(): Promise<Finding[]> {
  const findings: Finding[] = [];

  const dbPerms = await prisma.permission.findMany({ select: { name: true } });
  const dbPermNames = new Set(dbPerms.map((p) => p.name));
  const catalog = new Set(ALL_PERMISSIONS);

  for (const perm of ALL_PERMISSIONS) {
    if (!dbPermNames.has(perm)) {
      findings.push({ level: "FAIL", message: `Missing permission in DB: ${perm}` });
    }
  }

  for (const name of dbPermNames) {
    if (!catalog.has(name)) {
      findings.push({
        level: "WARN",
        message: `${
          LEGACY_PERMISSIONS.has(name) ? "Legacy" : "Orphan"
        } permission in DB (not in ALL_PERMISSIONS): ${name}`,
      });
    }
  }

  const roles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } }, users: { select: { id: true } } },
  });
  const rolesByName = new Map(roles.map((r) => [r.name, r]));

  for (const [roleName, expected] of Object.entries(ROLE_PERMISSIONS)) {
    const role = rolesByName.get(roleName);
    if (!role) {
      findings.push({ level: "FAIL", message: `Missing role in DB: ${roleName}` });
      continue;
    }

    const have = new Set(role.permissions.map((rp) => rp.permission.name));
    for (const perm of expected) {
      if (!have.has(perm)) {
        findings.push({
          level: "FAIL",
          message: `Role "${roleName}" missing expected permission "${perm}"`,
        });
      }
    }
  }

  const superAdmin = rolesByName.get("super_admin");
  if (!superAdmin) {
    findings.push({ level: "FAIL", message: "super_admin role does not exist" });
  } else {
    const have = new Set(superAdmin.permissions.map((rp) => rp.permission.name));
    for (const perm of ALL_PERMISSIONS) {
      if (!have.has(perm)) {
        findings.push({ level: "FAIL", message: `super_admin missing "${perm}"` });
      }
    }
    for (const req of [USER_PERMISSIONS.VIEW, USER_PERMISSIONS.INVITE]) {
      if (!have.has(req)) {
        findings.push({ level: "FAIL", message: `super_admin missing critical "${req}"` });
      }
    }
  }

  for (const role of roles) {
    const lower = role.name.toLowerCase();
    if (role.name !== lower && ROLE_PERMISSIONS[lower]) {
      findings.push({
        level: "FAIL",
        message: `Non-canonical duplicate role "${role.name}" shadows "${lower}" (${role.users.length} user(s) attached)`,
      });
    }
  }

  const activeUsers = await prisma.user.findMany({
    where: { isActive: true, accountStatus: "ACTIVE" },
    include: { role: { include: { permissions: true } } },
  });
  for (const u of activeUsers) {
    if (!u.role) {
      findings.push({ level: "FAIL", message: `Active user ${u.email} has no role` });
    } else if (u.role.permissions.length === 0) {
      findings.push({
        level: "WARN",
        message: `Active user ${u.email} is on role "${u.role.name}" which has 0 permissions`,
      });
    }
  }

  return findings;
}

auditRbac()
  .then((findings) => {
    const fails = findings.filter((f) => f.level === "FAIL");
    const warns = findings.filter((f) => f.level === "WARN");

    console.log("RBAC AUDIT REPORT");
    if (findings.length === 0) {
      console.log("All checks passed. RBAC is consistent with the canonical definition.");
    } else {
      for (const f of findings) {
        console.log(`${f.level} ${f.message}`);
      }
      console.log("Run `npm run admin:rbac-sync` to create missing canonical permissions and role links.");
    }
    console.log(`Result: ${fails.length} failure(s), ${warns.length} warning(s).`);
    process.exitCode = fails.length > 0 ? 1 : 0;
  })
  .catch((e) => {
    console.error("RBAC audit crashed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
