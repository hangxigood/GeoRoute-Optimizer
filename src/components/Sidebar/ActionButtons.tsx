import { useStore } from '@/store/useStore';
import ExportButton from '@/components/Export/ExportButton';
import type MapView from '@arcgis/core/views/MapView';

interface ActionButtonsProps {
    onFindLodging: () => void;
    onOptimizeRoute: () => void;
    mapView: MapView | null;
}

export default function ActionButtons({ onFindLodging, onOptimizeRoute, mapView }: ActionButtonsProps) {
    const { points, startLocation, isLoading, clearAll } = useStore();

    const canCalculateLodging = points.length >= 2 && !startLocation;
    const canOptimizeRoute = points.length >= 1;

    return (
        <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50 space-y-2">
            {/* Primary Actions Grid */}
            <div className="grid grid-cols-2 gap-2">
                {/* Find Best Stay Area */}
                <button
                    onClick={onFindLodging}
                    disabled={!canCalculateLodging || isLoading}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5
                        ${!canCalculateLodging || isLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm hover:shadow-md'
                        }`}
                    title="Find the best area to stay based on your POIs"
                >
                    {isLoading ? (
                        <span className="animate-spin text-base">⏳</span>
                    ) : (
                        <span className="text-base font-normal">🏡</span>
                    )}
                    <span className="truncate">Find Stay</span>
                </button>

                {/* Optimize Route */}
                <button
                    onClick={onOptimizeRoute}
                    disabled={!canOptimizeRoute || isLoading}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5
                        ${!canOptimizeRoute || isLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-sm hover:shadow-md'
                        }`}
                    title="Calculate the most efficient route between all points"
                >
                    {isLoading ? (
                        <span className="animate-spin text-base">⏳</span>
                    ) : (
                        <span className="text-base font-normal">🚗</span>
                    )}
                    <span className="truncate">Optimize</span>
                </button>
            </div>

            {/* Secondary Action (Export) */}
            <ExportButton mapView={mapView} />

            {/* Utilitary Action (Clear) */}
            {(points.length > 0 || startLocation) && (
                <button
                    onClick={clearAll}
                    className="w-full py-1 text-xs text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider font-semibold"
                >
                    Clear All
                </button>
            )}
        </div>
    );
}
