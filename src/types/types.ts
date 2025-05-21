export type MarkerType = 
  | 'tree-stand' 
  | 'blind' 
  | 'food-plot' 
  | 'feeder' 
  | 'parking' 
  | 'camera' 
  | 'leaner-tripod'
  | 'hang-on'
  | 'climber-stand'
  | 'ground-blind'
  | 'custom-stand'
  | 'club-camp'
  | 'gate'
  | 'ag-field'
  | 'bait-pile'
  | 'custom-property'
  | 'buck-harvest'
  | 'doe-harvest'
  | 'turkey-harvest'
  | 'waterfowl-harvest'
  | 'hog-harvest'
  | 'geese-harvest'
  | 'duck-harvest'
  | 'pronghorn-harvest'
  | 'custom-harvest'
  | 'buck-sighting'
  | 'doe-sighting'
  | 'turkey-sighting'
  | 'waterfowl-sighting'
  | 'hog-sighting'
  | 'geese-sighting'
  | 'duck-sighting'
  | 'pronghorn-sighting'
  | 'custom-sighting'
  | 'track'
  | 'blood-trail'
  | 'bedding'
  | 'buck-rub'
  | 'buck-scrape'
  | 'droppings'
  | 'trail-crossing'
  | 'food-source'
  | 'glassing-point'
  | 'buck-shed'
  | 'turkey-tracks'
  | 'turkey-scratching'
  | 'turkey-scat'
  | 'turkey-roost'
  | 'turkey-gobble'
  | 'turkey-setup'
  | 'turkey-custom'
  | 'hazard'
  | 'custom';

export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  type: MarkerType;
  name?: string;
  notes?: string;
  createdBy: string;
  inUse: boolean;
  assignedTo: string | null;
  dateCreated: string;
  huntAreaId: string;
  cameraId?: string; // Add this line
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
  state?: string;
}

export interface CameraPhoto {
  id: string;
  cameraId: string;
  userId: string;
  date: string;
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
  tags?: string[];
}