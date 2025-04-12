import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from './UserContext';
import { getCachedData, setCachedData, getCachedPhotoData } from '../utils/cache';

interface Camera {
  id: string;
  name: string;
  notes?: string;
}

interface CameraContextType {
  cameras: Camera[];
  loading: boolean;
  getCameraById: (id: string) => Camera | undefined;
  getRecentPhoto: (cameraId: string) => Promise<any>;
}

const CameraContext = createContext<CameraContextType>({
  cameras: [],
  loading: true,
  getCameraById: () => undefined,
  getRecentPhoto: async () => null,
});

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchCameras = async () => {
      if (!user?.id) return;

      try {
        const camerasCollection = collection(db, 'users', user.id, 'cameras');
        const snapshot = await getDocs(camerasCollection);
        const fetchedCameras = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          notes: doc.data().notes
        } as Camera));
        setCameras(fetchedCameras);
      } catch (error) {
        console.error('Error fetching cameras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [user?.id]);

  const getCameraById = (id: string) => cameras.find(camera => camera.id === id);

  const getRecentPhoto = async (cameraId: string) => {
    if (!user?.id) return null;
    
    // Use photo-specific cache check
    const cachedPhoto = getCachedPhotoData(`photo_${cameraId}`);
    if (cachedPhoto) return cachedPhoto;

    try {
      const photosCollection = collection(db, 'users', user.id, 'cameras', cameraId, 'photos');
      const q = query(photosCollection, orderBy('date', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;

      const photo = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };

      // Cache the photo with timestamp
      setCachedData(`photo_${cameraId}`, photo);
      return photo;
    } catch (error) {
      console.error('Error fetching recent photo:', error);
      return null;
    }
  };

  return (
    <CameraContext.Provider value={{ cameras, loading, getCameraById, getRecentPhoto }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCameras = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCameras must be used within a CameraProvider');
  }
  return context;
};