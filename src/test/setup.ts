import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ArcGIS SDK
vi.mock('@arcgis/core/views/MapView', () => ({
    default: vi.fn(() => ({
        container: document.createElement('div'),
        map: {},
        extent: {
            xmin: 0,
            ymin: 0,
            xmax: 10,
            ymax: 10,
            spatialReference: { wkid: 4326 }
        },
        on: vi.fn(),
        when: vi.fn().mockResolvedValue(true),
        toScreen: vi.fn(() => ({ x: 0, y: 0 })),
        toMap: vi.fn(() => ({ latitude: 0, longitude: 0 })),
        hitTest: vi.fn().mockResolvedValue({ results: [] })
    }))
}))

vi.mock('@arcgis/core/widgets/Search', () => ({
    default: vi.fn(() => ({
        view: null,
        on: vi.fn(),
        destroy: vi.fn(),
        clear: vi.fn()
    }))
}))

vi.mock('@arcgis/core/core/reactiveUtils', () => ({
    watch: vi.fn(() => ({ remove: vi.fn() }))
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})
