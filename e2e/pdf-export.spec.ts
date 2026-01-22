import { test, expect } from '@playwright/test';
import { waitForMapLoad, waitForPoiCount, isRouteLinePresent } from './helpers/map-helpers';
import { waitForOptimizeRouteCall, waitForExportPdfCall } from './helpers/api-helpers';

test.describe('PDF Export', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForMapLoad(page);
    });

    async function addMultiplePOIs(page: any, count: number) {
        const locations = ['Banff', 'Lake Louise', 'Moraine Lake'];

        for (let i = 0; i < count && i < locations.length; i++) {
            await page.click('.address-search-container input');
            await page.fill('.address-search-container input', locations[i]);
            await page.waitForSelector('.esri-menu__list-item', { timeout: 10000 });
            await page.click('.esri-menu__list-item');
            await page.waitForTimeout(1000);
        }

        await waitForPoiCount(page, count);
    }

    test('should export optimized route to PDF', async ({ page }) => {
        // Add 3 POIs and optimize
        await addMultiplePOIs(page, 3);
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        // Set up download listener
        const downloadPromise = page.waitForEvent('download');

        // Click Export button
        const exportButton = page.locator('button', { hasText: 'Export Itinerary' });
        await exportButton.click();

        // Wait for download
        const download = await downloadPromise;

        // Verify download occurred
        expect(download.suggestedFilename()).toMatch(/itinerary.*\\.pdf/);

        // Verify file was downloaded
        const path = await download.path();
        expect(path).toBeTruthy();
    });

    test('should disable export button without route', async ({ page }) => {
        // Add POIs but don't optimize
        await addMultiplePOIs(page, 2);

        // Verify Export button is disabled
        const exportButton = page.locator('button', { hasText: 'Export Itinerary' });
        await expect(exportButton).toBeDisabled();
    });

    test('should show loading state during export', async ({ page }) => {
        // Add 3 POIs and optimize
        await addMultiplePOIs(page, 3);
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        // Click Export button
        const exportButton = page.locator('button', { hasText: 'Export Itinerary' });
        await exportButton.click();

        // Verify loading state appears briefly
        await expect(page.locator('text=Exporting...')).toBeVisible({ timeout: 5000 });
    });

    test('should export with route metrics', async ({ page }) => {
        // Add 3 POIs and optimize
        await addMultiplePOIs(page, 3);
        await page.locator('button', { hasText: 'Optimize' }).click();
        await waitForOptimizeRouteCall(page);
        await page.waitForTimeout(2000);

        // Verify metrics are visible before export
        await expect(page.locator('text=Route Summary')).toBeVisible();

        // Set up download listener
        const downloadPromise = page.waitForEvent('download');

        // Export
        await page.locator('button', { hasText: 'Export Itinerary' }).click();

        // Verify download
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\\.pdf$/);
    });
});
