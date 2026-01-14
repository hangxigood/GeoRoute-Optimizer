'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { api } from '@/services/api';

export function ExportButton() {
    const { route, points, hotel, isLoading } = useStore();
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const handleExport = async () => {
        if (!route || points.length === 0) return;

        setIsExporting(true);
        setExportError(null);

        try {
            // Get PDF blob from API
            const blob = await api.export.exportPdf(route, points, hotel);

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
            setExportError(`Backend unavailable: ${errorMessage}. Please start the backend server.`);
            console.error('Export error:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const isDisabled = !route || points.length === 0 || isLoading || isExporting;

    return (
        <div className="space-y-2">
            <button
                onClick={handleExport}
                disabled={isDisabled}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                    ${isDisabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg'
                    }`}
            >
                {isExporting ? (
                    <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export PDF
                    </>
                )}
            </button>

            {exportError && (
                <p className="text-xs text-red-600 px-2">
                    {exportError}
                </p>
            )}
        </div>
    );
}

export default ExportButton;
