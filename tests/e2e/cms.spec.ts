import { test, expect } from '@playwright/test';

test.describe('CMS functionality', () => {
  test('Draft pages are not visible to public', async ({ page }) => {
    // We would need to seed a draft page or use an existing one. 
    // Assuming '/en/draft-page-test' is not published
    const res = await page.goto('/en/draft-page-test');
    
    // Should be a 404 since it's a draft
    expect(res?.status()).toBe(404);
  });

  test('robots meta tag prevents indexing of draft/private content', async ({ page }) => {
    // Check an admin route or draft to ensure it has noindex
    await page.goto('/admin/login');
    
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    // Admin login must have noindex
    expect(robots).toContain('noindex');
  });
});
