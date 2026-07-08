'use client';

// `usePayment` — orchestrate a Paid Material Payment / cart checkout
// (Req 12.4–12.7, 6.10).
//
// Coordinates the full payment flow:
//   1. Ensure a valid learner Access Token via `useAccessToken`; otherwise the
//      Download Gate collects name + email first (Req 6.1, 6.10).
//   2. On gate submission, POST to `/api/downloads/gate`, persist the token,
//      and resume the deferred initiation (Req 6.2, 6.5).
//   3. POST the list of material ids to `/api/payments/initiate`; the backend
//      resolves the learner, drops Free/already-entitled items, sums the
//      chargeable prices, creates ONE Razorpay order + Payment Record, and
//      returns the order details (Req 12.4).
//   4. Drive the PaymentModal → Razorpay Checkout (Req 12.5).
//   5. POST the checkout result to `/api/payments/verify`; entitlement is
//      granted only on server-side signature verification (Req 12.6, 12.7).
//
// A single-material "Pay to unlock" is just a one-item checkout. A `401` on
// initiate means no User Record could be resolved: the token is cleared and the
// Download Gate re-opens (Req 6.10).

import { useCallback, useMemo, useRef, useState } from 'react';

import type { DownloadGateValues } from '@/components/DownloadGateModal/DownloadGateModal.types';
import type {
  PaymentFailure,
  PaymentOrderDetails,
  PaymentSuccessResult,
} from '@/components/PaymentModal/PaymentModal.types';
import { httpRequest } from '@/utils/http';
import type { HttpError } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import { API_ROUTES } from './apiClient.constant';
import {
  PAYMENT_AUTH_REQUIRED_STATUS,
  PAYMENT_DISMISSED_MESSAGE,
  PAYMENT_PHASE,
  PAYMENT_VERIFICATION_FAILED_MESSAGE,
} from './usePayment.constant';
import type {
  GateTokenResponse,
  PaymentInitiateResponse,
  PaymentPhase,
  PaymentVerifyResponse,
  UsePaymentResult,
} from './usePayment.types';
import { useAccessToken } from '../useAccessToken';

