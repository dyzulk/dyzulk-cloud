# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: example.spec.ts >> has title "Welcome to dyzulk Cloud"
- Location: tests/e2e/example.spec.ts:3:1

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /.*Welcome to dyzulk Cloud.*/
Received string:  "Laravel"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    13 × locator resolved to <html class="" lang="en">…</html>
       - unexpected value "Laravel"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('has title "Welcome to dyzulk Cloud"', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Expect the page title to contain "Welcome to dyzulk Cloud"
> 7  |   await expect(page).toHaveTitle(/.*Welcome to dyzulk Cloud.*/);
     |                      ^ Error: expect(page).toHaveTitle(expected) failed
  8  | });
  9  | 
  10 | 
```