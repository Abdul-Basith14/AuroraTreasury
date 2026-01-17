/**
 * QR Code and Payment Reference Generation Utilities
 * For UPI-based payments without payment gateway
 */

/**
 * Generate unique payment reference code
 * Format: AT-TYPE-ID-USERID-YYYYMMDD
 * 
 * @param {string} type - Payment type ('FUND' or 'PARTY')
 * @param {string} paymentId - ID of the fund/party
 * @param {string} userId - User ID
 * @returns {string} Unique reference code
 */
export const generatePaymentReference = (type, paymentId, userId) => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits for uniqueness
  
  // Shorten IDs to last 6 characters for cleaner reference
  const shortPaymentId = paymentId.toString().slice(-6).toUpperCase();
  const shortUserId = userId.toString().slice(-6).toUpperCase();
  
  return `AT-${type}-${shortPaymentId}-${shortUserId}-${dateStr}${timestamp}`;
};

/**
 * Generate UPI payment URL for QR code
 * 
 * @param {Object} params - Payment parameters
 * @param {string} params.upiId - Treasurer's UPI ID
 * @param {string} params.name - Payee name (default: AuroraTreasury)
 * @param {number} params.amount - Payment amount
 * @param {string} params.reference - Payment reference code
 * @returns {string} UPI payment URL
 */
export const generateUPIUrl = ({ upiId, name = 'AuroraTreasury', amount, reference }) => {
  // UPI URL format according to NPCI standards
  const params = new URLSearchParams({
    pa: upiId,           // Payee address (UPI ID)
    pn: name,            // Payee name
    am: amount.toString(), // Amount
    cu: 'INR',          // Currency
    tn: reference,       // Transaction note (our reference code)
  });
  
  return `upi://pay?${params.toString()}`;
};

/**
 * Generate QR code data for frontend rendering
 * Returns object with all necessary QR information
 * 
 * @param {Object} paymentDetails - Payment details
 * @param {string} paymentDetails.type - 'FUND' or 'PARTY'
 * @param {string} paymentDetails.paymentId - ID of fund/party
 * @param {string} paymentDetails.userId - User ID
 * @param {number} paymentDetails.amount - Payment amount
 * @param {string} paymentDetails.treasurerUPI - Treasurer's UPI ID
 * @param {string} paymentDetails.fundName - Name of fund/party for display
 * @returns {Object} QR code data
 */
export const generateQRData = ({ 
  type, 
  paymentId, 
  userId, 
  amount, 
  treasurerUPI,
  fundName,
  referenceOverride,
  memberName,
  memberUsn,
}) => {
  // Use provided reference when present to keep UI and stored payment in sync
  const reference = referenceOverride || generatePaymentReference(type, paymentId, userId);
  
  // Generate UPI URL
  const upiUrl = generateUPIUrl({
    upiId: treasurerUPI,
    amount,
    reference,
  });
  
  return {
    reference,
    upiUrl,
    amount,
    treasurerUPI,
    fundName,
    memberName,
    memberUsn,
    instructions: [
      'Scan this QR code using any UPI app (Google Pay, PhonePe, Paytm, etc.)',
      `DO NOT change the payment note: ${reference}`,
      `Member: ${memberName || 'N/A'}${memberUsn ? ` (${memberUsn})` : ''}`,
      'After payment, click "I have paid" button below',
      'Your payment will be verified by the treasurer',
    ],
  };
};

/**
 * Validate payment reference format
 * 
 * @param {string} reference - Reference code to validate
 * @returns {boolean} True if valid format
 */
export const validatePaymentReference = (reference) => {
  // Format: AT-TYPE-PAYMENTID-USERID-YYYYMMDDXXXX
  const pattern = /^AT-(FUND|PARTY)-[A-Z0-9]{6}-[A-Z0-9]{6}-\d{12}$/;
  return pattern.test(reference);
};

/**
 * Parse payment reference to extract information
 * 
 * @param {string} reference - Reference code
 * @returns {Object|null} Parsed data or null if invalid
 */
export const parsePaymentReference = (reference) => {
  if (!validatePaymentReference(reference)) {
    return null;
  }
  
  const parts = reference.split('-');
  return {
    type: parts[1],
    paymentId: parts[2],
    userId: parts[3],
    dateTimestamp: parts[4],
  };
};
