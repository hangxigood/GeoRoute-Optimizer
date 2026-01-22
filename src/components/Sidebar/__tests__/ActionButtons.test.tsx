import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import ActionButtons from '../ActionButtons';
import { useStore } from '@/store/useStore';

vi.mock('@/store/useStore');
vi.mock('@/components/Export/ExportButton', () => ({
    default: () => <button>Export PDF</button>
}));

describe('ActionButtons', () => {
    const mockOnFindLodging = vi.fn();
    const mockOnOptimizeRoute = vi.fn();
    const mockClearAll = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('enables Find Stay button when valid conditions met', () => {
        (useStore as unknown as Mock).mockReturnValue({
            points: [
                { id: '1', lat: 0, lng: 0 },
                { id: '2', lat: 1, lng: 1 }
            ],
            startLocation: null,
            isLoading: false,
            clearAll: mockClearAll
        });

        render(
            <ActionButtons
                onFindLodging={mockOnFindLodging}
                onOptimizeRoute={mockOnOptimizeRoute}
                mapView={null}
            />
        );

        const findStayBtn = screen.getByRole('button', { name: /find stay/i });
        expect(findStayBtn).toBeEnabled();

        fireEvent.click(findStayBtn);
        expect(mockOnFindLodging).toHaveBeenCalled();
    });

    it('disables Find Stay button when conditions not met', () => {
        (useStore as unknown as Mock).mockReturnValue({
            points: [{ id: '1', lat: 0, lng: 0 }], // Only 1 point
            startLocation: null,
            isLoading: false,
            clearAll: mockClearAll
        });

        render(
            <ActionButtons
                onFindLodging={mockOnFindLodging}
                onOptimizeRoute={mockOnOptimizeRoute}
                mapView={null}
            />
        );

        const findStayBtn = screen.getByRole('button', { name: /find stay/i });
        expect(findStayBtn).toBeDisabled();
    });

    it('enables Optimize button when valid conditions met', () => {
        (useStore as unknown as Mock).mockReturnValue({
            points: [{ id: '1', lat: 0, lng: 0 }],
            startLocation: null,
            isLoading: false,
            clearAll: mockClearAll
        });

        render(
            <ActionButtons
                onFindLodging={mockOnFindLodging}
                onOptimizeRoute={mockOnOptimizeRoute}
                mapView={null}
            />
        );

        const optimizeBtn = screen.getByRole('button', { name: /optimize/i });
        expect(optimizeBtn).toBeEnabled();

        fireEvent.click(optimizeBtn);
        expect(mockOnOptimizeRoute).toHaveBeenCalled();
    });

    it('disables all buttons when loading', () => {
        (useStore as unknown as Mock).mockReturnValue({
            points: [
                { id: '1', lat: 0, lng: 0 },
                { id: '2', lat: 1, lng: 1 }
            ],
            startLocation: null,
            isLoading: true, // Loading state
            clearAll: mockClearAll
        });

        render(
            <ActionButtons
                onFindLodging={mockOnFindLodging}
                onOptimizeRoute={mockOnOptimizeRoute}
                mapView={null}
            />
        );

        expect(screen.getByRole('button', { name: /find stay/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /optimize/i })).toBeDisabled();
    });

    it('shows Clear All button when items exist', () => {
        (useStore as unknown as Mock).mockReturnValue({
            points: [{ id: '1', lat: 0, lng: 0 }],
            startLocation: null,
            isLoading: false,
            clearAll: mockClearAll
        });

        render(
            <ActionButtons
                onFindLodging={mockOnFindLodging}
                onOptimizeRoute={mockOnOptimizeRoute}
                mapView={null}
            />
        );

        const clearBtn = screen.getByText(/clear all/i);
        fireEvent.click(clearBtn);
        expect(mockClearAll).toHaveBeenCalled();
    });
});
