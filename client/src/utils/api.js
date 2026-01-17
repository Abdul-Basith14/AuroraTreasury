import axios from 'axios';

// Prefer environment-provided API base; fallback to same-origin /api to avoid hard-coded hosts
export const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request Interceptor
 * Automatically add JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle common errors globally
 */
api.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    console.log('API Error Interceptor triggered:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error('API Error Response:', { status, data, url: error.config?.url });

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', status, data);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', status, data);
          break;
        case 500:
          // Server error
          console.error('Server error:', status, data);
          break;
        default:
          // Log status and full response data for easier debugging
          console.error('API Error:', status, data);
      }

      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server', error.request);
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your internet connection.',
      });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({
        success: false,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

// Authentication API calls
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verify: () => api.post('/auth/verify'),
  logout: () => api.post('/auth/logout'),
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  requestPasswordReset: (email) => api.post('/auth/request-reset', { email }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset', { email, otp, newPassword }),
  updateProfile: (formData) =>
    axios
      .put(`${API_BASE_URL}/auth/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        timeout: 20000,
      })
      .then((res) => res.data),
};

// Group Fund API calls
export const groupFundAPI = {
  // Get all payments for logged-in user
  getMyPayments: () => api.get('/groupfund/my-payments'),
  
  // Generate QR code for group fund payment (NEW)
  generateQR: (data) => api.post('/groupfund/generate-qr', data),
  
  // Confirm payment after paying via UPI (NEW)
  confirmPayment: (paymentId) => api.post(`/groupfund/confirm-payment/${paymentId}`),
  
  // LEGACY: Submit payment proof with image (deprecated)
  submitPayment: (formData) => {
    // Create a separate axios instance for multipart/form-data
    return axios
      .post(`${API_BASE_URL}/groupfund/submit-payment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        timeout: 30000, // 30 seconds for file upload
      })
      .then((res) => res.data);
  },
  
  // Get club settings (QR code, payment info)
  getSettings: () => api.get('/groupfund/settings'),
  
  // Get current monthly record set by treasurer
  getCurrentRecord: () => api.get('/groupfund/current-record'),

  // Get all active monthly records for the member's year
  getActiveRecords: () => api.get('/groupfund/active-records'),
  
  // Get payment proof URL for a specific payment
  downloadProof: (paymentId) => api.get(`/groupfund/download-proof/${paymentId}`),
  
  // Get payment summary
  getSummary: () => api.get('/groupfund/summary'),

  // Get all failed payments for current user
  getFailedPayments: () => api.get('/groupfund/failed-payments'),

  // Resubmit payment for failed payment (generates new QR)
  resubmitPayment: (paymentId) => api.post(`/groupfund/resubmit-payment/${paymentId}`),

  // Get payment history with status changes
  getPaymentHistory: (paymentId) => api.get(`/groupfund/payment-history/${paymentId}`),

  // Verify resubmitted payment (Treasurer only)
  verifyResubmission: (paymentId, approve) => 
    api.post(`/groupfund/verify-resubmission/${paymentId}`, { approve }),
};

// Reimbursement API calls
export const reimbursementAPI = {
  // Create a new reimbursement request with bill proof photo
  createRequest: (formData) => {
    return axios
      .post(`${API_BASE_URL}/reimbursement/request`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        timeout: 30000, // 30 seconds for file upload
      })
      .then((res) => res.data);
  },

  // Get all reimbursement requests for logged-in user
  getMyRequests: () => api.get('/reimbursement/my-requests'),

  // Get a single reimbursement request by ID
  getRequestById: (id) => api.get(`/reimbursement/request/${id}`),

  // Confirm receipt of payment from treasurer
  confirmReceipt: (id) => api.post(`/reimbursement/confirm-receipt/${id}`),

  // Delete a reimbursement request
  deleteRequest: (id) => api.delete(`/reimbursement/request/${id}`),

  // Get reimbursement statistics
  getStatistics: () => api.get('/reimbursement/statistics'),
};

export default api;
