import React, { useState } from 'react';
import MapView from '../components/map/MapView';
import { useMap } from '../contexts/MapContext';
import { useUser } from '../contexts/UserContext';
import { MapPin, Plus, Share2, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, Menu } from 'react-feather';

const MapSidebar: React.FC = () => {
  const { currentHuntArea, huntAreas, markers, setCurrentHuntArea, addHuntArea, setMapLocation } = useMap();
  const { user, isAdmin } = useUser();

  const [showAddCamera, setShowAddCamera] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({});
  const [showAddHuntAreaModal, setShowAddHuntAreaModal] = useState(false);
  const [newHuntAreaName, setNewHuntAreaName] = useState('');
  const [newHuntAreaBounds, setNewHuntAreaBounds] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [newHuntAreaNotes, setNewHuntAreaNotes] = useState('');

  // Filter markers based on user role
  const filteredMarkers = isAdmin
    ? markers
    : markers.filter(m => !m.inUse || m.assignedTo === user?.id);

  // Filter hunt areas based on user access
  const accessibleHuntAreas = isAdmin
    ? huntAreas
    : huntAreas.filter(area =>
        area.createdBy === user?.id ||
        (area.shared && area.sharedWith?.includes(user?.id || ''))
      );

  const toggleExpandArea = (areaId: string) => {
    setExpandedAreas(prev => ({
      ...prev,
      [areaId]: !prev[areaId]
    }));
  };

  const handleAddHuntArea = () => {
    if (!newHuntAreaName || newHuntAreaBounds.some((coord) => coord === 0)) {
      alert('Please fill in all required fields.');
      return;
    }
  
    const newHuntArea = {
      id: Date.now().toString(), // Generate a unique ID
      name: newHuntAreaName,
      notes: newHuntAreaNotes,
      markers: [],
      bounds: newHuntAreaBounds,
      lastUpdated: new Date().toISOString(),
      shared: false,
      sharedWith: [],
      createdBy: user?.id, // Use the current user's ID
    };
  
    // Add the new hunt area to the context
    addHuntArea(newHuntArea);
  
    // Reset modal state
    setNewHuntAreaName('');
    setNewHuntAreaBounds([0, 0, 0, 0]);
    setNewHuntAreaNotes('');
    setShowAddHuntAreaModal(false);
  };

  const { getMapBounds } = useMap() as unknown as { getMapBounds: () => { minLongitude: number; minLatitude: number; maxLongitude: number; maxLatitude: number } };

  if (!getMapBounds) {
    throw new Error('getMapBounds is not implemented in MapContext.');
  }

  function getCurrentMapBounds() {
    const bounds = getMapBounds();

    if (!bounds) {
      throw new Error('Unable to retrieve map bounds.');
    }

    return [bounds.minLongitude, bounds.minLatitude, bounds.maxLongitude, bounds.maxLatitude];
  }
  return (
    <div className="w-64 md:w-80 h-full bg-white border-r border-gray-200 overflow-y-auto mobile-full-width">
      <div className="p-3 md:p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800 uppercase">HUNT AREAS</h1>
      </div>

      <div className="p-2 flex justify-between">
        <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm">
          {isAdmin ? 'MANAGE AREAS' : 'MY AREAS'}
        </button>
        {isAdmin && (
          <button
            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
            onClick={() => {
              const bounds = getCurrentMapBounds();
              setNewHuntAreaBounds(bounds as [number, number, number, number]);
              setShowAddHuntAreaModal(true);
            }}
          >
            <Plus size={16} className="mr-1" /> NEW AREA
          </button>
        )}
      </div>

      <div className="p-3 md:p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
          {isAdmin ? 'ALL AREAS' : 'YOUR AREAS'}
        </h2>

        {accessibleHuntAreas.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            No hunt areas available. {isAdmin && 'Click the NEW AREA button to add one.'}
          </div>
        ) : (
          <div className="space-y-2">
            {accessibleHuntAreas.map((area) => (
              <div
                key={area.id}
                className="bg-gray-100 rounded-md"
              >
                <div
                  className="p-3 cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    // Center the map on the selected hunt area
                    if (area.bounds) {
                      const centerLongitude = (area.bounds[0] + area.bounds[2]) / 2; // Average of min and max longitude
                      const centerLatitude = (area.bounds[1] + area.bounds[3]) / 2; // Average of min and max latitude
                      setMapLocation({
                        latitude: centerLatitude,
                        longitude: centerLongitude,
                        zoom: 12, // Adjust zoom level as needed
                      });
                    }

                    // Optionally toggle the dropdown for the hunt area
                    toggleExpandArea(area.id);
                  }}
                >
                  <div className="flex items-center">
                    <div className="bg-green-500 text-white rounded-md p-1 mr-2">
                      <MapPin size={16} />
                    </div>
                    <span className="font-medium">{area.name}</span>
                  </div>
                  <button className="text-gray-500">
                    {expandedAreas[area.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>

                {expandedAreas[area.id] && (
                  <div className="px-3 pb-3">
                    {area.notes && <p className="text-sm text-gray-600 mb-2">{area.notes}</p>}
                    <div className="text-xs text-gray-500 mb-2">Last updated: {area.lastUpdated}</div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {markers
                        .filter(m => m.latitude >= (area.bounds?.[1] || 0) &&
                                   m.latitude <= (area.bounds?.[3] || 100) &&
                                   m.longitude >= (area.bounds?.[0] || 0) &&
                                   m.longitude <= (area.bounds?.[2] || 100))
                        .map(marker => (
                          <div
                            key={marker.id}
                            className={`px-2 py-1 rounded-md text-xs
                              ${marker.type === 'tree-stand' ? 'bg-orange-100 text-orange-800' :
                               marker.type === 'blind' ? 'bg-blue-100 text-blue-800' :
                               marker.type === 'camera' ? 'bg-red-100 text-red-800' :
                               marker.type === 'feeder' ? 'bg-yellow-100 text-yellow-800' :
                               marker.type === 'food-plot' ? 'bg-green-100 text-green-800' :
                               'bg-gray-100 text-gray-800'}`}
                          >
                            {marker.name} {marker.inUse && '(In Use)'}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 mt-4 border-t border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">MARKERS</h2>

        {filteredMarkers.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            No markers available.
          </div>
        ) : (
          <div className="space-y-2">
            {isAdmin ? (
              <>
                <div className="flex justify-between mb-2 text-xs text-gray-500">
                  <span>TYPE</span>
                  <span>STATUS</span>
                </div>
                {filteredMarkers.map((marker) => (
                  <div key={marker.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2
                        ${marker.type === 'tree-stand' ? 'bg-orange-500' :
                         marker.type === 'blind' ? 'bg-blue-500' :
                         marker.type === 'camera' ? 'bg-red-500' :
                         marker.type === 'feeder' ? 'bg-yellow-500' :
                         marker.type === 'food-plot' ? 'bg-green-500' :
                         'bg-gray-500'}`}
                      ></div>
                      <span className="text-sm">{marker.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      ${marker.inUse ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {marker.inUse ? 'In Use' : 'Available'}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="mb-2">
                  <h3 className="text-xs font-medium text-gray-600">YOUR ASSIGNMENTS</h3>
                  {filteredMarkers
                    .filter(m => m.assignedTo === user?.id)
                    .map((marker) => (
                      <div key={marker.id} className="flex items-center p-2 mt-1 bg-blue-50 rounded-md border border-blue-200">
                        <div className={`w-3 h-3 rounded-full mr-2
                          ${marker.type === 'tree-stand' ? 'bg-orange-500' :
                           marker.type === 'blind' ? 'bg-blue-500' :
                           marker.type === 'camera' ? 'bg-red-500' :
                           marker.type === 'feeder' ? 'bg-yellow-500' :
                           marker.type === 'food-plot' ? 'bg-green-500' :
                           'bg-gray-500'}`}
                        ></div>
                        <span className="text-sm">{marker.name}</span>
                      </div>
                    ))
                  }
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-600">AVAILABLE MARKERS</h3>
                  {filteredMarkers
                    .filter(m => !m.inUse)
                    .map((marker) => (
                      <div key={marker.id} className="flex items-center p-2 mt-1 bg-gray-100 rounded-md">
                        <div className={`w-3 h-3 rounded-full mr-2
                          ${marker.type === 'tree-stand' ? 'bg-orange-500' :
                           marker.type === 'blind' ? 'bg-blue-500' :
                           marker.type === 'camera' ? 'bg-red-500' :
                           marker.type === 'feeder' ? 'bg-yellow-500' :
                           marker.type === 'food-plot' ? 'bg-green-500' :
                           'bg-gray-500'}`}
                        ></div>
                        <span className="text-sm">{marker.name}</span>
                      </div>
                    ))
                  }
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 mt-auto border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <p className="font-medium text-center mb-2">
            {isAdmin ? 'Club Administrator' : `Member of ${currentHuntArea?.name || 'Hunting Club'}`}
          </p>
          <div className="bg-gray-100 p-2 rounded-md text-center">
            <p>You are logged in as</p>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {showAddHuntAreaModal && (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates (Bounds)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Min Longitude"
                    className="p-2 border border-gray-300 rounded-md"
                    value={newHuntAreaBounds[0]}
                    onChange={(e) =>
                      setNewHuntAreaBounds([+e.target.value, newHuntAreaBounds[1], newHuntAreaBounds[2], newHuntAreaBounds[3]])
                    }
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Min Latitude"
                    className="p-2 border border-gray-300 rounded-md"
                    value={newHuntAreaBounds[1]}
                    onChange={(e) =>
                      setNewHuntAreaBounds([newHuntAreaBounds[0], +e.target.value, newHuntAreaBounds[2], newHuntAreaBounds[3]])
                    }
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Max Longitude"
                    className="p-2 border border-gray-300 rounded-md"
                    value={newHuntAreaBounds[2]}
                    onChange={(e) =>
                      setNewHuntAreaBounds([newHuntAreaBounds[0], newHuntAreaBounds[1], +e.target.value, newHuntAreaBounds[3]])
                    }
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Max Latitude"
                    className="p-2 border border-gray-300 rounded-md"
                    value={newHuntAreaBounds[3]}
                    onChange={(e) =>
                      setNewHuntAreaBounds([newHuntAreaBounds[0], newHuntAreaBounds[1], newHuntAreaBounds[2], +e.target.value])
                    }
                    required
                  />
                </div>
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
                  onClick={() => setShowAddHuntAreaModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  Add Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Map: React.FC = () => {
  const { user } = useUser();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Mobile menu button - only visible on small screens */}
      <div className="md:hidden bg-white p-2 border-b border-gray-200 flex justify-between items-center z-10">
        <h1 className="font-semibold">Wildpursuit Map</h1>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 rounded-md bg-gray-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar for mobile - slides in from left */}
      <div className={`md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute top-0 left-0 h-full bg-white transform transition-transform duration-300 ease-in-out overflow-auto ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold">Map Options</h2>
            <button onClick={() => setShowSidebar(false)} className="text-gray-500">
              &times;
            </button>
          </div>
          <MapSidebar />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <MapSidebar />
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        <MapView />
        <div className="hidden md:block absolute top-4 left-4 z-10">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
          >
            {showSidebar ? '◀' : '▶'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Map;
