import { test as setup, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const authFileReviewer = path.join(__dirname, '../../playwright/.auth/reviewer.json');
const authFileContentManager = path.join(__dirname, '../../playwright/.auth/content_manager.json');
const authFileViewer = path.join(__dirname, '../../playwright/.auth/viewer.json');

// Ensure the auth directory exists
const authDir = path.join(__dirname, '../../playwright/.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

const prisma = new PrismaClient();

// All QA test users share this password. Only set in smanpower_qa. Never commit.
const QA_TEST_PASSWORD = process.env.QA_TEST_PASSWORD || 'QaTestPass123!';

async function createQAUser(email: string, roleName: string, permissions: string[]) {
  const permRecords = await Promise.all(permissions.map(async p => {
    const [module, action] = p.split('.');
    return prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p, displayName: p, module, action }
    });
  }));

  const role = await prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName, displayName: roleName }
  });

  // Re-link permissions
  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.rolePermission.createMany({
    data: permRecords.map(pr => ({ roleId: role.id, permissionId: pr.id }))
  });

  const passwordHash = await bcrypt.hash(QA_TEST_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email },
    update: { roleId: role.id, passwordHash, accountStatus: 'ACTIVE' },
    create: {
      email,
      name: `QA ${roleName}`,
      roleId: role.id,
      passwordHash,
      accountStatus: 'ACTIVE'
    }
  });
}

setup('setup QA users and login', async ({ page }) => {
  if (process.env.QA_MODE !== 'true' || !process.env.DATABASE_URL?.includes('smanpower_qa')) {
    throw new Error('global.setup.ts must only be run in QA_MODE against smanpower_qa');
  }

  // Define roles and users
  await createQAUser('qa-reviewer@test.local', 'qa_recruitment_reviewer', ['candidate_documents.view', 'applications.view', 'applications.review']);
  await createQAUser('qa-content@test.local', 'qa_content_manager', ['demands.create', 'demands.publish']); // No document view
  await createQAUser('qa-viewer@test.local', 'qa_viewer', ['demands.view']); // No document view

  const users = [
    { email: 'qa-reviewer@test.local', file: authFileReviewer },
    { email: 'qa-content@test.local', file: authFileContentManager },
    { email: 'qa-viewer@test.local', file: authFileViewer },
  ];

  for (const user of users) {
    // Navigate to login
    await page.goto('/admin/login');
    // Assuming a standard email login bypass or password form in the demo/test environment
    // NextAuth credentials provider is usually available in tests.
    // If it's a real password, we'd use a known test password from env. 
    // Since this is a test environment, let's assume `Test123!` or any configured password works if credentials are used.
    
    // Fill credentials using the known QA test password
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', QA_TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for successful redirect to dashboard (redirect leads to /admin or sub-path)
    // We must ensure the URL does NOT contain "login" to prove success.
    await page.waitForURL((url) => url.pathname.includes('/admin') && !url.pathname.includes('login'), { timeout: 15000 });

    // Save storage state
    await page.context().storageState({ path: user.file });
    
    // Clear cookies for the next user
    await page.context().clearCookies();
  }
});
