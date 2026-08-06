---
name: laravel-test-creation
description: "Trigger this skill when creating, modifying, or refactoring test suites, test cases, or mock requests in the dyzulk-cloud codebase. Guides the assistant on how to organize tests in folders by context (Web, Office, Api), dynamic port assignments in TestCase, guest redirects logic per port, and test database recovery."
license: MIT
metadata:
  author: dyzulk
---

# Laravel Test Creation Guidelines

Every new feature or route must have comprehensive test coverage. Use this skill to ensure tests are created according to the project's port-based routing conventions and folder architecture.

## 1. Test Folder Organization (By Context)

Tests **MUST ALWAYS** be organized in subfolders by application context under `tests/Feature/`. Do not put feature tests directly at the root of `tests/Feature/`.

| Folder | Context | Port | Targets / Features |
|--------|---------|------|--------------------|
| `tests/Feature/Web/` | Customer Portal | `8000` | Customer Dashboard, Registration, User Auth, Teams, Settings, SSL, and general web routes |
| `tests/Feature/Office/` | Internal Backoffice | `8001` | Backoffice Dashboard, Employees, and admin controls |
| `tests/Feature/Api/` | Public REST API | `8002` | Versioned REST API endpoints (`/client/v1/`), API Roots, and webhooks |

## 2. Automatic Port Assignment in Base TestCase

The base test class [TestCase.php](../../../tests/TestCase.php) automatically sets `$_SERVER['SERVER_PORT']` during the test `setUp()` method based on the running test's class namespace:

- Namespace containing `Tests\Feature\Web` $\rightarrow$ `$_SERVER['SERVER_PORT'] = 8000`
- Namespace containing `Tests\Feature\Office` $\rightarrow$ `$_SERVER['SERVER_PORT'] = 8001`
- Namespace containing `Tests\Feature\Api` $\rightarrow$ `$_SERVER['SERVER_PORT'] = 8002`
- Fallback $\rightarrow$ unsets `$_SERVER['SERVER_PORT']`

Ensure your test namespace is declared properly (or uses Pest's folder mapping) so this mapping is triggered.

## 3. URL Generation & Guest Redirects

- **Named Routes**: Always prefer using `route()` helper to generate URLs.
- **Guest Redirect Assertions**:
  - Web/Customer Dashboard redirects guest users to the `login` route.
  - Office/Backoffice Dashboard redirects guest users to the `office.login` route.
  Ensure guest redirect assertions match this context behavior.

## 4. SQLite Testing Database Recovery

The test suite runs using SQLite database `database/testing.sqlite`.
- If you encounter a `"database disk image is malformed"` error due to corrupted state from overlapping async tasks, delete the file so it can be re-created on the next run:
  ```bash
  rm database/testing.sqlite
  ```

## 5. Verification Checklist

1. Format all modified and new test files using Laravel Pint:
   ```bash
   vendor/bin/pint --dirty --format agent
   ```
2. Run your specific test file to confirm it passes:
   ```bash
   php artisan test tests/Feature/Web/Dashboard/DashboardTest.php --compact
   ```
3. Run the full test suite to guarantee no regression:
   ```bash
   php artisan test --compact
   ```
