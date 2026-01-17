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

/**
 * Send password reset request notification to treasurer
 * @param {Object} resetRequest - Password reset request with populated user data
 */
export const sendPasswordResetRequestEmail = async (resetRequest) => {
  try {
    if (!emailEnabled || !resendClient) {
      console.warn('Password reset notification email skipped: email is not enabled');
      return false;
    }

    // Get treasurer email from environment or use default
    const treasurerEmail = process.env.TREASURER_EMAIL || process.env.EMAIL_FROM;

    await resendClient.emails.send({
      from: process.env.EMAIL_FROM,
      to: treasurerEmail,
      subject: 'New Password Reset Request - Aurora Treasury',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #A6C36F; padding-bottom: 10px;">
            🔐 New Password Reset Request
          </h2>
          <p style="color: #666;">A member has requested to reset their password and needs your verification.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Member Details:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${resetRequest.user.name}</p>
            <p style="margin: 5px 0;"><strong>USN:</strong> ${resetRequest.user.usn}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${resetRequest.user.email}</p>
            <p style="margin: 5px 0;"><strong>Year:</strong> ${resetRequest.user.year}</p>
            <p style="margin: 5px 0;"><strong>Branch:</strong> ${resetRequest.user.branch}</p>
            <p style="margin: 5px 0;"><strong>Request Date:</strong> ${new Date(resetRequest.createdAt).toLocaleString()}</p>
          </div>

          <p style="color: #666;">Please log in to the Treasurer Dashboard to approve or reject this request.</p>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">Aurora Treasury - Automated Notification</p>
          </div>
        </div>
      `
    });

    console.log('Password reset request notification sent to treasurer');
    return true;
  } catch (error) {
    console.error('Send password reset request email error:', error);
    return false;
  }
};

/**
 * Send password reset approval email to member
 * @param {Object} user - User object
 */
export const sendPasswordResetApprovalEmail = async (user) => {
  try {
    if (!emailEnabled || !resendClient) {
      console.warn('Password reset approval email skipped: email is not enabled');
      return false;
    }

    await resendClient.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Approved - Aurora Treasury',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
            ✅ Password Reset Approved
          </h2>
          <p style="color: #666;">Dear ${user.name},</p>
          <p style="color: #666;">Your password reset request has been approved by the treasurer. Your new password is now active.</p>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #155724; margin: 0;">
              <strong>You can now log in with your new password!</strong>
            </p>
          </div>

          <p style="color: #666;">If you did not request this password reset, please contact the treasurer immediately.</p>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">Aurora Treasury - Automated Notification</p>
          </div>
        </div>
      `
    });

    console.log('Password reset approval email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('Send password reset approval email error:', error);
    return false;
  }
};

/**
 * Send password reset rejection email to member
 * @param {Object} user - User object
 * @param {string} reason - Rejection reason
 */
export const sendPasswordResetRejectionEmail = async (user, reason) => {
  try {
    if (!emailEnabled || !resendClient) {
      console.warn('Password reset rejection email skipped: email is not enabled');
      return false;
    }

    await resendClient.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request Rejected - Aurora Treasury',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
            ❌ Password Reset Request Rejected
          </h2>
          <p style="color: #666;">Dear ${user.name},</p>
          <p style="color: #666;">Your password reset request has been rejected by the treasurer.</p>
          
          ${reason ? `
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #721c24; margin: 0;">
              <strong>Reason:</strong> ${reason}
            </p>
          </div>
          ` : ''}

          <p style="color: #666;">If you believe this is an error or need assistance, please contact the treasurer directly.</p>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">Aurora Treasury - Automated Notification</p>
          </div>
        </div>
      `
    });

    console.log('Password reset rejection email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('Send password reset rejection email error:', error);
    return false;
  }
};