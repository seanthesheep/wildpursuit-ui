import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Firestore instance
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useCameras } from '../../contexts/CameraContext';
import { getCachedData, setCachedData } from '../../utils/cache';
import ImageModal from '../modals/ImageModal';

interface Camera {
  id: string;
  name: string;
  notes?: string;
}

interface CameraPhoto {
  id: string;
  smallUrl: string;
  date: string;
}

interface CameraMarkerPopupProps {
  markerId: string; // ID of the marker
  userId: string; // Current user ID
  onCameraSelect: (cameraId: string) => void; // Callback to notify parent of selected camera
}

const CameraMarkerPopup: React.FC<CameraMarkerPopupProps> = ({ markerId, userId, onCameraSelect }) => {
  const { cameras, loading, getCameraById, getRecentPhoto } = useCameras();
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [associatedCamera, setAssociatedCamera] = useState<Camera | null>(null);
  const [recentPhoto, setRecentPhoto] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAssociatedCamera = async () => {
      try {
        console.log('Fetching associated camera for marker:', markerId); // Debug log

        // Check cache first
        const cachedMarker = getCachedData(`marker_${markerId}`);
        if (cachedMarker && cachedMarker.cameraId) {
          const camera = getCameraById(cachedMarker.cameraId);
          if (camera) {
            console.log('Found camera in cache:', camera); // Debug log
            setSelectedCameraId(cachedMarker.cameraId);
            setAssociatedCamera(camera);
            
            // Always fetch the latest photo
            const photo = await getRecentPhoto(cachedMarker.cameraId);
            if (photo) {
              console.log('Found recent photo:', photo); // Debug log
              setRecentPhoto(photo);
              setCachedData(`photo_${cachedMarker.cameraId}`, photo);
            }
            return;
          }
        }

        // If not in cache, fetch from Firestore
        const markerDocRef = doc(db, 'markers', markerId);
        const markerDoc = await getDoc(markerDocRef);

        if (markerDoc.exists()) {
          const markerData = markerDoc.data();
          setCachedData(`marker_${markerId}`, markerData);
          
          if (markerData.cameraId) {
            const camera = getCameraById(markerData.cameraId);
            if (camera) {
              setSelectedCameraId(markerData.cameraId);
              setAssociatedCamera(camera);
              
              // Fetch the latest photo
              const photo = await getRecentPhoto(markerData.cameraId);
              if (photo) {
                console.log('Fetched recent photo:', photo); // Debug log
                setRecentPhoto(photo);
                setCachedData(`photo_${markerData.cameraId}`, photo);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching associated camera:', error);
      }
    };

    fetchAssociatedCamera();
  }, [markerId, getCameraById, getRecentPhoto]);

  const handleSave = async () => {
    if (!selectedCameraId) return;

    setIsSaving(true);
    try {
      const markerDocRef = doc(db, 'markers', markerId);

      const markerDoc = await getDoc(markerDocRef);
      if (!markerDoc.exists()) {
        console.error(`Marker document with ID ${markerId} does not exist.`);
        return;
      }

      await updateDoc(markerDocRef, { cameraId: selectedCameraId });

      // Get the newly selected camera
      const camera = getCameraById(selectedCameraId);
      if (camera) {
        setAssociatedCamera(camera);
        // Fetch and set the new recent photo
        const photo = await getRecentPhoto(selectedCameraId);
        setRecentPhoto(photo);
        // Update cache
        setCachedData(`marker_${markerId}`, { ...markerDoc.data(), cameraId: selectedCameraId });
        setCachedData(`photo_${selectedCameraId}`, photo);
      }

      setIsEditing(false);
      onCameraSelect(selectedCameraId);
    } catch (error) {
      console.error('Error saving camera to marker:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const refreshPhoto = async () => {
    if (!selectedCameraId) return;
    
    try {
      // Clear the photo cache first
      localStorage.removeItem(`photo_${selectedCameraId}`);
      
      // Fetch fresh photo
      const freshPhoto = await getRecentPhoto(selectedCameraId);
      if (freshPhoto) {
        setRecentPhoto(freshPhoto);
        console.log('Refreshed photo:', freshPhoto);
      }
    } catch (error) {
      console.error('Error refreshing photo:', error);
    }
  };

  return (
    <div className="camera-marker-popup w-full max-w-sm">
      <div className="flex flex-col space-y-4">
        {/* Camera Selection Section */}
        <div className="w-full">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : associatedCamera && !isEditing ? (
            <div className="flex items-center justify-between">
              <span className="font-semibold">{associatedCamera.name}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="w-full">
              <label htmlFor="camera-select" className="block font-semibold mb-2">
                {isEditing ? 'Select New Camera:' : 'Select a Camera:'}
              </label>
              {cameras.length > 0 ? (
                <select
                  id="camera-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedCameraId || ''}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                >
                  <option value="" disabled>
                    -- Choose a Camera --
                  </option>
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-500">No cameras available</div>
              )}

              <button
                onClick={handleSave}
                disabled={!selectedCameraId || isSaving}
                className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Recent Photo Section - Now full width below */}
        {recentPhoto && (
          <div className="w-full mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Recent Photo</h4>
              <button
                onClick={refreshPhoto}
                className="text-xs text-blue-500 hover:text-blue-600"
              >
                Refresh
              </button>
            </div>
            <div className="relative">
              <div 
                className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <img
                  src={recentPhoto.smallUrl}
                  alt="Recent trail cam"
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  onError={async (e) => {
                    console.error('Image load error:', recentPhoto.smallUrl);
                    await refreshPhoto();
                    if (!recentPhoto?.smallUrl) {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }
                  }}
                  loading="lazy"
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {new Date(recentPhoto.date).toLocaleString()}
              </div>
            </div>
            
            {/* Add Modal */}
            {showModal && (
              <ImageModal
                imageUrl={recentPhoto.largeUrl || recentPhoto.smallUrl}
                date={recentPhoto.date}
                onClose={() => setShowModal(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraMarkerPopup;
