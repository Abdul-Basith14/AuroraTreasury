# Fixes Applied: OTP Removal & Email Policy

## Changes

1.  **Backend - Authentication Controller**:
    *   **Login Flow Updated**: Removed all logic related to generating, sending, and expecting OTPs. Login now purely validates Email + Password + Treasurer Key (if applicable) and issues a JWT immediately.
    *   **Signup Validation**: Added Strict Regex Validation for emails.
        ```javascript
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|sit\.ac\.in)$/;
        ```
        Only addresses ending in `@gmail.com` or `@sit.ac.in` are permitted.

2.  **Backend - Routes**:
    *   Removed `/send-otp` and `/verify-otp` routes entirely from `server/routes/auth.js`.

3.  **Frontend - Login Page**:
    *   Simplified the `Login.jsx` component.
    *   Removed `showOTPInput` state, countdown timers, and "Send OTP" logic.
    *   The "Sign In" button now directly triggers the `login` API call and navigates based on success.

## Verification
*   **Login**: Login should be instant upon valid credentials. No email will be sent.
*   **Signup**: Trying to register with `test@yahoo.com` should fail with an error message.
