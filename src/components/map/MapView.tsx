import React, { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Crosshair, Wind, Compass, Maximize, Plus, Minus, Layers, Search, X } from 'react-feather';
import { useMap } from '../../contexts/MapContext';
import { useUser } from '../../contexts/UserContext';
import MarkerDetailsPanel from './MarkerDetailsPanel';
import { v4 as uuidv4 } from 'uuid';
import { HuntArea, Marker, MarkerType } from '../../types/types';
import { addMarkerToFirestore, updateMarkerInFirestore, addHuntClubToFirestore, getHuntClubsFromFirestore, addHuntOutfitterToFirestore, getHuntOutfittersFromFirestore, addHuntAreaToFirestore, getHuntAreasFromFirestore } from '../../firebase';
import debounce from 'lodash/debounce';
import { useLocation } from 'react-router-dom'; // Import useLocation

// Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Mapbox Geocoding API endpoint
const GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

interface Club {
  id: string;
  name: string;
  location: string;
  coordinates?: [number, number]; // [longitude, latitude]
  notes?: string;
  createdBy: string;
  clubId: string;
}

interface Outfitter {
  id: string;
  name: string;
  location: string;
  coordinates?: [number, number]; // [longitude, latitude]
  notes?: string;
  createdBy: string;
  outfitterId: string;
}

const MarkerTypes = [
  { id: 'leaner-tripod', name: 'Leaner/Tripod', color: 'orange', icon: '/svgs/tree-stand.svg' },
  { id: 'hang-on', name: 'Hang On', color: 'orange', icon: '/svgs/tree-stand.svg' },
  { id: 'climber-stand', name: 'Climber Stand', color: 'orange', icon: '/svgs/tree-stand.svg' },
  { id: 'ground-blind', name: 'Ground Blind', color: 'green', icon: '/svgs/ground-blind.svg' },
  { id: 'custom-stand', name: 'Custom Stand', color: 'white', icon: '/svgs/Custom.svg' },
  { id: 'food-plot', name: 'Food Plot', color: 'green', icon: '/svgs/food-plot.svg' },
  { id: 'club-camp', name: 'Club/Camp', color: 'blue', icon: '/svgs/club-camp.svg' },
  { id: 'outfitter', name: 'Outfitter', color: 'purple', icon: '/svgs/outfitter.svg' },
  { id: 'gate', name: 'Gate', color: 'gray', icon: '/svgs/gate.svg' },
  { id: 'parking', name: 'Parking', color: 'gray', icon: '/svgs/parking.svg' },
  { id: 'ag-field', name: 'Ag Field', color: 'green', icon: '/svgs/ag-field.svg' },
  { id: 'feeder', name: 'Feeder', color: 'brown', icon: '/svgs/feeder.svg' },
  { id: 'bait-pile', name: 'Bait Pile', color: 'brown', icon: '/svgs/bait-pile.svg' },
  { id: 'custom-property', name: 'Custom Property', color: 'white', icon: '/svgs/Custom.svg' },
  { id: 'deer-harvest', name: 'Deer Harvest', color: 'red', icon: '/svgs/deer-harvest.svg' },
  { id: 'bear-harvest', name: 'Bear Harvest', color: 'red', icon: '/svgs/bear-harvest.svg' },
  { id: 'turkey-harvest', name: 'Turkey Harvest', color: 'red', icon: '/svgs/turkey-harvest.svg' },
  { id: 'deer-sighting', name: 'Deer Sighting', color: 'yellow', icon: '/svgs/deer-sighting.svg' },
  { id: 'bear-sighting', name: 'Bear Sighting', color: 'yellow', icon: '/svgs/bear-sighting.svg' },
  { id: 'turkey-sighting', name: 'Turkey Sighting', color: 'yellow', icon: '/svgs/turkey-sighting.svg' },
  { id: 'track', name: 'Track', color: 'purple', icon: '/svgs/track.svg' },
  { id: 'blood-trail', name: 'Blood Trail', color: 'red', icon: '/svgs/blood-trail.svg' },
  { id: 'bedding', name: 'Bedding', color: 'green', icon: '/svgs/bedding.svg' },
  { id: 'buck-rub', name: 'Buck Rub', color: 'brown', icon: '/svgs/buck-rub.svg' },
  { id: 'buck-scrape', name: 'Buck Scrape', color: 'brown', icon: '/svgs/buck-scrape.svg' },
  { id: 'droppings', name: 'Droppings', color: 'brown', icon: '/svgs/droppings.svg' },
  { id: 'trail-crossing', name: 'Trail Crossing', color: 'purple', icon: '/svgs/trail-crossing.svg' },
  { id: 'food-source', name: 'Food Source', color: 'green', icon: '/svgs/food-source.svg' },
  { id: 'glassing-point', name: 'Glassing Point', color: 'blue', icon: '/svgs/glassing-point.svg' },
  { id: 'buck-shed', name: 'Buck Shed', color: 'brown', icon: '/svgs/buck-shed.svg' },
  { id: 'turkey-strut', name: 'Turkey Strut', color: 'purple', icon: '/svgs/turkey-strut.svg' },
  { id: 'turkey-dust', name: 'Turkey Dust', color: 'brown', icon: '/svgs/turkey-dust.svg' },
  { id: 'turkey-roost', name: 'Turkey Roost', color: 'green', icon: '/svgs/turkey-roost.svg' },
  { id: 'camera', name: 'Camera', color: 'gray', icon: '/svgs/camera.svg' },
  { id: 'hazard', name: 'Hazard', color: 'red', icon: '/svgs/hazard.svg' },
  { id: 'custom', name: 'Custom', color: 'white', icon: '/svgs/Custom.svg' },
];

