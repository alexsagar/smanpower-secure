import { test, expect } from '@playwright/test';

test.describe('Authentication & Access Control', () => {
  test('login page loads and rejects invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for the error toast or inline message
    await expect(page.getByText(/invalid/i).first()).toBeVisible();
  });

  test('admin routes are protected and redirect to login', async ({ page }) => {
    const res = await page.goto('/admin');
    
    // Unauthenticated user should be redirected to login page
    expect(page.url()).toContain('/login');
  });
});
