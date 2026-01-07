import nodemailer from 'nodemailer';

// Verify required environment variables
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: parseInt(process.env.EMAIL_PORT) === 465, // Use true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
  logger: process.env.NODE_ENV === 'development', // Enable logging in development
});

// Verify the connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
    throw new Error('Failed to establish SMTP connection');
  } else {
    console.log('SMTP Connection successful');
  }
});

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
    throw new Error(`Failed to send email: ${error.message}`);
  }
};