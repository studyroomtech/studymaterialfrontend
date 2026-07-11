// Constants for the `usePayment` orchestration hook (Req 12.4–12.7, 6.10).

// The distinct phases of the Payment orchestration, driving which affordance
// (Download Gate, Razorpay Checkout, verifying spinner, outcome) is shown:
//   - `idle`        no Payment in progress.
//   - `gate`        the Download Gate is collecting name + email because no
//                   valid learner Access Token is present (Req 6.1, 6.10).
//   - `initiating`  the initiate request is in flight (Req 12.4).
//   - `checkout`    Razorpay Checkout is open with the returned order (Req 12.5).
//   - `verifying`   server-side Payment Signature Verification is in flight
//                   (Req 12.6).
//   - `entitled`    verification succeeded; a Payment Entitlement was granted
//                   (Req 12.6, 12.8).
//   - `failed`      the Payment could not be completed or verified (Req 12.7).
export const PAYMENT_PHASE = {
  idle: 'idle',
  gate: 'gate',
  initiating: 'initiating',
  checkout: 'checkout',
  verifying: 'verifying',
  entitled: 'entitled',
  failed: 'failed',
} as const;

// HTTP status returned by `POST /api/materials/:id/payment` when no User Record
// can be resolved from the presented Access Token (missing/expired/invalid). It
// indicates a valid email is required, so the hook clears any stored token and
// re-opens the Download Gate before retrying the initiation (Req 6.10).
export const PAYMENT_AUTH_REQUIRED_STATUS = 401;

// Backend error `code` returned by `POST /api/downloads/gate` when the submitted
// email resolves to a Password-Protected Account and a correct password was not
// supplied. It causes the gate to reveal a password field and prompt the
// Learner to enter their password before the checkout resumes.
export const GATE_PASSWORD_REQUIRED_CODE = 'PASSWORD_REQUIRED';

// User-facing message shown when a Payment could not be verified server-side
// and no Payment Entitlement was granted (Req 12.7).
export const PAYMENT_VERIFICATION_FAILED_MESSAGE =
  'Your payment could not be verified. If you were charged, it will be reversed. Please try again.';

// User-facing message shown when the Learner dismisses Razorpay Checkout before
// completing the Payment.
export const PAYMENT_DISMISSED_MESSAGE =
  'Payment was cancelled before it completed.';
