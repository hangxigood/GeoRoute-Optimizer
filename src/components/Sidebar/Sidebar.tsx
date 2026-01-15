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
                <header className="flex-shrink-0 px-6 py-5 bg-white/50 backdrop-blur-md border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-black/5">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                GeoRoute
                            </h1>
                            <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Optimizer</span>
                        </div>
                    </div>
                </header>

                {/* Search */}
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
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
                    <PoiList mapView={mapView} />

                    {/* Metrics */}
                    <Metrics />
                </div>

                {/* Action buttons */}
                <ActionButtons onFindLodging={onFindLodging} onOptimizeRoute={onOptimizeRoute} />
            </div>
        </aside>
    );
}
