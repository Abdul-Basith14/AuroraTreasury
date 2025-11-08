const express = require('express');
const router = express.Router();
const { 
  requestPasswordReset, 
  resetPassword 
} = require('../controllers/resetPasswordController');

// Route to request password reset
router.post('/request-reset', requestPasswordReset);

// Route to reset password with token
router.post('/reset', resetPassword);

module.exports = router;