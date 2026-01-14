import { useEffect } from 'react';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type { PointOfInterest } from '@/types/poi';
import { createPoiGraphic, createHotelGraphic } from '../utils/graphicCreators';

export function usePoiLayer(
    layerRef: React.RefObject<GraphicsLayer | null>,
    points: PointOfInterest[],
    hotel: PointOfInterest | null
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

        // Add hotel marker if set
        if (hotel) {
            const hotelGraphics = createHotelGraphic(hotel);
            hotelGraphics.forEach((graphic) => layer.add(graphic));
        }
    }, [layerRef, points, hotel]);
}
