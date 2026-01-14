import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Circle from '@arcgis/core/geometry/Circle';
import Polyline from '@arcgis/core/geometry/Polyline';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import { POI_SYMBOL, HOTEL_SYMBOL, ROUTE_SYMBOL, LODGING_ZONE_SYMBOL } from '@/lib/arcgis-config';
import type { PointOfInterest } from '@/types/poi';

/**
 * Creates a POI marker graphic with a numbered label
 */
export function createPoiGraphic(poi: PointOfInterest, index: number): Graphic[] {
    const point = new Point({
        longitude: poi.lng,
        latitude: poi.lat,
    });

    const markerGraphic = new Graphic({
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

    const labelGraphic = new Graphic({
        geometry: point,
        symbol: new TextSymbol({
            color: 'white',
            text: String(index + 1),
            font: { size: 10, weight: 'bold' },
            yoffset: 0,
        }),
    });

    return [markerGraphic, labelGraphic];
}

/**
 * Creates a hotel marker graphic with icon label
 */
export function createHotelGraphic(hotel: PointOfInterest): Graphic[] {
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

    const hotelLabel = new Graphic({
        geometry: hotelPoint,
        symbol: new TextSymbol({
            color: 'white',
            text: '🏨',
            font: { size: 10 },
            yoffset: 0,
        }),
    });

    return [hotelGraphic, hotelLabel];
}

/**
 * Creates a route polyline graphic
 */
export function createRouteGraphic(pathCoords: [number, number][]): Graphic | null {
    if (pathCoords.length < 2) return null;

    const polyline = new Polyline({
        paths: [pathCoords],
    });

    return new Graphic({
        geometry: polyline,
        symbol: new SimpleLineSymbol({
            color: ROUTE_SYMBOL.color,
            width: ROUTE_SYMBOL.width,
            style: ROUTE_SYMBOL.style,
        }),
    });
}

/**
 * Creates lodging zone graphics (circle + centroid marker)
 */
export function createLodgingZoneGraphics(
    centroid: { lng: number; lat: number },
    bufferRadiusKm: number
): Graphic[] {
    const center = new Point({
        longitude: centroid.lng,
        latitude: centroid.lat,
    });

    const circle = new Circle({
        center,
        radius: bufferRadiusKm * 1000,
        radiusUnit: 'meters',
    });

    const zoneGraphic = new Graphic({
        geometry: circle,
        symbol: new SimpleFillSymbol({
            color: LODGING_ZONE_SYMBOL.color,
            outline: LODGING_ZONE_SYMBOL.outline,
        }),
    });

    const centroidGraphic = new Graphic({
        geometry: center,
        symbol: new SimpleMarkerSymbol({
            color: [34, 197, 94],
            size: 10,
            outline: { color: 'white', width: 2 },
        }),
        popupTemplate: {
            title: 'Best Stay Area',
            content: `${bufferRadiusKm}km radius`,
        },
    });

    return [zoneGraphic, centroidGraphic];
}
