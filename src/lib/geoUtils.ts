// Helper: Generate unique ID for POIs
export function generatePoiId(): string {
    return `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
