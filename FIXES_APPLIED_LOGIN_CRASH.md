# Fixes Applied: Login Page Crash

## Issue
The Login page was crashing with `ReferenceError: showOTPInput is not defined`.
This was because I incompletely removed the OTP logic, leaving behind a JSX block that referenced `showOTPInput`, `countdown`, and `handleSendOTP` which were no longer defined in the component's state.

## Solution
Removed the entire leftover JSX block related to OTP input and button state logic.
Use `Login.jsx` now only contains:
-   Email/Password inputs.
-   Treasurer Key input (conditional).
-   Simple "Sign In" button without verification logic.

## Verification
-   The page should no longer crash on load or interaction.
-   The "Sign In" button should explicitly say "Sign In" and change to "Signing in..." when loading.
