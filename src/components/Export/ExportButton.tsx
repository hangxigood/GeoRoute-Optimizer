'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { api } from '@/services/api';
import type MapView from '@arcgis/core/views/MapView';

interface ExportButtonProps {
    mapView: MapView | null;
}

export function ExportButton({ mapView }: ExportButtonProps) {
    const { route, points, startLocation, routeMetrics, isLoading } = useStore();
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const handleExport = async () => {
        if (!route || points.length === 0) return;

        setIsExporting(true);
        setExportError(null);

        try {
            // Capture map screenshot if available
            let mapImageBase64: string | null = null;
            if (mapView) {
                try {
                    const screenshot = await mapView.takeScreenshot({ format: 'png' });
                    mapImageBase64 = screenshot.dataUrl;
                } catch (err) {
                    console.warn('Failed to capture map screenshot:', err);
                }
            }

            // Get PDF blob from API with metrics and map image
            const blob = await api.export.exportPdf(
                route,
                points,
                startLocation,
                routeMetrics,
                mapImageBase64
            );

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `itinerary-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to export PDF';
            setExportError(`Backend error: ${errorMessage}`);
            console.error('Export error:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const isDisabled = !route || points.length === 0 || isLoading || isExporting;

    return (
        <div className="space-y-1.5">
            <button
                onClick={handleExport}
                disabled={isDisabled}
                className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                    ${isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 shadow-sm hover:shadow-md'
                    }`}
            >
                {isExporting ? (
                    <>
                        <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Exporting...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export Itinerary</span>
                    </>
                )}
            </button>

            {exportError && (
                <p className="text-[10px] text-red-500 px-1 text-center font-medium leading-tight">
                    {exportError}
                </p>
            )}
        </div>
    );
}

export default ExportButton;
