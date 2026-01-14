'use client';

import { useStore } from '@/store/useStore';
import type { RouteMode } from '@/types/poi';

export function RouteModeToggle() {
    const { routeMode, setRouteMode } = useStore();

    const handleModeChange = (mode: RouteMode) => {
        setRouteMode(mode);
    };

    return (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Trip Mode
            </label>
            <div className="flex gap-2">
                <button
                    onClick={() => handleModeChange('loop')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5
                        ${routeMode === 'loop'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-300 hover:text-blue-600'
                        }`}
                >
                    <span>🔄</span>
                    Loop
                </button>
                <button
                    onClick={() => handleModeChange('one-way')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5
                        ${routeMode === 'one-way'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-300 hover:border-green-300 hover:text-green-600'
                        }`}
                >
                    <span>➡️</span>
                    One-Way
                </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
                {routeMode === 'loop'
                    ? 'Route returns to your start location'
                    : 'Route ends at the last stop'}
            </p>
        </div>
    );
}

export default RouteModeToggle;
