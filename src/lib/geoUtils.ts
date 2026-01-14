import type { LodgingZone, OptimizedRoute } from '@/types/poi';

// Helper: Generate unique ID for POIs
export function generatePoiId(): string {
    return `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Haversine distance in km
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Client-side fallback: Calculate centroid
export function calculateCentroidClientSide(
    points: { lat: number; lng: number }[],
    bufferRadiusKm: number
): LodgingZone {
    const sumLat = points.reduce((sum, p) => sum + p.lat, 0);
    const sumLng = points.reduce((sum, p) => sum + p.lng, 0);
    const centroid = {
        lat: sumLat / points.length,
        lng: sumLng / points.length,
    };

    return {
        centroid,
        bufferRadiusKm,
        bookingLinks: {
            bookingCom: `https://www.booking.com/searchresults.html?ss=${centroid.lat},${centroid.lng}&radius=${bufferRadiusKm}`,
            airbnb: `https://www.airbnb.com/s/homes?lat=${centroid.lat}&lng=${centroid.lng}`,
        },
    };
}

// Client-side fallback: Simple nearest neighbor route
export function calculateRouteClientSide(
    points: { id: string; name: string; lat: number; lng: number }[],
    hotel: { lat: number; lng: number } | null
): OptimizedRoute {
    if (points.length === 0) {
        return {
            sequence: [],
            legs: [],
            totalDistanceKm: 0,
            totalDurationMin: 0,
            isRoundTrip: !!hotel,
        };
    }

    // Simple nearest neighbor from hotel or first point
    const start = hotel || points[0];
    const remaining = [...points];
    const sequence: string[] = [];
    const legs: { from: string; to: string; distanceKm: number; durationMin: number }[] = [];

    let current = { lat: start.lat, lng: start.lng, id: hotel ? 'hotel' : points[0].id };

    while (remaining.length > 0) {
        // Find nearest
        let nearestIdx = 0;
        let nearestDist = Infinity;

        remaining.forEach((p, i) => {
            const dist = haversineDistance(current.lat, current.lng, p.lat, p.lng);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestIdx = i;
            }
        });

        const nearest = remaining.splice(nearestIdx, 1)[0];
        sequence.push(nearest.id);

        legs.push({
            from: current.id,
            to: nearest.id,
            distanceKm: nearestDist,
            durationMin: Math.round(nearestDist / 50 * 60), // Assume 50km/h average
        });

        current = { lat: nearest.lat, lng: nearest.lng, id: nearest.id };
    }

    // Return to hotel if set
    if (hotel) {
        const returnDist = haversineDistance(current.lat, current.lng, hotel.lat, hotel.lng);
        legs.push({
            from: current.id,
            to: 'hotel',
            distanceKm: returnDist,
            durationMin: Math.round(returnDist / 50 * 60),
        });
    }

    const totalDistanceKm = legs.reduce((sum, leg) => sum + leg.distanceKm, 0);
    const totalDurationMin = legs.reduce((sum, leg) => sum + leg.durationMin, 0);

    return {
        sequence,
        legs,
        totalDistanceKm,
        totalDurationMin,
        isRoundTrip: !!hotel,
    };
}
