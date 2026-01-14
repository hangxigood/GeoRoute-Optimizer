# API Service Layer Extraction

## Overview
Extracted API logic from `useStore.ts` into a dedicated service layer, reducing the store from **191 lines** to **148 lines** and improving separation of concerns.

## Changes Made

### New File Structure

```
src/
├── services/
│   └── api.ts (NEW - 81 lines)
└── store/
    └── useStore.ts (REFACTORED - 148 lines, down from 191)
```

### Before (Monolithic Store)

```typescript
// useStore.ts - Mixed concerns
calculateLodgingZone: async (bufferRadiusKm = 5) => {
    // Validation logic
    if (points.length < 2) { ... }
    
    // API fetch logic (30+ lines)
    const response = await fetch(`${API_URL}/lodging/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ... }),
    });
    
    if (!response.ok) { throw new Error(...) }
    const zone = await response.json();
    
    // State management
    set({ lodgingZone: zone, isLoading: false });
}
```

### After (Separated Concerns)

**API Service (`src/services/api.ts`)**
```typescript
export const lodgingApi = {
    calculate: async (points, bufferRadiusKm) => {
        const response = await fetch(`${API_URL}/lodging/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ... }),
        });
        
        if (!response.ok) throw new Error(...);
        return response.json();
    }
};
```

**Store (`src/store/useStore.ts`)**
```typescript
calculateLodgingZone: async (bufferRadiusKm = 5) => {
    const { points } = get();
    
    // Validation
    if (points.length < 2) {
        set({ error: 'Need at least 2 points...' });
        return null;
    }
    
    set({ isLoading: true, error: null });
    
    try {
        // Clean API call
        const zone = await api.lodging.calculate(points, bufferRadiusKm);
        set({ lodgingZone: zone, isLoading: false });
        return zone;
    } catch (err) {
        // Error handling
        set({ error: ..., isLoading: false });
        return null;
    }
}
```

## Benefits

### 1. **Single Responsibility Principle**
- **Store**: Manages state and orchestrates business logic
- **API Service**: Handles HTTP communication with backend

### 2. **Improved Testability**
```typescript
// Easy to mock API calls in tests
jest.mock('@/services/api', () => ({
    api: {
        lodging: {
            calculate: jest.fn().mockResolvedValue(mockZone)
        }
    }
}));
```

### 3. **Code Reusability**
The API service can be used outside of Zustand:
```typescript
// In a React Query hook
const { data } = useQuery(['lodging'], () => 
    api.lodging.calculate(points, 5)
);

// In a server action
const zone = await api.lodging.calculate(points, bufferRadius);
```

### 4. **Better Error Handling**
API errors are thrown and caught consistently, making it easier to add:
- Retry logic
- Request interceptors
- Response transformers
- Logging

### 5. **Easier to Extend**
Adding new API endpoints is straightforward:
```typescript
// src/services/api.ts
export const geocodingApi = {
    search: async (query: string) => { ... },
    reverse: async (lat: number, lng: number) => { ... }
};

export const api = {
    lodging: lodgingApi,
    route: routeApi,
    geocoding: geocodingApi, // ← Easy to add
};
```

### 6. **Type Safety**
The API service provides strong typing:
```typescript
// TypeScript knows the return type
const zone: LodgingZone = await api.lodging.calculate(points, 5);
const route: OptimizedRoute = await api.route.optimize(points, hotel);
```

## File Size Comparison

| File | Before | After | Change |
|------|--------|-------|--------|
| `useStore.ts` | 191 lines | 148 lines | **-43 lines** ✅ |
| `api.ts` | N/A | 81 lines | **+81 lines** |
| **Total** | 191 lines | 229 lines | +38 lines |

While total lines increased slightly, the **code quality improved significantly** through better organization.

## Future Enhancements

### 1. **Add Request/Response Interceptors**
```typescript
// src/services/api.ts
const apiClient = {
    async fetch(url: string, options: RequestInit) {
        // Add auth headers
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${getToken()}`
        };
        
        const response = await fetch(url, { ...options, headers });
        
        // Global error handling
        if (!response.ok) {
            await handleApiError(response);
        }
        
        return response.json();
    }
};
```

### 2. **Add Retry Logic**
```typescript
import { retry } from '@/lib/retry';

export const lodgingApi = {
    calculate: retry(async (points, bufferRadiusKm) => {
        // API call
    }, { maxAttempts: 3, backoff: 'exponential' })
};
```

### 3. **Add Request Cancellation**
```typescript
export const routeApi = {
    optimize: async (points, hotel, signal?: AbortSignal) => {
        const response = await fetch(url, { 
            signal, // ← Support cancellation
            // ...
        });
        return response.json();
    }
};
```

### 4. **Add Logging/Monitoring**
```typescript
const zone = await api.lodging.calculate(points, bufferRadiusKm);
// Automatically log API calls for debugging
console.log('[API] lodging.calculate', { points, bufferRadiusKm, zone });
```

## Migration Notes

### No Breaking Changes
- All existing functionality preserved
- Store API remains unchanged
- Components don't need updates

### Testing Recommendations
1. Test API service independently
2. Mock API service in store tests
3. Add integration tests for full flow

## Conclusion

This refactoring follows the **Principle of Locality** by:
- ✅ Keeping network logic in the service layer
- ✅ Keeping state management in the store
- ✅ Making each layer independently testable
- ✅ Improving code maintainability and scalability

The codebase is now better positioned for growth! 🚀
