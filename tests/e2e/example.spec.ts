import { test, expect } from '@playwright/test';

test('has title "Welcome to dyzulk Cloud"', async ({ page }) => {
  // Redirect internal container IP to localhost so the host browser can load Vite assets
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('172.31.100.15:5173')) {
      const newUrl = url.replace('172.31.100.15:5173', 'localhost:5173');
      route.continue({ url: newUrl });
    } else {
      route.continue();
    }
  });

  page.on('console', msg => console.log(`[BROWSER CONSOLE]: ${msg.text()}`));
  page.on('pageerror', exception => console.log(`[BROWSER ERROR]: ${exception.stack || exception.message}`));

  await page.goto('/');

  // Expect the page title to contain "Welcome to dyzulk Cloud"
  await expect(page).toHaveTitle(/.*Welcome to dyzulk Cloud.*/);
});



