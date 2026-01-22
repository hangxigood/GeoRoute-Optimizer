# React Component Test Plan: GeoRoute Optimizer Frontend

This document outlines the test strategy for React components in the GeoRoute Optimizer frontend application.

## Test Scope

**Target**: React components in `src/components/`  
**Approach**: Component testing with React Testing Library  
**Framework**: Vitest + React Testing Library + Testing Library User Event

## 1. PoiList Component (FR-1.1, FR-1.2, US-8)

The `PoiList` component displays the list of Points of Interest with drag-and-drop reordering, inline editing, and active/inactive toggling.

### Test Cases

| Test Case | PRD ID | User Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Render POI List** | FR-1.1 | Component mounts with 2 POIs | Displays 2 POI items with names and coordinates |
| **Remove POI** | FR-1.2 | Click remove button on POI | POI removed from list and store |
| **Toggle POI Active State** | FR-1.2 | Click eye icon on POI | POI marked as inactive with visual styling (opacity/strikethrough) |
| **Inline Name Edit** | US-8 | Click POI name, edit text, press Enter | POI name updated in store |
| **Set as Start Location** | FR-1.6 | Click "Set as Start" button | POI moved to start location section |
| **Drag-and-Drop Reorder** | US-8 | Drag POI to new position | POI order updated in store |
| **Empty State** | UI | No POIs in store | Shows empty state message |

---

## 2. AddressSearch Component (FR-1.1)

The `AddressSearch` component provides location search functionality using ArcGIS Geocoding Service.

### Test Cases

| Test Case | PRD ID | User Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Render Search Widget** | FR-1.1 | Component mounts with valid MapView | ArcGIS Search widget rendered in container |
| **Search Result Selection** | FR-1.1 | Mock search result selected | New POI added to store with correct coordinates |
| **Search Clear** | FR-1.1 | After selecting result | Search input cleared automatically |
| **No MapView** | Error | Component mounts without MapView | Widget not initialized (graceful handling) |

---

## 3. ActionButtons Component (FR-1.3, FR-1.7, FR-1.10)

The `ActionButtons` component provides primary actions: Find Stay Area, Optimize Route, Export PDF, and Clear All.

### Test Cases

| Test Case | PRD ID | User Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Find Stay Enabled** | FR-1.3 | 2+ POIs, no start location | "Find Stay" button enabled |
| **Find Stay Disabled** | FR-1.3 | <2 POIs or start location set | "Find Stay" button disabled |
| **Optimize Enabled** | FR-1.7 | 1+ POIs | "Optimize" button enabled |
| **Optimize Disabled** | FR-1.7 | 0 POIs | "Optimize" button disabled |
| **Click Find Stay** | FR-1.3 | Click "Find Stay" button | `onFindLodging` callback invoked |
| **Click Optimize** | FR-1.7 | Click "Optimize" button | `onOptimizeRoute` callback invoked |
| **Loading State** | UI | `isLoading` true | Buttons show spinner and are disabled |
| **Clear All** | UI | Click "Clear All" | `clearAll` action invoked |

---

## 4. Metrics Component (FR-1.9, FR-1.4)

The `Metrics` component displays route summary, lodging zone information, and booking links.

### Test Cases

| Test Case | PRD ID | User Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Display Route Metrics** | FR-1.9 | Route + metrics in store | Shows total distance, duration, and route legs |
| **Display Lodging Zone** | FR-1.4 | Lodging zone in store | Shows buffer radius and booking links |
| **Booking Links** | FR-1.5 | Lodging zone present | Booking.com and Airbnb links rendered with correct URLs |
| **Remove Lodging Zone** | UI | Click remove button | Lodging zone cleared from store |
| **Format Duration** | UI | 90 minutes | Displays as "1h 30m" |
| **Format Duration (< 1hr)** | UI | 45 minutes | Displays as "45min" |
| **Loop Mode Indicator** | FR-1.7 | Route mode is "loop" | Shows "Loop trip (returns to start)" |
| **One-Way Mode Indicator** | FR-1.7 | Route mode is "one-way" | Shows "One-way trip" |
| **Empty State** | UI | No route or lodging zone | Component returns null (not rendered) |

---

## 5. RouteModeToggle Component (FR-1.7)

The `RouteModeToggle` component allows users to switch between Loop and One-Way routing modes.

### Test Cases

| Test Case | PRD ID | User Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Default Mode** | FR-1.7 | Component mounts | "Loop" mode selected by default |
| **Switch to One-Way** | FR-1.7 | Click "One-Way" button | Route mode updated to "one-way" in store |
| **Switch to Loop** | FR-1.7 | Click "Loop" button | Route mode updated to "loop" in store |
| **Visual Active State** | UI | Mode selected | Active button has distinct styling |

