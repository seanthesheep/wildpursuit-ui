import React, { useState } from 'react';
import { Camera, RefreshCw } from 'react-feather';
import { CameraPhoto } from '../types/types';
import ImageModal from './modals/ImageModal';

interface PhotoCardProps {
  photo: CameraPhoto;
  onSync: () => Promise<void>;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onSync }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <div 
        className="bg-white rounded-md shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={handleClick}
      >
        <div className="relative w-full h-40">
          {!imageError ? (
            <img
              src={photo.mediumUrl}
              alt={`Photo from ${new Date(photo.date).toLocaleDateString()}`}
              className="w-full h-full object-cover"
              onError={async () => {
                console.error('Image load error:', photo.mediumUrl);
                await onSync();
                setImageError(true);
              }}
              onLoad={() => setIsLoading(false)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <Camera size={24} className="text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Failed to load</span>
            </div>
          )}
          {isLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Camera size={24} className="text-gray-400 animate-pulse" />
            </div>
          )}
        </div>
        <div className="p-2">
          <p className="text-sm text-gray-600">
            {new Date(photo.date).toLocaleString()}
          </p>
        </div>
      </div>

      {showModal && (
        <ImageModal
          imageUrl={photo.largeUrl}
          date={photo.date}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default PhotoCard;