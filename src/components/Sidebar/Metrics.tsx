'use client';

import { useStore } from '@/store/useStore';

export function Metrics() {
    const { route, routeMetrics, lodgingZone } = useStore();

    if (!route && !lodgingZone) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Lodging Zone Info */}
            {lodgingZone && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <span>🏡</span> Best Stay Area
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                        Stay within {lodgingZone.bufferRadiusKm}km of the center to minimize travel time.
                    </p>
                    {lodgingZone.bookingLinks && (
                        <div className="flex gap-2">
                            <a
                                href={lodgingZone.bookingLinks.bookingCom}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Booking.com
                            </a>
                            <a
                                href={lodgingZone.bookingLinks.airbnb}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center px-3 py-2 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 transition-colors"
                            >
                                Airbnb
                            </a>
                        </div>
                    )}
                </div>
            )}

            {/* Route Metrics */}
            {route && routeMetrics && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <span>🗺️</span> Route Summary
                    </h4>

                    {/* Total stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                                {routeMetrics.totalDistanceKm.toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-500 uppercase">km total</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                                {formatDuration(routeMetrics.totalDurationMin)}
                            </p>
                            <p className="text-xs text-gray-500 uppercase">total time</p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 italic">
                        ✓ Real road distances from ArcGIS
                    </p>

                    {route.routeMode === 'loop' && (
                        <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                            <span>🔄</span> Loop trip (returns to start)
                        </p>
                    )}
                    {route.routeMode === 'one-way' && (
                        <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <span>➡️</span> One-way trip
                        </p>
                    )}
                </div>
            )}

            {/* Show loading state while metrics are being calculated */}
            {route && !routeMetrics && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Calculating route metrics...
                    </p>
                </div>
            )}
        </div>
    );
}

function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default Metrics;

