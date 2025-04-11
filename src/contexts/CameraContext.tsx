import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from './UserContext';

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
        console.log('Fetching cameras for user:', user.id); // Debug log
        const camerasCollection = collection(db, 'users', user.id, 'cameras');
        const snapshot = await getDocs(camerasCollection);
        const fetchedCameras = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Fetched cameras:', fetchedCameras); // Debug log
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
    const cachedPhoto = getCachedData(`photo_${cameraId}`);
    if (cachedPhoto) return cachedPhoto;

    const photosCollection = collection(db, 'users', user?.id, 'cameras', cameraId, 'photos');
    const q = query(photosCollection, orderBy('date', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;

    const photo = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };

    setCachedData(`photo_${cameraId}`, photo);
    return photo;
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