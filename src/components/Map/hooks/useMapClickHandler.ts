import { useEffect } from 'react';
import MapViewClass from '@arcgis/core/views/MapView';
import { generatePoiId } from '@/lib/geoUtils';
import type { PointOfInterest } from '@/types/poi';

export function useMapClickHandler(
    viewRef: React.RefObject<MapViewClass | null>,
    pointsLength: number,
    addPoint: (poi: PointOfInterest) => void
) {
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        const handle = view.on('click', (event) => {
            const { mapPoint } = event;
            if (!mapPoint) return;

            const newPoi: PointOfInterest = {
                id: generatePoiId(),
                name: `Point ${pointsLength + 1}`,
                lat: mapPoint.latitude,
                lng: mapPoint.longitude,
            };
            addPoint(newPoi);
        });

        return () => handle.remove();
    }, [viewRef, pointsLength, addPoint]);
}
