import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Calendar, Clock, Tag, Eye } from 'react-feather';
import { Marker } from '../../contexts/MapContext';

// Mock camera photos for demo
const cameraPhotos = {
  '3': [
    {
      id: '1',
      url: 'https://placehold.co/400',
      timestamp: new Date('2025-03-15 09:45:00').getTime(),
      tags: ['buck', '8-point']
    },
    {
      id: '2',
      url: 'https://placehold.co/400',
      timestamp: new Date('2025-03-14 18:22:00').getTime(),
      tags: ['doe']
    }
  ]
};

interface CameraMarkerPopupProps {
  marker: Marker;
  onClose: () => void;
}

const CameraMarkerPopup: React.FC<CameraMarkerPopupProps> = ({ marker, onClose }) => {
  // Get the photos for this camera
  const photos = cameraPhotos[marker.id as keyof typeof cameraPhotos] || [];

  // Get the most recent photo
  const latestPhoto = photos.length > 0 ? photos[0] : null;

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-1 bg-white rounded-md shadow-md w-72">
      <div className="flex justify-between items-center p-2 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center mr-2">
            <Camera size={12} />
          </div>
          <span className="font-medium">{marker.name}</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>

      {latestPhoto ? (
        <div>
          <div className="p-2">
            <div className="h-40 overflow-hidden rounded">
              <img src={latestPhoto.url} alt="Recent capture" className="w-full h-full object-cover" />
            </div>

            <div className="mt-2 text-sm">
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar size={14} className="mr-1" />
                <span>{formatDate(latestPhoto.timestamp)}</span>
                <Clock size={14} className="ml-3 mr-1" />
                <span>{formatTime(latestPhoto.timestamp)}</span>
              </div>

              <div className="flex items-center flex-wrap">
                <Tag size={14} className="mr-1 text-gray-600" />
                {latestPhoto.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-200 rounded-full px-2 py-0.5 mr-1 mb-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2 pt-0">
            <Link
              to="/trail-cameras"
              className="flex items-center justify-center w-full py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
            >
              <Eye size={14} className="mr-1" />
              View All Photos ({photos.length})
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <Camera size={32} className="mx-auto mb-2 text-gray-400" />
          <p>No photos yet from this camera</p>
          <Link
            to="/trail-cameras"
            className="inline-block mt-2 text-sm text-red-500 hover:text-red-600 underline"
          >
            Manage Cameras
          </Link>
        </div>
      )}

      {marker.notes && (
        <div className="p-2 pt-0">
          <p className="text-xs text-gray-600 italic border-t border-gray-100 pt-2">
            {marker.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraMarkerPopup;
