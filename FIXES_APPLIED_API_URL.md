# Fixes Applied: API Connection Method

## Issue
The deployed application was trying to connect to `http://localhost:5000/api` instead of the live server URL.
This resulted in `net::ERR_CONNECTION_REFUSED` because the live server (Render) does not have a backend running on `localhost` relative to the user's browser, and even if it did, the port would be different.

## Cause
The file `client/.env` contained `VITE_API_URL=http://localhost:5000/api` and was committed to the repository. Vite bakes this value into the production build, hardcoding the API URL to localhost.

## Solution
1.  **Created `client/.env.development`**: Moved the `VITE_API_URL` variable here. Vite automatically uses this file *only* when you run `npm run dev`.
2.  **Updated `client/.env`**: Commented out the variable.

## Result
-   **Local Development**: `npm run dev` will pick up `.env.development` and connect to `localhost:5000`.
-   **Production Build**: `npm run build` will NOT see the variable. `client/src/utils/api.js` will fallback to its default behavior:
    ```javascript
    // falls back to /api on the same domain
    `${window.location.origin}/api`
    ```
    This correctly points to your deployed backend (e.g., `https://aurora-treasury.onrender.com/api`).

## Action Required
-   **Commit and Push**: You must push these changes to GitHub so Render triggers a new build.
