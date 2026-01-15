import { create } from 'zustand';
import type { PointOfInterest, LodgingZone, OptimizedRoute, RouteMode, RouteMetrics } from '@/types/poi';
import { api } from '@/services/api';

interface AppState {
    // State
    points: PointOfInterest[];
    startLocation: PointOfInterest | null;
    routeMode: RouteMode;
    lodgingZone: LodgingZone | null;
    route: OptimizedRoute | null;
    routeMetrics: RouteMetrics | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    addPoint: (poi: PointOfInterest) => void;
    removePoint: (id: string) => void;
    updatePoint: (id: string, updates: Partial<PointOfInterest>) => void;
    setPoints: (points: PointOfInterest[]) => void;
    reorderPoints: (fromIndex: number, toIndex: number) => void;
    setStartLocation: (location: PointOfInterest | null) => void;
    setRouteMode: (mode: RouteMode) => void;
    setLodgingZone: (zone: LodgingZone | null) => void;
    setRoute: (route: OptimizedRoute | null) => void;
    setRouteMetrics: (metrics: RouteMetrics | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearAll: () => void;

    // Async Actions
    calculateLodgingZone: (bufferRadiusKm?: number) => Promise<LodgingZone | null>;
    optimizeRoute: (optimizeSequence?: boolean) => Promise<OptimizedRoute | null>;
}

export const useStore = create<AppState>((set, get) => ({
    // Initial state
    points: [],
    startLocation: null,
    routeMode: 'loop',
    lodgingZone: null,
    route: null,
    routeMetrics: null,
    isLoading: false,
    error: null,

    // Actions
    addPoint: (poi) =>
        set((state) => ({
            points: [...state.points, poi],
            // Clear route when points change
            route: null,
        })),

    removePoint: (id) =>
        set((state) => ({
            points: state.points.filter((p) => p.id !== id),
            route: null,
        })),

    updatePoint: (id, updates) =>
        set((state) => ({
            points: state.points.map((p) =>
                p.id === id ? { ...p, ...updates } : p
            ),
            route: null,
        })),

    setPoints: (points) => set({ points, route: null }),

    reorderPoints: (fromIndex, toIndex) =>
        set((state) => {
            const newPoints = [...state.points];
            const [removed] = newPoints.splice(fromIndex, 1);
            newPoints.splice(toIndex, 0, removed);
            return { points: newPoints, route: null };
        }),

    setStartLocation: (location) => set({ startLocation: location, route: null }),

    setRouteMode: (mode) => set({ routeMode: mode, route: null }),

    setLodgingZone: (zone) => set({ lodgingZone: zone }),

    setRoute: (route) => set({ route }),

    setRouteMetrics: (metrics) => set({ routeMetrics: metrics }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    clearAll: () =>
        set({
            points: [],
            startLocation: null,
            routeMode: 'loop',
            lodgingZone: null,
            route: null,
            routeMetrics: null,
            error: null,
        }),

    // Async Actions
    calculateLodgingZone: async (bufferRadiusKm = 5) => {
        const { points } = get();

        if (points.length < 2) {
            set({ error: 'Need at least 2 points to calculate lodging zone' });
            return null;
        }

        set({ isLoading: true, error: null });

        try {
            const zone = await api.lodging.calculate(points, bufferRadiusKm);
            set({ lodgingZone: zone, isLoading: false });
            return zone;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to calculate lodging zone';
            set({
                error: `Backend unavailable: ${errorMessage}. Please start the backend server.`,
                isLoading: false
            });
            return null;
        }
    },

    optimizeRoute: async (optimizeSequence = true) => {
        const { points, startLocation, routeMode } = get();

        if (points.length < 1) {
            set({ error: 'Need at least 1 point to calculate route' });
            return null;
        }

        if (!startLocation && optimizeSequence) {
            set({ error: 'Please set a start location first' });
            return null;
        }

        set({ isLoading: true, error: null });

        try {
            const route = await api.route.optimize(points, startLocation, routeMode, optimizeSequence);

            // Reorder points based on the optimized sequence
            if (route && route.sequence && route.sequence.length > 0) {
                const pointsMap = new Map(points.map(p => [p.id, p]));
                const reorderedPoints = route.sequence
                    .map(id => pointsMap.get(id))
                    .filter((p): p is PointOfInterest => p !== undefined);

                set({ route, points: reorderedPoints, isLoading: false });
            } else {
                set({ route, isLoading: false });
            }

            return route;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to optimize route';
            set({
                error: `Backend unavailable: ${errorMessage}. Please start the backend server.`,
                isLoading: false
            });
            return null;
        }
    }
}));


