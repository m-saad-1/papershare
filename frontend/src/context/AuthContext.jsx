import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '@/api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const processUserData = (userData) => {
    let processedData = { ...userData };



    // Ensure other fields have default values
    processedData.semester = processedData.semester || '';
    processedData.batch = processedData.batch || '';
    processedData.profilePicture = processedData.profilePicture || '/images/default-profile.png'; // Provide a default profile picture path
    processedData.reputation = Number(processedData.reputation || 0);
    processedData.badgeKeys = Array.isArray(processedData.badgeKeys) ? processedData.badgeKeys : [];
    processedData.contributorStatus = processedData.contributorStatus || 'Student';

    return processedData;
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await apiClient.get('/auth/me');
          setUser(processUserData(response.data.user));
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(processUserData(userData));
      toast.success('Welcome back!');

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { token: newToken, user: newUserData } = response.data;

      localStorage.setItem('token', newToken);
      console.log('AuthContext: Token set in localStorage', newToken);
      setToken(newToken);
      console.log('AuthContext: setToken called with', newToken);
      setUser(processUserData(newUserData));
      console.log('AuthContext: setUser called with processed data', processUserData(newUserData));
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };


  const updateUserContext = (newUserData) => {
    setUser(processUserData(newUserData));
  };


  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    token,
    updateUserContext
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};