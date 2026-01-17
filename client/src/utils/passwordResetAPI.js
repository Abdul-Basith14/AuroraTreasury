import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Request password reset
 */
export const requestPasswordReset = async (email, newPassword, confirmPassword) => {
  try {
    const response = await api.post('/auth/request-reset', {
      email,
      newPassword,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    console.error('Request password reset error:', error);
    throw error.response?.data || { message: 'Failed to request password reset' };
  }
};

/**
 * Check password reset request status
 */
export const checkResetStatus = async (email) => {
  try {
    const response = await api.get(`/auth/reset-status/${email}`);
    return response.data;
  } catch (error) {
    console.error('Check reset status error:', error);
    throw error.response?.data || { message: 'Failed to check reset status' };
  }
};

/**
 * Get password reset requests (Treasurer only)
 */
export const getPasswordResetRequests = async (status = 'pending') => {
  try {
    const response = await api.get('/treasurer/password-reset-requests', {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error('Get password reset requests error:', error);
    throw error.response?.data || { message: 'Failed to fetch password reset requests' };
  }
};

/**
 * Approve password reset request (Treasurer only)
 */
export const approvePasswordReset = async (requestId) => {
  try {
    const response = await api.post(`/treasurer/approve-password-reset/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Approve password reset error:', error);
    throw error.response?.data || { message: 'Failed to approve password reset' };
  }
};

/**
 * Reject password reset request (Treasurer only)
 */
export const rejectPasswordReset = async (requestId, reason) => {
  try {
    const response = await api.post(`/treasurer/reject-password-reset/${requestId}`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Reject password reset error:', error);
    throw error.response?.data || { message: 'Failed to reject password reset' };
  }
};
