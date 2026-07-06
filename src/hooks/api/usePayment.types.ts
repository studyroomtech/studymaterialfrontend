// Type declarations for the `usePayment` orchestration hook
// (Req 12.4, 12.5, 12.6, 12.7, 6.10). All type/interface declarations live here
// so the hook module stays free of type declarations (Req 1.15, 1.17).

import type { DownloadGateValues } from '@/components/DownloadGateModal/DownloadGateModal.types';
import type {
  PaymentFailure,
  PaymentOrderDetails,
  PaymentSuccessResult,
} from '@/components/PaymentModal/PaymentModal.types';
import type { HttpError } from '@/utils/http.types';

import type { PAYMENT_PHASE } from './usePayment.constant';

/** The current phase of the Payment orchestration (see `PAYMENT_PHASE`). */
export type PaymentPhase = (typeof PAYMENT_PHASE)[keyof typeof PAYMENT_PHASE];

/**
 * Response body of `POST /api/materials/:id/payment`: the Razorpay order
 * details the Frontend Project presents in checkout (Req 12.4, 12.5). `keyId`
 * is the public Razorpay Key Identifier; the secret key never reaches the
 * client (Req 12.17).
 */
export interface PaymentInitiateResponse {
  /** The Razorpay Order Identifier created server-side (Req 12.4). */
  razorpayOrderId: string;
  /** The order amount in the smallest currency subunit Razorpay expects. */
  amount: number;
  /** The Currency of the order (defaults to INR). */
  currency: string;
  /** The public Razorpay Key Identifier used to present checkout (Req 12.5). */
  keyId?: string;
}

/**
 * Request body of `POST /api/payments/verify`. Carries the fields Razorpay
 * returns on a completed payment so the Backend API can perform server-side
 * Payment Signature Verification; the client "success" claim is never trusted
 * on its own (Req 12.6, 12.15).
 */
export interface PaymentVerifyRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * Response body of `POST /api/downloads/gate`: a freshly issued learner Access
 * Token used to resume a deferred Payment initiation (Req 6.5).
 */
export interface GateTokenResponse {
  /** The issued learner JWT Access Token. */
  accessToken: string;
  /** Token lifetime in seconds (2592000 per Req 6.5). */
  expiresInSeconds: number;
}

/**
 * Response body of `POST /api/payments/verify` on success: the resulting
 * Payment Status and whether a Payment Entitlement was granted (Req 12.6).
 */
export interface PaymentVerifyResponse {
  /** The resulting Payment Status (e.g. "successful"). */
  status: string;
  /** `true` when a Payment Entitlement was granted for the material (Req 12.8). */
  entitled: boolean;
}

/**
 * Value returned by {@link usePayment}. The hook orchestrates the full Payment
 * flow — ensuring a learner Access Token (else surfacing the Download Gate per
 * Req 6.1/6.10), initiating the Razorpay order (Req 12.4), driving the
 * {@link PaymentModal}/Razorpay Checkout (Req 12.5), and verifying the result
 * server-side (Req 12.6, 12.7) — while exposing state so the caller can wire up
 * a {@link DownloadGateModal} and {@link PaymentModal} and render feedback.
 */
export interface UsePaymentResult {
  /**
   * Begin a Payment for the given Paid Material. If a valid Access Token is
   * present the order is initiated immediately; otherwise the Download Gate is
   * opened and initiation is deferred until it is submitted (Req 6.1, 6.10).
   */
  startPayment: (materialId: string) => void;
  /** The Paid Material a Payment is currently in progress for, or `null`. */
  activeMaterialId: string | null;
  /** The current phase of the Payment orchestration. */
  phase: PaymentPhase;

  /** Whether the Download Gate should be displayed (no valid token) (Req 6.1). */
  isGateOpen: boolean;
  /** `true` while the Download Gate submission is in flight (Req 7.3). */
  isSubmittingGate: boolean;
  /** A user-facing gate submission error message for the modal (Req 8.1). */
  gateError?: string;
  /**
   * Submit the Download Gate name + email: persists a User Record, issues an
   * Access Token, and then resumes the deferred Payment initiation (Req 6.2,
   * 6.5, 6.10). Intended as the `onSubmit` handler for {@link DownloadGateModal}.
   */
  submitGate: (values: DownloadGateValues) => void;
  /** Dismiss the Download Gate without submitting; the Payment stays blocked. */
  cancelGate: () => void;

  /** Whether the {@link PaymentModal}/Razorpay Checkout should be shown (Req 12.5). */
  isModalOpen: boolean;
  /** The Razorpay order details to launch checkout with, or `null` (Req 12.4). */
  order: PaymentOrderDetails | null;
  /**
   * Forward Razorpay's completed-payment fields for server-side verification
   * (Req 12.6). Intended as the `onSuccess` handler for {@link PaymentModal}.
   */
  handleCheckoutSuccess: (result: PaymentSuccessResult) => void;
  /** Handle the Learner closing checkout without paying. */
  handleCheckoutDismiss: () => void;
  /** Handle a failed/rejected payment or a gateway that could not be launched. */
  handleCheckoutFailure: (failure: PaymentFailure) => void;

  /** `true` while the initiate request is in flight (Req 12.4, 7.3). */
  isInitiating: boolean;
  /** `true` while server-side verification is in flight (Req 12.6, 7.3). */
  isVerifying: boolean;
  /** `true` once verification succeeded and access was granted (Req 12.6, 12.8). */
  isEntitled: boolean;
  /** The most recent initiate/verify request failure, or `null` (Req 8.1). */
  error: HttpError | null;
  /** A user-facing message describing why the Payment failed (Req 12.7). */
  failureMessage?: string;
  /** Reset the orchestration back to its idle state for a fresh attempt. */
  reset: () => void;
}
