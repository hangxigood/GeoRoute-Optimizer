import { test, expect } from '@playwright/test';
import { waitForMapLoad, waitForPoiCount, isRouteLinePresent, isLodgingZonePresent } from './helpers/map-helpers';
import { waitForOptimizeRouteCall, waitForCalculateLodgingCall } from './helpers/api-helpers';

test.describe('Complete User Workflow', () => {
    test('should complete full trip planning flow', async ({ page }) => {
        // Step 1: Navigate to app
        await page.goto('/');
        await waitForMapLoad(page);

        // Step 2: Add 5 POIs via search
        const locations = ['Banff', 'Lake Louise', 'Moraine Lake', 'Johnston Canyon', 'Canmore'];

        for (const location of locations) {
            await page.click('.address-search-container input');
            await page.fill('.address-search-container input', location);
            await page.waitForSelector('.esri-menu__list-item', { timeout: 10000 });
            await page.click('.esri-menu__list-item');
            await page.waitForTimeout(1000);
        }

        await waitForPoiCount(page, 5);

        // Step 3: Find lodging zone
        const findStayButton = page.locator('button', { hasText: 'Find Stay' });
        await findStayButton.click();
        await waitForCalculateLodgingCall(page);
        await page.waitForTimeout(2000);

        // Verify lodging zone appears
        await expect(page.locator('text=Best Stay Area')).toBeVisible();
        const lodgingPresent = await isLodgingZonePresent(page);
        expect(lodgingPresent).toBeTruthy();

        // Step 4: Verify booking links
        const bookingLink = page.locator('a', { hasText: 'Booking.com' });
        await expect(bookingLink).toBeVisible();
        await expect(bookingLink).toHaveAttribute('href', /.+/);

        // Step 5: Clear lodging zone and set start location
        await page.locator('.bg-green-50 button[title="Remove stay area"]').click();
        await page.waitForTimeout(500);

        await page.locator('button[title="Set as start location"]').first().click();
        await expect(page.locator('text=Starting Point')).toBeVisible();

        // Step 6: Optimize route in Loop mode
        await expect(page.locator('text=Loop')).toBeVisible();
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        // Step 7: Verify route and metrics
        const routePresent = await isRouteLinePresent(page);
        expect(routePresent).toBeTruthy();

        await expect(page.locator('text=Route Summary')).toBeVisible();
        await expect(page.locator('text=km total')).toBeVisible();
        await expect(page.locator('text=Loop trip (returns to start)')).toBeVisible();

        // Step 8: Export PDF
        const downloadPromise = page.waitForEvent('download');
        await page.locator('button', { hasText: 'Export Itinerary' }).click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/itinerary.*\\.pdf/);

        // Verify download path exists
        const path = await download.path();
        expect(path).toBeTruthy();
    });

    test('should handle modify and re-optimize workflow', async ({ page }) => {
        // Navigate and add POIs
        await page.goto('/');
        await waitForMapLoad(page);

        const locations = ['Banff', 'Lake Louise', 'Moraine Lake', 'Johnston Canyon'];
        for (const location of locations) {
            await page.click('.address-search-container input');
            await page.fill('.address-search-container input', location);
            await page.waitForSelector('.esri-menu__list-item', { timeout: 10000 });
            await page.click('.esri-menu__list-item');
            await page.waitForTimeout(1000);
        }
        await waitForPoiCount(page, 4);

        // Initial optimization
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        // Verify initial route
        let routePresent = await isRouteLinePresent(page);
        expect(routePresent).toBeTruthy();

        // Remove one POI
        await page.locator('button[title="Remove"]').first().click();
        await waitForPoiCount(page, 3);

        // Toggle one POI inactive
        await page.locator('button[title="Deactivate POI"]').first().click();

        // Re-optimize
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        // Verify route still exists
        routePresent = await isRouteLinePresent(page);
        expect(routePresent).toBeTruthy();

        // Verify metrics updated
        await expect(page.locator('text=Route Summary')).toBeVisible();
    });

    test('should handle mode switching workflow', async ({ page }) => {
        // Setup
        await page.goto('/');
        await waitForMapLoad(page);

        // Add POIs
        const locations = ['Banff', 'Lake Louise', 'Canmore'];
        for (const location of locations) {
            await page.click('.address-search-container input');
            await page.fill('.address-search-container input', location);
            await page.waitForSelector('.esri-menu__list-item', { timeout: 10000 });
            await page.click('.esri-menu__list-item');
            await page.waitForTimeout(1000);
        }
        await waitForPoiCount(page, 3);

        // Optimize in Loop mode
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        await expect(page.locator('text=Loop trip (returns to start)')).toBeVisible();

        // Switch to One-Way mode
        await page.locator('button[title="Switch to One-way"]').click();
        await expect(page.locator('text=1-Way')).toBeVisible();

        // Re-optimize
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        // Verify mode indicator changed
        await expect(page.locator('text=One-way trip')).toBeVisible();
    });
});
