import { test, expect } from '@playwright/test';

test.describe('Web Portal Verification (Port 8000)', () => {
  const hydrationErrors: string[] = [];
  const consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // 1. Reroute Vite assets from container IP to localhost so host browser can fetch them
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('172.31.100.15:5173')) {
        const newUrl = url.replace('172.31.100.15:5173', 'localhost:5173');
        route.continue({ url: newUrl });
      } else {
        route.continue();
      }
    });

    // 2. Listen to console errors to capture React 18/19 hydration warnings
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        if (text.includes('Hydration failed') || text.includes('initial UI does not match')) {
          hydrationErrors.push(text);
        } else {
          consoleErrors.push(text);
        }
      }
    });

    // 3. Catch uncaught runtime exceptions
    page.on('pageerror', (exception) => {
      if (exception.message.toLowerCase().includes('hydration')) {
        hydrationErrors.push(exception.message);
      }
    });
  });

  test('should load welcome marketing page without hydration errors', async ({ page }) => {
    await page.goto('/');

    // Expect the page title to contain "Welcome to dyzulk Cloud"
    await expect(page).toHaveTitle(/.*Welcome to dyzulk Cloud.*/);

    // Verify no hydration errors were recorded
    expect(hydrationErrors).toEqual([]);
  });

  test('should redirect unauthenticated user from dashboard to login page', async ({ page }) => {
    // Try visiting a team-scoped dashboard path
    await page.goto('/default-team/dashboard');

    // Expect to be redirected to the login page
    await expect(page).toHaveURL(/.*\/login/);

    // Verify the email input is visible on the login page
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Verify no hydration errors on the login page
    expect(hydrationErrors).toEqual([]);
  });
});
