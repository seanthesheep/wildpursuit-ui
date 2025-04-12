import React, { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Crosshair, Wind, Compass, Maximize, Plus, Minus, Layers, Search, X, Cloud, Navigation, Truck, Home, Camera } from 'react-feather';
import { useMap } from '../../contexts/MapContext';
import { useUser } from '../../contexts/UserContext';
import MarkerIcon from './MarkerIcon';
import CustomMarkerIcon from './CustomMarkerIcon';
import CameraMarkerPopup from './CameraMarkerPopup';
import MarkerDetailsPanel from './MarkerDetailsPanel';
import { v4 as uuidv4 } from 'uuid';
import { HuntArea, Marker, MarkerType } from '../../types/types';
import { addMarkerToFirestore, updateMarkerInFirestore } from '../../firebase';

// Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

const MarkerTypes = [
  // Stands
  { id: 'leaner-tripod', name: 'Leaner/Tripod', color: 'orange', icon: '/svgs/tree-stand.svg' },
  { id: 'hang-on', name: 'Hang On', color: 'orange', icon: '/svgs/tree-stand.svg' },
  { id: 'climber-stand', name: 'Climber Stand', color: 'orange', icon: '/svgs/tree-stand.svg' },
  { id: 'ground-blind', name: 'Ground Blind', color: 'orange', icon: '/svgs/blind.svg' },
  { id: 'custom-stand', name: 'Custom Stand', color: 'orange', icon: '/svgs/Custom.svg' },

  // Property Features
  { id: 'food-plot', name: 'Food Plot', color: 'green', icon: '/svgs/food-plot.svg' },
  { id: 'club-camp', name: 'Club/Camp', color: 'green', icon: '/svgs/Custom.svg' },
  { id: 'gate', name: 'Gate', color: 'green', icon: '/svgs/Gate.svg' },
  { id: 'parking', name: 'Parking', color: 'green', icon: '/svgs/Parking.svg' },
  { id: 'ag-field', name: 'Ag Field', color: 'green', icon: '/svgs/food-plot.svg' },
  { id: 'feeder', name: 'Feeder', color: 'green', icon: '/svgs/Freeder.svg' },
  { id: 'bait-pile', name: 'Bait Pile', color: 'green', icon: '/svgs/other Food Source.svg' },
  { id: 'custom-property', name: 'Custom Property', color: 'green', icon: '/svgs/Custom.svg' },

  // Harvest
  { id: 'buck-harvest', name: 'Buck', color: 'red', icon: '/svgs/Buck.svg' },
  { id: 'doe-harvest', name: 'Doe', color: 'red', icon: '/svgs/Doe.svg' },
  { id: 'turkey-harvest', name: 'Turkey', color: 'red', icon: '/svgs/Turkey.svg' },
  { id: 'waterfowl-harvest', name: 'Waterfowl', color: 'red', icon: '/svgs/waterfowl.svg' },
  { id: 'hog-harvest', name: 'Hog', color: 'red', icon: '/svgs/Hog.svg' },
  { id: 'geese-harvest', name: 'Geese', color: 'red', icon: '/svgs/Geese.svg' },
  { id: 'duck-harvest', name: 'Duck', color: 'red', icon: '/svgs/Duck.svg' },
  { id: 'pronghorn-harvest', name: 'Pronghorn', color: 'red', icon: '/svgs/Pronghom.svg' },
  { id: 'custom-harvest', name: 'Custom Harvest', color: 'red', icon: '/svgs/Custom.svg' },

  // Sightings
  { id: 'buck-sighting', name: 'Buck', color: 'blue', icon: '/svgs/Buck.svg' },
  { id: 'doe-sighting', name: 'Doe', color: 'blue', icon: '/svgs/Doe.svg' },
  { id: 'turkey-sighting', name: 'Turkey', color: 'blue', icon: '/svgs/Turkey.svg' },
  { id: 'waterfowl-sighting', name: 'Waterfowl', color: 'blue', icon: '/svgs/waterfowl.svg' },
  { id: 'hog-sighting', name: 'Hog', color: 'blue', icon: '/svgs/Hog.svg' },
  { id: 'geese-sighting', name: 'Geese', color: 'blue', icon: '/svgs/Geese.svg' },
  { id: 'duck-sighting', name: 'Duck', color: 'blue', icon: '/svgs/Duck.svg' },
  { id: 'pronghorn-sighting', name: 'Pronghorn', color: 'blue', icon: '/svgs/Pronghom.svg' },
  { id: 'custom-sighting', name: 'Custom Sighting', color: 'blue', icon: '/svgs/Custom.svg' },

  // Scouting
  { id: 'track', name: 'Track', color: 'yellow', icon: '/svgs/Tracks.svg' },
  { id: 'blood-trail', name: 'Blood Trail', color: 'red', icon: '/svgs/Blood Trial.svg' },
  { id: 'bedding', name: 'Bedding', color: 'yellow', icon: '/svgs/Bedding.svg' },
  { id: 'buck-rub', name: 'Buck Rub', color: 'yellow', icon: '/svgs/Buck rub.svg' },
  { id: 'buck-scrape', name: 'Buck Scrape', color: 'yellow', icon: '/svgs/BuckScrap.svg' },
  { id: 'droppings', name: 'Droppings', color: 'yellow', icon: '/svgs/Scat.svg' },
  { id: 'trail-crossing', name: 'Trail Crossing', color: 'yellow', icon: '/svgs/Tracks.svg' },
  { id: 'food-source', name: 'Food Source', color: 'yellow', icon: '/svgs/other Food Source.svg' },
  { id: 'glassing-point', name: 'Glassing Point', color: 'yellow', icon: '/svgs/Custom.svg' },
  { id: 'buck-shed', name: 'Buck Shed', color: 'white', icon: '/svgs/Buck Shed.svg' },

  // Turkey Specific
  { id: 'turkey-tracks', name: 'Turkey Tracks', color: 'yellow', icon: '/svgs/Tracks.svg' },
  { id: 'turkey-scratching', name: 'Turkey Scratching', color: 'yellow', icon: '/svgs/Custom.svg' },
  { id: 'turkey-scat', name: 'Turkey Scat', color: 'yellow', icon: '/svgs/Scat.svg' },
  { id: 'turkey-roost', name: 'Roost Area', color: 'yellow', icon: '/svgs/Custom.svg' },
  { id: 'turkey-gobble', name: 'Gobble Heard', color: 'yellow', icon: '/svgs/Custom.svg' },
  { id: 'turkey-setup', name: 'Set Up Location', color: 'yellow', icon: '/svgs/Custom.svg' },
  { id: 'turkey-custom', name: 'Custom Turkey', color: 'yellow', icon: '/svgs/Custom.svg' },

  // Other
  { id: 'camera', name: 'Trail Camera', color: 'yellow', icon: '/svgs/trail camera.svg' },
  { id: 'hazard', name: 'Hazard', color: 'red', icon: '/svgs/Hazard.svg' },
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
    // Other destructured values...
  } = useMap();

  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

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
  const [showHuntAreaPopup, setShowHuntAreaPopup] = useState(false);
  const [clickedPoint, setClickedPoint] = useState<{ longitude: number; latitude: number } | null>(null);
  const [addingMarker, setAddingMarker] = useState(false);
  const [selectedMarkerType, setSelectedMarkerType] = useState<MarkerType>('tree-stand');
  const [newMarkerName, setNewMarkerName] = useState('');
  const [newMarkerNotes, setNewMarkerNotes] = useState('');
  const [markerDetails, setMarkerDetails] = useState<any>(null);
  const [newHuntAreaName, setNewHuntAreaName] = useState('');
  const [newHuntAreaNotes, setNewHuntAreaNotes] = useState('');

  // Utility function to detect mobile devices
  const isMobileDevice = () => {
    return /Mobi|Android/i.test(navigator.userAgent);
  };

  // Initialize map when component mounts
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

      // Add click event listener to the map
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
  }, [addingMarker]); // Add `addingMarker` as a dependency

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

  // Update view state when map moves
  useEffect(() => {
    if (!map.current) return;

    let timeout: ReturnType<typeof setTimeout>;

    const moveHandler = () => {
      if (!map.current) return;

      const { lng, lat } = map.current.getCenter();
      const zoom = map.current.getZoom();

      // Debounce updates to React state
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setMapLocation({
          latitude: lat,
          longitude: lng,
          zoom,
        });
      }, 200); // Adjust debounce delay as needed
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
        console.log('Fetched hunt areas:', areas);
        setHuntAreas(areas); // Now the data matches the HuntArea type
      } catch (error) {
        console.error("Error fetching hunt areas:", error);
      }
    };

    fetchHuntAreas();
  }, []);

  useEffect(() => {
    const fetchMarkers = async () => {
      if (!currentHuntArea?.id) return;

      try {
        const fetchedMarkers = await getMarkersForHuntArea(currentHuntArea.id);
        setMarkers(fetchedMarkers); // Update the markers state
      } catch (error) {
        console.error("Error fetching markers:", error);
      }
    };

    fetchMarkers();
  }, [currentHuntArea]);

  // Add or update markers on the map
  useEffect(() => {
    if (!map.current) return;

    // Clear existing marker references and popups
    Object.values(mapMarkers.current).forEach((marker) => marker.remove());
    Object.values(mapPopups.current).forEach((popup) => popup.remove());
    mapMarkers.current = {};
    mapPopups.current = {};

    // Add new markers
    markers.forEach((marker) => {
      // Create marker element
      const markerEl = document.createElement("div");
      markerEl.innerHTML = `<div class="marker-container" data-id="${marker.id}"></div>`;
      markerEl.style.cursor = "pointer";

      // Add the marker to the map
      const mapboxMarker = new mapboxgl.Marker(markerEl)
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map.current!);

      // Store reference to the marker
      mapMarkers.current[marker.id] = mapboxMarker;

      // Add marker icon to the container element
      const container = markerEl.querySelector(".marker-container") as HTMLElement;
      if (container) {
        const iconEl = document.createElement("img");
        iconEl.src = MarkerTypes.find((type) => type.id === marker.type)?.icon || "/svgs/default.svg";
        iconEl.alt = marker.type;
        iconEl.style.width = "48px";
        iconEl.style.height = "48px";
        iconEl.style.transform = "translate(-50%, -50%)";
        iconEl.style.position = "absolute";
        iconEl.style.top = "50%";
        iconEl.style.left = "50%";
        container.appendChild(iconEl);

        // Update container styles
        container.style.display = "block";
        container.style.position = "relative";
        container.style.width = "48px";
        container.style.height = "48px";
      }

      // Add click event listener to show marker details
      markerEl.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedMarkerId(marker.id);
        setMarkerDetails(marker);
      });
    });

    // Cleanup function
    return () => {
      Object.values(mapMarkers.current).forEach((marker) => marker.remove());
      Object.values(mapPopups.current).forEach((popup) => popup.remove());
    };
  }, [markers]);

  useEffect(() => {
    if (!map.current || !clickedPoint) return;

    const tempMarker = new mapboxgl.Marker({ color: 'blue' })
      .setLngLat([clickedPoint.longitude, clickedPoint.latitude])
      .addTo(map.current);

    return () => {
      tempMarker.remove();
    };
  }, [clickedPoint]);

  // Handle form submission for adding a new marker
  const handleAddMarker = async () => {
    if (!clickedPoint || !newMarkerName) return;

    if (!currentHuntArea?.id) {
      console.error("No hunt area selected. Cannot add marker.");
      return;
    }

    const newMarker: Marker = {
      id: uuidv4(),
      latitude: clickedPoint?.latitude || 0,
      longitude: clickedPoint?.longitude || 0,
      type: selectedMarkerType,
      name: newMarkerName,
      notes: newMarkerNotes,
      createdBy: user?.id || '',
      inUse: false,
      assignedTo: null,
      dateCreated: new Date().toISOString(),
      huntAreaId: currentHuntArea?.id || '',
    };

    try {
      const id = await addMarkerToFirestore(newMarker);
      setMarkers(prev => [...prev, { ...newMarker, id }] as Marker[]);
      setAddingMarker(false);
      setClickedPoint(null);
      setNewMarkerName('');
      setNewMarkerNotes('');
      console.log("Marker added with ID:", id);
    } catch (error) {
      console.error("Error adding marker:", error);
    }
  };

  // Handle marker deletion
  const handleDeleteMarker = (id: string) => {
    deleteMarker(id);
    setMarkerDetails(null);
  };

  // Toggle marker usage status (for admins)
  const handleToggleMarkerUsage = (id: string, inUse: boolean) => {
    const marker = markers.find(m => m.id === id);
    if (marker) {
      updateMarker(id, { inUse: !inUse });

      // Also update the local state if this is the selected marker
      if (markerDetails?.id === id) {
        setMarkerDetails({...markerDetails, inUse: !inUse});
      }
    }
  };

  // Assign marker to a hunter (for admins)
  const handleAssignMarker = (id: string, hunterId: string | null) => {
    const marker = markers.find(m => m.id === id);
    if (marker) {
      updateMarker(id, {
        assignedTo: hunterId,
        inUse: !!hunterId,
      });

      // Also update the local state if this is the selected marker
      if (markerDetails?.id === id) {
        setMarkerDetails({
          ...markerDetails,
          assignedTo: hunterId,
          inUse: !!hunterId
        });
      }
    }
  };

  // Update marker function
  const handleUpdateMarker = async (id: string, updatedFields: Partial<Marker>) => {
    try {
      await updateMarkerInFirestore(id, updatedFields);
      setMarkers(prev => 
        prev.map(marker => 
          marker.id === id
            ? { ...marker, ...updatedFields } as Marker
            : marker
        )
      );
    } catch (error) {
      console.error("Error updating marker:", error);
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

  const handleAddHuntArea = async () => {
    if (!newHuntAreaName) return;

    const newHuntArea: HuntArea = {
      id: '', // This will be updated with the Firestore ID
      name: newHuntAreaName,
      notes: newHuntAreaNotes,
      markers: [], // Initially empty
      bounds: [mapLocation.longitude - 0.01, mapLocation.latitude - 0.01, mapLocation.longitude + 0.01, mapLocation.latitude + 0.01], // Example bounds
      lastUpdated: new Date().toISOString(),
      shared: false,
      sharedWith: [],
      createdBy: user?.id || '', // Associate with the current user
      clubId: 'default-club', // Example club ID
    };

    try {
      const id = await addHuntAreaToFirestore(newHuntArea); // Save to Firestore
      setHuntAreas((prev) => [...prev, { ...newHuntArea, id }]); // Update local state
      setShowHuntAreaPopup(false);
      setNewHuntAreaName('');
      setNewHuntAreaNotes('');
      console.log('Hunt area added with ID:', id);
    } catch (error) {
      console.error('Error adding hunt area:', error);
    }
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="absolute top-0 bottom-0 left-0 right-0" />

      {/* Map Tools */}
      {/* <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 flex flex-col space-y-2 z-10">
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <Layers size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <  size={20} />
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
        <button
          className="p-2 hover:bg-gray-100 rounded-md"
          onClick={handleZoomIn}
        >
          <Plus size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded-md"
          onClick={handleZoomOut}
        >
          <Minus size={20} />
        </button>
      </div> */}

      {/* Add Marker Form */}
      {addingMarker && (
        <div className="absolute top-4 left-4 right-4 md:right-auto z-20 bg-white p-4 rounded-md shadow-md md:w-80">
          <h2 className="text-lg font-bold mb-4">Add New Marker</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddMarker(); // Call the function to add the marker
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
                  {MarkerTypes.filter(type => ['leaner-tripod', 'hang-on', 'climber-stand', 'ground-blind', 'custom-stand'].includes(type.id)).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Property Features">
                  {MarkerTypes.filter(type => ['food-plot', 'club-camp', 'gate', 'parking', 'ag-field', 'feeder', 'bait-pile', 'custom-property'].includes(type.id)).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Harvest">
                  {MarkerTypes.filter(type => type.id.endsWith('-harvest')).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Sightings">
                  {MarkerTypes.filter(type => type.id.endsWith('-sighting')).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Scouting">
                  {MarkerTypes.filter(type => ['track', 'blood-trail', 'bedding', 'buck-rub', 'buck-scrape', 'droppings', 'trail-crossing', 'food-source', 'glassing-point', 'buck-shed'].includes(type.id)).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Turkey">
                  {MarkerTypes.filter(type => type.id.startsWith('turkey-')).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Other">
                  {MarkerTypes.filter(type => ['camera', 'hazard', 'custom'].includes(type.id)).map((type) => (
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
                disabled={!newMarkerName} // Disable button if no name is provided
              >
                Add Marker
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Marker Details Panel (for non-camera markers) */}
      {markerDetails && (
        <div className="absolute top-4 left-4 right-4 md:right-auto z-20 md:w-80">
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

      {/* Hunt Area Popup */}
      {showHuntAreaPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add New Hunt Area</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddHuntArea();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newHuntAreaName}
                  onChange={(e) => setNewHuntAreaName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newHuntAreaNotes}
                  onChange={(e) => setNewHuntAreaNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowHuntAreaPopup(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Add Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-4 right-4 left-4 flex justify-between z-10">
        <button
          className={`px-3 py-1 ${
            currentHuntArea
              ? "bg-green-600 text-white"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          } rounded-md`}
          onClick={() => {
            if (currentHuntArea) {
              setAddingMarker(true);
            } else {
              alert("Please select a hunt area before adding a marker.");
            }
          }}
          disabled={!currentHuntArea}
        >
          + ADD MARKER
        </button>
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700"
          onClick={() => {
            setShowHuntAreaPopup(true);
          }}
        >
          + NEW HUNT AREA
        </button>
      </div>
    </div>
  );
};

export default MapView;
