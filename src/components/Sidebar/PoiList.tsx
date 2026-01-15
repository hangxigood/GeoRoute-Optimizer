'use client';

import { useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import type { PointOfInterest } from '@/types/poi';
import { Reorder, useDragControls } from 'framer-motion';
import RouteModeToggle from './RouteModeToggle';
import type MapView from '@arcgis/core/views/MapView';

function PoiListItem({ poi, index, mapView }: { poi: PointOfInterest; index: number; mapView: MapView | null }) {
    const { removePoint, setStartLocation, updatePoint } = useStore();
    const dragControls = useDragControls();
    const isDragging = useRef(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(poi.name);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSetAsStart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent drag start if clicked carelessly
        removePoint(poi.id);
        setStartLocation({ ...poi, isHotel: true });
    };

    const handleClick = () => {
        // Don't zoom if we just finished dragging
        if (isDragging.current) {
            isDragging.current = false;
            return;
        }
        if (mapView && !isEditing) {
            mapView.goTo({
                target: [poi.lng, poi.lat],
                zoom: 16
            });
        }
    };

    const handleNameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditedName(poi.name);
        // Focus input after state update
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleNameSave = () => {
        if (editedName.trim() && editedName !== poi.name) {
            updatePoint(poi.id, { name: editedName.trim() });
        } else {
            setEditedName(poi.name); // Reset to original if empty
        }
        setIsEditing(false);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            setEditedName(poi.name);
            setIsEditing(false);
        }
    };

    return (
        <Reorder.Item
            value={poi}
            id={poi.id}
            dragListener={false}
            dragControls={dragControls}
            className="relative"
            whileDrag={{ scale: 1.02, zIndex: 10, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
        >
            <div
                onClick={handleClick}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg 
                       hover:shadow-md hover:border-blue-300 transition-all group select-none cursor-pointer">

                {/* Drag handle */}
                <div
                    className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing p-1 hover:text-gray-600"
                    onPointerDown={(e) => {
                        isDragging.current = true;
                        dragControls.start(e);
                    }}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z" />
                    </svg>
                </div>

                {/* Number badge */}
                <div className="flex-shrink-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={handleNameSave}
                            onKeyDown={handleNameKeyDown}
                            className="w-full font-medium text-gray-900 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div className="group/name relative">
                            <p
                                className="font-medium text-gray-900 truncate cursor-text hover:text-blue-600 transition-colors pr-6"
                                onClick={handleNameClick}
                                title="Click to edit name"
                            >
                                {poi.name}
                            </p>
                        </div>
                    )}
                    <p className="text-xs text-gray-500">
                        {poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleSetAsStart}
                        className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition-colors"
                        title="Set as start location"
                    >
                        📍
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); removePoint(poi.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </Reorder.Item>
    );
}

export function PoiList({ mapView }: { mapView: MapView | null }) {
    const { points, startLocation, setStartLocation, setPoints } = useStore();
    const [isEditingStart, setIsEditingStart] = useState(false);
    const [editedStartName, setEditedStartName] = useState('');
    const startInputRef = useRef<HTMLInputElement>(null);

    const handleClearStartLocation = () => {
        setStartLocation(null);
    };

    const handleStartNameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (startLocation) {
            setIsEditingStart(true);
            setEditedStartName(startLocation.name);
            setTimeout(() => startInputRef.current?.focus(), 0);
        }
    };

    const handleStartNameSave = () => {
        if (startLocation && editedStartName.trim() && editedStartName !== startLocation.name) {
            setStartLocation({ ...startLocation, name: editedStartName.trim() });
        } else if (startLocation) {
            setEditedStartName(startLocation.name);
        }
        setIsEditingStart(false);
    };

    const handleStartNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleStartNameSave();
        } else if (e.key === 'Escape') {
            if (startLocation) {
                setEditedStartName(startLocation.name);
            }
            setIsEditingStart(false);
        }
    };

    if (points.length === 0 && !startLocation) {
        return (
            <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📍</div>
                <p className="text-sm">Click on the map or search above to add points of interest</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Start Location section */}
            {startLocation && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Start Location
                        </h4>
                        <RouteModeToggle />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                            📍
                        </div>
                        <div className="flex-1 min-w-0">
                            {isEditingStart ? (
                                <input
                                    ref={startInputRef}
                                    type="text"
                                    value={editedStartName}
                                    onChange={(e) => setEditedStartName(e.target.value)}
                                    onBlur={handleStartNameSave}
                                    onKeyDown={handleStartNameKeyDown}
                                    className="w-full font-medium text-gray-900 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <div className="group/name relative">
                                    <p
                                        className="font-medium text-gray-900 truncate cursor-text hover:text-blue-600 transition-colors pr-6"
                                        onClick={handleStartNameClick}
                                        title="Click to edit name"
                                    >
                                        {startLocation.name}
                                    </p>
                                    <span className="absolute right-0 top-0 text-gray-400 opacity-0 group-hover/name:opacity-100 transition-opacity text-xs">
                                        ✏️
                                    </span>
                                </div>
                            )}
                            <p className="text-xs text-gray-500">
                                {startLocation.lat.toFixed(4)}, {startLocation.lng.toFixed(4)}
                            </p>
                        </div>
                        <button
                            onClick={handleClearStartLocation}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded transition-colors"
                            title="Remove start location"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* POI list */}
            {points.length > 0 && (
                <>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Points of Interest ({points.length})
                    </h4>
                    <Reorder.Group
                        axis="y"
                        values={points}
                        onReorder={setPoints}
                        className="space-y-2 list-none p-0 m-0"
                    >
                        {points.map((poi, index) => (
                            <PoiListItem key={poi.id} poi={poi} index={index} mapView={mapView} />
                        ))}
                    </Reorder.Group>
                </>
            )}
        </div>
    );
}

export default PoiList;
