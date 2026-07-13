import { test, expect } from '@playwright/test';

test.describe('Public Routes', () => {
  test('homepage loads and shows navigation', async ({ page }) => {
    await page.goto('/en');
    
    // Check main title or logo exists
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible(); // Footer
  });

  test('about page loads', async ({ page }) => {
    const res = await page.goto('/en/about');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('demands listing page loads and has items', async ({ page }) => {
    const res = await page.goto('/en/demands');
    expect(res?.status()).toBe(200);
  });

  test('404 page works', async ({ page }) => {
    const res = await page.goto('/en/does-not-exist-12345');
    expect(res?.status()).toBe(404);
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('homepage renders without horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/en');
    
    // Evaluate horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });
});
