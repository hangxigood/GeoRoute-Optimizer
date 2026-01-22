import { Page, expect } from '@playwright/test';

/**
 * Helper functions for map interactions in E2E tests
 */

/**
 * Wait for the ArcGIS map to fully load
 */
export async function waitForMapLoad(page: Page, timeout = 30000) {
    // Wait for the map container to be visible
    await page.waitForSelector('.esri-view-root', { timeout });

    // Wait for map view to be exposed to window
    await page.waitForFunction(() => {
        return (window as any).__arcgisMapView !== undefined;
    }, { timeout });

    // Wait for map to be interactive (no loading spinner)
    await page.waitForFunction(() => {
        const loadingIndicator = document.querySelector('.esri-view-surface--inset-outline');
        return !loadingIndicator || !loadingIndicator.classList.contains('esri-view-surface--inset-outline');
    }, { timeout });

    // Additional wait for tiles to load
    await page.waitForTimeout(2000);
}

/**
 * Get the count of POI markers on the map
 */
export async function getPoiMarkerCount(page: Page): Promise<number> {
    return await page.evaluate(() => {
        const mapView = (window as any).__arcgisMapView;
        if (!mapView) return 0;

        const poiLayer = mapView.map?.layers.find((l: any) => l.id === 'poi-layer');
        return poiLayer?.graphics?.length || 0;
    });
}

/**
 * Check if a route line is present on the map
 */
export async function isRouteLinePresent(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
        const mapView = (window as any).__arcgisMapView;
        if (!mapView) return false;

        const routeLayer = mapView.map?.layers.find((l: any) => l.id === 'route-layer');
        return (routeLayer?.graphics?.length || 0) > 0;
    });
}

/**
 * Check if lodging zone graphics are present on the map
 */
export async function isLodgingZonePresent(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
        const mapView = (window as any).__arcgisMapView;
        if (!mapView) return false;

        const lodgingLayer = mapView.map?.layers.find((l: any) => l.id === 'lodging-layer');
        return (lodgingLayer?.graphics?.length || 0) > 0;
    });
}

/**
 * Wait for POI count to match expected value
 */
export async function waitForPoiCount(page: Page, expectedCount: number, timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const count = await getPoiMarkerCount(page);
        if (count === expectedCount) {
            return;
        }
        await page.waitForTimeout(500);
    }

    const actualCount = await getPoiMarkerCount(page);
    throw new Error(`Expected ${expectedCount} POIs, but found ${actualCount}`);
}

/**
 * Get POI names from sidebar
 */
export async function getPoiNamesFromSidebar(page: Page): Promise<string[]> {
    const poiElements = await page.locator('[data-testid^="reorder-item-"]').all();
    const names: string[] = [];

    for (const element of poiElements) {
        const nameText = await element.locator('p.font-medium').first().textContent();
        if (nameText) {
            names.push(nameText.trim());
        }
    }

    return names;
}
