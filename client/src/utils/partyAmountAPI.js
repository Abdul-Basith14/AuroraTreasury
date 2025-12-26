import api from './api';
import axios from 'axios';

const BASE = '/party-amount';

const partyAmountAPI = {
  getAll: () => api.get(`${BASE}/all`),
  getActive: () => api.get(`${BASE}/active`),
  createParty: (data) => api.post(`${BASE}/create`, data),

  // Submit payment (multipart)
  submitPayment: (formData) => {
    return axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${BASE}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        timeout: 30000,
      }
    ).then(res => res.data);
  },

  getMyPayments: () => api.get(`${BASE}/my/payments`),
  getPartyPayments: (partyId) => api.get(`${BASE}/${partyId}/payments`),
  verifyPayment: (payload) => api.post(`${BASE}/verify`, payload),
  getPartyWallet: (partyId) => api.get(`${BASE}/${partyId}/wallet`),
};

export default partyAmountAPI;
