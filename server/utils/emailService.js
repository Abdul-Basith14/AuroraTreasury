import nodemailer from 'nodemailer';

// Verify required environment variables
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

let emailEnabled = true;

if (missingVars.length > 0) {
  emailEnabled = false;
  console.error('Email disabled. Missing required environment variables:', missingVars);
}

let transporter = null;

if (emailEnabled) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Helpful for slow or flaky SMTP connections in production
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });

  // Verify the connection once at startup, but never crash the server if it fails
  transporter.verify((error) => {
    if (error) {
      console.error('SMTP Connection Error (email will remain best-effort):', error.message);
    } else {
      console.log('SMTP server is ready to send emails');
    }
  });
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
    if (!emailEnabled || !transporter) {
      console.warn('Email send skipped: email is not enabled or transporter not configured');
      return false;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...emailData
    });
    return true;
  } catch (error) {
    console.error('Send Email Error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send OTP via email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    if (!emailEnabled || !transporter) {
      console.warn('OTP email skipped: email is not enabled or transporter not configured');
      return false;
    }

    console.log('Attempting to send OTP email to:', email);
    console.log('Email configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM
    });

    // Send mail
    const result = await transporter.sendMail({
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