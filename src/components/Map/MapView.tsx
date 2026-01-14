'use client';

import { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapViewClass from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Circle from '@arcgis/core/geometry/Circle';
import Polyline from '@arcgis/core/geometry/Polyline';
import { MAP_DEFAULTS, POI_SYMBOL, HOTEL_SYMBOL, ROUTE_SYMBOL, LODGING_ZONE_SYMBOL } from '@/lib/arcgis-config';
import { useStore } from '@/store/useStore';
import { generatePoiId } from '@/lib/geoUtils';
import type { PointOfInterest } from '@/types/poi';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';

// Import ArcGIS CSS
import '@arcgis/core/assets/esri/themes/light/main.css';

interface MapViewComponentProps {
    onMapReady?: (view: MapViewClass) => void;
}

export function MapViewComponent({ onMapReady }: MapViewComponentProps) {
    const mapDiv = useRef<HTMLDivElement>(null);
    const viewRef = useRef<MapViewClass | null>(null);
    const poiLayerRef = useRef<GraphicsLayer | null>(null);
    const routeLayerRef = useRef<GraphicsLayer | null>(null);
    const lodgingLayerRef = useRef<GraphicsLayer | null>(null);

    const { points, hotel, route, lodgingZone, addPoint } = useStore();

    // Initialize map
    useEffect(() => {
        if (!mapDiv.current || viewRef.current) return;

        // Create layers inside effect
        const poiLayer = new GraphicsLayer({ id: 'poi-layer', title: 'Points of Interest' });
        const routeLayer = new GraphicsLayer({ id: 'route-layer', title: 'Route' });
        const lodgingLayer = new GraphicsLayer({ id: 'lodging-layer', title: 'Lodging Zone' });

        poiLayerRef.current = poiLayer;
        routeLayerRef.current = routeLayer;
        lodgingLayerRef.current = lodgingLayer;

        const map = new Map({
            basemap: MAP_DEFAULTS.basemap,
            layers: [lodgingLayer, routeLayer, poiLayer], // Add layers during construction
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
            poiLayerRef.current = null;
            routeLayerRef.current = null;
            lodgingLayerRef.current = null;
        };
    }, [onMapReady]);

    // Handle map click to add POI
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        const handle = view.on('click', (event) => {
            const { mapPoint } = event;
            if (!mapPoint) return;

            const newPoi: PointOfInterest = {
                id: generatePoiId(),
                name: `Point ${points.length + 1}`,
                lat: mapPoint.latitude,
                lng: mapPoint.longitude,
            };
            addPoint(newPoi);
        });

        return () => handle.remove();
    }, [points.length, addPoint]);

    // Sync POI graphics
    useEffect(() => {
        const layer = poiLayerRef.current;
        if (!layer) return;

        layer.removeAll();

        // Add POI markers with numbered labels
        points.forEach((poi, index) => {
            const point = new Point({
                longitude: poi.lng,
                latitude: poi.lat,
            });

            const graphic = new Graphic({
                geometry: point,
                symbol: new SimpleMarkerSymbol({
                    color: POI_SYMBOL.color,
                    size: POI_SYMBOL.size,
                    outline: POI_SYMBOL.outline,
                }),
                attributes: { id: poi.id, name: poi.name, index },
                popupTemplate: {
                    title: poi.name,
                    content: `Stop #${index + 1}`,
                },
            });
            layer.add(graphic);

            // Add number label
            const labelGraphic = new Graphic({
                geometry: point,
                symbol: new TextSymbol({
                    color: 'white',
                    text: String(index + 1),
                    font: { size: 10, weight: 'bold' },
                    yoffset: 0,
                }),
            });
            layer.add(labelGraphic);
        });

        // Add hotel marker if set
        if (hotel) {
            const hotelPoint = new Point({
                longitude: hotel.lng,
                latitude: hotel.lat,
            });

            const hotelGraphic = new Graphic({
                geometry: hotelPoint,
                symbol: new SimpleMarkerSymbol({
                    color: HOTEL_SYMBOL.color,
                    size: HOTEL_SYMBOL.size,
                    outline: HOTEL_SYMBOL.outline,
                }),
                attributes: { id: hotel.id, name: hotel.name, isHotel: true },
                popupTemplate: {
                    title: hotel.name,
                    content: 'Your Hotel',
                },
            });
            layer.add(hotelGraphic);

            // Hotel icon label
            const hotelLabel = new Graphic({
                geometry: hotelPoint,
                symbol: new TextSymbol({
                    color: 'white',
                    text: '🏨',
                    font: { size: 10 },
                    yoffset: 0,
                }),
            });
            layer.add(hotelLabel);
        }
    }, [points, hotel]);

    // Sync route graphics
    useEffect(() => {
        const layer = routeLayerRef.current;
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
        route.sequence.forEach((id) => {
            const poi = points.find((p) => p.id === id);
            if (poi) {
                pathCoords.push([poi.lng, poi.lat]);
            }
        });

        // Return to hotel if round trip
        if (hotel && route.isRoundTrip) {
            pathCoords.push([hotel.lng, hotel.lat]);
        }

        if (pathCoords.length >= 2) {
            const polyline = new Polyline({
                paths: [pathCoords],
            });

            const routeGraphic = new Graphic({
                geometry: polyline,
                symbol: new SimpleLineSymbol({
                    color: ROUTE_SYMBOL.color,
                    width: ROUTE_SYMBOL.width,
                    style: ROUTE_SYMBOL.style,
                }),
            });
            layer.add(routeGraphic);
        }
    }, [route, points, hotel]);

    // Sync lodging zone graphics
    useEffect(() => {
        const layer = lodgingLayerRef.current;
        if (!layer) return;

        layer.removeAll();

        if (!lodgingZone) return;

        const center = new Point({
            longitude: lodgingZone.centroid.lng,
            latitude: lodgingZone.centroid.lat,
        });

        // Create circle buffer (radius in meters)
        const circle = new Circle({
            center,
            radius: lodgingZone.bufferRadiusKm * 1000,
            radiusUnit: 'meters',
        });

        const zoneGraphic = new Graphic({
            geometry: circle,
            symbol: new SimpleFillSymbol({
                color: LODGING_ZONE_SYMBOL.color,
                outline: LODGING_ZONE_SYMBOL.outline,
            }),
        });
        layer.add(zoneGraphic);

        // Add centroid marker
        const centroidGraphic = new Graphic({
            geometry: center,
            symbol: new SimpleMarkerSymbol({
                color: [34, 197, 94],
                size: 10,
                outline: { color: 'white', width: 2 },
            }),
            popupTemplate: {
                title: 'Best Stay Area',
                content: `${lodgingZone.bufferRadiusKm}km radius`,
            },
        });
        layer.add(centroidGraphic);
    }, [lodgingZone]);

    return (
        <div
            ref={mapDiv}
            className="w-full h-full min-h-[400px]"
            style={{ position: 'relative' }}
        />
    );
}

export default MapViewComponent;
