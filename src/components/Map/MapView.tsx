'use client';

import { useRef } from 'react';
import MapViewClass from '@arcgis/core/views/MapView';
import { useStore } from '@/store/useStore';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapClickHandler } from './hooks/useMapClickHandler';
import { usePoiLayer } from './hooks/usePoiLayer';
import { useRouteLayer } from './hooks/useRouteLayer';
import { useLodgingZoneLayer } from './hooks/useLodgingZoneLayer';

// Import ArcGIS CSS
import '@arcgis/core/assets/esri/themes/light/main.css';

interface MapViewComponentProps {
    onMapReady?: (view: MapViewClass) => void;
}

export function MapViewComponent({ onMapReady }: MapViewComponentProps) {
    const mapDiv = useRef<HTMLDivElement>(null);
    const { points, hotel, route, lodgingZone, addPoint } = useStore();

    // Initialize map and layers
    const { viewRef, layersRef } = useMapInitialization(mapDiv, onMapReady);

    // Handle map click to add POI
    useMapClickHandler(viewRef, points.length, addPoint);

    // Sync POI graphics (including hotel)
    usePoiLayer(
        { current: layersRef.current?.poiLayer || null },
        points,
        hotel
    );

    // Sync route graphics
    useRouteLayer(
        { current: layersRef.current?.routeLayer || null },
        route,
        points,
        hotel
    );

    // Sync lodging zone graphics
    useLodgingZoneLayer(
        { current: layersRef.current?.lodgingLayer || null },
        lodgingZone
    );

    return (
        <div
            ref={mapDiv}
            className="w-full h-full min-h-[400px]"
            style={{ position: 'relative' }}
        />
    );
}

export default MapViewComponent;
