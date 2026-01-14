'use client';

import { useStore } from '@/store/useStore';

export function ExportButton() {
    const { route, points, hotel, isLoading } = useStore();

    const handleExport = async () => {
        if (!route || points.length === 0) return;

        // For now, generate a simple text summary
        // TODO: Call backend /api/export/pdf when available
        const summary = generateTextSummary(route, points, hotel);

        // Create and download text file
        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'itinerary.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const isDisabled = !route || points.length === 0 || isLoading;

    return (
        <button
            onClick={handleExport}
            disabled={isDisabled}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2
        ${isDisabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg'
                }`}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Itinerary
        </button>
    );
}

function generateTextSummary(
    route: { sequence: string[]; legs: { from: string; to: string; distanceKm: number; durationMin: number }[]; totalDistanceKm: number; totalDurationMin: number },
    points: { id: string; name: string; lat: number; lng: number }[],
    hotel: { name: string; lat: number; lng: number } | null
): string {
    const lines: string[] = [
        '=== GeoRoute Optimizer - Your Itinerary ===',
        '',
        `📅 Generated: ${new Date().toLocaleDateString()}`,
        '',
    ];

    if (hotel) {
        lines.push(`🏨 Hotel: ${hotel.name}`);
        lines.push(`   Location: ${hotel.lat.toFixed(4)}, ${hotel.lng.toFixed(4)}`);
        lines.push('');
    }

    lines.push('📍 Stops:');
    route.sequence.forEach((id, index) => {
        const poi = points.find(p => p.id === id);
        if (poi) {
            lines.push(`   ${index + 1}. ${poi.name} (${poi.lat.toFixed(4)}, ${poi.lng.toFixed(4)})`);
        }
    });
    lines.push('');

    lines.push('🚗 Route Details:');
    route.legs.forEach((leg, index) => {
        const fromName = leg.from === 'hotel' ? (hotel?.name || 'Hotel') : points.find(p => p.id === leg.from)?.name || leg.from;
        const toName = leg.to === 'hotel' ? (hotel?.name || 'Hotel') : points.find(p => p.id === leg.to)?.name || leg.to;
        lines.push(`   ${index + 1}. ${fromName} → ${toName}: ${leg.distanceKm.toFixed(1)}km, ${leg.durationMin}min`);
    });
    lines.push('');

    lines.push(`📊 Total Distance: ${route.totalDistanceKm.toFixed(1)} km`);
    lines.push(`⏱️ Total Time: ${formatDuration(route.totalDurationMin)}`);
    lines.push('');
    lines.push('---');
    lines.push('Created with GeoRoute Optimizer');

    return lines.join('\n');
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
}

export default ExportButton;
