import { useEffect } from 'react';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type { PointOfInterest, OptimizedRoute } from '@/types/poi';
import { createRouteGraphic } from '../utils/graphicCreators';

export function useRouteLayer(
    layerRef: React.RefObject<GraphicsLayer | null>,
    route: OptimizedRoute | null,
    points: PointOfInterest[],
    hotel: PointOfInterest | null
) {
    useEffect(() => {
        const layer = layerRef.current;
        if (!layer) return;

        layer.removeAll();

        if (!route || route.sequence.length < 2) return;

        // Build path from sequence
        const pathCoords: [number, number][] = [];

        // Start from hotel if exists
        if (hotel) {
            pathCoords.push([hotel.lng, hotel.lat]);
        }

        // Add each stop in sequence
        route.sequence.forEach((id: string) => {
            const poi = points.find((p) => p.id === id);
            if (poi) {
                pathCoords.push([poi.lng, poi.lat]);
            }
        });

        // Return to hotel if round trip
        if (hotel && route.isRoundTrip) {
            pathCoords.push([hotel.lng, hotel.lat]);
        }

        const routeGraphic = createRouteGraphic(pathCoords);
        if (routeGraphic) {
            layer.add(routeGraphic);
        }
    }, [layerRef, route, points, hotel]);
}
