"use client";

// PaymentModal component (Requirement 12.5).
//
// Launches Razorpay Checkout using the order details returned by the Backend
// API (`POST /api/materials/:id/payment`) and the public Razorpay Key
// Identifier. The public key is taken from the order details or, when absent,
// from `NEXT_PUBLIC_RAZORPAY_KEY_ID`; the secret key never reaches the client
// (Req 12.17). The Razorpay Checkout script is loaded dynamically the first
// time it is needed.
//
// The component surfaces every outcome to the caller:
//   - success  -> `onSuccess({ razorpayPaymentId, razorpayOrderId, razorpaySignature })`
//                 so the Backend API can perform server-side Payment Signature
//                 Verification (Req 12.6, 12.15).
//   - dismiss  -> `onDismiss()` when the Learner closes checkout without paying.
//   - failure  -> `onFailure({ code, description })` when the payment fails or
//                 the gateway cannot be launched.
//
// While the script loads and the gateway opens, a lightweight "preparing
// checkout" overlay is shown; if the gateway cannot be launched, an error state
// is shown instead. All styling lives in `PaymentModal.module.scss` (no inline
// CSS) and consumes the shared theme.

import { useEffect, useRef, useState } from "react";

import Button from "../Button/Button";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import styles from "./PaymentModal.module.scss";
import {
  CANCEL_LABEL,
  CHECKOUT_NAME,
  CHECKOUT_THEME_COLOR,
  DEFAULT_CHECKOUT_DESCRIPTION,
  DIALOG_DESCRIPTION,
  DIALOG_DESCRIPTION_ID,
  DIALOG_TITLE,
  DIALOG_TITLE_ID,
  ERROR_TITLE,
  LOADING_LABEL,
  MISSING_KEY_ERROR,
  RAZORPAY_CHECKOUT_SCRIPT_URL,
  RAZORPAY_PAYMENT_FAILED_EVENT,
  RAZORPAY_SCRIPT_ELEMENT_ID,
  SCRIPT_LOAD_ERROR,
} from "./PaymentModal.constant";
import type {
  PaymentModalProps,
  RazorpayCheckoutOptions,
} from "./PaymentModal.types";

/**
 * Join a set of class names, dropping any falsy entries.
 * @param names candidate class names (falsy values are ignored).
 * @returns a space-separated className string.
 */
function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

/**
 * Dynamically load the Razorpay Checkout script, resolving once
 * `window.Razorpay` is available. The script is injected at most once (keyed by
 * a stable element id) and reused on subsequent launches.
 * @returns a promise that resolves when the checkout constructor is ready and
 *   rejects if the script fails to load.
 */
function loadRazorpayScript(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay Checkout is only available in the browser."));
      return;
    }

    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.getElementById(
      RAZORPAY_SCRIPT_ELEMENT_ID,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Razorpay Checkout script failed to load.")),
      );
      // Already present and finished loading before listeners attached.
      if (window.Razorpay) {
        resolve();
      }
      return;
    }

    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ELEMENT_ID;
    script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () =>
      reject(new Error("Razorpay Checkout script failed to load.")),
    );
    document.body.appendChild(script);
  });
}

function PaymentModal({
  isOpen,
  order,
  materialTitle,
  prefill,
  onSuccess,
  onDismiss,
  onFailure,
  className,
}: PaymentModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track the Razorpay Order Identifier we have already launched checkout for
  // so re-renders do not open the gateway more than once per order.
  const launchedOrderRef = useRef<string | null>(null);

  // Reset the launch guard and error state whenever the modal is closed so a
  // subsequent open starts cleanly.
  useEffect(() => {
    if (!isOpen) {
      launchedOrderRef.current = null;
      setErrorMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !order) {
      return undefined;
    }

    // Avoid relaunching checkout for an order that is already in progress.
    if (launchedOrderRef.current === order.razorpayOrderId) {
      return undefined;
    }

    const publicKey =
      order.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

    if (!publicKey) {
      setErrorMessage(MISSING_KEY_ERROR);
      return undefined;
    }

    let isActive = true;
    launchedOrderRef.current = order.razorpayOrderId;
    setErrorMessage(null);

    loadRazorpayScript()
      .then(() => {
        if (!isActive) {
          return;
        }

        const RazorpayCtor = window.Razorpay;
        if (!RazorpayCtor) {
          setErrorMessage(SCRIPT_LOAD_ERROR);
          return;
        }

        const options: RazorpayCheckoutOptions = {
          key: publicKey,
          amount: order.amount,
          currency: order.currency,
          order_id: order.razorpayOrderId,
          name: CHECKOUT_NAME,
          description: materialTitle ?? DEFAULT_CHECKOUT_DESCRIPTION,
          handler: (response) => {
            onSuccess({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          prefill: {
            name: prefill?.name,
            email: prefill?.email,
          },
          theme: {
            color: CHECKOUT_THEME_COLOR,
          },
          modal: {
            ondismiss: () => {
              onDismiss();
            },
          },
        };

        const checkout = new RazorpayCtor(options);
        checkout.on(RAZORPAY_PAYMENT_FAILED_EVENT, (failure) => {
          onFailure({
            code: failure.error?.code,
            description:
              failure.error?.description ??
              failure.error?.reason ??
              "The payment could not be completed.",
          });
        });
        checkout.open();
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        // Allow a later retry by clearing the launch guard for this order.
        launchedOrderRef.current = null;
        setErrorMessage(SCRIPT_LOAD_ERROR);
      });

    return () => {
      isActive = false;
    };
  }, [isOpen, order, materialTitle, prefill, onSuccess, onDismiss, onFailure]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div
        className={classNames(styles.dialog, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={DIALOG_TITLE_ID}
        aria-describedby={DIALOG_DESCRIPTION_ID}
      >
        {errorMessage ? (
          <>
            <ErrorMessage title={ERROR_TITLE} message={errorMessage} />
            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={onDismiss}>
                {CANCEL_LABEL}
              </Button>
            </div>
          </>
        ) : (
          <>
            <header className={styles.header}>
              <h2 id={DIALOG_TITLE_ID} className={styles.title}>
                {DIALOG_TITLE}
              </h2>
              <p id={DIALOG_DESCRIPTION_ID} className={styles.description}>
                {DIALOG_DESCRIPTION}
              </p>
            </header>
            <div className={styles.body}>
              <LoadingIndicator label={LOADING_LABEL} />
            </div>
            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={onDismiss}>
                {CANCEL_LABEL}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
