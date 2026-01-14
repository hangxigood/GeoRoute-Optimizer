import { useEffect, useRef } from 'react';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type { PointOfInterest, OptimizedRoute } from '@/types/poi';
import * as routeService from '@arcgis/core/rest/route';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import { ROUTE_SYMBOL } from '@/lib/arcgis-config';
import { useStore } from '@/store/useStore';


const ROUTE_SERVICE_URL = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World';

export function useRouteLayer(
    layerRef: React.RefObject<GraphicsLayer | null>,
    optimizedRoute: OptimizedRoute | null,
    points: PointOfInterest[],
    startLocation: PointOfInterest | null
) {
    const setRouteMetrics = useStore((state) => state.setRouteMetrics);
    const previousRouteRef = useRef<OptimizedRoute | null>(null);

    useEffect(() => {
        const layer = layerRef.current;
        if (!layer) return;

        layer.removeAll();

        if (!optimizedRoute || optimizedRoute.sequence.length < 2) {
            // Only clear metrics if we previously had a route
            if (previousRouteRef.current !== null) {
                // Check current state directly to avoid unnecessary updates
                if (useStore.getState().routeMetrics !== null) {
                    setRouteMetrics(null);
                }
                previousRouteRef.current = null;
            }
            return;
        }

        previousRouteRef.current = optimizedRoute;

        // Build ordered stops array
        const stops: Graphic[] = [];

        // Start from start location if exists
        if (startLocation) {
            stops.push(new Graphic({
                geometry: new Point({
                    longitude: startLocation.lng,
                    latitude: startLocation.lat
                }),
                attributes: { name: startLocation.name }
            }));
        }

        // Add each stop in sequence
        optimizedRoute.sequence.forEach((id: string) => {
            const poi = points.find((p) => p.id === id);
            if (poi) {
                stops.push(new Graphic({
                    geometry: new Point({
                        longitude: poi.lng,
                        latitude: poi.lat
                    }),
                    attributes: { name: poi.name }
                }));
            }
        });

        // Return to start location if loop mode
        if (startLocation && optimizedRoute.routeMode === 'loop') {
            stops.push(new Graphic({
                geometry: new Point({
                    longitude: startLocation.lng,
                    latitude: startLocation.lat
                }),
                attributes: { name: startLocation.name }
            }));
        }

        // Solve route using ArcGIS Route Service
        const routeParams = new RouteParameters({
            stops: new FeatureSet({ features: stops }),
            returnDirections: false,
            preserveFirstStop: true,
            preserveLastStop: true,
            outSpatialReference: { wkid: 4326 }
        });

        // Capture layer reference for async callback
        const currentLayer = layer;

        routeService.solve(ROUTE_SERVICE_URL, routeParams)
            .then((result: any) => {
                if (!currentLayer) return;

                // Clear previous graphics before adding new ones to avoid duplicates during rapid updates
                currentLayer.removeAll();

                if (result.routeResults.length > 0) {
                    const routeResult = result.routeResults[0].route;

                    console.log("ArcGIS Route Attributes:", routeResult.attributes);

                    // Ensure geometry is a Polyline instance if it's not already
                    const polylineGeometry = new Polyline(routeResult.geometry);

                    const routeGraphic = new Graphic({
                        geometry: polylineGeometry,
                        symbol: {
                            type: "simple-line",
                            color: [59, 130, 246], // Solid blue, no alpha to be safe
                            width: 4
                        } as any
                    });

                    console.log("Adding route graphic:", routeGraphic);
                    currentLayer.add(routeGraphic);

                    // Extract real metrics from ArcGIS (checking multiple possible keys)
                    const totalLength = routeResult.attributes.Total_Kilometers || routeResult.attributes.Total_Distance || 0;
                    // Try Total_Minutes, or Total_TravelTime, or Total_Time
                    const totalTime = routeResult.attributes.Total_Minutes || routeResult.attributes.Total_TravelTime || routeResult.attributes.Total_Time || 0;

                    // CHECK BEFORE SETTING: Only update if values differ effectively
                    // allowing for small floating point differences
                    const currentMetrics = useStore.getState().routeMetrics;
                    const isDistanceDifferent = !currentMetrics || Math.abs(currentMetrics.totalDistanceKm - totalLength) > 0.001;
                    const isTimeDifferent = !currentMetrics || Math.abs(currentMetrics.totalDurationMin - totalTime) > 0.1;

                    if (isDistanceDifferent || isTimeDifferent) {
                        console.log("Updating route metrics in store...");
                        setRouteMetrics({
                            totalDistanceKm: totalLength,
                            totalDurationMin: totalTime
                        });
                    } else {
                        console.log("Route metrics unchanged, skipping store update.");
                    }
                }
            })
            .catch((error: any) => {
                console.error('Route solving failed:', error);
                console.warn('Falling back to straight-line visualization');
            });



    }, [layerRef, optimizedRoute, points, startLocation]);

}
