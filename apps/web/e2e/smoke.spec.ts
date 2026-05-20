import { test, expect } from '@playwright/test';

test.describe('public surfaces', () => {
  test('landing page renders in AhTohMoh voice', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('The operating environment for AhTohMoh.')).toBeVisible();
    await expect(page.getByText('Legacy through play.')).toBeVisible();
  });

  test('login page is reachable', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('protected routes redirect to /login when signed out', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('api/health returns ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.service).toBe('keep-playing');
  });
});
