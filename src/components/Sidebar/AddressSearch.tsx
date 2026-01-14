'use client';

import { useRef, useEffect, useState } from 'react';
import Search from '@arcgis/core/widgets/Search';
import MapViewClass from '@arcgis/core/views/MapView';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import { useStore } from '@/store/useStore';
import { generatePoiId } from '@/lib/geoUtils';
import type { PointOfInterest } from '@/types/poi';
import { SEARCH_CONFIG } from '@/lib/arcgis-config';

interface AddressSearchProps {
    mapView: MapViewClass | null;
}

export function AddressSearch({ mapView }: AddressSearchProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<Search | null>(null);
    const [isReady, setIsReady] = useState(false);
    const { addPoint } = useStore();

    useEffect(() => {
        if (!containerRef.current || !mapView || searchRef.current) return;

        const search = new Search({
            view: mapView,
            container: containerRef.current,
            locationEnabled: false,
            popupEnabled: false,
            resultGraphicEnabled: false,
            includeDefaultSources: false,
            sources: [
                {
                    url: SEARCH_CONFIG.geocodeServiceUrl,
                    singleLineFieldName: 'SingleLine',
                    name: 'ArcGIS World Geocoding Service',
                    placeholder: SEARCH_CONFIG.placeholder,
                    filter: {
                        geometry: mapView.extent, // Bias to current view
                    },
                } as __esri.LocatorSearchSource,
            ],
        });

        // Handle search result selection
        search.on('select-result', (event) => {
            if (event.result?.feature?.geometry) {
                const geom = event.result.feature.geometry as __esri.Point;
                const newPoi: PointOfInterest = {
                    id: generatePoiId(),
                    name: event.result.name || 'Selected Location',
                    lat: geom.latitude ?? 0,
                    lng: geom.longitude ?? 0,
                };
                addPoint(newPoi);
                search.clear();
            }
        });

        searchRef.current = search;
        setIsReady(true);

        return () => {
            search.destroy();
            searchRef.current = null;
        };
    }, [mapView, addPoint]);

    // Update search extent when map moves (using reactiveUtils instead of deprecated watch)
    useEffect(() => {
        if (!mapView || !searchRef.current) return;

        const handle = reactiveUtils.watch(
            () => mapView.extent,
            (newExtent) => {
                const sources = searchRef.current?.sources;
                if (sources && sources.length > 0 && newExtent) {
                    const source = sources.getItemAt(0) as __esri.LocatorSearchSource;
                    if (source.filter) {
                        source.filter.geometry = newExtent;
                    }
                }
            }
        );

        return () => handle.remove();
    }, [mapView, isReady]);

    return (
        <div className="w-full">
            <div
                ref={containerRef}
                className="address-search-container"
            />
            <style jsx>{`
        .address-search-container :global(.esri-search) {
          width: 100% !important;
          box-shadow: none !important;
        }
        .address-search-container :global(.esri-search__container) {
          border-radius: 8px;
          overflow: hidden;
        }
        .address-search-container :global(.esri-search__input) {
          padding: 12px 16px;
          font-size: 14px;
        }
      `}</style>
        </div>
    );
}

export default AddressSearch;
