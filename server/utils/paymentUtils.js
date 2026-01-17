import crypto from 'crypto';

/**
 * Generate a unique payment reference code
 * Format: AT-FUND{fundType}-{userId}-{timestamp}
 * Example: AT-FUND01-U123ABC-20260117145030
 * 
 * @param {String} userId - MongoDB ObjectId of the user
 * @param {String} fundType - Type of fund (01 for monthly group fund)
 * @returns {String} Unique payment reference
 */
export const generatePaymentReference = (userId, fundType = '01') => {
  const timestamp = new Date().toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14); // YYYYMMDDHHmmss
  
  // Get last 6 characters of userId for uniqueness
  const userIdShort = userId.toString().slice(-6).toUpperCase();
  
  return `AT-FUND${fundType}-${userIdShort}-${timestamp}`;
};

/**
 * Generate UPI payment link with embedded reference
 * 
 * @param {Object} params - Payment parameters
 * @param {String} params.upiId - Treasurer's UPI ID
 * @param {Number} params.amount - Payment amount
 * @param {String} params.reference - Payment reference code
 * @param {String} params.name - Payee name (default: AuroraTreasury)
 * @returns {String} UPI payment link
 */
export const generateUPILink = ({ upiId, amount, reference, name = 'AuroraTreasury' }) => {
  // Validate inputs
  if (!upiId || !amount || !reference) {
    throw new Error('UPI ID, amount, and reference are required');
  }

  // UPI URL format
  // upi://pay?pa=<upiId>&pn=<name>&am=<amount>&cu=INR&tn=<reference>
  const params = new URLSearchParams({
    pa: upiId,           // Payee Address (UPI ID)
    pn: name,            // Payee Name
    am: amount.toString(), // Amount
    cu: 'INR',           // Currency
    tn: reference,       // Transaction Note (our reference)
  });

  return `upi://pay?${params.toString()}`;
};

/**
 * Validate payment reference format
 * 
 * @param {String} reference - Payment reference to validate
 * @returns {Boolean} True if valid, false otherwise
 */
export const validatePaymentReference = (reference) => {
  // Format: AT-FUND01-U123ABC-20260117145030
  const pattern = /^AT-FUND\d{2}-[A-Z0-9]{6}-\d{14}$/;
  return pattern.test(reference);
};

/**
 * Parse payment reference to extract components
 * 
 * @param {String} reference - Payment reference
 * @returns {Object} Parsed components
 */
export const parsePaymentReference = (reference) => {
  if (!validatePaymentReference(reference)) {
    return null;
  }

  const parts = reference.split('-');
  return {
    fundType: parts[1].replace('FUND', ''),
    userIdShort: parts[2],
    timestamp: parts[3],
  };
};

export default {
  generatePaymentReference,
  generateUPILink,
  validatePaymentReference,
  parsePaymentReference,
};
