import React, { createContext, useState, useContext, ReactNode, useRef, useMemo } from 'react';

// Types
export type MarkerType = 'tree-stand' | 'blind' | 'food-plot' | 'feeder' | 'parking' | 'camera';

export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  type: MarkerType;
  name: string;
  notes?: string;
  createdBy?: string;
  inUse?: boolean;
  assignedTo?: string | null;
  dateCreated?: string;
}

export interface HuntArea {
  id: string;
  name: string;
  notes?: string;
  markers: Marker[];
  bounds?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  lastUpdated: string;
  shared?: boolean;
  sharedWith?: string[];
  createdBy?: string;
  clubId?: string;
}

interface MapContextType {
  currentHuntArea: HuntArea | null;
  huntAreas: HuntArea[];
  markers: Marker[];
  selectedMarkerId: string | null;
  mapLocation: { latitude: number; longitude: number; zoom: number };
  setCurrentHuntArea: (area: HuntArea | null) => void;
  setHuntAreas: (areas: HuntArea[]) => void;
  addHuntArea: (area: HuntArea) => void;
  updateHuntArea: (id: string, area: Partial<HuntArea>) => void;
  deleteHuntArea: (id: string) => void;
  setMarkers: (markers: Marker[]) => void;
  addMarker: (marker: Marker) => void;
  updateMarker: (id: string, marker: Partial<Marker>) => void;
  deleteMarker: (id: string) => void;
  setSelectedMarkerId: (id: string | null) => void;
  setMapLocation: (location: { latitude: number; longitude: number; zoom: number }) => void;
  shareHuntArea: (id: string, userIds: string[]) => void;
  getMarkersForUser: (userId: string) => Marker[];
  getAvailableMarkers: (type?: MarkerType) => Marker[];
  getCurrentMapBounds: () => [number, number, number, number]; // New method
  getMapBounds: () => { minLongitude: number; minLatitude: number; maxLongitude: number; maxLatitude: number }; // Add this function
  createDefaultHuntArea: () => HuntArea; // Optional utility
}

const defaultMapContext: MapContextType = {
  currentHuntArea: null,
  huntAreas: [],
  markers: [],
  selectedMarkerId: null,
  mapLocation: { latitude: 34.7195, longitude: -84.5478, zoom: 15 }, // Default to a location
  setCurrentHuntArea: () => {},
  setHuntAreas: () => {},
  addHuntArea: () => {},
  updateHuntArea: () => {},
  deleteHuntArea: () => {},
  setMarkers: () => {},
  addMarker: () => {},
  updateMarker: () => {},
  deleteMarker: () => {},
  setSelectedMarkerId: () => {},
  setMapLocation: () => {},
  shareHuntArea: () => {},
  getMarkersForUser: () => [],
  getAvailableMarkers: () => [],
  getCurrentMapBounds: () => [0, 0, 0, 0], // New method
  getMapBounds: () => ({ minLongitude: 0, minLatitude: 0, maxLongitude: 0, maxLatitude: 0 }), // Add this function
  createDefaultHuntArea: () => ({
    id: '',
    name: '',
    notes: '',
    markers: [],
    bounds: [0, 0, 0, 0],
    lastUpdated: '',
    shared: false,
    sharedWith: [],
    createdBy: '',
    clubId: '',
  }), // Optional utility
};

const MapContext = createContext<MapContextType>(defaultMapContext);

