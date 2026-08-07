import { test, expect } from '@playwright/test';

test.describe('API Portal Verification (Port 8002)', () => {
  test('should load API root endpoint with correct status', async ({ request, baseURL }) => {
    // Map target URL from port 8000 to port 8002
    const targetURL = baseURL ? baseURL.replace(':8000', ':8002') : 'http://172.31.100.15:8002';

    const response = await request.get(`${targetURL}/`);
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body).toEqual({
      service: 'dyzulk-cloud-api',
      status: 'online',
    });
  });

  test('should load API health check endpoint with ok status', async ({ request, baseURL }) => {
    // Map target URL from port 8000 to port 8002
    const targetURL = baseURL ? baseURL.replace(':8000', ':8002') : 'http://172.31.100.15:8002';

    const response = await request.get(`${targetURL}/health`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toEqual({
      status: 'ok',
    });
  });
});
