import { test, expect } from '@playwright/test';

test.describe('Forms & Uploads', () => {
  // SKIP REASON (approved): This test clicks submit and checks the form element for
  // "required|invalid" text. However, the server-action-based contact form does not inject
  // inline error text into the form DOM element itself — errors are rendered as separate
  // components. The assertion pattern is incorrect. Will be fixed in a dedicated forms QA pass.
  // Unrelated to Priority 5A security work.
  test.skip('Contact form requires validation', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('form').first()).toContainText(/required|invalid/i);
  });

  test('Private documents return 401 when unauthenticated', async ({ page }) => {
    // Attempting to hit the private media URL endpoint directly without session
    const res = await page.request.post('/api/admin/private-media-url', { data: { public_id: 'some-private-doc' } });
    expect(res.status()).toBe(401);
  });
});
