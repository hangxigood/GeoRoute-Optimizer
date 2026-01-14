import { useStore } from '@/store/useStore';
import ExportButton from '@/components/Export/ExportButton';

interface ActionButtonsProps {
    onFindLodging: () => void;
    onOptimizeRoute: () => void;
}

export default function ActionButtons({ onFindLodging, onOptimizeRoute }: ActionButtonsProps) {
    const { points, startLocation, isLoading, clearAll } = useStore();

    const canCalculateLodging = points.length >= 2;
    const canOptimizeRoute = points.length >= 1;

    return (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 space-y-3">
            {/* Find Best Stay Area */}
            <button
                onClick={onFindLodging}
                disabled={!canCalculateLodging || isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2
          ${!canCalculateLodging || isLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg'
                    }`}
            >
                {isLoading ? (
                    <span className="animate-spin">⏳</span>
                ) : (
                    <span>🏡</span>
                )}
                Find Best Stay Area
            </button>

            {/* Optimize Route */}
            <button
                onClick={onOptimizeRoute}
                disabled={!canOptimizeRoute || isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2
          ${!canOptimizeRoute || isLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-lg'
                    }`}
            >
                {isLoading ? (
                    <span className="animate-spin">⏳</span>
                ) : (
                    <span>🚗</span>
                )}
                Optimize My Day
            </button>

            {/* Export */}
            <ExportButton />

            {/* Clear all */}
            {(points.length > 0 || startLocation) && (
                <button
                    onClick={clearAll}
                    className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                    Clear all points
                </button>
            )}
        </div>
    );
}
