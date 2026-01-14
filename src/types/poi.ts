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

// Route mode options
export type RouteMode = 'loop' | 'one-way';

export interface OptimizedRoute {
    sequence: string[]; // List of POI IDs
    legs: RouteLeg[];
    totalDistanceKm: number;
    totalDurationMin: number;
    routeMode: RouteMode;
}

export interface RouteLeg {
    from: string; // ID or "start"
    to: string;   // ID or "start"
    distanceKm: number;
    durationMin: number;
}

