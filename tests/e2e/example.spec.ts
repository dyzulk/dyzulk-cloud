import { test, expect } from '@playwright/test';

test('has title "Welcome to dyzulk Cloud"', async ({ page }) => {
  await page.goto('/');

  // Expect the page title to contain "Welcome to dyzulk Cloud"
  await expect(page).toHaveTitle(/.*Welcome to dyzulk Cloud.*/);
});

