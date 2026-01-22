import { test, expect } from '@playwright/test';
import { waitForMapLoad, waitForPoiCount, isLodgingZonePresent } from './helpers/map-helpers';
import { waitForCalculateLodgingCall, verifyCalculateLodgingResponse } from './helpers/api-helpers';

test.describe('Lodging Zone Calculation', () => {
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

    test('should calculate lodging zone', async ({ page }) => {
        // Add 3 POIs
        await addMultiplePOIs(page, 3);

        // Click "Find Stay" button
        const findStayButton = page.locator('button', { hasText: 'Find Stay' });
        await findStayButton.click();

        // Wait for API call
        const response = await waitForCalculateLodgingCall(page);
        await verifyCalculateLodgingResponse(response);

        // Wait for graphics to render
        await page.waitForTimeout(2000);

        // Verify lodging zone graphics appear on map
        const lodgingPresent = await isLodgingZonePresent(page);
        expect(lodgingPresent).toBeTruthy();

        // Verify lodging card in sidebar
        await expect(page.locator('text=Best Stay Area')).toBeVisible();
        await expect(page.locator('text=/Stay within \\d+km/')).toBeVisible();
    });

    test('should display booking links', async ({ page }) => {
        // Add 3 POIs and calculate lodging
        await addMultiplePOIs(page, 3);
        await page.locator('button', { hasText: 'Find Stay' }).click();
        await waitForCalculateLodgingCall(page);
        await page.waitForTimeout(2000);

        // Verify booking links are present
        const bookingLink = page.locator('a', { hasText: 'Booking.com' });
        const airbnbLink = page.locator('a', { hasText: 'Airbnb' });

        await expect(bookingLink).toBeVisible();
        await expect(airbnbLink).toBeVisible();

        // Verify links have href attributes
        await expect(bookingLink).toHaveAttribute('href', /.+/);
        await expect(airbnbLink).toHaveAttribute('href', /.+/);
    });

    test('should remove lodging zone', async ({ page }) => {
        // Add 3 POIs and calculate lodging
        await addMultiplePOIs(page, 3);
        await page.locator('button', { hasText: 'Find Stay' }).click();
        await waitForCalculateLodgingCall(page);
        await page.waitForTimeout(2000);

        // Verify lodging zone exists
        await expect(page.locator('text=Best Stay Area')).toBeVisible();

        // Click remove button on lodging card
        const removeButton = page.locator('.bg-green-50 button[title="Remove stay area"]');
        await removeButton.click();

        // Verify lodging card is gone
        await expect(page.locator('text=Best Stay Area')).not.toBeVisible();

        // Verify graphics removed from map
        await page.waitForTimeout(1000);
        const lodgingPresent = await isLodgingZonePresent(page);
        expect(lodgingPresent).toBeFalsy();
    });

    test('should disable Find Stay when start location is set', async ({ page }) => {
        // Add 2 POIs
        await addMultiplePOIs(page, 2);

        // Set one as start location
        await page.locator('button[title="Set as start location"]').first().click();

        // Verify Find Stay button is disabled
        const findStayButton = page.locator('button', { hasText: 'Find Stay' });
        await expect(findStayButton).toBeDisabled();
    });

    test('should require at least 2 POIs for lodging calculation', async ({ page }) => {
        // Add only 1 POI
        await page.click('.address-search-container input');
        await page.fill('.address-search-container input', 'Banff');
        await page.waitForSelector('.esri-menu__list-item');
        await page.click('.esri-menu__list-item');
        await waitForPoiCount(page, 1);

        // Verify Find Stay button is disabled
        const findStayButton = page.locator('button', { hasText: 'Find Stay' });
        await expect(findStayButton).toBeDisabled();
    });
});
