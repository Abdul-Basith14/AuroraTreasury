import { Resend } from 'resend';

// Verify required environment variables for Resend
const requiredEnvVars = ['RESEND_API_KEY', 'EMAIL_FROM'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

let emailEnabled = true;

if (missingVars.length > 0) {
  emailEnabled = false;
  console.error('Email disabled. Missing required environment variables for Resend:', missingVars);
}

let resendClient = null;

if (emailEnabled) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Send OTP via email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 */
/**
 * Send email with custom content
 * @param {Object} emailData - Email data including to, subject, and html content
 */
export const sendEmail = async (emailData) => {
  try {
    if (!emailEnabled || !resendClient) {
      console.warn('Email send skipped: email is not enabled or Resend client not configured');
      return false;
    }

    await resendClient.emails.send({
      from: process.env.EMAIL_FROM,
      ...emailData,
    });
    return true;
  } catch (error) {
    console.error('Send Email Error:', error);
    return false;
  }
};

/**
 * Send OTP via email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    if (!emailEnabled || !resendClient) {
      console.warn('OTP email skipped: email is not enabled or Resend client not configured');
      return false;
    }

    console.log('Attempting to send OTP email to:', email);
    console.log('Email configuration:', {
      provider: 'Resend',
      from: process.env.EMAIL_FROM,
    });

    // Send mail via Resend
    const result = await resendClient.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Aurora Treasury Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Aurora Treasury Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px;">${otp}</h1>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });

    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Send Email Error:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    // Don't crash callers; surface a simple failure signal
    return false;
  }
};