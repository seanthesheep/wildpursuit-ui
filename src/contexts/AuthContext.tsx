import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded sample users
const sampleUsers = {
  admin: {
    id: 'admin',
    email: 'admin@wildpursuit.net',
    password: 'wildpursuit123', // Replace with hashed passwords in production
    role: 'admin',
    name: 'Admin User',
  },
  hunter: {
    id: 'hunter',
    email: 'hunter@wildpursuit.net',
    password: 'wildpursuit123', // Replace with hashed passwords in production
    role: 'hunter',
    name: 'Hunter User',
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