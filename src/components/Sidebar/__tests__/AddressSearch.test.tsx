import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, Mock } from 'vitest';
import AddressSearch from '../AddressSearch';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

// Mock dependencies
vi.mock('@/store/useStore', () => ({
    useStore: vi.fn(() => ({
        addPoint: vi.fn()
    }))
}));

// Setup ArcGis mocks in setup.ts, but we verify rendering here

interface MockMapView {
    container: HTMLDivElement;
    extent: Record<string, unknown>;
    on: Mock;
}

describe('AddressSearch', () => {
    const mockMapView: MockMapView = {
        container: document.createElement('div'),
        extent: {},
        on: vi.fn(),
    };

    it('renders search container when map view is provided', () => {
        render(<AddressSearch mapView={mockMapView as unknown as __esri.MapView} />);

        // Check if the container div exists (implementation detail)
        // The actual widget is mocked, so we verify the wrapper
        const container = document.querySelector('.address-search-container');
        expect(container).toBeInTheDocument();
    });

    it('watches for map extent changes', () => {
        // We mock reactiveUtils in setup.ts
        render(<AddressSearch mapView={mockMapView as unknown as __esri.MapView} />);

        expect(reactiveUtils.watch).toHaveBeenCalled();
    });
});
