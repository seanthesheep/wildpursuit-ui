import React, { createContext, useState, useContext, ReactNode, useRef, useMemo, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import {
  addHuntAreaToFirestore,
  addMarkerToFirestore,
  getMarkersForHuntArea,
  updateMarkerInFirestore,
  deleteMarkerFromFirestore,
  db,
} from "../firebase";
import { HuntArea, Marker, MarkerType } from '../types/types';
export type { Marker, MarkerType } from '../types/types';
import { collection, getDocs } from "firebase/firestore";

// Types

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
  setMarkers: Dispatch<SetStateAction<Marker[]>>;
  addMarker: (marker: Marker) => void;
  updateMarker: (id: string, marker: Partial<Marker>) => void;
  deleteMarker: (id: string) => void;
  setSelectedMarkerId: (id: string | null) => void;
  setMapLocation: (location: { latitude: number; longitude: number; zoom: number }) => void;
  shareHuntArea: (id: string, userIds: string[]) => void;
  getMarkersForUser: (userId: string) => Marker[];
  getAvailableMarkers: (type?: MarkerType) => Marker[];
  getCurrentMapBounds: () => [number, number, number, number];
  getMapBounds: () => { minLongitude: number; minLatitude: number; maxLongitude: number; maxLatitude: number };
  createDefaultHuntArea: () => HuntArea;
  getHuntAreasFromFirestore: () => Promise<HuntArea[]>;
  addHuntAreaToFirestore: (area: HuntArea) => Promise<string>;
  getMarkersForHuntArea: (huntAreaId: string) => Promise<Marker[]>;
}

const defaultMapContext: MapContextType = {
  currentHuntArea: null,
  huntAreas: [],
  markers: [],
  selectedMarkerId: null,
  mapLocation: { latitude: 34.7195, longitude: -84.5478, zoom: 15 },
  setCurrentHuntArea: (area: HuntArea | null) => {
    console.warn('not implemented in defaultMapContext');
  },
  setHuntAreas: () => {
    console.warn('not implemented in defaultMapContext');
  },
  addHuntArea: () => {
    console.warn('not implemented in defaultMapContext');
  },
  updateHuntArea: () => {
    console.warn('not implemented in defaultMapContext');
  },
  deleteHuntArea: () => {
    console.warn('not implemented in defaultMapContext');
  },
  setMarkers: () => {
    console.warn('setMarkers not implemented');
  },
  addMarker: () => {
    console.warn('not implemented in defaultMapContext');
  },
  updateMarker: () => {
    console.warn('not implemented in defaultMapContext');
  },
  deleteMarker: () => {
    console.warn('not implemented in defaultMapContext');
  },
  setSelectedMarkerId: () => {
    console.warn('not implemented in defaultMapContext');
  },
  setMapLocation: () => {
    console.warn('not implemented in defaultMapContext');
  },
  shareHuntArea: () => {
    console.warn('not implemented in defaultMapContext');
  },
  getMarkersForUser: () => [],
  getAvailableMarkers: () => [],
  getCurrentMapBounds: () => [0, 0, 0, 0],
  getMapBounds: () => ({ minLongitude: 0, minLatitude: 0, maxLongitude: 0, maxLatitude: 0 }),
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
  }),
  getHuntAreasFromFirestore: async () => {
    console.warn('not implemented in defaultMapContext');
    return Promise.resolve([]);
  },
  addHuntAreaToFirestore: async () => {
    console.warn('not implemented in defaultMapContext');
    return '';
  },
  getMarkersForHuntArea: async () => {
    console.warn('not implemented in defaultMapContext');
    return Promise.resolve([]);
  },
};

const MapContext = createContext<MapContextType>(defaultMapContext);

