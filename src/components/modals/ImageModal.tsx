import React from 'react';
import { X } from 'react-feather';

interface ImageModalProps {
  imageUrl: string;
  date: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, date, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-7xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="relative aspect-w-16 aspect-h-9">
            <img
              src={imageUrl}
              alt={`Trail cam photo from ${new Date(date).toLocaleDateString()}`}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="p-4 bg-white">
            <p className="text-sm text-gray-600">
              {new Date(date).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;