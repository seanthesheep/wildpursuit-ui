import React, { createContext, useState, useContext, ReactNode, useRef, useMemo, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import {
  addHuntAreaToFirestore,
  addMarkerToFirestore,
  getHuntAreasFromFirestore,
  getMarkersForHuntArea,
  updateHuntAreaInFirestore,
  updateMarkerInFirestore,
  deleteHuntAreaFromFirestore,
  deleteMarkerFromFirestore,
  addHuntClubToFirestore,
  getHuntClubsFromFirestore,
  db,
} from "../firebase";
import { HuntArea, Marker, MarkerType } from '../types/types';

// Types
interface Club {
  id: string;
  name: string;
  location?: string;
  notes?: string;
  createdBy: string;
  clubId: string;
}

interface MapContextType {
  currentHuntArea: HuntArea | null;
  huntAreas: HuntArea[];
  huntClubs: Club[]; // Added huntClubs to context
  markers: Marker[];
  selectedMarkerId: string | null;
  mapLocation: { latitude: number; longitude: number; zoom: number };
  setCurrentHuntArea: (area: HuntArea | null) => void;
  setHuntAreas: (areas: HuntArea[]) => void;
  setHuntClubs: (clubs: Club[]) => void; // Added setter for huntClubs
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
  addHuntClubToFirestore: (club: Club) => Promise<string>;
  getHuntClubsFromFirestore: () => Promise<Club[]>; // Added to context
}

const defaultMapContext: MapContextType = {
  currentHuntArea: null,
  huntAreas: [],
  huntClubs: [], // Added to default context
  markers: [],
  selectedMarkerId: null,
  mapLocation: { latitude: 34.7195, longitude: -84.5478, zoom: 15 },
  setCurrentHuntArea: () => console.warn('not implemented in defaultMapContext'),
  setHuntAreas: () => console.warn('not implemented in defaultMapContext'),
  setHuntClubs: () => console.warn('not implemented in defaultMapContext'), // Added to default context
  addHuntArea: () => console.warn('not implemented in defaultMapContext'),
  updateHuntArea: () => console.warn('not implemented in defaultMapContext'),
  deleteHuntArea: () => console.warn('not implemented in defaultMapContext'),
  setMarkers: () => console.warn('setMarkers not implemented'),
  addMarker: () => console.warn('not implemented in defaultMapContext'),
  updateMarker: () => console.warn('not implemented in defaultMapContext'),
  deleteMarker: () => console.warn('not implemented in defaultMapContext'),
  setSelectedMarkerId: () => console.warn('not implemented in defaultMapContext'),
  setMapLocation: () => console.warn('not implemented in defaultMapContext'),
  shareHuntArea: () => console.warn('not implemented in defaultMapContext'),
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
  getHuntAreasFromFirestore: async () => Promise.resolve([]),
  addHuntAreaToFirestore: async () => '',
  getMarkersForHuntArea: async () => Promise.resolve([]),
  addHuntClubToFirestore: async () => '',
  getHuntClubsFromFirestore: async () => Promise.resolve([]), // Added to default context
};

const MapContext = createContext<MapContextType>(defaultMapContext);

export const useMap = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentHuntArea, setCurrentHuntArea] = useState<HuntArea | null>(null);
  const [huntAreas, setHuntAreas] = useState<HuntArea[]>([]);
  const [huntClubs, setHuntClubs] = useState<Club[]>([]); // Added state for huntClubs
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mapLocationState, setMapLocationState] = useState({
    latitude: 34.7195,
    longitude: -84.5478,
    zoom: 15,
  });

  const mapLocationRef = useRef(mapLocationState);

  // Fetch hunt areas from Firestore
  useEffect(() => {
    const fetchHuntAreas = async () => {
      try {
        const areas = await getHuntAreasFromFirestore();
        setHuntAreas(areas);
      } catch (error) {
        console.error('Error fetching hunt areas:', error);
      }
    };
    fetchHuntAreas();
  }, []);

  // Fetch hunt clubs from Firestore
  useEffect(() => {
    const fetchHuntClubs = async () => {
      try {
        const clubs = await getHuntClubsFromFirestore();
        setHuntClubs(clubs);
      } catch (error) {
        console.error('Error fetching hunt clubs:', error);
      }
    };
    fetchHuntClubs();
  }, []);

  // Fetch markers for the current hunt area
  useEffect(() => {
    if (!currentHuntArea) return;
    const fetchMarkers = async () => {
      try {
        const areaMarkers = await getMarkersForHuntArea(currentHuntArea.id);
        setMarkers(areaMarkers);
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
      console.error('Error adding hunt area:', error);
    }
  };

  const updateHuntArea = (id: string, updatedFields: Partial<HuntArea>) => {
    updateHuntAreaInFirestore(id, updatedFields);
    setHuntAreas(
      huntAreas.map((area) => (area.id === id ? { ...area, ...updatedFields } : area))
    );
    if (currentHuntArea?.id === id) {
      setCurrentHuntArea({ ...currentHuntArea, ...updatedFields });
    }
  };

  const deleteHuntArea = (id: string) => {
    deleteHuntAreaFromFirestore(id);
    setHuntAreas(huntAreas.filter((area) => area.id !== id));
    if (currentHuntArea?.id === id) {
      setCurrentHuntArea(null);
    }
  };

  const addMarker = async (marker: Marker) => {
    try {
      await addMarkerToFirestore(marker);
      setMarkers((prev: Marker[]) => [...prev, marker]);
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  };

  const updateMarker = async (id: string, updatedFields: Partial<Marker>) => {
    try {
      await updateMarkerInFirestore(id, updatedFields);
      setMarkers((prev: Marker[]) =>
        prev.map((marker) =>
          marker.id === id ? { ...marker, ...updatedFields } : marker
        )
      );
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  };

  const deleteMarker = async (id: string) => {
    try {
      await deleteMarkerFromFirestore(id);
      setMarkers((prev) => prev.filter((marker) => marker.id !== id));
    } catch (error) {
      console.error('Error deleting marker:', error);
    }
  };

  const shareHuntArea = (id: string, userIds: string[]) => {
    const updatedFields = {
      shared: true,
      sharedWith: userIds,
    };
    updateHuntAreaInFirestore(id, updatedFields);
    setHuntAreas(
      huntAreas.map((area) =>
        area.id === id ? { ...area, ...updatedFields } : area
      )
    );
  };

  const getMarkersForUser = (userId: string) => {
    return markers.filter(
      (marker) => marker.assignedTo === userId || marker.createdBy === userId || !marker.inUse
    );
  };

  const getAvailableMarkers = (type?: MarkerType) => {
    let availableMarkers = markers.filter((marker) => !marker.inUse);
    if (type) {
      availableMarkers = availableMarkers.filter((marker) => marker.type === type);
    }
    return availableMarkers;
  };

  const getCurrentMapBounds = (): [number, number, number, number] => {
    const { latitude, longitude, zoom } = mapLocationState;
    const delta = 0.01 / zoom;
    return [longitude - delta, latitude - delta, longitude + delta, latitude + delta];
  };

  const getMapBounds = (): { minLongitude: number; minLatitude: number; maxLongitude: number; maxLatitude: number } => {
    const { latitude, longitude, zoom } = mapLocationState;
    const delta = 0.01 / zoom;
    return {
      minLongitude: longitude - delta,
      minLatitude: latitude - delta,
      maxLongitude: longitude + delta,
      maxLatitude: latitude + delta,
    };
  };

  const createDefaultHuntArea = (): HuntArea => {
    const bounds = getCurrentMapBounds();
    return {
      id: uuidv4(),
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

  // Implementation of uuidv4
  function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const contextValue = useMemo(() => ({
    markers,
    setMarkers,
    currentHuntArea,
    huntAreas,
    huntClubs, // Added to context value
    selectedMarkerId,
    mapLocation: mapLocationState,
    setCurrentHuntArea,
    setHuntAreas,
    setHuntClubs, // Added to context value
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
    addHuntClubToFirestore,
    getHuntClubsFromFirestore, // Added to context value
  }), [
    markers,
    currentHuntArea,
    huntAreas,
    huntClubs, // Added to dependencies
    selectedMarkerId,
    mapLocationState,
  ]);

  return <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>;
};