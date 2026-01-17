# Fixes Applied: Overlapping Modals

## Issue
The Reimbursement Request form and potentially other modals were overlapping with page content (like the "Pay Group Fund" button) or appearing cutoff. This was caused by the modals being rendered inside the component tree within containers that likely created new stacking contexts (e.g., using `transform` or animations), causing `fixed` positioning to behave incorrectly relative to the viewport.

## Solution
Moved the following modals to use `React Portals` (`ReactDOM.createPortal`), rendering them directly into `document.body`. This ensures they break out of any parent stacking contexts and are positioned correctly relative to the viewport with the intended `z-index`.

## Modified Components
1.  **ReimbursementRequestModal.jsx** (`client/src/components/member/ReimbursementRequestModal.jsx`)
    -   Added `import { createPortal } from 'react-dom';`
    -   Wrapped return JSX with `createPortal(..., document.body)`

2.  **TreasurerResponseModal.jsx** (`client/src/components/member/TreasurerResponseModal.jsx`)
    -   Added `import { createPortal } from 'react-dom';`
    -   Wrapped return JSX with `createPortal(..., document.body)`

3.  **ConfirmReceiptModal.jsx** (`client/src/components/member/ConfirmReceiptModal.jsx`)
    -   Added `import { createPortal } from 'react-dom';`
    -   Wrapped return JSX with `createPortal(..., document.body)`

4.  **QRPaymentModal.jsx** (`client/src/components/member/QRPaymentModal.jsx`)
    -   Added `import { createPortal } from 'react-dom';`
    -   Wrapped return JSX with `createPortal(..., document.body)`

## Verification
-   The modals should now appear on top of all other content, including sticky headers and transformed buttons.
-   The backdrop should cover the entire screen.
-   Scrolling within the modal should work correctly.
