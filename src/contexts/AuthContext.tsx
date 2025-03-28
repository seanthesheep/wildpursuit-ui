import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { UserRole, User } from './UserContext'; // Import UserRole and User types

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded sample users
const sampleUsers: Record<string, User> = {
  admin: {
    id: 'admin',
    name: 'Club Admin',
    email: 'admin@huntclub.com',
    password: 'admin123', // Example password
    role: 'admin',
    clubMemberships: ['club1', 'club2'], // Example club memberships
    subscription: 'Pro', // Example subscription
  },
  hunter1: {
    id: 'hunter1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hunter123', // Example password
    role: 'hunter',
    clubMemberships: ['club1'], // Example club memberships
    subscription: 'Basic', // Example subscription
  },
  hunter2: {
    id: 'hunter2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'hunter456', // Example password
    role: 'hunter',
    clubMemberships: ['club1', 'club2'], // Example club memberships
    subscription: 'Pro', // Example subscription
  },
  hunter3: {
    id: 'hunter3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'hunter789', // Example password
    role: 'hunter',
    clubMemberships: ['club2'], // Example club memberships
    subscription: 'Basic', // Example subscription
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  // Restore authentication state from localStorage on app load
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('user');

    if (authStatus === 'true' && storedUser) {
      setIsAuthenticated(true); // Restore authentication state
      setUser(JSON.parse(storedUser)); // Restore the user in UserContext
    } else {
      setIsAuthenticated(false); // Ensure unauthenticated state if data is missing
    }

    setIsLoading(false); // Mark loading as complete
  }, [setUser]);

  const login = (email: string, password: string): boolean => {
    // Validate email and password against sample users
    const foundUser = Object.values(sampleUsers).find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser(foundUser); // Set the user in UserContext
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true'); // Save auth status in localStorage
      localStorage.setItem('user', JSON.stringify(foundUser)); // Save user data in localStorage
      return true;
    }

    return false; // Return false if credentials are invalid
  };

  const logout = () => {
    setUser(null); // Clear the user in UserContext
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated'); // Remove auth status from localStorage
    localStorage.removeItem('user'); // Remove user data from localStorage
    navigate('/login'); // Redirect to login page
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading indicator while restoring state
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};