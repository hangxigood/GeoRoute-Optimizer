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
    const { points, startLocation, route, lodgingZone, addPoint } = useStore();

    // Initialize map and layers
    const { viewRef, layersRef } = useMapInitialization(mapDiv, onMapReady);

    // Handle map click to add POI
    useMapClickHandler(viewRef, points.length, addPoint);

    // Sync POI graphics (including start location)
    usePoiLayer(
        { current: layersRef.current?.poiLayer || null },
        points,
        startLocation
    );

    // Sync route graphics
    useRouteLayer(
        { current: layersRef.current?.routeLayer || null },
        route,
        points,
        startLocation
    );

    // Sync lodging zone graphics
    useLodgingZoneLayer(
        { current: layersRef.current?.lodgingLayer || null },
        lodgingZone
    );

    // Handle reset view to show all POIs
    const handleResetView = () => {
        const view = viewRef.current;
        const poiLayer = layersRef.current?.poiLayer;

        if (!view || !poiLayer) return;

        // If there are graphics, zoom to them
        if (poiLayer.graphics.length > 0) {
            view.goTo(poiLayer.graphics.toArray(), {
                duration: 500,
                easing: 'ease-in-out'
            });
        }
    };

    return (
        <div
            ref={mapDiv}
            className="w-full h-full min-h-[400px]"
            style={{ position: 'relative' }}
        >
            {/* Reset View Button */}
            {(points.length > 0 || startLocation) && (
                <button
                    onClick={handleResetView}
                    className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                    title="Reset view to show all points"
                    aria-label="Reset view"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}

export default MapViewComponent;
