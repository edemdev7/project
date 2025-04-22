import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, AuthTokens } from '@/types';
import { login as apiLogin, fetchCurrentUser } from '@/services/api';
import { Platform } from 'react-native';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  refreshUserProfile: async () => {},
  clearError: () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function for storage
  const storage = {
    getItem: async (key: string) => {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    },
    removeItem: async (key: string) => {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    },
  };

  // Initialize context - check for existing token and user data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const token = await storage.getItem('auth_token'); // Utiliser storage.getItem

        if (token) {
          const userData = await fetchCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        await storage.removeItem('auth_token'); // Utiliser storage.removeItem
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log('Inside UserContext login function'); 
    try {
      setIsLoading(true);
      setError(null);

      console.log('Calling apiLogin...'); // <-- Log de débogage
      const response = await apiLogin(credentials);
      console.log('apiLogin response received:', response); // <-- Log de débogage
      const { auth_token } = response;

      await storage.setItem('auth_token', auth_token); // Utiliser storage.setItem

      // Fetch user data after successful login
      const userData = await fetchCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);

    } catch (err: any) {
      console.error('Error in UserContext login:', err); // <-- Log d'erreur
      setError(err.message || 'Failed to login');
      await storage.removeItem('auth_token'); // Utiliser storage.removeItem
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };



  const logout = async () => {
    try {
      setIsLoading(true);
      await storage.removeItem('auth_token'); // Utiliser storage.removeItem
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (!isAuthenticated) return; 
    try {
      setIsLoading(true);
      const userData = await fetchCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        logout,
        refreshUserProfile,
        clearError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};