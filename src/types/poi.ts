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

// Backend response - only contains sequence and mode
export interface OptimizedRoute {
    sequence: string[]; // List of POI IDs
    routeMode: RouteMode;
}

// Frontend-calculated metrics from ArcGIS Route Service
export interface RouteLeg {
    fromId: string;
    toId: string;
    distanceKm: number;
    durationMin: number;
}

export interface RouteMetrics {
    totalDistanceKm: number;
    totalDurationMin: number;
    legs?: RouteLeg[];
}

