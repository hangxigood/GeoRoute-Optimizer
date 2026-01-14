'use client';

import { useState, useCallback } from 'react';
import type MapView from '@arcgis/core/views/MapView';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';

import PoiList from '@/components/Sidebar/PoiList';
import Metrics from '@/components/Sidebar/Metrics';
import ExportButton from '@/components/Export/ExportButton';

// Dynamically import map components (client-side only)
const MapViewComponent = dynamic(
  () => import('@/components/Map/MapView'),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" /> }
);

const AddressSearch = dynamic(
  () => import('@/components/Sidebar/AddressSearch'),
  { ssr: false }
);

export default function Home() {
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { points, hotel, isLoading, error, clearAll, calculateLodgingZone, optimizeRoute } = useStore();

  const handleMapReady = useCallback((view: MapView) => {
    setMapView(view);
  }, []);

  const handleFindLodging = async () => {
    await calculateLodgingZone();
  };

  const handleOptimizeRoute = async () => {
    await optimizeRoute();
  };

  const canCalculateLodging = points.length >= 2;
  const canOptimizeRoute = points.length >= 1;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Map (full screen) */}
      <div className="absolute inset-0">
        <MapViewComponent onMapReady={handleMapReady} />
      </div>

      {/* Sidebar toggle (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-20 lg:hidden p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`absolute top-0 left-0 h-full w-full sm:w-96 z-10 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <div className="h-full bg-white/95 backdrop-blur-lg shadow-2xl flex flex-col">
          {/* Header */}
          <header className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🗺️</span> GeoRoute Optimizer
            </h1>
            <p className="text-blue-100 text-sm mt-1">Plan your perfect day trip</p>
          </header>

          {/* Search */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search for a place
            </label>
            <AddressSearch mapView={mapView} />
            <p className="mt-2 text-xs text-gray-500">
              Or click anywhere on the map to add a point
            </p>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* POI List */}
            <PoiList />

            {/* Metrics */}
            <Metrics />
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 space-y-3">
            {/* Find Best Stay Area */}
            <button
              onClick={handleFindLodging}
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
              onClick={handleOptimizeRoute}
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
            {(points.length > 0 || hotel) && (
              <button
                onClick={clearAll}
                className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear all points
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-gray-700">Calculating...</span>
          </div>
        </div>
      )}
    </div>
  );
}