/** JSON request headers shared by the gate, initiate, and verify POST calls. */
const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const usePayment = (): UsePaymentResult => {
  const { token, hasValidToken, setToken, clearToken } = useAccessToken();

  const [phase, setPhase] = useState<PaymentPhase>(PAYMENT_PHASE.idle);
  const [order, setOrder] = useState<PaymentOrderDetails | null>(null);
  const [activeMaterialIds, setActiveMaterialIds] = useState<string[]>([]);
  const [error, setError] = useState<HttpError | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | undefined>(
    undefined,
  );
  const [gateError, setGateError] = useState<string | undefined>(undefined);
  const [isSubmittingGate, setIsSubmittingGate] = useState<boolean>(false);

  // The materials awaiting checkout while the Download Gate collects the
  // learner's details; resumed once a valid token is obtained (Req 6.10).
  const pendingMaterialIdsRef = useRef<string[] | null>(null);

  // POST `/api/payments/initiate` to create a Razorpay order + Payment Record
  // for the whole cart, then open the PaymentModal (Req 12.4, 12.5).
  const initiatePayment = useCallback(
    async (materialIds: string[], accessToken: string): Promise<void> => {
      setPhase(PAYMENT_PHASE.initiating);
      setError(null);
      setFailureMessage(undefined);
      setOrder(null);

      const result = await httpRequest<PaymentInitiateResponse>(
        buildApiUrl(API_ROUTES.paymentsInitiate),
        {
          method: 'POST',
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ studyMaterialIds: materialIds }),
        },
      );

      if (result.ok) {
        pendingMaterialIdsRef.current = null;
        setOrder({
          razorpayOrderId: result.data.razorpayOrderId,
          amount: result.data.amount,
          currency: result.data.currency,
          keyId: result.data.keyId,
        });
        setPhase(PAYMENT_PHASE.checkout);
        return;
      }

      // No resolvable User Record (missing/expired/invalid token): clear it and
      // re-open the Download Gate so the Learner re-identifies (Req 6.10).
      if (result.error.status === PAYMENT_AUTH_REQUIRED_STATUS) {
        clearToken();
        pendingMaterialIdsRef.current = materialIds;
        setPhase(PAYMENT_PHASE.gate);
        return;
      }

      // Other initiation failures (e.g. 422 free, 409 already entitled) are
      // surfaced so the caller can render a message (Req 8.1).
      setError(result.error);
      setPhase(PAYMENT_PHASE.failed);
      setFailureMessage(result.error.message);
    },
    [clearToken],
  );

  const startCheckout = useCallback(
    (materialIds: string[]): void => {
      setActiveMaterialIds(materialIds);
      setError(null);
      setFailureMessage(undefined);
      setGateError(undefined);

      if (materialIds.length === 0) {
        return;
      }

      // A valid Access Token lets initiation proceed without the gate (Req 12.4).
      if (hasValidToken && token !== null) {
        pendingMaterialIdsRef.current = materialIds;
        void initiatePayment(materialIds, token);
        return;
      }

      // No valid token: surface the Download Gate and defer initiation so a
      // User Record (email) exists before a Payment is created (Req 6.1, 6.10).
      pendingMaterialIdsRef.current = materialIds;
      setPhase(PAYMENT_PHASE.gate);
    },
    [hasValidToken, token, initiatePayment],
  );

  const startPayment = useCallback(
    (materialId: string): void => {
      startCheckout([materialId]);
    },
    [startCheckout],
  );

  const submitGate = useCallback(
    async (values: DownloadGateValues): Promise<void> => {
      setIsSubmittingGate(true);
      setGateError(undefined);

      const result = await httpRequest<GateTokenResponse>(
        buildApiUrl(API_ROUTES.downloadsGate),
        {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify(values),
        },
      );

      setIsSubmittingGate(false);

      if (!result.ok) {
        // Keep the gate open with the entered values preserved (Req 8.1).
        setGateError(result.error.message);
        return;
      }

      // Persist the issued token and resume the deferred initiation (Req 6.2, 6.5).
      setToken(result.data.accessToken);

      const materialIds = pendingMaterialIdsRef.current;
      if (materialIds !== null && materialIds.length > 0) {
        void initiatePayment(materialIds, result.data.accessToken);
      } else {
        setPhase(PAYMENT_PHASE.idle);
      }
    },
    [setToken, initiatePayment],
  );

  const cancelGate = useCallback((): void => {
    pendingMaterialIdsRef.current = null;
    setGateError(undefined);
    setPhase(PAYMENT_PHASE.idle);
  }, []);

  // POST the Razorpay confirmation for server-side Payment Signature
  // Verification; entitlement is granted only on server success (Req 12.6,
  // 12.7, 12.15).
  const handleCheckoutSuccess = useCallback(
    async (result: PaymentSuccessResult): Promise<void> => {
      setPhase(PAYMENT_PHASE.verifying);
      setError(null);
      setFailureMessage(undefined);

      const response = await httpRequest<PaymentVerifyResponse>(
        buildApiUrl(API_ROUTES.paymentsVerify),
        {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({
            razorpayOrderId: result.razorpayOrderId,
            razorpayPaymentId: result.razorpayPaymentId,
            razorpaySignature: result.razorpaySignature,
          }),
        },
      );

      // Close the checkout modal now that a confirmation has been submitted.
      setOrder(null);

      if (response.ok && response.data.entitled) {
        setPhase(PAYMENT_PHASE.entitled);
        return;
      }

      // Verification failed (or reported not entitled): grant nothing and
      // surface a verification error (Req 12.7).
      if (!response.ok) {
        setError(response.error);
      }
      setFailureMessage(PAYMENT_VERIFICATION_FAILED_MESSAGE);
      setPhase(PAYMENT_PHASE.failed);
    },
    [],
  );

  const handleCheckoutDismiss = useCallback((): void => {
    setOrder(null);
    setFailureMessage(PAYMENT_DISMISSED_MESSAGE);
    setPhase(PAYMENT_PHASE.failed);
  }, []);

  const handleCheckoutFailure = useCallback((failure: PaymentFailure): void => {
    setOrder(null);
    setFailureMessage(failure.description);
    setPhase(PAYMENT_PHASE.failed);
  }, []);

  const reset = useCallback((): void => {
    pendingMaterialIdsRef.current = null;
    setPhase(PAYMENT_PHASE.idle);
    setOrder(null);
    setActiveMaterialIds([]);
    setError(null);
    setFailureMessage(undefined);
    setGateError(undefined);
  }, []);

  const isGateOpen = phase === PAYMENT_PHASE.gate;
  const isModalOpen =
    phase === PAYMENT_PHASE.checkout || phase === PAYMENT_PHASE.verifying;
  const activeMaterialId = activeMaterialIds[0] ?? null;

  return useMemo<UsePaymentResult>(
    () => ({
      startPayment,
      startCheckout,
      activeMaterialId,
      activeMaterialIds,
      phase,
      isGateOpen,
      isSubmittingGate,
      gateError,
      submitGate,
      cancelGate,
      isModalOpen,
      order,
      handleCheckoutSuccess,
      handleCheckoutDismiss,
      handleCheckoutFailure,
      isInitiating: phase === PAYMENT_PHASE.initiating,
      isVerifying: phase === PAYMENT_PHASE.verifying,
      isEntitled: phase === PAYMENT_PHASE.entitled,
      error,
      failureMessage,
      reset,
    }),
    [
      startPayment,
      startCheckout,
      activeMaterialId,
      activeMaterialIds,
      phase,
      isGateOpen,
      isSubmittingGate,
      gateError,
      submitGate,
      cancelGate,
      isModalOpen,
      order,
      handleCheckoutSuccess,
      handleCheckoutDismiss,
      handleCheckoutFailure,
      error,
      failureMessage,
      reset,
    ],
  );
};
