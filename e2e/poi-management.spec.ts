import { test, expect } from '@playwright/test';
import { waitForMapLoad, getPoiMarkerCount, waitForPoiCount, getPoiNamesFromSidebar } from './helpers/map-helpers';

test.describe('POI Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForMapLoad(page);
    });

    test('should add POI via address search', async ({ page }) => {
        // Wait for search widget to be ready
        await page.waitForSelector('.esri-search__input', { timeout: 15000 });

        // Click on the search input
        await page.click('.esri-search__input');

        // Type a location
        await page.fill('.esri-search__input', 'Banff, Alberta');

        // Wait for suggestions dropdown to appear
        await page.waitForSelector('.esri-menu__list-item', { timeout: 15000 });

        // Wait a bit for all suggestions to load
        await page.waitForTimeout(500);

        // Click the first result
        await page.click('.esri-menu__list-item');

        // Wait for POI to be added
        await page.waitForTimeout(2000);
        await waitForPoiCount(page, 1);

        // Verify POI appears in sidebar
        const poiNames = await getPoiNamesFromSidebar(page);
        expect(poiNames.length).toBe(1);
    });

    test('should remove POI', async ({ page }) => {
        // Add a POI first via search
        await page.waitForSelector('.esri-search__input', { timeout: 15000 });
        await page.click('.esri-search__input');
        await page.fill('.esri-search__input', 'Lake Louise');
        await page.waitForSelector('.esri-menu__list-item', { timeout: 15000 });
        await page.waitForTimeout(500);
        await page.click('.esri-menu__list-item');
        await page.waitForTimeout(2000);
        await waitForPoiCount(page, 1);

        // Click remove button
        const removeButton = page.locator('button[title="Remove"]').first();
        await removeButton.click();

        // Verify POI is removed
        await page.waitForTimeout(1000);
        await waitForPoiCount(page, 0);

        // Verify sidebar is empty
        const poiNames = await getPoiNamesFromSidebar(page);
        expect(poiNames.length).toBe(0);
    });

    test('should toggle POI active/inactive', async ({ page }) => {
        // Add a POI
        await page.waitForSelector('.esri-search__input', { timeout: 15000 });
        await page.click('.esri-search__input');
        await page.fill('.esri-search__input', 'Moraine Lake');
        await page.waitForSelector('.esri-menu__list-item', { timeout: 15000 });
        await page.waitForTimeout(500);
        await page.click('.esri-menu__list-item');
        await page.waitForTimeout(2000);
        await waitForPoiCount(page, 1);

        // Click toggle button (eye icon)
        const toggleButton = page.locator('button[title="Deactivate POI"]').first();
        await toggleButton.click();

        // Verify button title changed to "Activate POI"
        await expect(page.locator('button[title="Activate POI"]').first()).toBeVisible();

        // Toggle back
        await page.locator('button[title="Activate POI"]').first().click();
        await expect(page.locator('button[title="Deactivate POI"]').first()).toBeVisible();
    });

    test('should edit POI name', async ({ page }) => {
        // Add a POI
        await page.waitForSelector('.esri-search__input', { timeout: 15000 });
        await page.click('.esri-search__input');
        await page.fill('.esri-search__input', 'Johnston Canyon');
        await page.waitForSelector('.esri-menu__list-item', { timeout: 15000 });
        await page.waitForTimeout(500);
        await page.click('.esri-menu__list-item');
        await page.waitForTimeout(2000);
        await waitForPoiCount(page, 1);

        // Click on POI name to edit
        const poiName = page.locator('p.font-medium').first();
        await poiName.click();

        // Wait for input to appear and edit
        await page.waitForTimeout(500);
        const nameInput = page.locator('input[type="text"]').first();
        await nameInput.fill('My Custom Canyon');
        await nameInput.press('Enter');

        // Wait for save
        await page.waitForTimeout(500);

        // Verify name changed
        await expect(page.locator('p.font-medium').first()).toHaveText('My Custom Canyon');
    });

    test('should set POI as start location', async ({ page }) => {
        // Add two POIs
        await page.waitForSelector('.esri-search__input', { timeout: 15000 });

        // First POI
        await page.click('.esri-search__input');
        await page.fill('.esri-search__input', 'Banff');
        await page.waitForSelector('.esri-menu__list-item', { timeout: 15000 });
        await page.waitForTimeout(500);
        await page.click('.esri-menu__list-item');
        await page.waitForTimeout(2000);
        await waitForPoiCount(page, 1);

        // Second POI
        await page.click('.esri-search__input');
        await page.fill('.esri-search__input', 'Canmore');
        await page.waitForSelector('.esri-menu__list-item', { timeout: 15000 });
        await page.waitForTimeout(500);
        await page.click('.esri-menu__list-item');
        await page.waitForTimeout(2000);
        await waitForPoiCount(page, 2);

        // Click "Set as start location" button on first POI
        const setStartButton = page.locator('button[title="Set as start location"]').first();
        await setStartButton.click();

        // Wait for UI update
        await page.waitForTimeout(1000);

        // Verify start location section appears (check for the start location card)
        const startLocationCard = page.locator('.bg-blue-50').first();
        await expect(startLocationCard).toBeVisible();

        // Verify only 1 POI remains in the list
        const poiNames = await getPoiNamesFromSidebar(page);
        expect(poiNames.length).toBe(1);
    });

    test('should clear start location', async ({ page }) => {
        // Add a POI and set as start
        await page.waitForSelector('.esri-search__input', { timeout: 15000 });
        await page.click('.esri-search__input');
        await page.fill('.esri-search__input', 'Banff');
        await page.waitForSelector('.esri-menu__list-item', { timeout: 15000 });
        await page.waitForTimeout(500);
        await page.click('.esri-menu__list-item');
        await page.waitForTimeout(2000);
        await waitForPoiCount(page, 1);

        await page.locator('button[title="Set as start location"]').first().click();
        await page.waitForTimeout(1000);

        // Verify start location section exists
        const startLocationCard = page.locator('.bg-blue-50').first();
        await expect(startLocationCard).toBeVisible();

        // Click remove start location button
        await page.locator('button[title="Remove start location"]').click();

        // Wait for UI update
        await page.waitForTimeout(1000);

        // Verify start location section is gone
        await expect(startLocationCard).not.toBeVisible();

        // Verify POI is back in the list
        const poiNames = await getPoiNamesFromSidebar(page);
        expect(poiNames.length).toBe(1);
    });
});
