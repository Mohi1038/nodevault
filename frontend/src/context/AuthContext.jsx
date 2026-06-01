// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nodevault-two.vercel.app/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nv_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.data);
      } else {
        // Token invalid or expired
        logout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('nv_token', data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data;
  };

  const register = async (email, password, role) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Registration failed');
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('nv_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  // Helper function to make authenticated API requests
  const apiRequest = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    return data;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    apiRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
