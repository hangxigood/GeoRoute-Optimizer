import { useEffect } from 'react';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type { PointOfInterest, OptimizedRoute } from '@/types/poi';
import { createRouteGraphic } from '../utils/graphicCreators';

export function useRouteLayer(
    layerRef: React.RefObject<GraphicsLayer | null>,
    route: OptimizedRoute | null,
    points: PointOfInterest[],
    startLocation: PointOfInterest | null
) {
    useEffect(() => {
        const layer = layerRef.current;
        if (!layer) return;

        layer.removeAll();

        if (!route || route.sequence.length < 2) return;

        // Build path from sequence
        const pathCoords: [number, number][] = [];

        // Start from start location if exists
        if (startLocation) {
            pathCoords.push([startLocation.lng, startLocation.lat]);
        }

        // Add each stop in sequence
        route.sequence.forEach((id: string) => {
            const poi = points.find((p) => p.id === id);
            if (poi) {
                pathCoords.push([poi.lng, poi.lat]);
            }
        });

        // Return to start location if loop mode
        if (startLocation && route.routeMode === 'loop') {
            pathCoords.push([startLocation.lng, startLocation.lat]);
        }

        const routeGraphic = createRouteGraphic(pathCoords);
        if (routeGraphic) {
            layer.add(routeGraphic);
        }
    }, [layerRef, route, points, startLocation]);
}

