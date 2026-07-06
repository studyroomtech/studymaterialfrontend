// Type declarations for the PaymentModal component (Requirements 1.15, 12.5).
//
// The PaymentModal launches Razorpay Checkout using the order details returned
// by `POST /api/materials/:id/payment` and surfaces the payment outcome back to
// the caller. All type/interface declarations for the component live here so
// the component module stays free of type declarations (Req 1.15, 1.17).

/**
 * The order details returned by the Backend API when a Payment is initiated
 * (`POST /api/materials/:id/payment` — Req 12.4). These drive the Razorpay
 * Checkout launch.
 */
export interface PaymentOrderDetails {
  /** The Razorpay Order Identifier created server-side (Req 12.4). */
  razorpayOrderId: string;
  /**
   * The order amount expressed in the smallest currency subunit that Razorpay
   * expects (e.g. paise for INR). The caller is responsible for supplying the
   * amount in the correct subunit.
   */
  amount: number;
  /** The Currency of the order (defaults to INR — Req 12 introduction). */
  currency: string;
  /**
   * The public Razorpay Key Identifier used to present the checkout. When
   * omitted, the component falls back to `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   * (Req 12.5). The secret key never reaches the client (Req 12.17).
   */
  keyId?: string;
}

/**
 * The verified-payment fields Razorpay returns to the Frontend Project on a
 * completed payment. They are handed back to the caller unchanged so the
 * Backend API can perform server-side Payment Signature Verification — the
 * client "success" claim is never trusted on its own (Req 12.6, 12.15).
 */
export interface PaymentSuccessResult {
  /** The Razorpay Payment Identifier for the completed payment. */
  razorpayPaymentId: string;
  /** The Razorpay Order Identifier the payment settled against. */
  razorpayOrderId: string;
  /** The Razorpay Signature to be verified server-side (Req 12.16). */
  razorpaySignature: string;
}

/** A normalized description of a failed/rejected payment. */
export interface PaymentFailure {
  /** An optional Razorpay error code, when provided. */
  code?: string;
  /** A human-readable explanation of the failure. */
  description: string;
}

/** Optional values used to pre-fill the Razorpay Checkout contact fields. */
export interface PaymentPrefill {
  /** The Learner's name, when known. */
  name?: string;
  /** The Learner's email, when known. */
  email?: string;
}

/**
 * Props for the PaymentModal.
 *
 * The modal is a controlled component: the parent decides when it is visible
 * and supplies the order details to launch checkout with. It reports the
 * outcome through `onSuccess` (verified fields for server-side verification),
 * `onDismiss` (Learner closed checkout without paying), and `onFailure` (the
 * payment was attempted but failed or the gateway could not be launched).
 */
export interface PaymentModalProps {
  /** Whether the modal is active and should launch checkout. */
  isOpen: boolean;
  /**
   * The order details to launch Razorpay Checkout with. When `null` while
   * `isOpen` is true, the modal shows its loading affordance awaiting the
   * order (e.g. while the initiate request is in flight).
   */
  order: PaymentOrderDetails | null;
  /** Title of the Paid Material, shown as the checkout description. */
  materialTitle?: string;
  /** Optional contact values used to pre-fill the checkout form. */
  prefill?: PaymentPrefill;
  /**
   * Called with the Razorpay payment/order/signature once the Learner
   * completes payment. The caller must forward these to the Backend API for
   * server-side verification before granting access (Req 12.6, 12.15).
   */
  onSuccess: (result: PaymentSuccessResult) => void;
  /** Called when the Learner closes checkout without completing payment. */
  onDismiss: () => void;
  /** Called when the payment fails or the gateway cannot be launched. */
  onFailure: (failure: PaymentFailure) => void;
  /** Optional additional class name applied to the dialog element. */
  className?: string;
}

/**
 * The response Razorpay passes to the checkout `handler` on a successful
 * payment.
 */
export interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/** The payload Razorpay emits on a `payment.failed` event. */
export interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
}

/** The subset of Razorpay Checkout options this component sets. */
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

/** The Razorpay Checkout instance created from the options above. */
export interface RazorpayInstance {
  /** Opens the Razorpay Checkout overlay. */
  open: () => void;
  /** Subscribes to a Razorpay Checkout event (e.g. `payment.failed`). */
  on: (
    event: string,
    handler: (response: RazorpayFailureResponse) => void,
  ) => void;
}

/** The global `window.Razorpay` constructor exposed by the checkout script. */
export type RazorpayConstructor = new (
  options: RazorpayCheckoutOptions,
) => RazorpayInstance;

declare global {
  // Augment the browser Window with the Razorpay Checkout constructor injected
  // by the dynamically loaded checkout script.
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}
