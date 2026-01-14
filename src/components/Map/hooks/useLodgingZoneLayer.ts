import { useEffect } from 'react';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type { LodgingZone } from '@/types/poi';
import { createLodgingZoneGraphics } from '../utils/graphicCreators';

export function useLodgingZoneLayer(
    layerRef: React.RefObject<GraphicsLayer | null>,
    lodgingZone: LodgingZone | null
) {
    useEffect(() => {
        const layer = layerRef.current;
        if (!layer) return;

        layer.removeAll();

        if (!lodgingZone) return;

        const graphics = createLodgingZoneGraphics(
            lodgingZone.centroid,
            lodgingZone.bufferRadiusKm
        );
        graphics.forEach((graphic) => layer.add(graphic));
    }, [layerRef, lodgingZone]);
}
