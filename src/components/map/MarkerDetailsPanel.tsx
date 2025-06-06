import React from 'react';
import { X } from 'react-feather';
import { Marker, MarkerType } from '../../types/types';
import CustomMarkerIcon from './CustomMarkerIcon';
import { useUser } from '../../contexts/UserContext';
import CameraMarkerPopup from './CameraMarkerPopup';

interface MarkerDetailsPanelProps {
  marker: Marker;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onToggleUsage?: (id: string, currentState: boolean) => void;
  onAssign?: (id: string, userId: string | null) => void;
}

const markerTypeNames: Record<MarkerType, string> = {
  // Stands
  'tree-stand': 'Tree Stand',
  'leaner-tripod': 'Leaner/Tripod',
  'hang-on': 'Hang On',
  'climber-stand': 'Climber Stand',
  'ground-blind': 'Ground Blind',
  'blind': 'Blind',
  'custom-stand': 'Custom Stand',

  // Property Features
  'food-plot': 'Food Plot',
  'club-camp': 'Club/Camp',
  'gate': 'Gate',
  'parking': 'Parking',
  'ag-field': 'Ag Field',
  'feeder': 'Feeder',
  'bait-pile': 'Bait Pile',
  'custom-property': 'Custom Property',

  // Harvest
  'buck-harvest': 'Buck Harvest',
  'doe-harvest': 'Doe Harvest',
  'turkey-harvest': 'Turkey Harvest',
  'waterfowl-harvest': 'Waterfowl Harvest',
  'hog-harvest': 'Hog Harvest',
  'geese-harvest': 'Geese Harvest',
  'duck-harvest': 'Duck Harvest',
  'pronghorn-harvest': 'Pronghorn Harvest',
  'custom-harvest': 'Custom Harvest',

  // Sightings
  'buck-sighting': 'Buck Sighting',
  'doe-sighting': 'Doe Sighting',
  'turkey-sighting': 'Turkey Sighting',
  'waterfowl-sighting': 'Waterfowl Sighting',
  'hog-sighting': 'Hog Sighting',
  'geese-sighting': 'Geese Sighting',
  'duck-sighting': 'Duck Sighting',
  'pronghorn-sighting': 'Pronghorn Sighting',
  'custom-sighting': 'Custom Sighting',

  // Scouting
  'track': 'Track',
  'blood-trail': 'Blood Trail',
  'bedding': 'Bedding',
  'buck-rub': 'Buck Rub',
  'buck-scrape': 'Buck Scrape',
  'droppings': 'Droppings',
  'trail-crossing': 'Trail Crossing',
  'food-source': 'Food Source',
  'glassing-point': 'Glassing Point',
  'buck-shed': 'Buck Shed',

  // Turkey Specific
  'turkey-tracks': 'Turkey Tracks',
  'turkey-scratching': 'Turkey Scratching',
  'turkey-scat': 'Turkey Scat',
  'turkey-roost': 'Turkey Roost',
  'turkey-gobble': 'Turkey Gobble',
  'turkey-setup': 'Turkey Setup',
  'turkey-custom': 'Turkey Custom',

  // Other
  'camera': 'Trail Camera',
  'hazard': 'Hazard',
  'custom': 'Custom'
};

const MarkerDetailsPanel: React.FC<MarkerDetailsPanelProps> = ({
  marker,
  onClose,
  onDelete,
  onToggleUsage,
  onAssign
}) => {
  const { user, isAdmin, allUsers } = useUser();

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">{marker.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-3">
        <div className="flex items-center mb-2">
          <div className="mr-2">
            <CustomMarkerIcon
              type={marker.type}
              inUse={marker.inUse}
              assignedTo={marker.assignedTo}
              size={14}
            />
          </div>
          <span className="text-gray-700">
            {markerTypeNames[marker.type] || 'Unknown Type'}
          </span>
        </div>

        {marker.notes && (
          <p className="text-gray-600 text-sm mb-2">{marker.notes}</p>
        )}

        <div className="text-xs text-gray-500 mb-2">
          Coordinates: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
        </div>

        {marker.dateCreated && (
          <div className="text-xs text-gray-500 mb-2">
            Created: {marker.dateCreated}
          </div>
        )}

        {/* Add camera functionality for camera-type markers */}
        {marker.type === 'camera' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <CameraMarkerPopup
              markerId={marker.id}
              userId={user?.id || ''}
              onCameraSelect={(cameraId) => {
                // Handle camera selection if needed
                console.log('Selected camera:', cameraId);
              }}
            />
          </div>
        )}

        {/* Admin controls */}
        {isAdmin && onToggleUsage && onDelete && onAssign && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="font-medium text-sm mb-2">Admin Controls</h4>

            <div className="flex items-center mb-2">
              <span className="text-sm text-gray-700 mr-2">Status:</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${marker.inUse ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {marker.inUse ? 'In Use' : 'Available'}
              </span>
            </div>

            <div className="flex space-x-2 mb-2">
              <button
                onClick={() => onToggleUsage(marker.id, !!marker.inUse)}
                className={`px-2 py-1 text-xs rounded-md ${marker.inUse ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
              >
                {marker.inUse ? 'Mark Available' : 'Mark In Use'}
              </button>

              <button
                onClick={() => onDelete(marker.id)}
                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md"
              >
                Delete
              </button>
            </div>

            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Assign To Hunter</label>
              <select
                className="w-full p-1 text-sm border border-gray-300 rounded-md"
                value={marker.assignedTo || ''}
                onChange={(e) => onAssign(marker.id, e.target.value || null)}
              >
                <option value="">None</option>
                {Object.entries(allUsers)
                  .filter(([_, userData]) => userData.role === 'hunter')
                  .map(([id, userData]) => (
                    <option key={id} value={id}>{userData.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
        )}

        {/* Hunter view */}
        {!isAdmin && marker.assignedTo === user?.id && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm">
              This {markerTypeNames[marker.type]} is assigned to you.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkerDetailsPanel;
