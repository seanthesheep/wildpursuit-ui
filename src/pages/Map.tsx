import React, { useState } from 'react';
import MapView from '../components/map/MapView';
import { useMap } from '../contexts/MapContext';
import { useUser } from '../contexts/UserContext';
import { Plus, ChevronRight, Menu } from 'react-feather';

const MapSidebar: React.FC = () => {
  const { currentHuntArea, huntAreas, markers, setCurrentHuntArea, addHuntArea, setMapLocation } = useMap();
  const { user, isAdmin } = useUser();

  const [showAddHuntAreaModal, setShowAddHuntAreaModal] = useState(false);
  const [newHuntAreaName, setNewHuntAreaName] = useState('');
  const [newHuntAreaBounds, setNewHuntAreaBounds] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [newHuntAreaNotes, setNewHuntAreaNotes] = useState('');

  const handleAddHuntArea = async () => {
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

    try {
      await addHuntArea(newHuntArea); // Add the hunt area to Firestore
      alert('Hunt area added successfully!');
    } catch (error) {
      console.error('Error adding hunt area:', error);
      alert('Failed to add hunt area.');
    }

    // Reset modal state
    setNewHuntAreaName('');
    setNewHuntAreaBounds([0, 0, 0, 0]);
    setNewHuntAreaNotes('');
    setShowAddHuntAreaModal(false);
  };

  return (
    <div className="w-64 md:w-80 h-full bg-white border-r border-gray-200 overflow-y-auto">
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
              setShowAddHuntAreaModal(true); // Open the modal
            }}
          >
            <Plus size={16} className="mr-1" /> NEW AREA
          </button>
        )}
      </div>

      {/* Hunt Areas List */}
      <div className="p-3 md:p-4">
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
                  onClick={() => setCurrentHuntArea(area)} // Set the current hunt area
                >
                  <span className="font-medium">{area.name}</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Hunt Area Modal */}
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
