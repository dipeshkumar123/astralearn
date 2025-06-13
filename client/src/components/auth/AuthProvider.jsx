import React, { createContext, useContext, useState, useEffect } from 'react';
import webSocketService from '../../services/webSocketService.js';

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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);  useEffect(() => {
    if (token) {
      // Validate token and get user info
      validateToken();
      // Only initialize WebSocket connection with real token (not demo token)
      if (token !== 'demo_token_for_development') {
        webSocketService.connectWithAuth(token);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        // Token is invalid, remove it
        logout();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };  const login = async (identifier, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.tokens.accessToken);
        setUser(data.user);
        localStorage.setItem('token', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        
        // Initialize WebSocket connection with authentication
        webSocketService.connectWithAuth(data.tokens.accessToken);
        
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.tokens.accessToken);
        setUser(data.user);
        localStorage.setItem('token', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        
        // Initialize WebSocket connection with authentication
        webSocketService.connectWithAuth(data.tokens.accessToken);
        
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Disconnect WebSocket on logout
    webSocketService.disconnect();
  };
  const getMockUser = () => ({
    id: 'user_12345',
    firstName: 'Demo',
    lastName: 'Student',
    username: 'demo_student',
    email: 'demo@astralearn.com',
    role: 'student',
    learningStyle: 'visual',
    progress: 45,
    enrolledCourses: ['javascript-fundamentals', 'react-advanced'],
    preferences: {
      learningStyle: 'visual',
      difficulty: 'intermediate',
      studyTime: 'evening'
    }
  });

  const getDemoToken = () => 'demo_token_for_development';

  const value = {
    user: user || getMockUser(),
    token: token || getDemoToken(),
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token || true, // Always true for demo
    isDemoMode: !token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
