'use client';

import { useStore } from '@/store/useStore';
import type { RouteMode } from '@/types/poi';

export function RouteModeToggle() {
    const { routeMode, setRouteMode } = useStore();

    const handleToggle = () => {
        setRouteMode(routeMode === 'loop' ? 'one-way' : 'loop');
    };

    return (
        <div className="flex items-center gap-2 select-none">
            {/* Text on the left */}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                {routeMode === 'loop' ? 'Loop' : '1-Way'}
            </span>

            {/* Toggle Switch on the right */}
            <button
                onClick={handleToggle}
                className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors focus:outline-none ring-1 ring-inset ring-black/5
                    ${routeMode === 'loop' ? 'bg-blue-500' : 'bg-green-500'}`}
                title={routeMode === 'loop' ? 'Switch to One-way' : 'Switch to Loop'}
            >
                <span
                    className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform shadow-sm
                        ${routeMode === 'loop' ? 'translate-x-0.5' : 'translate-x-4'}`}
                />
            </button>
        </div>
    );
}

export default RouteModeToggle;
