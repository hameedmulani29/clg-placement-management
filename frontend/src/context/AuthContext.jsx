import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            setProfile(res.data.data.profile);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
            if (res.data.data.profile) {
              localStorage.setItem('profile', JSON.stringify(res.data.data.profile));
            }
          }
        } catch (err) {
          console.warn('Session verification failed, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser, profile: newProfile } = res.data.data;
      setToken(newToken);
      setUser(newUser);
      setProfile(newProfile);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      if (newProfile) {
        localStorage.setItem('profile', JSON.stringify(newProfile));
      }
      return { success: true, role: newUser.role };
    }
    return { success: false, message: res.data.message };
  };

  const registerStudent = async (studentData) => {
    const res = await api.post('/auth/register-student', studentData);
    if (res.data.success) {
      const { token: newToken, user: newUser, profile: newProfile } = res.data.data;
      setToken(newToken);
      setUser(newUser);
      setProfile(newProfile);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('profile', JSON.stringify(newProfile));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        if (res.data.data.profile) {
          localStorage.setItem('profile', JSON.stringify(res.data.data.profile));
        }
      }
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        registerStudent,
        logout,
        refreshProfile,
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
