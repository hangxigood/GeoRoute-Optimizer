'use client';

import { useStore } from '@/store/useStore';

export function Metrics() {
    const { route, points, startLocation, lodgingZone } = useStore();

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
            {route && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <span>🗺️</span> Route Summary
                    </h4>

                    {/* Total stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                                {route.totalDistanceKm.toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-500 uppercase">km total</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                                {formatDuration(route.totalDurationMin)}
                            </p>
                            <p className="text-xs text-gray-500 uppercase">total time</p>
                        </div>
                    </div>

                    {/* Leg breakdown */}
                    {route.legs.length > 0 && (
                        <details className="group">
                            <summary className="cursor-pointer text-sm text-blue-700 hover:text-blue-800 flex items-center gap-1">
                                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                View leg details
                            </summary>
                            <ul className="mt-2 space-y-1 text-sm">
                                {route.legs.map((leg, index) => (
                                    <li key={index} className="flex justify-between py-1 border-b border-blue-100 last:border-0">
                                        <span className="text-gray-600">
                                            {getLegLabel(leg.from, leg.to, points, startLocation)}
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                            {leg.distanceKm.toFixed(1)}km · {leg.durationMin}min
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}

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
        </div>
    );
}

function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getLegLabel(
    fromId: string,
    toId: string,
    points: { id: string; name: string }[],
    startLocation: { name: string } | null
): string {
    const getLabel = (id: string) => {
        if (id === 'start' || id === 'hotel') return startLocation?.name || 'Start';
        const poi = points.find((p) => p.id === id);
        return poi?.name || id;
    };
    return `${getLabel(fromId)} → ${getLabel(toId)}`;
}

export default Metrics;
