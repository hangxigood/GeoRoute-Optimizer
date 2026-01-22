import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import RouteModeToggle from '../RouteModeToggle';
import { useStore } from '@/store/useStore';

vi.mock('@/store/useStore');

describe('RouteModeToggle', () => {
    const mockSetRouteMode = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly for loop mode', () => {
        (useStore as unknown as Mock).mockReturnValue({
            routeMode: 'loop',
            setRouteMode: mockSetRouteMode
        });

        render(<RouteModeToggle />);
        expect(screen.getByText('Loop')).toBeInTheDocument();
    });

    it('renders correctly for one-way mode', () => {
        (useStore as unknown as Mock).mockReturnValue({
            routeMode: 'one-way',
            setRouteMode: mockSetRouteMode
        });

        render(<RouteModeToggle />);
        expect(screen.getByText('1-Way')).toBeInTheDocument();
    });

    it('toggles mode when clicked (loop -> one-way)', () => {
        (useStore as unknown as Mock).mockReturnValue({
            routeMode: 'loop',
            setRouteMode: mockSetRouteMode
        });

        render(<RouteModeToggle />);

        const toggleBtn = screen.getByRole('button');
        fireEvent.click(toggleBtn);

        expect(mockSetRouteMode).toHaveBeenCalledWith('one-way');
    });

    it('toggles mode when clicked (one-way -> loop)', () => {
        (useStore as unknown as Mock).mockReturnValue({
            routeMode: 'one-way',
            setRouteMode: mockSetRouteMode
        });

        render(<RouteModeToggle />);

        const toggleBtn = screen.getByRole('button');
        fireEvent.click(toggleBtn);

        expect(mockSetRouteMode).toHaveBeenCalledWith('loop');
    });
});
