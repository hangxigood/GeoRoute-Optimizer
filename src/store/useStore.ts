import { create } from 'zustand';
import type { PointOfInterest, LodgingZone, OptimizedRoute } from '@/types/poi';
import { api } from '@/services/api';

interface AppState {
    // State
    points: PointOfInterest[];
    hotel: PointOfInterest | null;
    lodgingZone: LodgingZone | null;
    route: OptimizedRoute | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    addPoint: (poi: PointOfInterest) => void;
    removePoint: (id: string) => void;
    updatePoint: (id: string, updates: Partial<PointOfInterest>) => void;
    setPoints: (points: PointOfInterest[]) => void;
    reorderPoints: (fromIndex: number, toIndex: number) => void;
    setHotel: (hotel: PointOfInterest | null) => void;
    setLodgingZone: (zone: LodgingZone | null) => void;
    setRoute: (route: OptimizedRoute | null) => void;
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
    hotel: null,
    lodgingZone: null,
    route: null,
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

    setHotel: (hotel) => set({ hotel, route: null }),

    setLodgingZone: (zone) => set({ lodgingZone: zone }),

    setRoute: (route) => set({ route }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    clearAll: () =>
        set({
            points: [],
            hotel: null,
            lodgingZone: null,
            route: null,
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
        const { points, hotel } = get();

        if (points.length < 1) {
            set({ error: 'Need at least 1 point to calculate route' });
            return null;
        }

        if (!hotel && optimizeSequence) {
            set({ error: 'Please set a hotel location first' });
            return null;
        }

        set({ isLoading: true, error: null });

        try {
            const route = await api.route.optimize(points, hotel, optimizeSequence);
            set({ route, isLoading: false });
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


