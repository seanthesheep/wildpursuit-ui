import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Camera, Grid, List } from 'react-feather';
import { useUser } from '../contexts/UserContext';
import { useSpypointSync } from '../hooks/useSpypointSync';
import { db } from '../firebase'; // Firestore instance
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import CameraMarkerPopup from '../components/map/CameraMarkerPopup';
import PhotoCard from '../components/PhotoCard';
import SpypointModal from '../components/modals/SpypointModal';
import { Marker, CameraPhoto } from '../types/types';
import { getSpypointCredentials } from '../firebase';
import SpypointIntegerationModal from '../components/modals/SpyPointIntegerationModal';
const TrailCameras: React.FC = () => {
  const { user } = useUser();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [photos, setPhotos] = useState<CameraPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPhotosLoaded, setTotalPhotosLoaded] = useState(0);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingCredentials, setExistingCredentials] = useState<{ username: string; password: string } | null>(null);

  const PHOTOS_PER_PAGE = 12;
  const userId = user?.id || 'exampleUserId';
  const { syncPhotos, isLoading, lastSync, error } = useSpypointSync();

  // Fetch Spypoint credentials on component mount
  useEffect(() => {
    const fetchCredentials = async () => {
      if (user?.id) {
        try {
          const credentials = await getSpypointCredentials(user.id);
          if (credentials) {
            setExistingCredentials({ username: credentials.username, password: '' }); // Password is hashed, so we can't retrieve it
          }
        } catch (error) {
          console.error('Error fetching Spypoint credentials:', error);
        }
      }
    };
    fetchCredentials();
  }, [user?.id]);

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
        console.log('Fetched Markers:', fetchedMarkers);
        setMarkers(fetchedMarkers);
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
    };
    fetchMarkers();
  }, []);

  // Fetch photos for the selected camera
  const fetchPhotos = async (page: number) => {
    if (!selectedCameraId) return;

    setPhotosLoading(true);
    try {
      const photosCollection = collection(
        db,
        'users',
        userId,
        'cameras',
        selectedCameraId,
        'photos'
      );

      let q = query(
        photosCollection,
        orderBy('date', 'desc'),
        limit(PHOTOS_PER_PAGE)
      );

      if (page > 1 && lastVisible) {
        q = query(
          photosCollection,
          orderBy('date', 'desc'),
          startAfter(lastVisible),
          limit(PHOTOS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const fetchedPhotos: CameraPhoto[] = [];
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.mediumUrl) {
          console.warn('Photo missing mediumUrl:', doc.id);
          return;
        }
        try {
          new URL(data.mediumUrl);
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
        } catch (error) {
          console.error('Invalid photo URL:', {
            photoId: doc.id,
            url: data.mediumUrl,
            error,
          });
        }
      });

      setHasMore(fetchedPhotos.length === PHOTOS_PER_PAGE);
      setPhotos((prev) => (page === 1 ? fetchedPhotos : [...prev, ...fetchedPhotos]));
      setTotalPhotosLoaded((prev) => prev + fetchedPhotos.length);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setPhotosLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCameraId) {
      setPhotos([]);
      setCurrentPage(1);
      setTotalPhotosLoaded(0);
      setHasMore(true);
      setLastVisible(null);
      return;
    }
    fetchPhotos(1);
  }, [selectedCameraId]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPhotos(nextPage);
  };

  const handleConnect = (username: string, password: string) => {
    setExistingCredentials({ username, password: '' });
    setIsModalOpen(false);
    syncPhotos(); // Trigger sync after connecting
  };

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
        <div className="flex space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            {existingCredentials ? 'Manage Spypoint' : 'Connect Spypoint'}
          </button>
          <button
            onClick={syncPhotos}
            disabled={isLoading || !existingCredentials}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600"
          >
            {isLoading ? 'Syncing...' : 'Sync Photos'}
          </button>
        </div>
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
            {markers.filter((marker) => marker.type === 'camera').map((marker) => (
              <div
                key={marker.id}
                className="bg-orange-100 p-3 rounded-md flex items-center border-l-4 border-orange-500 cursor-pointer"
                onClick={() => {
                  if (marker.cameraId) {
                    console.log(`Selected Camera ID: ${marker.cameraId}`);
                    setCurrentPage(1);
                    setSelectedCameraId(marker.cameraId);
                  } else {
                    console.warn(`Marker ${marker.id} has no associated camera.`);
                    setSelectedCameraId(null);
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
        <div className="flex-1 bg-gray-100 overflow-y-auto">
          {photosLoading && currentPage === 1 ? (
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
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} onSync={syncPhotos} />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={photosLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600"
                  >
                    {photosLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Spypoint Modal */}
      <SpypointIntegerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
        existingCredentials={existingCredentials}
      />
    </div>
  );
};

export default TrailCameras;