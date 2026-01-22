# Debugging E2E Tests with Playwright UI Mode

## Quick Start

The Playwright UI mode is now running. Here's how to use it effectively:

## UI Mode Features

### 1. **Test Explorer (Left Panel)**
- See all test files and individual tests
- Click any test to run it
- Green checkmark = passed
- Red X = failed
- Click failed tests to see error details

### 2. **Actions Timeline (Middle Panel)**
- Shows each step of the test
- Click any step to see:
  - Screenshot at that moment
  - DOM snapshot
  - Network requests
  - Console logs

### 3. **Watch Mode**
- Tests auto-rerun when you save files
- Great for iterative debugging

## Common Issues & Fixes

### Issue 1: Search Input Not Found
**Symptom**: `TimeoutError: locator.click: Timeout 30000ms exceeded`

**Debug Steps**:
1. Click the failed test in UI mode
2. Look at the screenshot when it failed
3. Check if the search widget loaded
4. If not visible, increase timeout or add wait

**Fix**: Already updated with `.esri-search__input` selector and 15s timeout

### Issue 2: POI Not Added
**Symptom**: `waitForPoiCount` throws error

**Debug Steps**:
1. Check if search result was clicked
2. Verify `__arcgisMapView` is exposed (check Console tab)
3. Look at Network tab for API errors

**Fix**: Added `window.__arcgisMapView` exposure in MapView.tsx

### Issue 3: Timing Issues
**Symptom**: Test passes sometimes, fails other times

**Debug Steps**:
1. Look for race conditions
2. Check if elements appear/disappear quickly
3. Use `waitForSelector` instead of `waitForTimeout`

**Fix**: Added strategic `waitForTimeout` calls after async operations

## Using the Debugger

### Step-by-Step Debugging
1. Click the **"Pick Locator"** button (target icon)
2. Hover over elements in the browser to see selectors
3. Copy the selector to use in your test

### Inspect Element State
1. Click any action in the timeline
2. Click "DOM Snapshot" tab
3. Search for elements using DevTools

### Check Network Requests
1. Click "Network" tab
2. See all API calls
3. Check request/response payloads

## Fixing Tests Interactively

### Current Test Status
- ❌ Most tests failing due to selector/timing issues
- ✅ "should handle empty POI list gracefully" passes

### To Fix a Test:
1. **Run the test** in UI mode
2. **Pause at failure** - click the failed step
3. **Inspect** - use Pick Locator to find correct selector
4. **Update test file** - change selector in your editor
5. **Save** - test auto-reruns
6. **Repeat** until green

## Example: Fixing "should add POI via address search"

### Before (Failing):
```typescript
await page.click('.address-search-container input');
```

### After (Fixed):
```typescript
await page.waitForSelector('.esri-search__input', { timeout: 15000 });
await page.click('.esri-search__input');
```

### Why it works:
- Waits for ArcGIS widget to fully render
- Uses correct ESRI class name
- Increased timeout for slow map loading

## Tips for Success

### 1. **Use Explicit Waits**
```typescript
// ❌ Bad
await page.click('.button');

// ✅ Good
await page.waitForSelector('.button', { timeout: 10000 });
await page.click('.button');
```

### 2. **Wait for Network**
```typescript
// Wait for API call to complete
await page.waitForResponse(response => 
  response.url().includes('/api/route/optimize')
);
```

### 3. **Add Debug Waits**
```typescript
// Temporarily add to see what's happening
await page.pause(); // Opens debugger
```

### 4. **Check Console Logs**
```typescript
page.on('console', msg => console.log('Browser:', msg.text()));
```

## Next Steps

1. **Run tests one by one** in UI mode
2. **Fix selectors** as needed using Pick Locator
3. **Adjust timeouts** for slow operations
4. **Verify map view exposure** - check if `window.__arcgisMapView` exists

## Updated Files

I've already updated:
- ✅ `MapView.tsx` - Exposes map view to window
- ✅ `poi-management.spec.ts` - Better selectors and waits
- ✅ `map-helpers.ts` - Waits for map view exposure

Try running the tests again in UI mode to see improvements!
