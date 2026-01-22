# E2E Testing Guide: GeoRoute Optimizer

## Overview
This document provides instructions for running and maintaining the End-to-End (E2E) test suite for GeoRoute Optimizer using Playwright.

## Test Suite Structure

### Test Files (25 scenarios total)

1. **`e2e/poi-management.spec.ts`** (6 tests)
   - Add POI via address search
   - Remove POI
   - Toggle POI active/inactive
   - Edit POI name
   - Set POI as start location
   - Clear start location

2. **`e2e/route-optimization.spec.ts`** (5 tests)
   - Optimize route in Loop mode
   - Optimize route in One-Way mode
   - Display route metrics
   - Optimize with inactive POIs excluded
   - Handle empty POI list gracefully

3. **`e2e/lodging-zone.spec.ts`** (5 tests)
   - Calculate lodging zone
   - Display booking links
   - Remove lodging zone
   - Disable Find Stay when start location is set
   - Require at least 2 POIs for lodging calculation

4. **`e2e/pdf-export.spec.ts`** (4 tests)
   - Export optimized route to PDF
   - Disable export button without route
   - Show loading state during export
   - Export with route metrics

5. **`e2e/complete-workflow.spec.ts`** (3 tests)
   - Complete full trip planning flow
   - Handle modify and re-optimize workflow
   - Handle mode switching workflow

### Helper Utilities

- **`e2e/helpers/map-helpers.ts`**: Map interaction utilities
  - `waitForMapLoad()`: Wait for ArcGIS map initialization
  - `getPoiMarkerCount()`: Count POI graphics on map
  - `isRouteLinePresent()`: Check for route polyline
  - `isLodgingZonePresent()`: Check for lodging graphics
  - `waitForPoiCount()`: Wait for specific POI count
  - `getPoiNamesFromSidebar()`: Extract POI names from UI

- **`e2e/helpers/api-helpers.ts`**: API verification utilities
  - `waitForOptimizeRouteCall()`: Monitor route optimization API
  - `waitForCalculateLodgingCall()`: Monitor lodging calculation API
  - `waitForExportPdfCall()`: Monitor PDF export API
  - `verifyOptimizeRouteResponse()`: Validate API response structure
  - `verifyCalculateLodgingResponse()`: Validate API response structure

## Prerequisites

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Services
The E2E tests require both frontend and backend to be running:

```bash
# Terminal 1: Start Next.js frontend
npm run dev

# Terminal 2: Start Azure Functions backend
cd backend/GeoRoute.Api
dotnet run watch
```

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test e2e/poi-management.spec.ts
```

### Run in UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

This opens Playwright's interactive UI where you can:
- See tests running in real-time
- Debug failures step-by-step
- Inspect DOM at each step
- View network requests

### Run in Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

This opens Playwright Inspector for step-by-step debugging.

### Run Specific Browser
```bash
# Chromium only (default)
npx playwright test --project=chromium

# Add Firefox/WebKit in playwright.config.ts if needed
```

## Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

The report includes:
- Test results with pass/fail status
- Screenshots of failures
- Videos of failed tests
- Execution timeline
- Network activity

## Configuration

### `playwright.config.ts`
Key settings:
- **Base URL**: `http://localhost:3000`
- **Timeout**: 60 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure
- **Videos**: Retained on failure
- **Trace**: On first retry

### Environment Variables
Set in `.env.local` if needed:
```bash
# Backend API URL (if different from default)
NEXT_PUBLIC_API_URL=http://localhost:7071/api
```

## Writing New Tests

### Test Template
```typescript
import { test, expect } from '@playwright/test';
import { waitForMapLoad } from './helpers/map-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForMapLoad(page);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    // ... setup

    // Act
    // ... perform actions

    // Assert
    await expect(page.locator('...')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Data Attributes**: Add `data-testid` to elements for stable selectors
2. **Wait for Network**: Use `waitForResponse()` for API calls
3. **Avoid Hard Waits**: Use `waitForSelector()` instead of `waitForTimeout()` when possible
4. **Clean State**: Each test should be independent
5. **Descriptive Names**: Test names should clearly describe the scenario

## Troubleshooting

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check if backend services are running
- Verify network connectivity

### Map Not Loading
- Ensure ArcGIS API key is valid
- Check browser console for errors
- Verify map container is visible

### Flaky Tests
- Add explicit waits for async operations
- Use `page.waitForLoadState('networkidle')`
- Increase action timeout for slow operations

### API Calls Failing
- Verify backend is running on correct port
- Check CORS configuration
- Inspect network tab in Playwright UI mode

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start backend
        run: |
          cd backend/GeoRoute.Api
          dotnet run &
        
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Coverage Mapping

Tests validate all critical user stories from PRD:

| User Story | Test File | Test Case |
| :--- | :--- | :--- |
| US-1: Drop pins | `poi-management.spec.ts` | Add POI via search |
| US-2: Best sequence | `route-optimization.spec.ts` | Optimize route |
| US-3: Lodging zone | `lodging-zone.spec.ts` | Calculate lodging zone |
| US-4: Export PDF | `pdf-export.spec.ts` | Export optimized route |
| US-5: Disable POI | `poi-management.spec.ts` | Toggle POI active/inactive |
| US-6: Leg metrics | `route-optimization.spec.ts` | Display route metrics |
| US-7: Total metrics | `route-optimization.spec.ts` | Display route metrics |
| US-8: Manual reorder | `poi-management.spec.ts` | Edit POI (drag-drop tested manually) |

---

*Created: 2026-01-22*  
*Framework: Playwright v1.57*  
*Total Tests: 25 scenarios*
