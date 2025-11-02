import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 * Usage: const { user, login, logout, isLoading } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * Wraps the app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Check if user is already logged in on app load
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.verify();
          if (response.success) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token verification failed
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);

      if (response.success) {
        if (response.requireOTP) {
          toast.success('OTP sent to your email!');
          return { success: true, requireOTP: true };
        }

        const { user, token } = response.data;
        
        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        return { success: true, user };
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Signup new user
   * @param {Object} userData - User registration data
   */
  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.signup(userData);

      if (response.success) {
        if (response.requireOTP) {
          toast.success('OTP sent to your email!');
          return { success: true, requireOTP: true };
        }
        toast.success('Registration successful! Please login.');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Signup failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  /**
   * Update user data in context and localStorage
   * @param {Object} updatedUser - Updated user data
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  /**
   * Verify OTP for login/signup
   * @param {string} email - User's email
   * @param {string} otp - OTP code
   * @param {string} type - Type of verification ('login' or 'signup')
   */
  const verifyOTP = async (email, otp, type) => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyOTP({ email, otp, type });

      if (response.success) {
        if (type === 'login') {
          const { user, token } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          setIsAuthenticated(true);
          toast.success('Login successful!');
          return { success: true, user };
        } else {
          toast.success('Registration successful! Please login.');
          return { success: true };
        }
      }
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend OTP
   * @param {string} email - User's email
   * @param {string} type - Type of verification ('login' or 'signup')
   */
  const resendOTP = async (email, type) => {
    try {
      setIsLoading(true);
      const response = await authAPI.resendOTP({ email, type });

      if (response.success) {
        toast.success('New OTP sent to your email!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
    verifyOTP,
    resendOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
