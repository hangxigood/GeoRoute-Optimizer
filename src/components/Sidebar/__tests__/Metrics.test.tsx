import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import Metrics from '../Metrics';
import { useStore } from '@/store/useStore';

vi.mock('@/store/useStore');

describe('Metrics', () => {
    const mockSetLodgingZone = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when no data', () => {
        (useStore as unknown as Mock).mockReturnValue({
            route: null,
            routeMetrics: null,
            lodgingZone: null,
            setLodgingZone: mockSetLodgingZone
        });

        const { container } = render(<Metrics />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders route metrics when available', () => {
        (useStore as unknown as Mock).mockReturnValue({
            route: { routeMode: 'loop' },
            routeMetrics: {
                totalDistanceKm: 10.5,
                totalDurationMin: 90,
                legs: []
            },
            lodgingZone: null,
            setLodgingZone: mockSetLodgingZone
        });

        render(<Metrics />);

        expect(screen.getByText('10.5')).toBeInTheDocument();
        expect(screen.getByText('1h 30m')).toBeInTheDocument();
        expect(screen.getByText(/loop trip/i)).toBeInTheDocument();
    });

    it('renders lodging zone when available', () => {
        (useStore as unknown as Mock).mockReturnValue({
            route: null,
            routeMetrics: null,
            lodgingZone: {
                bufferRadiusKm: 5,
                bookingLinks: {
                    bookingCom: 'http://booking.com',
                    airbnb: 'http://airbnb.com'
                }
            },
            setLodgingZone: mockSetLodgingZone
        });

        render(<Metrics />);

        expect(screen.getByText(/stay within 5km/i)).toBeInTheDocument();
        expect(screen.getByText('Booking.com')).toHaveAttribute('href', 'http://booking.com');
    });

    it('renders formatted duration correctly', () => {
        // 45 mins -> 45min
        (useStore as unknown as Mock).mockReturnValue({
            route: { routeMode: 'one-way' },
            routeMetrics: {
                totalDistanceKm: 5,
                totalDurationMin: 45,
                legs: []
            },
            lodgingZone: null,
            setLodgingZone: mockSetLodgingZone
        });

        render(<Metrics />);
        expect(screen.getByText('45min')).toBeInTheDocument();
    });
});
