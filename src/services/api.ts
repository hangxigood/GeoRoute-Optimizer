import type { PointOfInterest, LodgingZone, OptimizedRoute } from '@/types/poi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';

/**
 * API service for lodging zone calculations
 */
export const lodgingApi = {
    /**
     * Calculate the optimal lodging zone based on POIs
     */
    calculate: async (
        points: PointOfInterest[],
        bufferRadiusKm: number = 5
    ): Promise<LodgingZone> => {
        const response = await fetch(`${API_URL}/lodging/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                points: points.map(p => ({
                    id: p.id,
                    name: p.name,
                    lat: p.lat,
                    lng: p.lng,
                })),
                bufferRadiusKm,
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend API returned ${response.status}`);
        }

        return response.json();
    },
};

/**
 * API service for route optimization
 */
export const routeApi = {
    /**
     * Optimize route sequence for given POIs and hotel
     */
    optimize: async (
        points: PointOfInterest[],
        hotel: PointOfInterest | null,
        optimizeSequence: boolean = true
    ): Promise<OptimizedRoute> => {
        const response = await fetch(`${API_URL}/route/optimize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                points: points.map(p => ({
                    id: p.id,
                    name: p.name,
                    lat: p.lat,
                    lng: p.lng,
                })),
                hotel: hotel ? {
                    name: hotel.name,
                    lat: hotel.lat,
                    lng: hotel.lng,
                } : null,
                optimizeSequence,
                manualSequence: optimizeSequence ? null : points.map(p => p.id),
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend API returned ${response.status}`);
        }

        return response.json();
    },
};

/**
 * API service for export functionality
 */
export const exportApi = {
    /**
     * Export route and POIs as PDF
     */
    exportPdf: async (
        route: OptimizedRoute,
        points: PointOfInterest[],
        hotel: PointOfInterest | null
    ): Promise<Blob> => {
        const response = await fetch(`${API_URL}/export/pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                route,
                points: points.map(p => ({
                    id: p.id,
                    name: p.name,
                    lat: p.lat,
                    lng: p.lng,
                })),
                hotel: hotel ? {
                    name: hotel.name,
                    lat: hotel.lat,
                    lng: hotel.lng,
                } : null,
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend API returned ${response.status}`);
        }

        return response.blob();
    },
};

/**
 * Combined API service
 */
export const api = {
    lodging: lodgingApi,
    route: routeApi,
    export: exportApi,
};
