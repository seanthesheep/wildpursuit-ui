import React, { useState, useEffect, useCallback } from 'react';
import { useMap } from '../contexts/MapContext';
import { useUser } from '../contexts/UserContext';
import { Plus, ChevronRight, Menu, X } from 'react-feather';
import debounce from 'lodash/debounce';
import MapView from '../components/map/MapView';

// Mapbox Geocoding API endpoint
const GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
// Mock API endpoint for hunt clubs/outfitters (replace with actual API)
const CLUBS_API = 'https://api.example.com/clubs';

interface Club {
  id: string;
  name: string;
  location?: string;
  notes?: string;
  createdBy: string;
  clubId: string;
}

const MapSidebar: React.FC = () => {
  const { currentHuntArea, huntAreas, huntClubs, setCurrentHuntArea, setHuntClubs, addHuntArea, setMapLocation, addHuntClubToFirestore } = useMap();
  const { user, isAdmin } = useUser();

  const [showAddHuntAreaModal, setShowAddHuntAreaModal] = useState(false);
  const [newHuntAreaName, setNewHuntAreaName] = useState('');
  const [newHuntAreaBounds, setNewHuntAreaBounds] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [newHuntAreaNotes, setNewHuntAreaNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hunt-areas' | 'hunt-clubs'>('hunt-areas');
  const [clubSearchQuery, setClubSearchQuery] = useState('');
  const [clubSuggestions, setClubSuggestions] = useState<any[]>([]);
  const [clubSearchError, setClubSearchError] = useState<string | null>(null);
  const [isClubSearching, setIsClubSearching] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);

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
          `${GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${
            import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
          }&types=place,locality,region,country&limit=5`
        );
        if (!response.ok) throw new Error('Failed to fetch place suggestions');
        const data = await response.json();
        setPlaceSuggestions(data.features || []);
        if (!data.features.length) setSearchError('No places found for your query.');
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
        const response = await fetch(`${CLUBS_API}?query=${encodeURIComponent(query)}&limit=5`);
        if (!response.ok) throw new Error('Failed to fetch club suggestions');
        const data = await response.json();
        setClubSuggestions(data.results || []);
        if (!data.results.length) setClubSearchError('No clubs/outfitters found for your query.');
      } catch (error) {
        console.error('Error fetching club suggestions:', error);
        setClubSearchError('Error fetching clubs. Please try again.');
        setClubSuggestions([]);
      } finally {
        setIsClubSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input change for Hunt Areas
  useEffect(() => {
    fetchPlaceSuggestions(searchQuery);
  }, [searchQuery, fetchPlaceSuggestions]);

  // Handle search input change for Clubs/Outfitters
  useEffect(() => {
    fetchClubSuggestions(clubSearchQuery);
  }, [clubSearchQuery, fetchClubSuggestions]);

  // Handle place selection for Hunt Areas
  const handlePlaceSelect = (place: any) => {
    const [lng, lat] = place.center;
    const bounds: [number, number, number, number] = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01];
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
  };

  // Handle club selection for adding a new club
  const handleClubSelect = (club: any) => {
    setSelectedClub(club);
    setClubSearchQuery(club.name);
    setClubSuggestions([]);
    setClubSearchError(null);
  };

  // Handle club click from the list
  const handleClubClick = async (club: Club) => {
    if (club.location) {
      try {
        const response = await fetch(
          `${GEOCODING_API}/${encodeURIComponent(club.location)}.json?access_token=${
            import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
          }&limit=1`
        );
        if (!response.ok) throw new Error('Failed to fetch location coordinates');
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setMapLocation({ latitude: lat, longitude: lng, zoom: 12 });
        } else {
          console.warn(`No coordinates found for location: ${club.location}`);
        }
      } catch (error) {
        console.error('Error fetching club location coordinates:', error);
      }
    }
  };

  // Clear club search input
  const handleClearClubSearch = () => {
    setClubSearchQuery('');
    setClubSuggestions([]);
    setClubSearchError(null);
    setSelectedClub(null);
  };

  const handleAddHuntArea = async () => {
    if (!newHuntAreaName) {
      alert('Please enter a hunt area name.');
      return;
    }
    if (newHuntAreaBounds.some((coord) => coord === 0)) {
      alert('Please select a valid location for the hunt area.');
      return;
    }

    const newHuntArea = {
      id: uuidv4(),
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
      await addHuntArea(newHuntArea);
      alert('Hunt area added successfully!');
      setShowAddHuntAreaModal(false);
      setNewHuntAreaName('');
      setNewHuntAreaBounds([0, 0, 0, 0]);
      setNewHuntAreaNotes('');
      setSearchQuery('');
      setPlaceSuggestions([]);
      setSearchError(null);
    } catch (error) {
      console.error('Error adding hunt area:', error);
      alert('Failed to add hunt area. Please try again.');
    }
  };

  const handleAddHuntClub = async () => {
    if (!selectedClub) {
      alert('Please select a club or outfitter.');
      return;
    }

    const newClub: Club = {
      id: uuidv4(),
      name: selectedClub.name,
      location: selectedClub.location || '',
      notes: newHuntAreaNotes,
      createdBy: user?.id || '',
      clubId: 'default-club',
    };

    try {
      const id = await addHuntClubToFirestore(newClub);
      setHuntClubs([...huntClubs, { ...newClub, id }]);
      alert('Club/outfitter added successfully!');
      setShowAddHuntAreaModal(false);
      setClubSearchQuery('');
      setClubSuggestions([]);
      setClubSearchError(null);
      setSelectedClub(null);
      setNewHuntAreaNotes('');
    } catch (error) {
      console.error('Error adding hunt club:', error);
      alert('Failed to add club/outfitter. Please try again.');
    }
  };

  // Implementation of uuidv4
  function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  return (
    <div className="w-64 md:w-80 h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-3 md:p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800 uppercase">HUNT AREAS</h1>
      </div>

      {/* Tab Navigation */}
      <div className="p-2 flex justify-between border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            className={`px-3 py-1 rounded-md text-sm ${activeTab === 'hunt-areas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('hunt-areas')}
          >
            Hunt Areas
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${activeTab === 'hunt-clubs' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('hunt-clubs')}
          >
            Hunt Clubs/Outfitters
          </button>
        </div>
        {isAdmin && (
          <button
            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
            onClick={() => setShowAddHuntAreaModal(true)}
          >
            <Plus size={16} className="mr-1" /> {activeTab === 'hunt-areas' ? 'NEW AREA' : 'NEW CLUB'}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-3 md:p-4">
        {activeTab === 'hunt-areas' && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              {isAdmin ? 'ALL AREAS' : 'YOUR AREAS'}
            </h2>
            {huntAreas.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No hunt areas available. {isAdmin && 'Click the NEW AREA button to add one.'}
              </div>
            ) : (
              <div className="space-y-2">
                {huntAreas.map((area) => (
                  <div key={area.id} className="bg-gray-100 rounded-md">
                    <div
                      className="p-3 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setCurrentHuntArea(area);
                        if (area.bounds) {
                          const [minLng, minLat, maxLng, maxLat] = area.bounds;
                          setMapLocation({
                            latitude: (minLat + maxLat) / 2,
                            longitude: (minLng + maxLng) / 2,
                            zoom: 12,
                          });
                        }
                      }}
                    >
                      <span className="font-medium">{area.name}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'hunt-clubs' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">CLUBS/OUTFITTERS</h2>
            {huntClubs.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No clubs/outfitters available. {isAdmin && 'Click the NEW CLUB button to add one.'}
              </div>
            ) : (
              <div className="space-y-2">
                {huntClubs.map((club) => (
                  <div key={club.id} className="bg-gray-100 rounded-md">
                    <div
                      className="p-3 cursor-pointer flex items-center justify-between"
                      onClick={() => handleClubClick(club)}
                    >
                      <span className="font-medium">
                        {club.name} {club.location ? `(${club.location})` : ''}
                      </span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Hunt Area/Club Modal */}
      {showAddHuntAreaModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add {activeTab === 'hunt-areas' ? 'New Hunt Area' : 'New Club/Outfitter'}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                activeTab === 'hunt-areas' ? handleAddHuntArea() : handleAddHuntClub();
              }}
            >
              {activeTab === 'hunt-areas' ? (
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
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Club/Outfitter</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md pr-8"
                        value={clubSearchQuery}
                        onChange={(e) => setClubSearchQuery(e.target.value)}
                        placeholder="Search for a club or outfitter"
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
                      placeholder="Add any notes about the club/outfitter"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddHuntAreaModal(false);
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
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={activeTab === 'hunt-areas' ? (!newHuntAreaName || newHuntAreaBounds.some((coord) => coord === 0)) : !selectedClub}
                >
                  Add {activeTab === 'hunt-areas' ? 'Area' : 'Club'}
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
      {/* Mobile menu button */}
      <div className="md:hidden bg-white p-2 border-b border-gray-200 flex justify-between items-center z-10">
        <h1 className="font-semibold">Wildpursuit Map</h1>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 rounded-md bg-gray-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ${
          showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`absolute top-0 left-0 h-full bg-white transform transition-transform duration-300 ease-in-out overflow-auto ${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold">Map Options</h2>
            <button onClick={() => setShowSidebar(false)} className="text-gray-500">
              ×
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