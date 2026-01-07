import express from 'express';
import * as partyController from '../controllers/partyAmountController.js';
import { protect } from '../middleware/auth.js';
import treasurerAuth from '../middleware/treasurerAuth.js';
import * as upload from '../middleware/upload.js';

const router = express.Router();

// Create a party amount (treasurer only)
router.post('/create', protect, treasurerAuth, partyController.createPartyAmount);

// Get all party amounts
router.get('/all', protect, partyController.getAllPartyAmounts);

// Get active party amounts (for members)
router.get('/active', protect, partyController.getActivePartyAmounts);

// Submit a payment for a party (member) - supports multiple files
router.post('/submit', protect, upload.uploadPartyPaymentProof, partyController.submitPartyPayment);

// Treasurer routes: get payments for a party
router.get('/:partyId/payments', protect, treasurerAuth, partyController.getPartyPayments);

// Treasurer verify a payment
router.post('/verify', protect, treasurerAuth, partyController.verifyPayment);

// Member: get my payments
router.get('/my/payments', protect, partyController.getMyPartyPayments);

// Get party wallet summary
router.get('/:partyId/wallet', protect, partyController.getPartyWallet);

export default router;
