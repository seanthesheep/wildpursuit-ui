import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  onAuthStateChangedListener,
} from '../firebase';

interface AuthContextType {
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      if (user) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  const loginWithGoogle = async () => {
    const user = await signInWithGoogle();
    if (user) {
      setIsAuthenticated(true);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const user = await signInWithEmail(email, password);
    if (user) {
      setIsAuthenticated(true);
    }
  };


  const handleSignUpWithEmail = async (email: string, password: string) => {
    const user = await signUpWithEmail(email, password); // Use the imported function
    if (user) {
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    await signOutUser();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail: handleSignUpWithEmail, 
        logout,
      }}
    >
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