import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import PoiList from '../PoiList';
import { useStore } from '@/store/useStore';

// Mock the dependencies
vi.mock('@/store/useStore');
vi.mock('framer-motion', () => ({
    Reorder: {
        Group: ({ children }: { children: React.ReactNode; onReorder?: (newOrder: unknown[]) => void }) => (
            <div data-testid="reorder-group">
                {children}
            </div>
        ),
        Item: ({ children, value }: { children: React.ReactNode; value: { id: string } }) => (
            <div data-testid={`reorder-item-${value.id}`}>
                {children}
            </div>
        ),
    },
    useDragControls: () => ({
        start: vi.fn(),
    }),
}));

// Mock the child component to simplify testing
vi.mock('../RouteModeToggle', () => ({
    default: () => <div data-testid="route-mode-toggle">Toggle</div>
}));

describe('PoiList', () => {
    const mockPoints = [
        { id: 'p1', name: 'Point 1', lat: 10, lng: 10, isActive: true },
        { id: 'p2', name: 'Point 2', lat: 20, lng: 20, isActive: true },
    ];

    const mockStore = {
        points: mockPoints,
        startLocation: null,
        setStartLocation: vi.fn(),
        removePoint: vi.fn(),
        updatePointName: vi.fn(),
        reorderPoints: vi.fn(),
        togglePointActive: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as unknown as Mock).mockReturnValue(mockStore);
    });

    it('renders list of points', () => {
        render(<PoiList mapView={null} />);

        // Implementation uses <p>Point 1</p> so getByText should work
        expect(screen.getByText('Point 1')).toBeInTheDocument();
        expect(screen.getByText('Point 2')).toBeInTheDocument();
    });

    it('handles removing a point', () => {
        render(<PoiList mapView={null} />);

        const removeButtons = screen.getAllByTitle('Remove');
        fireEvent.click(removeButtons[0]);

        expect(mockStore.removePoint).toHaveBeenCalledWith('p1');
    });

    it('handles setting a point as start location', () => {
        render(<PoiList mapView={null} />);

        const setStartButtons = screen.getAllByTitle('Set as start location');
        fireEvent.click(setStartButtons[0]);

        // Component adds isHotel: true when setting start location via this button
        expect(mockStore.setStartLocation).toHaveBeenCalledWith(expect.objectContaining({
            id: mockPoints[0].id
        }));
    });

    it('handles toggling active state', () => {
        render(<PoiList mapView={null} />);

        // Title depends on active state. mockPoints are active so title is "Deactivate POI"
        const toggleButtons = screen.getAllByTitle('Deactivate POI');
        fireEvent.click(toggleButtons[0]);

        expect(mockStore.togglePointActive).toHaveBeenCalledWith('p1');
    });

    it('renders start location section when set', () => {
        const startLocationMock = { id: 'start', name: 'Start Point', lat: 0, lng: 0 };
        (useStore as unknown as Mock).mockReturnValue({
            ...mockStore,
            startLocation: startLocationMock,
        });

        render(<PoiList mapView={null} />);

        expect(screen.getByText('Start Point')).toBeInTheDocument();
        expect(screen.getByTitle('Remove start location')).toBeInTheDocument();
    });

    it('handles clearing start location', () => {
        const startLocationMock = { id: 'start', name: 'Start Point', lat: 0, lng: 0 };
        (useStore as unknown as Mock).mockReturnValue({
            ...mockStore,
            startLocation: startLocationMock,
        });

        render(<PoiList mapView={null} />);

        const clearButton = screen.getByTitle('Remove start location');
        fireEvent.click(clearButton);

        expect(mockStore.setStartLocation).toHaveBeenCalledWith(null);
    });
});
