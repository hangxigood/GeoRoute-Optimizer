'use client';

import { useState, useCallback } from 'react';
import type MapView from '@arcgis/core/views/MapView';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';

import Sidebar from '@/components/Sidebar/Sidebar';
import SidebarToggle from '@/components/UI/SidebarToggle';
import LoadingOverlay from '@/components/UI/LoadingOverlay';

// Dynamically import map components (client-side only)
const MapViewComponent = dynamic(
  () => import('@/components/Map/MapView'),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" /> }
);

export default function Home() {
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { isLoading, calculateLodgingZone, optimizeRoute } = useStore();

  const handleMapReady = useCallback((view: MapView) => {
    setMapView(view);
  }, []);

  const handleFindLodging = async () => {
    await calculateLodgingZone();
  };

  const handleOptimizeRoute = async () => {
    await optimizeRoute();
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Map (full screen) */}
      <div className="absolute inset-0">
        <MapViewComponent onMapReady={handleMapReady} />
      </div>

      {/* Sidebar toggle (mobile) */}
      <SidebarToggle isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        mapView={mapView}
        onFindLodging={handleFindLodging}
        onOptimizeRoute={handleOptimizeRoute}
      />

      {/* Loading overlay */}
      {isLoading && <LoadingOverlay />}
    </div>
  );
}
