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

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic3N1bGxpdmFuZGV2IiwiYSI6ImNtOGN6azhnejBqZWkybHBzbXBvc3RqOTYifQ.jqD31E5Hd0xtu16Oy45uIA';

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

const MarkerTypes = [
  { id: 'tree-stand', name: 'Tree Stand', color: 'orange', icon: Navigation },
  { id: 'blind', name: 'Blind', color: 'blue', icon: Home },
  { id: 'food-plot', name: 'Food Plot', color: 'green', icon: Cloud },
  { id: 'feeder', name: 'Feeder', color: 'yellow', icon: MapPin },
  { id: 'parking', name: 'Parking', color: 'gray', icon: Truck },
  { id: 'camera', name: 'Trail Camera', color: 'red', icon: Camera },
];

const MapView: React.FC = () => {
  const {
    markers,
    selectedMarkerId,
    setSelectedMarkerId,
    mapLocation,
    setMapLocation,
    currentHuntArea,
    huntAreas,
    setCurrentHuntArea,
    addMarker,
    deleteMarker,
    updateMarker,
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

  const [showHuntAreaPopup, setShowHuntAreaPopup] = useState(false);
  const [clickedPoint, setClickedPoint] = useState<{ longitude: number; latitude: number } | null>(null);
  const [addingMarker, setAddingMarker] = useState(false);
  const [selectedMarkerType, setSelectedMarkerType] = useState('tree-stand');
  const [newMarkerName, setNewMarkerName] = useState('');
  const [newMarkerNotes, setNewMarkerNotes] = useState('');
  const [markerDetails, setMarkerDetails] = useState<any>(null);

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

  // Add or update markers on the map
  useEffect(() => {
    if (!map.current) return;

    // Clear existing marker references and popups
    Object.values(mapMarkers.current).forEach(marker => marker.remove());
    Object.values(mapPopups.current).forEach(popup => popup.remove());
    mapMarkers.current = {};
    mapPopups.current = {};

    // Add new markers
    markers.forEach(marker => {
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.innerHTML = `<div class="marker-container" data-id="${marker.id}"></div>`;
      markerEl.style.cursor = 'pointer';

      // Add the marker to the map
      const mapboxMarker = new mapboxgl.Marker(markerEl)
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map.current!);

      // Store reference to the marker
      mapMarkers.current[marker.id] = mapboxMarker;

      // Add marker icon to the container element
      const container = markerEl.querySelector('.marker-container');
      if (container) {
        // Create a wrapper div for the CustomMarkerIcon component
        const iconWrapper = document.createElement('div');
        container.appendChild(iconWrapper);

        // Render custom marker icon
        const iconEl = document.createElement('div');
        iconEl.className = `marker-icon marker-${marker.type} ${marker.inUse ? 'marker-in-use' : ''} ${marker.assignedTo ? 'marker-assigned' : ''}`;

        // Set marker styles based on type
        const markerColor = MarkerTypes.find(m => m.id === marker.type)?.color || 'gray';
        iconEl.style.backgroundColor = `var(--marker-${marker.type}-color, ${markerColor})`;
        iconEl.style.width = '36px';
        iconEl.style.height = '36px';
        iconEl.style.borderRadius = '50%';
        iconEl.style.border = marker.assignedTo ? '3px solid #3b82f6' : '2px solid white';
        iconEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        iconEl.style.display = 'flex';
        iconEl.style.alignItems = 'center';
        iconEl.style.justifyContent = 'center';
        iconEl.style.color = 'white';

        // Create SVG icon based on marker type
        // For tree stand, use the ladder icon
        if (marker.type === 'tree-stand') {
          iconEl.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20" />
              <path d="M8 6h8" />
              <path d="M8 10h8" />
              <path d="M8 14h8" />
              <path d="M8 18h8" />
              <path d="M6 22h12" />
            </svg>
          `;
        } else {
          iconEl.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${marker.type === 'blind' ?
                '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>' :
              marker.type === 'food-plot' ?
                '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>' :
              marker.type === 'feeder' ?
                '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path>' :
              marker.type === 'parking' ?
                '<rect x="1" y="3" width="15" height="13"></rect><polyline points="16 8 20 8 23 11 23 16 20 16 16 16 16 8"></polyline><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>' :
              marker.type === 'camera' ?
                '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>' :
                '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>'
              }
            </svg>
          `;
        }

        // Add opacity for in-use markers
        if (marker.inUse) {
          iconEl.style.opacity = '0.6';
        }

        container.appendChild(iconEl);

        // Add click event listener to show details
        markerEl.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedMarkerId(marker.id);

          // For camera markers, show a popup instead of the details panel
          if (marker.type === 'camera') {
            // Remove any existing popups
            Object.values(mapPopups.current).forEach(popup => popup.remove());

            // Create and display popup for camera
            const popupNode = document.createElement('div');
            popupNode.className = 'camera-popup-container';

            // Create the popup
            const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setLngLat([marker.longitude, marker.latitude])
              .setDOMContent(popupNode);

            // Store reference to popup
            mapPopups.current[marker.id] = popup;

            // Add the popup to the map
            popup.addTo(map.current!);

            // Render the camera popup content
            const cameraPopupContent = `
              <div class="p-1 bg-white rounded-md shadow-md" style="width: 280px;">
                <div class="flex justify-between items-center p-2 border-b border-gray-200">
                  <div class="flex items-center">
                    <div class="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center mr-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    </div>
                    <span class="font-medium">${marker.name}</span>
                  </div>
                  <button data-close-popup class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                <div class="p-2">
                  <div class="h-40 overflow-hidden rounded">
                    <img src="https://www.whitetailhabitatsolutions.com/uploads/blog/_blogLargeImage/6145/Screen-Shot-2016-12-13-at-7.25.02-AM.jpg" alt="Recent capture" class="w-full h-full object-cover" />
                  </div>

                  <div class="mt-2 text-sm">
                    <div class="flex items-center text-gray-600 mb-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span>Mar 15, 2025</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-3 mr-1"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      <span>9:45 AM</span>
                    </div>

                    <div class="flex items-center flex-wrap">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1 text-gray-600"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                      <span class="text-xs bg-gray-200 rounded-full px-2 py-0.5 mr-1 mb-1">buck</span>
                      <span class="text-xs bg-gray-200 rounded-full px-2 py-0.5 mr-1 mb-1">8-point</span>
                    </div>
                  </div>
                </div>

                <div class="p-2 pt-0">
                  <a href="/trail-cameras" class="flex items-center justify-center w-full py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    View All Photos (2)
                  </a>
                </div>

                ${marker.notes ? `
                <div class="p-2 pt-0">
                  <p class="text-xs text-gray-600 italic border-t border-gray-100 pt-2">${marker.notes}</p>
                </div>
                ` : ''}
              </div>
            `;

            popupNode.innerHTML = cameraPopupContent;

            // Add event listener to close button
            const closeButton = popupNode.querySelector('[data-close-popup]');
            if (closeButton) {
              closeButton.addEventListener('click', () => {
                popup.remove();
              });
            }
          } else {
            // For non-camera markers, show the details panel
            setMarkerDetails(marker);
          }
        });
      }
    });

    // Cleanup function
    return () => {
      Object.values(mapMarkers.current).forEach(marker => marker.remove());
      Object.values(mapPopups.current).forEach(popup => popup.remove());
    };
  }, [markers, map.current, setSelectedMarkerId]);

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
  const handleAddMarker = () => {
    if (!clickedPoint || !newMarkerName) return;

    const newMarker = {
      id: uuidv4(),
      latitude: clickedPoint.latitude,
      longitude: clickedPoint.longitude,
      type: selectedMarkerType as any,
      name: newMarkerName,
      notes: newMarkerNotes,
      createdBy: user?.id,
      inUse: false,
      assignedTo: null,
      dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    addMarker(newMarker);

    // Reset form
    setAddingMarker(false);
    setClickedPoint(null);
    setNewMarkerName('');
    setNewMarkerNotes('');
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Add New Marker</h3>
            <button
              onClick={() => {
                setAddingMarker(false);
                setClickedPoint(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          {clickedPoint ? (
            <div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Marker Type</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedMarkerType}
                  onChange={(e) => setSelectedMarkerType(e.target.value)}
                >
                  {MarkerTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newMarkerName}
                  onChange={(e) => setNewMarkerName(e.target.value)}
                  placeholder="Enter a name"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newMarkerNotes}
                  onChange={(e) => setNewMarkerNotes(e.target.value)}
                  placeholder="Add any additional details"
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setClickedPoint(null)}
                  className="px-3 py-1 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMarker}
                  className="px-3 py-1 bg-green-600 text-white rounded-md"
                  disabled={!newMarkerName}
                >
                  Add Marker
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">Click on the map to place your marker</p>
              <button
                onClick={() => setAddingMarker(false)}
                className="px-3 py-1 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
            </div>
          )}
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

      {/* Bottom Controls */}
      <div className="absolute bottom-4 right-4 left-4 flex justify-between z-10">
        {isAdmin ? (
          <>
            <button
              className="bg-green-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-700"
              onClick={() => setAddingMarker(true)}
            >
              + ADD MARKER
            </button>
            <button className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700">
              + NEW HUNT AREA
            </button>
          </>
        ) : (
          <button className="bg-green-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-700">
            VIEW HUNT AREAS
          </button>
        )}
      </div>
    </div>
  );
};

export default MapView;
