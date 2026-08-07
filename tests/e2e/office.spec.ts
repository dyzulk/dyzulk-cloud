import { test, expect } from '@playwright/test';

test.describe('Office Panel Verification (Port 8001)', () => {
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

  test('should load office login page without hydration errors', async ({ page, baseURL }) => {
    // Map target URL from port 8000 to port 8001
    const targetURL = baseURL ? baseURL.replace(':8000', ':8001') : 'http://172.31.100.15:8001';
    
    // Visit office login page
    await page.goto(`${targetURL}/login`);

    // Verify page title contains "Office"
    await expect(page).toHaveTitle(/.*Office.*/);

    // Verify email input is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Verify no hydration errors were recorded
    expect(hydrationErrors).toEqual([]);
  });
});
