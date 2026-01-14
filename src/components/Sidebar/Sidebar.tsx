import type MapView from '@arcgis/core/views/MapView';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import PoiList from '@/components/Sidebar/PoiList';
import Metrics from '@/components/Sidebar/Metrics';
import ActionButtons from '@/components/Sidebar/ActionButtons';

const AddressSearch = dynamic(
    () => import('@/components/Sidebar/AddressSearch'),
    { ssr: false }
);

interface SidebarProps {
    isOpen: boolean;
    mapView: MapView | null;
    onFindLodging: () => void;
    onOptimizeRoute: () => void;
}

export default function Sidebar({ isOpen, mapView, onFindLodging, onOptimizeRoute }: SidebarProps) {
    const { error } = useStore();

    return (
        <aside
            className={`absolute top-0 left-0 h-full w-full sm:w-96 z-10 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
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
                </div>

                {/* Scrollable content */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
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
                <ActionButtons onFindLodging={onFindLodging} onOptimizeRoute={onOptimizeRoute} />
            </div>
        </aside>
    );
}
