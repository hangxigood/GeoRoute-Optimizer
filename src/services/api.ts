import type { PointOfInterest, LodgingZone, OptimizedRoute, RouteMode, RouteMetrics, RouteLeg } from '@/types/poi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.105:7001/api';

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
     * Optimize route sequence for given POIs and start location
     */
    optimize: async (
        points: PointOfInterest[],
        startLocation: PointOfInterest | null,
        routeMode: RouteMode = 'loop',
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
                startLocation: startLocation ? {
                    id: startLocation.id,
                    name: startLocation.name,
                    lat: startLocation.lat,
                    lng: startLocation.lng,
                } : null,
                routeMode: routeMode === 'one-way' ? 'OneWay' : 'Loop',
                optimizeSequence,
                manualSequence: optimizeSequence ? null : points.map(p => p.id),
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend API returned ${response.status}`);
        }

        const data = await response.json();

        // Normalize routeMode from backend (PascalCase) to frontend (lowercase)
        const normalizeRouteMode = (mode: string): RouteMode => {
            const normalized = mode.toLowerCase();
            if (normalized === 'loop') return 'loop';
            if (normalized === 'oneway' || normalized === 'one-way') return 'one-way';
            return 'loop'; // Default fallback
        };

        return {
            ...data,
            routeMode: normalizeRouteMode(data.routeMode)
        };
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
        startLocation: PointOfInterest | null,
        metrics: RouteMetrics | null = null,
        mapImageBase64: string | null = null
    ): Promise<Blob> => {
        const response = await fetch(`${API_URL}/export/pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                route: {
                    ...route,
                    routeMode: route.routeMode === 'one-way' ? 'OneWay' : 'Loop'
                },
                points: points.map(p => ({
                    id: p.id,
                    name: p.name,
                    lat: p.lat,
                    lng: p.lng,
                })),
                startLocation: startLocation ? {
                    id: startLocation.id,
                    name: startLocation.name,
                    lat: startLocation.lat,
                    lng: startLocation.lng,
                } : null,
                metrics: metrics ? {
                    totalDistanceKm: metrics.totalDistanceKm,
                    totalDurationMin: metrics.totalDurationMin,
                    legs: metrics.legs?.map((leg: RouteLeg) => ({
                        fromId: leg.fromId,
                        toId: leg.toId,
                        distanceKm: leg.distanceKm,
                        durationMin: leg.durationMin
                    }))
                } : null,
                mapImageBase64
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
