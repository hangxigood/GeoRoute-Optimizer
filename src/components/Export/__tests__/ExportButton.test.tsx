import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import ExportButton from '../ExportButton';
import { useStore } from '@/store/useStore';
import { api } from '@/services/api';

// Mock dependencies
vi.mock('@/store/useStore');
vi.mock('@/services/api', () => ({
    api: {
        export: {
            exportPdf: vi.fn()
        }
    }
}));

interface MockMapView {
    takeScreenshot: Mock;
    map: {
        layers: {
            find: Mock;
        };
    };
    goTo: Mock;
}

describe('ExportButton', () => {
    const mockMapView: MockMapView = {
        takeScreenshot: vi.fn().mockResolvedValue({ dataUrl: 'data:image/png;base64,mock' }),
        map: {
            layers: {
                find: vi.fn().mockReturnValue({ graphics: { length: 1, toArray: vi.fn() } })
            }
        },
        goTo: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders disabled when no route', () => {
        (useStore as unknown as Mock).mockReturnValue({
            route: null,
            points: [{ id: '1', lat: 0, lng: 0 }],
            startLocation: null,
            routeMetrics: null,
            isLoading: false
        });

        render(<ExportButton mapView={mockMapView as unknown as __esri.MapView} />);

        const button = screen.getByRole('button', { name: /export itinerary/i });
        expect(button).toBeDisabled();
    });

    it('renders enabled when route exists', () => {
        (useStore as unknown as Mock).mockReturnValue({
            route: { sequence: [] },
            points: [{ id: '1', lat: 0, lng: 0 }],
            isLoading: false
        });

        render(<ExportButton mapView={mockMapView as unknown as __esri.MapView} />);

        const button = screen.getByRole('button', { name: /export itinerary/i });
        expect(button).toBeEnabled();
    });

    it('handles export process', async () => {
        (useStore as unknown as Mock).mockReturnValue({
            route: { sequence: [] },
            points: [{ id: '1', lat: 0, lng: 0 }],
            isLoading: false
        });

        (api.export.exportPdf as Mock).mockResolvedValue(new Blob(['pdf content']));

        global.URL.createObjectURL = vi.fn(() => 'blob:url');
        global.URL.revokeObjectURL = vi.fn();

        render(<ExportButton mapView={mockMapView as unknown as __esri.MapView} />);

        const button = screen.getByRole('button', { name: /export itinerary/i });
        fireEvent.click(button);

        // Should indicate exporting state in UI (button text changes)
        expect(screen.getByText('Exporting...')).toBeInTheDocument();

        await waitFor(() => {
            expect(api.export.exportPdf).toHaveBeenCalled();
        });

        // Should finish loading
        expect(screen.queryByText('Exporting...')).not.toBeInTheDocument();
    });

    it('handles API error', async () => {
        (useStore as unknown as Mock).mockReturnValue({
            route: { sequence: [] },
            points: [{ id: '1', lat: 0, lng: 0 }],
            isLoading: false
        });

        (api.export.exportPdf as Mock).mockRejectedValue(new Error('API Error'));

        render(<ExportButton mapView={mockMapView as unknown as __esri.MapView} />);
        const button = screen.getByRole('button', { name: /export itinerary/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/backend error: api error/i)).toBeInTheDocument();
        });
    });
});
