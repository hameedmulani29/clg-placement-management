import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import {
  signInWithGooglePopup,
  firebaseSignOut,
  isFirebaseConfigured,
} from '../config/firebase';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEYS = ['token', 'user', 'profile'];

const readStoredJson = (key) => {
  const saved = sessionStorage.getItem(key);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn(`Removing invalid stored authentication data (${key}).`);
    sessionStorage.removeItem(key);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredJson('user'));
  const [profile, setProfile] = useState(() => readStoredJson('profile'));
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    AUTH_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
    setToken(null);
    setUser(null);
    setProfile(null);
    firebaseSignOut().catch((error) => {
      console.error('Firebase sign-out failed:', error);
    });
  };

  // Sync session on mount
  useEffect(() => {
    const initAuth = async () => {
      AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      const storedToken = sessionStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            setProfile(res.data.data.profile);
            sessionStorage.setItem('user', JSON.stringify(res.data.data.user));
            if (res.data.data.profile) {
              sessionStorage.setItem('profile', JSON.stringify(res.data.data.profile));
            } else {
              sessionStorage.removeItem('profile');
            }
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed, logging out.');
          logout();
        }
      } else {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('profile');
        setUser(null);
        setProfile(null);
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
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      if (newProfile) {
        sessionStorage.setItem('profile', JSON.stringify(newProfile));
      } else {
        sessionStorage.removeItem('profile');
      }
      return { success: true, role: newUser.role };
    }
    return { success: false, message: res.data.message };
  };

  const loginWithGoogle = async (extraData = {}) => {
    const { idToken } = await signInWithGooglePopup();
    const res = await api.post('/auth/google', {
      idToken,
      ...extraData,
    });
    if (res.data.success) {
      const {
        token: newToken,
        user: newUser,
        profile: newProfile,
        isNewUser,
        accountCreated,
      } = res.data.data;
      if (isNewUser && !newToken) {
        clearSession();
        return {
          success: true,
          role: newUser.role,
          isNewUser,
          email: newUser.email,
        };
      }

      setToken(newToken);
      setUser(newUser);
      setProfile(newProfile);
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      if (newProfile) {
        sessionStorage.setItem('profile', JSON.stringify(newProfile));
      } else {
        sessionStorage.removeItem('profile');
      }
      return { success: true, role: newUser.role, isNewUser: false, accountCreated: !!accountCreated };
    }
    return { success: false, message: res.data.message };
  };

  const registerStudent = async (studentData) => {
    const res = await api.post('/auth/register-student', studentData);
    if (res.data.success) {
      clearSession();
      return { success: true, email: res.data.data.email };
    }
    return { success: false, message: res.data.message };
  };

  const registerWithGoogle = async (extraData = {}) => {
    const { idToken } = await signInWithGooglePopup();
    const res = await api.post('/auth/google/register-student', { idToken, ...extraData });
    if (!res.data.success) {
      return { success: false, message: res.data.message };
    }

    clearSession();
    if (!res.data.data.isNewUser) {
      return {
        success: false,
        message: 'This Google account is already registered. Please sign in from the login page.',
      };
    }

    return {
      success: true,
      email: res.data.data.user.email,
      role: res.data.data.user.role,
    };
  };

  const completeStudentProfile = async (profileData) => {
    const res = await api.put('/students/me', profileData);
    if (res.data.success) {
      setProfile(res.data.data);
      sessionStorage.setItem('profile', JSON.stringify(res.data.data));
      return res.data.data;
    }
    throw new Error(res.data.message || 'Could not complete the student profile.');
  };

  const logout = () => {
    clearSession();
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
        sessionStorage.setItem('user', JSON.stringify(res.data.data.user));
        if (res.data.data.profile) {
          sessionStorage.setItem('profile', JSON.stringify(res.data.data.profile));
        } else {
          sessionStorage.removeItem('profile');
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
        isFirebaseConfigured: isFirebaseConfigured(),
        login,
        loginWithGoogle,
        registerStudent,
        registerWithGoogle,
        completeStudentProfile,
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
