import { Page, expect } from '@playwright/test';

/**
 * Helper functions for API verification in E2E tests
 */

/**
 * Wait for and intercept route optimization API call
 */
export async function waitForOptimizeRouteCall(page: Page) {
    return await page.waitForResponse(
        response => response.url().includes('/api/route/optimize') && response.status() === 200,
        { timeout: 15000 }
    );
}

/**
 * Wait for and intercept lodging calculation API call
 */
export async function waitForCalculateLodgingCall(page: Page) {
    return await page.waitForResponse(
        response => response.url().includes('/api/lodging/calculate') && response.status() === 200,
        { timeout: 15000 }
    );
}

/**
 * Wait for and intercept PDF export API call
 */
export async function waitForExportPdfCall(page: Page) {
    return await page.waitForResponse(
        response => response.url().includes('/api/export/pdf') && response.status() === 200,
        { timeout: 20000 }
    );
}

/**
 * Verify API response structure for route optimization
 */
export async function verifyOptimizeRouteResponse(response: any) {
    const data = await response.json();

    expect(data).toHaveProperty('sequence');
    expect(data).toHaveProperty('routeMode');
    expect(Array.isArray(data.sequence)).toBeTruthy();
}

/**
 * Verify API response structure for lodging calculation
 */
export async function verifyCalculateLodgingResponse(response: any) {
    const data = await response.json();

    expect(data).toHaveProperty('centroid');
    expect(data).toHaveProperty('bufferRadiusKm');
    expect(data).toHaveProperty('bookingLinks');
    expect(data.centroid).toHaveProperty('lat');
    expect(data.centroid).toHaveProperty('lng');
}