---

## 6. ExportButton Component (FR-1.10)

The `ExportButton` component triggers PDF export of the itinerary.

### Test Cases

| Test Case | PRD ID | User Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Export Enabled** | FR-1.10 | Route exists in store | "Export PDF" button enabled |
| **Export Disabled** | FR-1.10 | No route in store | "Export PDF" button disabled |
| **Click Export** | FR-1.10 | Click "Export PDF" button | Calls export API with route data |
| **Export with Screenshot** | FR-1.10 | MapView available | Includes map screenshot in export request |
| **Loading State** | UI | Export in progress | Button shows loading spinner |
| **Error Handling** | Error | API call fails | Shows error message to user |

---

## 7. LoadingOverlay Component (UI)

The `LoadingOverlay` component displays a full-screen loading indicator.

### Test Cases

| Test Case | PRD ID | User Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Show Overlay** | UI | `isLoading` true | Overlay visible with spinner |
| **Hide Overlay** | UI | `isLoading` false | Overlay not rendered |

---

## 8. SidebarToggle Component (UI)

The `SidebarToggle` component allows collapsing/expanding the sidebar on mobile.

### Test Cases

| Test Case | PRD ID | User Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Toggle Sidebar** | UI | Click toggle button | Sidebar visibility toggled |
| **Icon Change** | UI | Sidebar open/closed | Icon changes between open/close states |

---

## Test Implementation Strategy

### Tools & Frameworks
- **Vitest**: Fast test runner for Vite projects
- **React Testing Library**: Component testing with user-centric queries
- **@testing-library/user-event**: Realistic user interaction simulation
- **@testing-library/jest-dom**: Custom matchers for assertions
- **MSW (Mock Service Worker)**: API mocking for integration tests

### Test Project Structure
```
src/
├── components/
│   ├── Sidebar/
│   │   ├── __tests__/
│   │   │   ├── PoiList.test.tsx
│   │   │   ├── AddressSearch.test.tsx
│   │   │   ├── ActionButtons.test.tsx
│   │   │   ├── Metrics.test.tsx
│   │   │   └── RouteModeToggle.test.tsx
│   │   └── ...
│   ├── Export/
│   │   └── __tests__/
│   │       └── ExportButton.test.tsx
│   └── UI/
│       └── __tests__/
│           ├── LoadingOverlay.test.tsx
│           └── SidebarToggle.test.tsx
└── test/
    ├── setup.ts
    └── test-utils.tsx
```

### Sample Test Pattern
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PoiList from '../PoiList';

describe('PoiList', () => {
  it('should remove POI when remove button clicked', () => {
    const mockRemove = vi.fn();
    render(<PoiList points={mockPoints} onRemove={mockRemove} />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    expect(mockRemove).toHaveBeenCalledWith('poi-1');
  });
});
```

### Mocking Strategy

#### Zustand Store Mocking
```typescript
// test/test-utils.tsx
import { useStore } from '@/store/useStore';

vi.mock('@/store/useStore');

const mockStore = {
  points: [],
  addPoint: vi.fn(),
  removePoint: vi.fn(),
  // ... other store methods
};

(useStore as any).mockReturnValue(mockStore);
```

#### ArcGIS SDK Mocking
```typescript
// test/mocks/arcgis.ts
vi.mock('@arcgis/core/views/MapView', () => ({
  default: vi.fn(() => ({
    extent: {},
    on: vi.fn(),
    // ... other MapView methods
  }))
}));
```

---

## Verification Goals

- **Component Rendering**: All components render without errors
- **User Interactions**: All interactive elements respond correctly
- **State Management**: Store updates propagate to UI
- **Accessibility**: Components are keyboard navigable and screen-reader friendly
- **Error Boundaries**: Components handle errors gracefully
- **Code Coverage**: >80% coverage for critical user flows

---

## Running Component Tests

```bash
# Run all component tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- PoiList.test.tsx
```

---

## Accessibility Testing

All components should be tested for:
- ✅ **Keyboard Navigation**: Tab, Enter, Escape keys work as expected
- ✅ **ARIA Labels**: Buttons and interactive elements have descriptive labels
- ✅ **Screen Reader**: Semantic HTML and ARIA attributes for assistive technology
- ✅ **Focus Management**: Focus moves logically through interactive elements

---

*Created: 2026-01-22*  
*Target: Phase 1 MVP (Frontend Component Testing)*
