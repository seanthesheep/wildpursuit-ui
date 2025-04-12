import React from 'react';
import { MarkerType } from '../../types/types';

interface CustomMarkerIconProps {
  type: MarkerType;
  inUse?: boolean;
  assignedTo?: string | null;
  size?: number;
}

const CustomMarkerIcon: React.FC<CustomMarkerIconProps> = ({
  type,
  inUse = false,
  assignedTo = null,
  size = 16
}) => {
  const getMarkerColor = (): string => {
    switch (type) {
      case 'tree-stand': return 'var(--marker-tree-stand-color, #f97316)';
      case 'blind': return 'var(--marker-blind-color, #3b82f6)';
      case 'food-plot': return 'var(--marker-food-plot-color, #22c55e)';
      case 'feeder': return 'var(--marker-feeder-color, #eab308)';
      case 'parking': return 'var(--marker-parking-color, #6b7280)';
      case 'camera': return 'var(--marker-camera-color, #ef4444)';
      default: return '#6b7280';
    }
  };

  const renderSVGPath = (): JSX.Element => {
    switch (type) {
      case 'tree-stand':
        // Tree stand ladder icon
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Tree trunk */}
            <path d="M12 2v20" />
            {/* Ladder steps */}
            <path d="M8 6h8" />
            <path d="M8 10h8" />
            <path d="M8 14h8" />
            <path d="M8 18h8" />
            {/* Platform */}
            <path d="M6 22h12" />
          </svg>
        );
      case 'blind':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        );
      case 'food-plot':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
          </svg>
        );
      case 'feeder':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
            <path d="M7 17L17 7"></path>
          </svg>
        );
      case 'parking':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polyline points="16 8 20 8 23 11 23 16 20 16 16 16 16 8"></polyline>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
      case 'camera':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        );
    }
  };

  return (
    <div
      className={`
        marker-icon marker-${type}
        ${inUse ? 'marker-in-use' : ''}
        ${assignedTo ? 'marker-assigned' : ''}
      `}
      style={{
        backgroundColor: getMarkerColor(),
        width: size * 2,
        height: size * 2,
        borderRadius: '50%',
        border: assignedTo ? '3px solid #3b82f6' : '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        opacity: inUse ? 0.6 : 1
      }}
    >
      {renderSVGPath()}
    </div>
  );
};

export default CustomMarkerIcon;
