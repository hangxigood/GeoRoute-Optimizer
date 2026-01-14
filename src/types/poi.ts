export interface PointOfInterest {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address?: string;
    category?: string;
    isHotel?: boolean;
}

export interface LodgingZone {
    centroid: {
        lat: number;
        lng: number;
    };
    bufferRadiusKm: number;
    bookingLinks: {
        bookingCom: string;
        airbnb: string;
    };
}

export interface OptimizedRoute {
    sequence: string[]; // List of POI IDs
    legs: RouteLeg[];
    totalDistanceKm: number;
    totalDurationMin: number;
    isRoundTrip: boolean;
}

export interface RouteLeg {
    from: string; // ID or "hotel"
    to: string; // ID or "hotel"
    distanceKm: number;
    durationMin: number;
}
