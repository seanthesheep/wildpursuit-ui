import React from 'react';
import { Map, Home, Camera, Triangle, Square, Box, Target } from 'react-feather';
import { MarkerType } from '../../types/types';

interface MarkerIconProps {
  type: MarkerType;
  inUse?: boolean;
  assignedTo?: string | null;
  size?: number;
}

const MarkerIcon: React.FC<MarkerIconProps> = ({
  type,
  inUse = false,
  assignedTo = null,
  size = 20
}) => {
  const getIcon = () => {
    switch (type) {
      case 'tree-stand':
        return <Triangle size={size} className="text-orange-500" />;
      case 'blind':
        return <Square size={size} className="text-blue-500" />;
      case 'food-plot':
        return <Box size={size} className="text-green-500" />;
      case 'feeder':
        return <Target size={size} className="text-yellow-500" />;
      case 'parking':
        return <Home size={size} className="text-gray-500" />;
      case 'camera':
        return <Camera size={size} className="text-red-500" />;
      default:
        return <Map size={size} className="text-purple-500" />;
    }
  };

  return (
    <div className={`
      bg-white rounded-full p-1 shadow-md border border-gray-300
      ${inUse ? 'opacity-50' : ''}
      ${assignedTo ? 'ring-2 ring-blue-500' : ''}
    `}>
      {getIcon()}
    </div>
  );
};

export default MarkerIcon;
