# Email Service Update: Reverted to Resend

## Configuration
The user requested to strictly use Resend logic with the testing domain sender.

## Changes
1.  **server/.env**:
    -   Updated `EMAIL_FROM` to `onboarding@resend.dev`
    -   This allows sending emails via Resend API (limited to the registered account email for testing).

2.  **server/utils/emailService.js**:
    -   (No changes needed to code as the previous "Revert" attempt failed due to file state mismatch, but upon inspection, the file content `c:\01.Myuse\AuroraTreasury\AuroraTreasury\server\utils\emailService.js` currently uses Resend logic exclusively, which matches the requirement).
    -   *Note: My previous read of `emailService.js` showed it using `Resend` class directly without the SMTP fallback code I thought I added. It seems the file might not have been successfully updated in the previous turn or I read an old version. In either case, the current state of `emailService.js` matches the user's request: it uses Resend.*

## Verification
-   The server will use `RESEND_API_KEY` to send emails.
-   The sender will be `onboarding@resend.dev`.
