import { useEffect } from 'react';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type { PointOfInterest } from '@/types/poi';
import { createPoiGraphic, createStartLocationGraphic } from '../utils/graphicCreators';

export function usePoiLayer(
    layerRef: React.RefObject<GraphicsLayer | null>,
    points: PointOfInterest[],
    startLocation: PointOfInterest | null
) {
    useEffect(() => {
        const layer = layerRef.current;
        if (!layer) return;

        layer.removeAll();

        // Add POI markers with numbered labels
        points.forEach((poi, index) => {
            const graphics = createPoiGraphic(poi, index);
            graphics.forEach((graphic) => layer.add(graphic));
        });

        // Add start location marker if set
        if (startLocation) {
            const startGraphics = createStartLocationGraphic(startLocation);
            startGraphics.forEach((graphic) => layer.add(graphic));
        }
    }, [layerRef, points, startLocation]);
}

