import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AddressSearch from '../AddressSearch';
import { useStore } from '@/store/useStore';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

// Mock dependencies
vi.mock('@/store/useStore', () => ({
    useStore: vi.fn(() => ({
        addPoint: vi.fn()
    }))
}));

// Setup ArcGis mocks in setup.ts, but we verify rendering here

describe('AddressSearch', () => {
    const mockMapView = {
        container: document.createElement('div'),
        extent: {},
        on: vi.fn(),
    };

    it('renders search container when map view is provided', () => {
        render(<AddressSearch mapView={mockMapView as any} />);

        // Check if the container div exists (implementation detail)
        // The actual widget is mocked, so we verify the wrapper
        const container = document.querySelector('.address-search-container');
        expect(container).toBeInTheDocument();
    });

    it('watches for map extent changes', () => {
        // We mock reactiveUtils in setup.ts
        render(<AddressSearch mapView={mockMapView as any} />);

        expect(reactiveUtils.watch).toHaveBeenCalled();
    });
});