export const useMap = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentHuntArea, setCurrentHuntArea] = useState<HuntArea | null>(null);
  const [huntAreas, setHuntAreas] = useState<HuntArea[]>([
    {
      id: '1',
      name: 'TEST',
      notes: 'Sample hunt area',
      markers: [],
      lastUpdated: 'Mar 13, 2025',
      createdBy: 'admin1',
      clubId: 'club1',
    },
  ]);

  // Sample markers for the demo
  const [markers, setMarkers] = useState<Marker[]>([
    {
      id: '1',
      latitude: 34.7195,
      longitude: -84.5478,
      type: 'tree-stand',
      name: 'North Ridge Stand',
      notes: 'Good visibility to the east',
      createdBy: 'admin1',
      inUse: false,
      assignedTo: null,
      dateCreated: 'Mar 14, 2025',
    },
    {
      id: '2',
      latitude: 34.7199,
      longitude: -84.5472,
      type: 'blind',
      name: 'Creek Blind',
      notes: 'Near water source',
      createdBy: 'admin1',
      inUse: true,
      assignedTo: 'hunter1',
      dateCreated: 'Mar 15, 2025',
    },
    {
      id: '3',
      latitude: 34.7190,
      longitude: -84.5469,
      type: 'camera',
      name: 'East Trail Camera',
      notes: 'Facing food plot',
      createdBy: 'admin1',
      inUse: false,
      assignedTo: null,
      dateCreated: 'Mar 12, 2025',
    },
    {
      id: '4',
      latitude: 34.7187,
      longitude: -84.5482,
      type: 'feeder',
      name: 'South Feeder',
      notes: 'Corn feeder',
      createdBy: 'admin1',
      inUse: false,
      assignedTo: null,
      dateCreated: 'Mar 10, 2025',
    }
  ]);

  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mapLocationState, setMapLocationState] = useState({
    latitude: 34.7195,
    longitude: -84.5478,
    zoom: 15
  });

  const mapLocationRef = useRef(mapLocationState);

  const addHuntArea = (area: HuntArea) => {
    setHuntAreas((prevHuntAreas) => [...prevHuntAreas, area]);
  };

  const updateHuntArea = (id: string, updatedFields: Partial<HuntArea>) => {
    setHuntAreas(
      huntAreas.map((area) => (area.id === id ? { ...area, ...updatedFields } : area))
    );
    if (currentHuntArea?.id === id) {
      setCurrentHuntArea({ ...currentHuntArea, ...updatedFields });
    }
  };

  const deleteHuntArea = (id: string) => {
    setHuntAreas(huntAreas.filter((area) => area.id !== id));
    if (currentHuntArea?.id === id) {
      setCurrentHuntArea(null);
    }
  };

  const addMarker = (marker: Marker) => {
    setMarkers([...markers, marker]);
  };

  const updateMarker = (id: string, updatedFields: Partial<Marker>) => {
    setMarkers(
      markers.map((marker) => (marker.id === id ? { ...marker, ...updatedFields } : marker))
    );
  };

  const deleteMarker = (id: string) => {
    setMarkers(markers.filter((marker) => marker.id !== id));
    if (selectedMarkerId === id) {
      setSelectedMarkerId(null);
    }
  };

  const shareHuntArea = (id: string, userIds: string[]) => {
    setHuntAreas(
      huntAreas.map((area) =>
        area.id === id
          ? {
              ...area,
              shared: true,
              sharedWith: [...(area.sharedWith || []), ...userIds]
            }
          : area
      )
    );
  };

  const getMarkersForUser = (userId: string) => {
    return markers.filter(marker =>
      marker.assignedTo === userId || // Assigned directly to the user
      marker.createdBy === userId || // Created by the user
      !marker.inUse // Available to everyone if not in use
    );
  };

  const getAvailableMarkers = (type?: MarkerType) => {
    let availableMarkers = markers.filter(marker => !marker.inUse);

    if (type) {
      availableMarkers = availableMarkers.filter(marker => marker.type === type);
    }

    return availableMarkers;
  };

  const getCurrentMapBounds = (): [number, number, number, number] => {
    const { latitude, longitude, zoom } = mapLocationState;
  
    // Example: Calculate bounds based on zoom level (adjust as needed)
    const delta = 0.01 / zoom; // Adjust delta based on zoom level
    const minLng = longitude - delta;
    const minLat = latitude - delta;
    const maxLng = longitude + delta;
    const maxLat = latitude + delta;
  
    return [minLng, minLat, maxLng, maxLat];
  };

  const getMapBounds = (): { minLongitude: number; minLatitude: number; maxLongitude: number; maxLatitude: number } => {
    const { latitude, longitude, zoom } = mapLocationState;
  
    // Example: Calculate bounds based on zoom level (adjust delta as needed)
    const delta = 0.01 / zoom; // Adjust delta based on zoom level
    const minLongitude = longitude - delta;
    const minLatitude = latitude - delta;
    const maxLongitude = longitude + delta;
    const maxLatitude = latitude + delta;
  
    return { minLongitude, minLatitude, maxLongitude, maxLatitude };
  };

  const createDefaultHuntArea = (): HuntArea => {
    const bounds = getCurrentMapBounds();
  
    return {
      id: Date.now().toString(), // Generate a unique ID
      name: 'New Hunt Area',
      notes: '',
      markers: [],
      bounds,
      lastUpdated: new Date().toISOString(),
      shared: false,
      sharedWith: [],
      createdBy: 'admin', // Replace with the current user's ID
      clubId: 'club1', // Replace with the current club ID
    };
  };

  const setMapLocation = (location: { latitude: number; longitude: number; zoom: number }) => {
    mapLocationRef.current = location; // Update the ref
    setMapLocationState(location); // Update the state only when necessary
  };

  const contextValue = useMemo(() => ({
    currentHuntArea,
    huntAreas,
    markers,
    selectedMarkerId,
    mapLocation: mapLocationState,
    setCurrentHuntArea,
    setHuntAreas,
    addHuntArea,
    updateHuntArea,
    deleteHuntArea,
    setMarkers,
    addMarker,
    updateMarker,
    deleteMarker,
    setSelectedMarkerId,
    setMapLocation,
    shareHuntArea,
    getMarkersForUser,
    getAvailableMarkers,
    getMapBounds,
    getCurrentMapBounds,
    createDefaultHuntArea,
  }), [
    currentHuntArea,
    huntAreas,
    markers,
    selectedMarkerId,
    mapLocationState,
  ]);

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};
