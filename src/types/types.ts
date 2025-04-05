export type MarkerType = 'tree-stand' | 'blind' | 'food-plot' | 'feeder' | 'parking' | 'camera';

export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  type: MarkerType;
  name: string;
  notes?: string;
  createdBy?: string;
  inUse?: boolean;
  assignedTo?: string | null;
  dateCreated?: string;
}

export interface HuntArea {
  id: string;
  name: string;
  notes?: string;
  markers: Marker[];
  bounds?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  lastUpdated: string;
  shared?: boolean;
  sharedWith?: string[];
  createdBy?: string;
  clubId?: string;
}