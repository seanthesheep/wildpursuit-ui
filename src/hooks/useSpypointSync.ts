import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

interface SyncState {
  isLoading: boolean;
  lastSync: Date | null;
  error: string | null;
}

export const useSpypointSync = () => {
  const { user } = useUser();
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    lastSync: null,
    error: null
  });

  const syncPhotos = async () => {
    if (!user?.id) return;

    setSyncState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(user.id,"id")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/us-central1/syncSpypointPhotos?userId=${user.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
console.log(response,"response")
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to sync photos');
      }

      const data = await response.json();
      setSyncState(prev => ({
        ...prev,
        lastSync: new Date(),
        isLoading: false,
      }));

      return data;
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false,
      }));
      throw error;
    }
  };

  return {
    syncPhotos,
    isLoading: syncState.isLoading,
    lastSync: syncState.lastSync,
    error: syncState.error
  };
};