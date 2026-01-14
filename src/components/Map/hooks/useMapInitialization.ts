import { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapViewClass from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { MAP_DEFAULTS } from '@/lib/arcgis-config';

export interface MapLayers {
    poiLayer: GraphicsLayer;
    routeLayer: GraphicsLayer;
    lodgingLayer: GraphicsLayer;
}

export function useMapInitialization(
    mapDiv: React.RefObject<HTMLDivElement | null>,
    onMapReady?: (view: MapViewClass) => void
) {
    const viewRef = useRef<MapViewClass | null>(null);
    const layersRef = useRef<MapLayers | null>(null);

    useEffect(() => {
        if (!mapDiv.current || viewRef.current) return;

        // Create layers
        const poiLayer = new GraphicsLayer({ id: 'poi-layer', title: 'Points of Interest' });
        const routeLayer = new GraphicsLayer({ id: 'route-layer', title: 'Route' });
        const lodgingLayer = new GraphicsLayer({ id: 'lodging-layer', title: 'Lodging Zone' });

        layersRef.current = { poiLayer, routeLayer, lodgingLayer };

        const map = new Map({
            basemap: MAP_DEFAULTS.basemap,
            layers: [lodgingLayer, routeLayer, poiLayer],
        });

        const view = new MapViewClass({
            container: mapDiv.current,
            map,
            center: MAP_DEFAULTS.center,
            zoom: MAP_DEFAULTS.zoom,
            ui: {
                components: ['zoom', 'compass'],
            },
        });

        viewRef.current = view;

        view.when(() => {
            onMapReady?.(view);
        });

        return () => {
            view.destroy();
            viewRef.current = null;
            layersRef.current = null;
        };
    }, [mapDiv, onMapReady]);

    return { viewRef, layersRef };
}
