import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChangedListener } from '../firebase'; // Import the wrapper function
import { User as FirebaseUser } from 'firebase/auth'; // Import Firebase User type

export type UserRole = 'admin' | 'hunter';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  clubMemberships?: string[];
  subscription?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  switchUser: (userId: string) => void;
  isAdmin: boolean;
  allUsers: Record<string, User>;
  clubs: Record<string, ClubData>;
  updateUser: (updatedUser: Partial<User>) => void;
  updatePreferences: (preferences: Record<string, any>) => void;
  logout: () => void;
}

export interface ClubData {
  id: string;
  name: string;
  description: string;
  location: string;
  memberIds: string[];
  adminIds: string[];
  dateCreated: string;
  imageUrl?: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Synchronize with Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((firebaseUser) => {
      if (firebaseUser) {
        const mappedUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Unknown User',
          role: 'hunter', // Default role
          clubMemberships: [], // Default memberships
          subscription: 'Free', // Default subscription
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const switchUser = (userId: string) => {
    console.warn('switchUser is not applicable when using Firebase authentication.');
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...updatedUser } : null));
  };

  const updatePreferences = (preferences: Record<string, any>) => {
    console.log('Updating preferences:', preferences);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        switchUser,
        isAdmin: user?.role === 'admin',
        allUsers: {}, // Not applicable when using Firebase
        clubs: {}, // Replace with actual club data if needed
        updateUser,
        updatePreferences,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