const MapView: React.FC = () => {
  const {
    getMarkersForHuntArea,
    markers,
    setMarkers,
    currentHuntArea,
    selectedMarkerId,
    setSelectedMarkerId,
    mapLocation,
    setMapLocation,
    setCurrentHuntArea,
    addMarker,
    deleteMarker,
    updateMarker,
    getHuntAreasFromFirestore,
    addHuntAreaToFirestore,
    huntClubs,
    setHuntClubs,
    huntOutfitters,
    setHuntOutfitters,
  } = useMap();

  const { user, isAdmin } = useUser();
  const location = useLocation(); // Use useLocation to get current route

  // Debug user and route
  useEffect(() => {
    console.log('User:', user);
    console.log('isAdmin:', isAdmin);
    console.log('Current route:', location.pathname);
  }, [user, isAdmin, location.pathname]);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapMarkers = useRef<Record<string, mapboxgl.Marker>>({});
  const mapPopups = useRef<Record<string, mapboxgl.Popup>>({});

  const [viewState, setViewState] = useState<ViewState>({
    latitude: mapLocation.latitude,
    longitude: mapLocation.longitude,
    zoom: mapLocation.zoom,
    bearing: 0,
    pitch: 0,
  });
  const [huntAreas, setHuntAreas] = useState<HuntArea[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [clickedPoint, setClickedPoint] = useState<{ longitude: number; latitude: number } | null>(null);
  const [addingMarker, setAddingMarker] = useState(false);
  const [selectedMarkerType, setSelectedMarkerType] = useState<MarkerType>('tree-stand');
  const [newMarkerName, setNewMarkerName] = useState('');
  const [newMarkerNotes, setNewMarkerNotes] = useState('');
  const [markerDetails, setMarkerDetails] = useState<any>(null);
  const [newHuntAreaName, setNewHuntAreaName] = useState('');
  const [newHuntAreaNotes, setNewHuntAreaNotes] = useState('');
  const [newHuntAreaBounds, setNewHuntAreaBounds] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [clubSearchQuery, setClubSearchQuery] = useState('');
  const [clubSuggestions, setClubSuggestions] = useState<any[]>([]);
  const [clubSearchError, setClubSearchError] = useState<string | null>(null);
  const [isClubSearching, setIsClubSearching] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [newClubCoordinates, setNewClubCoordinates] = useState<[number, number] | null>(null);

  // Utility function to detect mobile devices
  const isMobileDevice = () => {
    return /Mobi|Android/i.test(navigator.userAgent);
  };

  // Determine button and modal type based on route
  const getEntityType = () => {
    if (location.pathname === '/hunt-club') return 'hunt-club';
    if (location.pathname === '/hunt-outfitter') return 'hunt-outfitter';
    return 'hunt-area';
  };

  const entityType = getEntityType();

  // Debounced search function for place suggestions (Hunt Areas)
  const fetchPlaceSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setPlaceSuggestions([]);
        setSearchError(null);
        return;
      }
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await fetch(
          `${GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}&types=place,locality,region,country&limit=5`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch place suggestions');
        }
        const data = await response.json();
        setPlaceSuggestions(data.features || []);
        if (!data.features.length) {
          setSearchError('No places found for your query.');
        }
      } catch (error) {
        console.error('Error fetching place suggestions:', error);
        setSearchError('Error fetching places. Please try again.');
        setPlaceSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Debounced search function for club/outfitter suggestions
  const fetchClubSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setClubSuggestions([]);
        setClubSearchError(null);
        return;
      }
      setIsClubSearching(true);
      setClubSearchError(null);
      try {
        const response = await fetch(
          `${GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}&types=poi,place&limit=5`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch club suggestions');
        }
        const data = await response.json();
        const suggestions = data.features.map((feature: any) => ({
          id: feature.id,
          name: feature.place_name,
          location: feature.place_name.split(', ').slice(1).join(', '),
          coordinates: feature.center,
        }));
        setClubSuggestions(suggestions);
        if (!suggestions.length) {
          setClubSearchError(`No ${entityType === 'hunt-club' ? 'clubs' : 'outfitters'} found for your query.`);
        }
      } catch (error) {
        console.error('Error fetching club suggestions:', error);
        setClubSearchError(`Error fetching ${entityType === 'hunt-club' ? 'clubs' : 'outfitters'}. Please try again.`);
        setClubSuggestions([]);
      } finally {
        setIsClubSearching(false);
      }
    }, 300),
    [entityType]
  );

  // Fetch hunt clubs from Firestore on mount
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
  }, [setHuntClubs]);

  // Fetch hunt outfitters from Firestore on mount
  useEffect(() => {
    const fetchHuntOutfitters = async () => {
      try {
        const outfitters = await getHuntOutfittersFromFirestore();
        setHuntOutfitters(outfitters);
      } catch (error) {
        console.error('Error fetching hunt outfitters:', error);
      }
    };
    fetchHuntOutfitters();
  }, [setHuntOutfitters]);

  // Handle search input change for Hunt Areas
  useEffect(() => {
    if (entityType === 'hunt-area') {
      fetchPlaceSuggestions(searchQuery);
    }
  }, [searchQuery, fetchPlaceSuggestions, entityType]);

  // Handle search input change for Clubs/Outfitters
  useEffect(() => {
    if (entityType === 'hunt-club' || entityType === 'hunt-outfitter') {
      fetchClubSuggestions(clubSearchQuery);
    }
  }, [clubSearchQuery, fetchClubSuggestions, entityType]);

  // Handle place selection for Hunt Areas
  const handlePlaceSelect = (place: any) => {
    const [lng, lat] = place.center;
    const bounds: [number, number, number, number] = [
      lng - 0.01,
      lat - 0.01,
      lng + 0.01,
      lat + 0.01,
    ];
    setNewHuntAreaBounds(bounds);
    setMapLocation({ latitude: lat, longitude: lng, zoom: 12 });
    setSearchQuery(place.place_name);
    setPlaceSuggestions([]);
    setSearchError(null);
  };

  // Clear search input for Hunt Areas
  const handleClearSearch = () => {
    setSearchQuery('');
    setPlaceSuggestions([]);
    setSearchError(null);
    setNewHuntAreaBounds([0, 0, 0, 0]);
  };

  // Handle club selection
  const handleClubSelect = (club: any) => {
    setSelectedClub(club);
    setClubSearchQuery(club.name);
    setClubSuggestions([]);
    setClubSearchError(null);
    setNewClubCoordinates(club.coordinates);
    if (map.current) {
      map.current.flyTo({
        center: club.coordinates,
        zoom: 12,
      });
      setMapLocation({
        latitude: club.coordinates[1],
        longitude: club.coordinates[0],
        zoom: 12,
      });
    }
  };

  // Clear club search input
  const handleClearClubSearch = () => {
    setClubSearchQuery('');
    setClubSuggestions([]);
    setClubSearchError(null);
    setSelectedClub(null);
    setNewClubCoordinates(null);
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [mapLocation.longitude, mapLocation.latitude],
        zoom: mapLocation.zoom,
        cooperativeGestures: isMobileDevice(),
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'bottom-right'
      );

      map.current.on('click', (e) => {
        if (addingMarker) {
          setClickedPoint({
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat,
          });
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [addingMarker, setMapLocation]);

  // Handle drag and zoom restrictions during marker placement
  useEffect(() => {
    if (!map.current) return;

    if (addingMarker) {
      map.current.dragPan.disable();
      map.current.scrollZoom.disable();
    } else {
      map.current.dragPan.enable();
      map.current.scrollZoom.enable();
    }
  }, [addingMarker]);

  // Update view

  useEffect(() => {
    if (!map.current) return;

    let timeout: ReturnType<typeof setTimeout>;

    const moveHandler = () => {
      if (!map.current) return;

      const { lng, lat } = map.current.getCenter();
      const zoom = map.current.getZoom();

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setMapLocation({
          latitude: lat,
          longitude: lng,
          zoom,
        });
      }, 200);
    };

    map.current.on('move', moveHandler);

    return () => {
      if (map.current) {
        map.current.off('move', moveHandler);
      }
      clearTimeout(timeout);
    };
  }, [setMapLocation]);

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
  }, [getHuntAreasFromFirestore]);

  // Fetch markers for the current hunt area
  useEffect(() => {
    const fetchMarkers = async () => {
      if (!currentHuntArea?.id) return;

      try {
        const fetchedMarkers = await getMarkersForHuntArea(currentHuntArea.id);
        setMarkers(fetchedMarkers);
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
    };

    fetchMarkers();
  }, [currentHuntArea, getMarkersForHuntArea, setMarkers]);

  // Add or update markers on the map
  useEffect(() => {
    if (!map.current) return;

    Object.values(mapMarkers.current).forEach((marker) => marker.remove());
    Object.values(mapPopups.current).forEach((popup) => popup.remove());
    mapMarkers.current = {};
    mapPopups.current = {};

    markers.forEach((marker: any) => {
      const markerEl = document.createElement('div');
      markerEl.innerHTML = `<div class="marker-container" data-id="${marker.id}"></div>`;
      markerEl.style.cursor = 'pointer';

      const mapboxMarker = new mapboxgl.Marker(markerEl)
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map.current!);

      mapMarkers.current[marker.id] = mapboxMarker;

      const container = markerEl.querySelector('.marker-container') as HTMLElement;
      if (container) {
        const iconEl = document.createElement('img');
        iconEl.src = MarkerTypes.find((type) => type.id === marker.type)?.icon || '/svgs/default.svg';
        iconEl.alt = marker.type;
        iconEl.style.width = '48px';
        iconEl.style.height = '48px';
        iconEl.style.transform = 'translate(-50%, -50%)';
        iconEl.style.position = 'absolute';
        iconEl.style.top = '50%';
        iconEl.style.left = '50%';
        container.appendChild(iconEl);

        container.style.display = 'block';
        container.style.position = 'relative';
        container.style.width = '48px';
        container.style.height = '48px';
      }

      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedMarkerId(marker.id);
        setMarkerDetails(marker);
      });
    });

    return () => {
      Object.values(mapMarkers.current).forEach((marker) => marker.remove());
      Object.values(mapPopups.current).forEach((popup) => popup.remove());
    };
  }, [markers, setSelectedMarkerId]);

  // Temporary marker for adding new marker
  useEffect(() => {
    if (!map.current || !clickedPoint) return;

    const tempMarker = new mapboxgl.Marker({ color: 'blue' })
      .setLngLat([clickedPoint.longitude, clickedPoint.latitude])
      .addTo(map.current);

    return () => {
      tempMarker.remove();
    };
  }, [clickedPoint]);

  // Handle adding a new marker
  const handleAddMarker = async () => {
    if (!clickedPoint || !newMarkerName || !currentHuntArea?.id) {
      console.error('Missing required fields or hunt area');
      return;
    }

    const newMarker: Marker = {
      id: uuidv4(),
      latitude: clickedPoint.latitude,
      longitude: clickedPoint.longitude,
      type: selectedMarkerType,
      name: newMarkerName,
      notes: newMarkerNotes,
      createdBy: user?.id || '',
      inUse: false,
      assignedTo: null,
      dateCreated: new Date().toISOString(),
      huntAreaId: currentHuntArea.id,
    };

    try {
      const id = await addMarkerToFirestore(newMarker);
      setMarkers((prev: any) => [...prev, { ...newMarker, id }] as Marker[]);
      setAddingMarker(false);
      setClickedPoint(null);
      setNewMarkerName('');
      setNewMarkerNotes('');
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  };

  // Handle marker deletion
  const handleDeleteMarker = (id: string) => {
    deleteMarker(id);
    setMarkerDetails(null);
  };

  // Toggle marker usage status
  const handleToggleMarkerUsage = (id: string, inUse: boolean) => {
    const marker = markers.find((m: any) => m.id === id);
    if (marker) {
      updateMarker(id, { inUse: !inUse });
      if (markerDetails?.id === id) {
        setMarkerDetails({ ...markerDetails, inUse: !inUse });
      }
    }
  };

  // Assign marker to a hunter
  const handleAssignMarker = (id: string, hunterId: string | null) => {
    const marker = markers.find((m: any) => m.id === id);
    if (marker) {
      updateMarker(id, {
        assignedTo: hunterId,
        inUse: !!hunterId,
      });
      if (markerDetails?.id === id) {
        setMarkerDetails({
          ...markerDetails,
          assignedTo: hunterId,
          inUse: !!hunterId,
        });
      }
    }
  };

  // Update marker
  const handleUpdateMarker = async (id: string, updatedFields: Partial<Marker>) => {
    try {
      await updateMarkerInFirestore(id, updatedFields);
      setMarkers((prev: Marker[]) =>
        prev.map((marker: Marker) =>
          marker.id === id ? { ...marker, ...updatedFields } as Marker : marker
        )
      );
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  // Handle adding a new hunt area
  const handleAddHuntArea = async () => {
    if (!newHuntAreaName) {
      alert('Please enter a hunt area name.');
      return;
    }
    if (newHuntAreaBounds.some((coord) => coord === 0)) {
      alert('Please select a valid location for the hunt area.');
      return;
    }

    const newHuntArea: HuntArea = {
      id: '',
      name: newHuntAreaName,
      notes: newHuntAreaNotes,
      markers: [],
      bounds: newHuntAreaBounds,
      lastUpdated: new Date().toISOString(),
      shared: false,
      sharedWith: [],
      createdBy: user?.id || '',
      clubId: 'default-club',
    };

    try {
      const id = await addHuntAreaToFirestore(newHuntArea);
      const createdHuntArea = { ...newHuntArea, id };
      setHuntAreas((prev) => [...prev, createdHuntArea]);
      setCurrentHuntArea(createdHuntArea);

      const [minLng, minLat, maxLng, maxLat] = newHuntAreaBounds;
      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;

      const newMarker: Marker = {
        id: uuidv4(),
        latitude: centerLat,
        longitude: centerLng,
        type: 'custom' as MarkerType,
        name: `${newHuntAreaName} Center`,
        notes: `Center marker for ${newHuntAreaName}`,
        createdBy: user?.id || '',
        inUse: false,
        assignedTo: null,
        dateCreated: new Date().toISOString(),
        huntAreaId: id,
      };

      const markerId = await addMarkerToFirestore(newMarker);
      addMarker(newMarker);
      setMarkers((prev: any) => [...prev, { ...newMarker, id: markerId }] as Marker[]);

      setShowAddModal(false);
      setNewHuntAreaName('');
      setNewHuntAreaNotes('');
      setNewHuntAreaBounds([0, 0, 0, 0]);
      setSearchQuery('');
      setPlaceSuggestions([]);
      setSearchError(null);
    } catch (error) {
      console.error('Error adding hunt area:', error);
      alert('Failed to add hunt area. Please try again.');
    }
  };

  // Handle adding a new hunt club
  const handleAddHuntClub = async () => {
    if (!selectedClub || !newClubCoordinates) {
      alert('Please select a club.');
      return;
    }

    const newClub: Club = {
      id: uuidv4(),
      name: selectedClub.name,
      location: selectedClub.location || '',
      coordinates: newClubCoordinates,
      notes: newHuntAreaNotes,
      createdBy: user?.id || '',
      clubId: 'default-club',
    };

    try {
      const id = await addHuntClubToFirestore(newClub);
      const updatedClubs = [...huntClubs, { ...newClub, id }];
      setHuntClubs(updatedClubs);

      const newMarker: Marker = {
        id: uuidv4(),
        latitude: newClubCoordinates[1],
        longitude: newClubCoordinates[0],
        type: 'club-camp' as MarkerType,
        name: `${selectedClub.name} Location`,
        notes: `Marker for ${selectedClub.name}`,
        createdBy: user?.id || '',
        inUse: false,
        assignedTo: null,
        dateCreated: new Date().toISOString(),
        huntAreaId: currentHuntArea?.id || 'default-hunt-area',
      };

      const markerId = await addMarkerToFirestore(newMarker);
      addMarker(newMarker);
      setMarkers((prev: any) => [...prev, { ...newMarker, id: markerId }] as Marker[]);

      alert('Club added successfully!');
      setShowAddModal(false);
      setClubSearchQuery('');
      setClubSuggestions([]);
      setClubSearchError(null);
      setSelectedClub(null);
      setNewClubCoordinates(null);
      setNewHuntAreaNotes('');
    } catch (error) {
      console.error('Error adding hunt club:', error);
      alert('Failed to add club. Please try again.');
    }
  };

  // Handle adding a new outfitter
  const handleAddOutfitter = async () => {
    if (!selectedClub || !newClubCoordinates) {
      alert('Please select an outfitter.');
      return;
    }

    const newOutfitter: Outfitter = {
      id: uuidv4(),
      name: selectedClub.name,
      location: selectedClub.location || '',
      coordinates: newClubCoordinates,
      notes: newHuntAreaNotes,
      createdBy: user?.id || '',
      outfitterId: 'default-outfitter',
    };

    try {
      const id = await addHuntOutfitterToFirestore(newOutfitter);
      const updatedOutfitters = [...huntOutfitters, { ...newOutfitter, id }];
      setHuntOutfitters(updatedOutfitters);

      const newMarker: Marker = {
        id: uuidv4(),
        latitude: newClubCoordinates[1],
        longitude: newClubCoordinates[0],
        type: 'outfitter' as MarkerType,
        name: `${selectedClub.name} Location`,
        notes: `Marker for ${selectedClub.name}`,
        createdBy: user?.id || '',
        inUse: false,
        assignedTo: null,
        dateCreated: new Date().toISOString(),
        huntAreaId: currentHuntArea?.id || 'default-hunt-area',
      };

      const markerId = await addMarkerToFirestore(newMarker);
      addMarker(newMarker);
      setMarkers((prev: any) => [...prev, { ...newMarker, id: markerId }] as Marker[]);

      alert('Outfitter added successfully!');
      setShowAddModal(false);
      setClubSearchQuery('');
      setClubSuggestions([]);
      setClubSearchError(null);
      setSelectedClub(null);
      setNewClubCoordinates(null);
      setNewHuntAreaNotes('');
    } catch (error) {
      console.error('Error adding outfitter:', error);
      alert('Failed to add outfitter. Please try again.');
    }
  };

  return (
    <div className="relative h-[500px] w-full">
      <div ref={mapContainer} className="absolute top-0 bottom-0 left-0 right-0 rounded-md" />

      {/* Map Tools (Top-Right) */}
      <div
        className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 flex flex-col space-y-2"
        style={{ zIndex: 1000 }}
      >
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <Layers size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <Search size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <Compass size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <Wind size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <Maximize size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <Crosshair size={20} />
        </button>
        <div className="border-t border-gray-200 pt-2"></div>
        <button className="p-2 hover:bg-gray-100 rounded-md" onClick={handleZoomIn}>
          <Plus size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md" onClick={handleZoomOut}>
          <Minus size={20} />
        </button>
      </div>

      {/* Add Marker Form */}
      {addingMarker && (
        <div
          className="absolute top-4 left-4 right-4 md:right-auto bg-white p-4 rounded-md shadow-md md:w-80"
          style={{ zIndex: 1000 }}
        >
          <h2 className="text-lg font-bold mb-4">Add New Marker</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddMarker();
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Marker Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newMarkerName}
                onChange={(e) => setNewMarkerName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newMarkerNotes}
                onChange={(e) => setNewMarkerNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Marker Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedMarkerType}
                onChange={(e) => setSelectedMarkerType(e.target.value as MarkerType)}
              >
                <optgroup label="Stands">
                  {MarkerTypes.filter((type) =>
                    ['leaner-tripod', 'hang-on', 'climber-stand', 'ground-blind', 'custom-stand'].includes(type.id)
                  ).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Property Features">
                  {MarkerTypes.filter((type) =>
                    ['food-plot', 'club-camp', 'outfitter', 'gate', 'parking', 'ag-field', 'feeder', 'bait-pile', 'custom-property'].includes(type.id)
                  ).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Harvest">
                  {MarkerTypes.filter((type) => type.id.endsWith('-harvest')).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Sightings">
                  {MarkerTypes.filter((type) => type.id.endsWith('-sighting')).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Scouting">
                  {MarkerTypes.filter((type) =>
                    ['track', 'blood-trail', 'bedding', 'buck-rub', 'buck-scrape', 'droppings', 'trail-crossing', 'food-source', 'glassing-point', 'buck-shed'].includes(type.id)
                  ).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Turkey">
                  {MarkerTypes.filter((type) => type.id.startsWith('turkey-')).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Other">
                  {MarkerTypes.filter((type) => ['camera', 'hazard', 'custom'].includes(type.id)).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setAddingMarker(false);
                  setClickedPoint(null);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-green-600 text-white rounded-md"
                disabled={!newMarkerName}
              >
                Add Marker
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Marker Details Panel */}
      {markerDetails && (
        <div
          className="absolute top-4 left-4 right-4 md:right-auto md:w-80"
          style={{ zIndex: 1000 }}
        >
          <MarkerDetailsPanel
            marker={markerDetails}
            onClose={() => {
              setMarkerDetails(null);
              setSelectedMarkerId(null);
            }}
            onDelete={handleDeleteMarker}
            onToggleUsage={handleToggleMarkerUsage}
            onAssign={handleAssignMarker}
          />
        </div>
      )}

      {/* Add Hunt Area/Club/Outfitter Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center"
          style={{ zIndex: 2000 }}
        >
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {entityType === 'hunt-area' ? 'New Hunt Area' : entityType === 'hunt-club' ? 'New Hunt Club' : 'New Hunt Outfitter'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (entityType === 'hunt-area') handleAddHuntArea();
                else if (entityType === 'hunt-club') handleAddHuntClub();
                else if (entityType === 'hunt-outfitter') handleAddOutfitter();
              }}
            >
              {entityType === 'hunt-area' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newHuntAreaName}
                      onChange={(e) => setNewHuntAreaName(e.target.value)}
                      required
                      placeholder="Enter hunt area name"
                    />
                  </div>
                  <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md pr-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a place (e.g., city, region)"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {isSearching && <div className="text-sm text-gray-500 mt-1">Searching...</div>}
                    {searchError && <div className="text-sm text-red-500 mt-1">{searchError}</div>}
                    {placeSuggestions.length > 0 && (
                      <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
                        {placeSuggestions.map((place) => (
                          <li
                            key={place.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handlePlaceSelect(place)}
                          >
                            {place.place_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newHuntAreaNotes}
                      onChange={(e) => setNewHuntAreaNotes(e.target.value)}
                      rows={3}
                      placeholder="Add any notes about the hunt area"
                    />
                  </div>
                </>
              ) : entityType === 'hunt-club' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Club</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md pr-8"
                        value={clubSearchQuery}
                        onChange={(e) => setClubSearchQuery(e.target.value)}
                        placeholder="Search for a club (e.g., name or location)"
                      />
                      {clubSearchQuery && (
                        <button
                          type="button"
                          onClick={handleClearClubSearch}
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {isClubSearching && <div className="text-sm text-gray-500 mt-1">Searching...</div>}
                    {clubSearchError && <div className="text-sm text-red-500 mt-1">{clubSearchError}</div>}
                    {clubSuggestions.length > 0 && (
                      <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
                        {clubSuggestions.map((club) => (
                          <li
                            key={club.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleClubSelect(club)}
                          >
                            {club.name} ({club.location})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedClub?.name || ''}
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedClub?.location || ''}
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newHuntAreaNotes}
                      onChange={(e) => setNewHuntAreaNotes(e.target.value)}
                      rows={3}
                      placeholder="Add any notes about the club"
                    />
                  </div>
                </>
              ) : entityType === 'hunt-outfitter' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Outfitter</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md pr-8"
                        value={clubSearchQuery}
                        onChange={(e) => setClubSearchQuery(e.target.value)}
                        placeholder="Search for an outfitter (e.g., name or location)"
                      />
                      {clubSearchQuery && (
                        <button
                          type="button"
                          onClick={handleClearClubSearch}
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {isClubSearching && <div className="text-sm text-gray-500 mt-1">Searching...</div>}
                    {clubSearchError && <div className="text-sm text-red-500 mt-1">{clubSearchError}</div>}
                    {clubSuggestions.length > 0 && (
                      <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
                        {clubSuggestions.map((club) => (
                          <li
                            key={club.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleClubSelect(club)}
                          >
                            {club.name} ({club.location})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedClub?.name || ''}
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedClub?.location || ''}
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newHuntAreaNotes}
                      onChange={(e) => setNewHuntAreaNotes(e.target.value)}
                      rows={3}
                      placeholder="Add any notes about the outfitter"
                    />
                  </div>
                </>
              ) : null}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchQuery('');
                    setPlaceSuggestions([]);
                    setSearchError(null);
                    setNewHuntAreaName('');
                    setNewHuntAreaBounds([0, 0, 0, 0]);
                    setNewHuntAreaNotes('');
                    setClubSearchQuery('');
                    setClubSuggestions([]);
                    setClubSearchError(null);
                    setSelectedClub(null);
                    setNewClubCoordinates(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={
                    entityType === 'hunt-area'
                      ? !newHuntAreaName || newHuntAreaBounds.some((coord) => coord === 0)
                      : !selectedClub || !newClubCoordinates
                  }
                >
                  Add {entityType === 'hunt-area' ? 'Area' : entityType === 'hunt-club' ? 'Club' : 'Outfitter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Buttons (Bottom-Right) */}
      <div
        className="absolute bottom-4 right-4 left-4 flex justify-between"
        style={{ zIndex: 1000 }}
      >
        <button
          className={`px-3 py-1 ${
            currentHuntArea ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          } rounded-md`}
          onClick={() => {
            if (currentHuntArea) {
              setAddingMarker(true);
            } else {
              alert('Please select a hunt area before adding a marker.');
            }
          }}
          disabled={!currentHuntArea}
        >
          + ADD MARKER
        </button>
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700"
          style={{ zIndex: 1001 }}
          onClick={() => setShowAddModal(true)}
        >
          + NEW {entityType === 'hunt-area' ? 'HUNT AREA' : entityType === 'hunt-club' ? 'HUNT CLUB' : 'HUNT OUTFITTER'}
        </button>
      </div>
    </div>
  );
};

export default MapView;