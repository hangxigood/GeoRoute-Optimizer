'use client';

import { useStore } from '@/store/useStore';
import type { PointOfInterest } from '@/types/poi';

export function PoiList() {
    const { points, hotel, removePoint, reorderPoints, setHotel } = useStore();

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, toIndex: number) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (fromIndex !== toIndex) {
            reorderPoints(fromIndex, toIndex);
        }
    };

    const handleSetAsHotel = (poi: PointOfInterest) => {
        // Remove from points and set as hotel
        removePoint(poi.id);
        setHotel({ ...poi, isHotel: true });
    };

    const handleClearHotel = () => {
        setHotel(null);
    };

    if (points.length === 0 && !hotel) {
        return (
            <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📍</div>
                <p className="text-sm">Click on the map or search above to add points of interest</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Hotel section */}
            {hotel && (
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Your Hotel
                    </h4>
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
                            🏨
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{hotel.name}</p>
                            <p className="text-xs text-gray-500">
                                {hotel.lat.toFixed(4)}, {hotel.lng.toFixed(4)}
                            </p>
                        </div>
                        <button
                            onClick={handleClearHotel}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded transition-colors"
                            title="Remove hotel"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* POI list */}
            {points.length > 0 && (
                <>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Points of Interest ({points.length})
                    </h4>
                    <ul className="space-y-2">
                        {points.map((poi, index) => (
                            <li
                                key={poi.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg 
                           cursor-move hover:shadow-md hover:border-blue-300 transition-all
                           active:scale-[0.98] group"
                            >
                                {/* Drag handle */}
                                <div className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z" />
                                    </svg>
                                </div>

                                {/* Number badge */}
                                <div className="flex-shrink-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {index + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{poi.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleSetAsHotel(poi)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Set as hotel"
                                    >
                                        🏨
                                    </button>
                                    <button
                                        onClick={() => removePoint(poi.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Remove"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default PoiList;
