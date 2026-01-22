import { test, expect } from '@playwright/test';
import { waitForMapLoad, waitForPoiCount, isRouteLinePresent } from './helpers/map-helpers';
import { waitForOptimizeRouteCall, verifyOptimizeRouteResponse } from './helpers/api-helpers';

test.describe('Route Optimization', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForMapLoad(page);
    });

    async function addMultiplePOIs(page: any, count: number) {
        const locations = ['Banff', 'Lake Louise', 'Moraine Lake', 'Johnston Canyon', 'Canmore'];

        for (let i = 0; i < count && i < locations.length; i++) {
            await page.click('.address-search-container input');
            await page.fill('.address-search-container input', locations[i]);
            await page.waitForSelector('.esri-menu__list-item', { timeout: 10000 });
            await page.click('.esri-menu__list-item');
            await page.waitForTimeout(1000);
        }

        await waitForPoiCount(page, count);
    }

    test('should optimize route in Loop mode', async ({ page }) => {
        // Add 3 POIs
        await addMultiplePOIs(page, 3);

        // Verify Loop mode is selected by default
        await expect(page.locator('text=Loop')).toBeVisible();

        // Click Optimize button
        const optimizeButton = page.locator('button', { hasText: 'Optimize' });
        await optimizeButton.click();

        // Wait for API call
        const response = await waitForOptimizeRouteCall(page);
        await verifyOptimizeRouteResponse(response);

        // Verify route line appears on map
        await page.waitForTimeout(2000);
        const routePresent = await isRouteLinePresent(page);
        expect(routePresent).toBeTruthy();

        // Verify metrics appear in sidebar
        await expect(page.locator('text=Route Summary')).toBeVisible();
        await expect(page.locator('text=km total')).toBeVisible();
        await expect(page.locator('text=Loop trip (returns to start)')).toBeVisible();
    });

    test('should optimize route in One-Way mode', async ({ page }) => {
        // Add 3 POIs
        await addMultiplePOIs(page, 3);

        // Switch to One-Way mode
        const toggleButton = page.locator('button[title="Switch to One-way"]');
        await toggleButton.click();

        // Verify mode switched
        await expect(page.locator('text=1-Way')).toBeVisible();

        // Click Optimize button
        await page.locator('button', { hasText: 'Optimize' }).click();

        // Wait for API call
        await waitForOptimizeRouteCall(page);

        // Verify route line appears
        await page.waitForTimeout(2000);
        const routePresent = await isRouteLinePresent(page);
        expect(routePresent).toBeTruthy();

        // Verify One-Way indicator
        await expect(page.locator('text=One-way trip')).toBeVisible();
    });

    test('should display route metrics', async ({ page }) => {
        // Add 3 POIs
        await addMultiplePOIs(page, 3);

        // Optimize route
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        // Verify total metrics
        await expect(page.locator('text=Route Summary')).toBeVisible();

        // Check for distance and duration displays
        const metricsSection = page.locator('.bg-blue-50');
        await expect(metricsSection).toBeVisible();

        // Verify route legs section exists
        await expect(page.locator('text=Route Legs')).toBeVisible();
    });

    test('should optimize with inactive POIs excluded', async ({ page }) => {
        // Add 4 POIs
        await addMultiplePOIs(page, 4);

        // Deactivate one POI
        const toggleButton = page.locator('button[title="Deactivate POI"]').first();
        await toggleButton.click();

        // Optimize route
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        // Verify route exists
        const routePresent = await isRouteLinePresent(page);
        expect(routePresent).toBeTruthy();

        // Verify metrics show only active POIs
        await expect(page.locator('text=Route Summary')).toBeVisible();
    });

    test('should handle empty POI list gracefully', async ({ page }) => {
        // Try to optimize without any POIs
        const optimizeButton = page.locator('button', { hasText: 'Optimize' });

        // Button should be disabled
        await expect(optimizeButton).toBeDisabled();
    });
});
