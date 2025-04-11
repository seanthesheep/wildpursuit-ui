import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Camera, Grid, List } from 'react-feather';
import { useUser } from '../contexts/UserContext';
import { useSpypointSync } from '../hooks/useSpypointSync';
import { db } from '../firebase'; // Firestore instance
import { collection, getDocs } from 'firebase/firestore';
import CameraMarkerPopup from '../components/map/CameraMarkerPopup';

interface Marker {
  id: string;
  name: string;
  notes?: string;
  cameraId?: string; // Associated camera ID
  type: string; // Marker type (e.g., "camera")
}

interface CameraPhoto {
  id: string;
  cameraId: string;
  userId: string;
  date: string;
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
  tags: string[];
}

const TrailCameras: React.FC = () => {
  const { user } = useUser();
  const [markers, setMarkers] = useState<Marker[]>([]); // State for markers
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [photos, setPhotos] = useState<CameraPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false); // New loading state
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const userId = user?.id || 'exampleUserId'; // Replace with actual user ID from context/auth
  const { syncPhotos, isLoading, lastSync, error } = useSpypointSync();

  // Fetch markers from Firestore
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const markersCollection = collection(db, 'markers');
        const snapshot = await getDocs(markersCollection);
        const fetchedMarkers: Marker[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Marker[];

        console.log('Fetched Markers:', fetchedMarkers); // Debug log
        setMarkers(fetchedMarkers);
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
    };

    fetchMarkers();
  }, []);

  // Fetch photos for the selected camera
  useEffect(() => {
    console.log(`Fetching photos for Camera ID: ${selectedCameraId}`); // Debug log

    if (!selectedCameraId) {
      setPhotos([]); // Clear photos if no camera is selected
      return;
    }

    const fetchPhotos = async () => {
      setPhotosLoading(true); // Start loading
      try {
        const photosCollection = collection(
          db,
          'users',
          userId,
          'cameras',
          selectedCameraId,
          'photos'
        );
        const snapshot = await getDocs(photosCollection);
        const fetchedPhotos: CameraPhoto[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedPhotos.push({
            id: doc.id,
            cameraId: data.cameraId,
            userId: data.userId,
            date: data.date,
            smallUrl: data.smallUrl,
            mediumUrl: data.mediumUrl,
            largeUrl: data.largeUrl,
            tags: data.tags || [],
          });
        });

        console.log(`Fetched Photos:`, fetchedPhotos); // Debug log
        setPhotos(fetchedPhotos); // Update photos state
      } catch (error) {
        console.error('Error fetching photos:', error);
        setPhotos([]); // Clear photos on error
      } finally {
        setPhotosLoading(false); // End loading
      }
    };

    fetchPhotos();
  }, [selectedCameraId, userId]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">TRAIL CAMERAS</h1>
        <div className="flex space-x-4">
          <button
            className={`p-2 rounded-md ${view === 'grid' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            onClick={() => setView('grid')}
          >
            <Grid size={20} />
          </button>
          <button
            className={`p-2 rounded-md ${view === 'list' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            onClick={() => setView('list')}
          >
            <List size={20} />
          </button>
          <button
            className="p-2 rounded-md hover:bg-gray-800"
            onClick={() => console.log('Map View')}
          >
            <MapPin size={20} />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold">Trail Cameras</h1>
        <button
          onClick={syncPhotos}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Syncing...' : 'Sync Photos'}
        </button>
      </div>
      {error && (
        <div className="text-red-500 mb-4 p-4">
          Error: {error}
        </div>
      )}
      {lastSync && (
        <div className="text-gray-500 text-sm mb-4 p-4">
          Last synced: {lastSync.toLocaleString()}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Camera Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <span className="font-semibold">Your Cameras</span>
            <button className="text-green-600">
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {markers.filter(marker => marker.type === 'camera').map((marker) => (
              <div
                key={marker.id}
                className="bg-orange-100 p-3 rounded-md flex items-center border-l-4 border-orange-500 cursor-pointer"
                onClick={() => {
                  if (marker.cameraId) {
                    console.log(`Selected Camera ID: ${marker.cameraId}`); // Debug log
                    setSelectedCameraId(marker.cameraId); // Fetch all photos for the associated camera
                  } else {
                    console.warn(`Marker ${marker.id} has no associated camera.`);
                    setSelectedCameraId(null); // Clear the selected camera
                  }
                }}
              >
                <div className="bg-orange-500 text-white rounded-md p-1 mr-2 flex-shrink-0">
                  <Camera size={16} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{marker.name || 'Unnamed Marker'}</div>
                  <div className="text-xs text-gray-500">
                    {marker.notes || 'No description'}
                  </div>
                </div>
                <CameraMarkerPopup
                  markerId={marker.id}
                  userId={userId}
                  onCameraSelect={(cameraId) => setSelectedCameraId(cameraId)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          {photosLoading ? ( // Show loading indicator while photos are being fetched
            <div className="text-center p-8">
              <Camera size={48} className="mx-auto text-gray-300 mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-700">Loading Photos...</h3>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center p-8">
              <Camera size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No Trail Camera Photos</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-md shadow-sm overflow-hidden">
                  <img src={photo.mediumUrl} alt="Trail cam" className="w-full h-40 object-cover" />
                  <div className="p-2">
                    <p className="text-sm">{new Date(photo.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailCameras;
