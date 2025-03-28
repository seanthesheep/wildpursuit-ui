import React, { createContext, useState, useContext, useEffect } from 'react';

export type UserRole = 'admin' | 'hunter'; // Define the allowed roles

export interface User {
  id: string;
  email: string;
  password: string; // This should ideally be omitted or hashed in production
  role: UserRole; // Use the UserRole type here
  name: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  switchUser: (userId: string) => void;
  isAdmin: boolean;
  allUsers: Record<string, User>;
  clubs: Record<string, ClubData>;
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

// Sample users
const sampleUsers: Record<string, User> = {
  'admin': {
    id: 'admin',
    name: 'Club Admin',
    email: 'admin@huntclub.com',
    password: 'admin123', // Example password
    role: 'admin'
  },
  'hunter1': {
    id: 'hunter1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hunter123', // Example password
    role: 'hunter'
  },
  'hunter2': {
    id: 'hunter2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'hunter456', // Example password
    role: 'hunter'
  },
  'hunter3': {
    id: 'hunter3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'hunter789', // Example password
    role: 'hunter'
  }
};

// Sample clubs
const sampleClubs: Record<string, ClubData> = {
  'club1': {
    id: 'club1',
    name: 'Big Deer Hunting Club',
    description: 'Premier hunting club with exclusive access to prime whitetail land across 1,200 acres.',
    location: 'Jonesville, GA',
    memberIds: ['admin', 'hunter1', 'hunter2'],
    adminIds: ['admin'],
    dateCreated: 'Jan 12, 2024',
    imageUrl: 'https://same-assets.com/10c27f66-f29e-44a5-8ba3-a6dbf30b9d24.jpg'
  },
  'club2': {
    id: 'club2',
    name: 'Oak Ridge Outfitters',
    description: 'Family-owned hunting property providing guided hunts and comfortable lodging.',
    location: 'Springfield, MO',
    memberIds: ['admin', 'hunter2', 'hunter3'],
    adminIds: ['admin', 'hunter2'],
    dateCreated: 'Mar 3, 2024',
    imageUrl: 'https://same-assets.com/0a5ef9d3-9070-4d8d-b04b-9c9a9ea0008b.jpg'
  }
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(sampleUsers.admin);

  const switchUser = (userId: string) => {
    if (sampleUsers[userId]) {
      setUser(sampleUsers[userId]);
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      switchUser,
      isAdmin: user?.role === 'admin',
      allUsers: sampleUsers,
      clubs: sampleClubs
    }}>
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

// Example of setUser usage
const setUser = (user: User | null) => {
  // Ensure the user object matches the User interface
};
