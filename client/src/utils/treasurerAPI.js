import axios from 'axios';

/**
 * Treasurer API utility functions
 * Handles all API calls for treasurer dashboard
 */

// Create axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add JWT token to all requests
 */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handle response and errors
 */
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle specific error status codes
      if (error.response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw error.response.data;
    } else if (error.request) {
      throw {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    } else {
      throw {
        success: false,
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
);

/**
 * Get all members with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.year - Filter by year (all/1st/2nd/3rd/4th)
 * @param {string} params.status - Filter by status (all/paid/pending/failed)
 * @param {string} params.search - Search by name, USN, or email
 * @returns {Promise} - Members data
 */
export const getMembers = async (params = {}) => {
  try {
    const response = await API.get('/treasurer/members', { params });
    return response;
  } catch (error) {
    console.error('Get members error:', error);
    throw error;
  }
};

/**
 * Get specific member's payment details
 * @param {string} userId - Member user ID
 * @returns {Promise} - Member payment data
 */
export const getMemberPayments = async (userId) => {
  try {
    const response = await API.get(`/treasurer/member/${userId}/payments`);
    return response;
  } catch (error) {
    console.error('Get member payments error:', error);
    throw error;
  }
};

/**
 * Get dashboard statistics
 * @returns {Promise} - Statistics data
 */
export const getStatistics = async () => {
  try {
    const response = await API.get('/treasurer/statistics');
    return response;
  } catch (error) {
    console.error('Get statistics error:', error);
    throw error;
  }
};

/**
 * Get failed payments summary grouped by month
 * @returns {Promise} - Failed payments summary
 */
export const getFailedPaymentsSummary = async () => {
  try {
    const response = await API.get('/treasurer/failed-payments-summary');
    return response;
  } catch (error) {
    console.error('Get failed payments summary error:', error);
    throw error;
  }
};

/**
 * Get month-based member list with payment status
 * @param {string} month - Month name (e.g., "November")
 * @param {string} year - Year (e.g., "2024")
 * @returns {Promise} - Member list for specific month
 */
export const getMonthBasedMemberList = async (month, year) => {
  try {
    const response = await API.get(`/treasurer/member-list/${month}/${year}`);
    return response; // Already unwrapped by interceptor
  } catch (error) {
    console.error('Get month-based member list error:', error);
    throw error;
  }
};

/**
 * Delete all payment records for a specific month
 * @param {string} month - Month name (e.g., "November")
 * @param {string} year - Year (e.g., "2024")
 * @returns {Promise} - Delete result
 */
export const deleteMonthlyRecords = async (month, year) => {
  try {
    const response = await API.delete(`/treasurer/delete-monthly-records/${month}/${year}`);
    return response;
  } catch (error) {
    console.error('Delete monthly records error:', error);
    throw error;
  }
};

/**
 * Get wallet balance and transaction history
 * @returns {Promise} - Wallet data
 */
export const getWallet = async () => {
  try {
    const response = await API.get('/treasurer/wallet');
    return response;
  } catch (error) {
    console.error('Get wallet error:', error);
    throw error;
  }
};

/**
 * Add money to wallet
 * @param {number} amount - Amount to add
 * @param {string} description - Description of transaction
 * @returns {Promise} - Updated wallet data
 */
export const addMoneyToWallet = async (amount, description) => {
  try {
    const response = await API.post('/treasurer/wallet/add', { amount, description });
    return response;
  } catch (error) {
    console.error('Add money to wallet error:', error);
    throw error;
  }
};

/**
 * Remove money from wallet
 * @param {number} amount - Amount to remove
 * @param {string} description - Description of transaction
 * @returns {Promise} - Updated wallet data
 */
export const removeMoneyFromWallet = async (amount, description) => {
  try {
    const response = await API.post('/treasurer/wallet/remove', { amount, description });
    return response;
  } catch (error) {
    console.error('Remove money from wallet error:', error);
    throw error;
  }
};

/**
 * Get payment requests (pending verification)
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (Pending/all)
 * @param {string} params.month - Filter by month
 * @param {string} params.year - Filter by member year
 * @returns {Promise} - Payment requests data
 */
export const getPaymentRequests = async (params = {}) => {
  try {
    const response = await API.get('/treasurer/payment-requests', { params });
    return response;
  } catch (error) {
    console.error('Get payment requests error:', error);
    throw error;
  }
};

/**
 * Verify and approve a payment request
 * @param {string} paymentId - Payment ID to verify
 * @returns {Promise} - Verification result
 */
export const verifyPayment = async (paymentId) => {
  try {
    const response = await API.post(`/treasurer/verify-payment/${paymentId}`);
    return response;
  } catch (error) {
    console.error('Verify payment error:', error);
    throw error;
  }
};

/**
 * Reject a payment request with reason
 * @param {string} paymentId - Payment ID to reject
 * @param {string} reason - Reason for rejection
 * @returns {Promise} - Rejection result
 */
export const rejectPayment = async (paymentId, reason) => {
  try {
    const response = await API.post(`/treasurer/reject-payment/${paymentId}`, { reason });
    return response;
  } catch (error) {
    console.error('Reject payment error:', error);
    throw error;
  }
};

/**
 * Get resubmission requests (failed payments with resubmitted proof)
 * @returns {Promise} - Resubmission requests data
 */
export const getResubmissionRequests = async () => {
  try {
    const response = await API.get('/treasurer/resubmission-requests');
    return response;
  } catch (error) {
    console.error('Get resubmission requests error:', error);
    throw error;
  }
};

/**
 * Verify and approve a resubmitted payment
 * @param {string} paymentId - Payment ID to verify
 * @returns {Promise} - Verification result
 */
export const verifyResubmission = async (paymentId) => {
  try {
    const response = await API.post(`/treasurer/verify-resubmission/${paymentId}`);
    return response;
  } catch (error) {
    console.error('Verify resubmission error:', error);
    throw error;
  }
};

/**
 * Reject a resubmitted payment with reason
 * @param {string} paymentId - Payment ID to reject
 * @param {string} reason - Reason for rejection
 * @returns {Promise} - Rejection result
 */
export const rejectResubmission = async (paymentId, reason) => {
  try {
    const response = await API.post(`/treasurer/reject-resubmission/${paymentId}`, { reason });
    return response;
  } catch (error) {
    console.error('Reject resubmission error:', error);
    throw error;
  }
};

/**
 * Create manual payment for member (treasurer-initiated)
 * For recording cash/offline payments without member submission
 * @param {Object} data - { userId, month, year, amount, paymentMethod, note? }
 * @returns {Promise} - Created payment result
 */
export const createManualPayment = async (data) => {
  try {
    console.log('Creating manual payment with data:', data);
    const response = await API.post('/treasurer/create-manual-payment', data);
    console.log('Create manual payment response:', response);
    return response;
  } catch (error) {
    console.error('Create manual payment error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Manually update payment status from Pending to Paid
 * For cash/offline payments without online proof
 * @param {string} paymentId - Payment ID to update
 * @param {Object} data - { paymentMethod: string, note?: string }
 * @returns {Promise} - Update result
 */
export const manualPaymentUpdate = async (paymentId, data) => {
  try {
    const response = await API.post(`/treasurer/manual-payment-update/${paymentId}`, data);
    return response;
  } catch (error) {
    console.error('Manual payment update error:', error);
    throw error;
  }
};

/**
 * Create monthly payment records for all members
 * @param {Object} data - { 
 *   month: string, 
 *   year: number, 
 *   yearAmounts: Array<{year: number, amount: number}>, 
 *   deadline: Date 
 * }
 * @returns {Promise} - Creation result
 */
export const createMonthlyRecords = async (data) => {
  try {
    // Transform yearAmounts into the format expected by the backend
    const requestData = {
      month: data.month,
      year: data.year,
      yearAmounts: data.yearAmounts,
      deadline: data.deadline
    };
    
    console.log('Sending createMonthlyRecords request:', requestData);
    const response = await API.post('/treasurer/create-monthly-records', requestData);
    return response; // Already unwrapped by interceptor
  } catch (error) {
    console.error('Create monthly records error:', error);
    throw error;
  }
};

/**
 * Get all reimbursement requests
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (all/pending/paid/received/rejected)
 * @param {string} params.year - Filter by member year
 * @param {string} params.search - Search by name, USN, or description
 * @returns {Promise} - Reimbursement requests data
 */
export const getReimbursementRequests = async (params = {}) => {
  try {
    const response = await API.get('/reimbursement/all-requests', { params });
    return response;
  } catch (error) {
    console.error('Get reimbursement requests error:', error);
    throw error;
  }
};

/**
 * Pay reimbursement and upload proof
 * @param {string} requestId - Reimbursement request ID
 * @param {FormData} formData - Form data with paymentProof and optional message
 * @returns {Promise} - Payment result
 */
export const payReimbursement = async (requestId, formData) => {
  try {
    const response = await API.post(`/reimbursement/pay/${requestId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Pay reimbursement error:', error);
    throw error;
  }
};

/**
 * Reject reimbursement request
 * @param {string} requestId - Reimbursement request ID
 * @param {Object} data - { reason: string }
 * @returns {Promise} - Rejection result
 */
export const rejectReimbursement = async (requestId, data) => {
  try {
    const response = await API.post(`/reimbursement/reject/${requestId}`, data);
    return response;
  } catch (error) {
    console.error('Reject reimbursement error:', error);
    throw error;
  }
};

/**
 * Get treasurer wallet balance and stats
 * @returns {Promise} - Wallet data including totalCollected, totalReimbursed, currentBalance
 */
export const getTreasurerWallet = async () => {
  try {
    const response = await API.get('/reimbursement/treasurer-wallet');
    return response;
  } catch (error) {
    console.error('Get treasurer wallet error:', error);
    throw error;
  }
};

export default API;
