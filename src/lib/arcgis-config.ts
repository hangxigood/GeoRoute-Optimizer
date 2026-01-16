// ArcGIS Maps SDK Configuration
import esriConfig from '@arcgis/core/config';

// Configure ArcGIS API key from environment
if (typeof window !== 'undefined') {
    esriConfig.apiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY || '';
}

// Default map settings
export const MAP_DEFAULTS = {
    basemap: 'streets-navigation-vector',
    center: [-98.5795, 39.8283] as [number, number], // Center of USA
    zoom: 4,
};

// Search widget configuration
export const SEARCH_CONFIG = {
    geocodeServiceUrl: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
    placeholder: 'Search for a place...',
};

// Visual styling
export const POI_SYMBOL = {
    type: 'simple-marker' as const,
    color: [59, 130, 246], // Blue
    size: 12,
    outline: {
        color: [255, 255, 255],
        width: 2,
    },
};

export const HOTEL_SYMBOL = {
    type: 'simple-marker' as const,
    color: [239, 68, 68], // Red
    size: 14,
    outline: {
        color: [255, 255, 255],
        width: 2,
    },
};

export const ROUTE_SYMBOL = {
    type: 'simple-line' as const,
    color: [59, 130, 246, 0.8],
    width: 4,
    style: 'solid' as const,
};

export const LODGING_ZONE_SYMBOL = {
    type: 'simple-fill' as const,
    color: [34, 197, 94, 0.15], // Green with transparency
    outline: {
        color: [34, 197, 94],
        width: 2,
    },
};