export const useMap = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentHuntArea, setCurrentHuntArea] = useState<HuntArea | null>(null);
  const [huntAreas, setHuntAreas] = useState<HuntArea[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mapLocationState, setMapLocationState] = useState({
    latitude: 34.7195,
    longitude: -84.5478,
    zoom: 15
  });

  const mapLocationRef = useRef(mapLocationState);

  // Fetch hunt areas from Firestore
  useEffect(() => {
    const fetchHuntAreas = async () => {
      try {
        const areas = await getHuntAreasFromFirestore();
        setHuntAreas(areas); // The data now matches the HuntArea type
      } catch (error) {
        console.error("Error fetching hunt areas:", error);
      }
    };

    fetchHuntAreas();
  }, []);

  // Fetch markers for the current hunt area
  useEffect(() => {
    if (!currentHuntArea) return;

    const fetchMarkers = async () => {
      try {
        const areaMarkers = await getMarkersForHuntArea(currentHuntArea.id);
        setMarkers(
          areaMarkers.map((marker: Partial<Marker>) => ({
            id: marker.id || '',
            latitude: marker.latitude || 0,
            longitude: marker.longitude || 0,
            type: marker.type || 'tree-stand',
            name: marker.name || 'Unnamed Marker',
            notes: marker.notes || '',
            createdBy: marker.createdBy || '',
            inUse: marker.inUse || false,
            assignedTo: marker.assignedTo || null,
            dateCreated: marker.dateCreated || new Date().toISOString(),
            huntAreaId: currentHuntArea.id, // Add huntAreaId here
          }))
        );
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
    };

    fetchMarkers();
  }, [currentHuntArea]);

  const addHuntArea = async (area: HuntArea) => {
    try {
      const id = await addHuntAreaToFirestore(area);
      setHuntAreas((prev) => [...prev, { ...area, id }]);
    } catch (error) {
      console.error("Error adding hunt area:", error);
    }
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

  const addMarker = async (marker: Marker) => {
    try {
      const id = await addMarkerToFirestore(marker);
      setMarkers((prev: Marker[]) => [...prev, { ...marker, id }]);
    } catch (error) {
      console.error("Error adding marker:", error);
    }
  };

  const updateMarker = async (id: string, updatedFields: Partial<Marker>) => {
    try {
      await updateMarkerInFirestore(id, updatedFields);
      setMarkers((prev: Marker[]) =>
        prev.map((marker) =>
          marker.id === id
            ? {
                ...marker,
                ...updatedFields,
                latitude: updatedFields.latitude ?? marker.latitude,
                longitude: updatedFields.longitude ?? marker.longitude,
                type: updatedFields.type ?? marker.type,
                name: updatedFields.name ?? marker.name,
                huntAreaId: updatedFields.huntAreaId ?? marker.huntAreaId,
              }
            : marker
        )
      );
    } catch (error) {
      console.error("Error updating marker:", error);
    }
  };

  const deleteMarker = async (id: string) => {
    try {
      await deleteMarkerFromFirestore(id);
      setMarkers((prev) => prev.filter((marker) => marker.id !== id));
    } catch (error) {
      console.error("Error deleting marker:", error);
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
      marker.assignedTo === userId ||
      marker.createdBy === userId ||
      !marker.inUse
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
  
    const delta = 0.01 / zoom;
    const minLng = longitude - delta;
    const minLat = latitude - delta;
    const maxLng = longitude + delta;
    const maxLat = latitude + delta;
  
    return [minLng, minLat, maxLng, maxLat];
  };

  const getMapBounds = (): { minLongitude: number; minLatitude: number; maxLongitude: number; maxLatitude: number } => {
    const { latitude, longitude, zoom } = mapLocationState;
  
    const delta = 0.01 / zoom;
    const minLongitude = longitude - delta;
    const minLatitude = latitude - delta;
    const maxLongitude = longitude + delta;
    const maxLatitude = latitude + delta;
  
    return { minLongitude, minLatitude, maxLongitude, maxLatitude };
  };

  const createDefaultHuntArea = (): HuntArea => {
    const bounds = getCurrentMapBounds();
  
    return {
      id: Date.now().toString(),
      name: 'New Hunt Area',
      notes: '',
      markers: [],
      bounds,
      lastUpdated: new Date().toISOString(),
      shared: false,
      sharedWith: [],
      createdBy: 'admin',
      clubId: 'club1',
    };
  };

  const setMapLocation = (location: { latitude: number; longitude: number; zoom: number }) => {
    mapLocationRef.current = location;
    setMapLocationState(location);
  };

  const contextValue = useMemo(() => ({
    markers,
    setMarkers,
    currentHuntArea,
    huntAreas,
    selectedMarkerId,
    mapLocation: mapLocationState,
    setCurrentHuntArea,
    setHuntAreas,
    addHuntArea,
    updateHuntArea,
    deleteHuntArea,
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
    getHuntAreasFromFirestore,
    addHuntAreaToFirestore,
    getMarkersForHuntArea,
  }), [
    markers,
    currentHuntArea,
    huntAreas,
    selectedMarkerId,
    mapLocationState,
  ]);

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

export const getHuntAreasFromFirestore = async (): Promise<HuntArea[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "huntAreas"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Unnamed Area", // Default to "Unnamed Area" if name is missing
        notes: data.notes || "", // Default to an empty string if notes are missing
        markers: data.markers || [], // Default to an empty array if markers are missing
        bounds: data.bounds || [0, 0, 0, 0], // Default to [0, 0, 0, 0] if bounds are missing
        lastUpdated: data.lastUpdated || new Date().toISOString(), // Default to the current timestamp
        shared: data.shared || false, // Default to false if shared is missing
        sharedWith: data.sharedWith || [], // Default to an empty array if sharedWith is missing
        createdBy: data.createdBy || "", // Default to an empty string if createdBy is missing
        clubId: data.clubId || "", // Default to an empty string if clubId is missing
      } as HuntArea;
    });
  } catch (error) {
    console.error("Error fetching hunt areas:", error);
    throw error;
  }
};
