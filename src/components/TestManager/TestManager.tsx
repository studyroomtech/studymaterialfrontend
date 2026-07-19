'use client';

// TestManager — the admin Test-authoring surface rendered inside the Manage
// Page's Test Series Tab (Requirements 2.1, 2.5, 5.3).
//
// This container drives two things through the `useAdminTests` hook:
//   - a create-Test form (title, Timing Mode, overall Time Limit, optional
//     Price), with per-field validation surfaced inline (Req 2.1, 2.5);
//   - a list of the existing Tests, each showing its title and a Price / free
//     indicator via the shared `utils/price.ts` (Req 5.3, 2.4).
//
// Each Test's Edit button navigates to the dedicated, shareable Edit Page at
// `/admin/tests/edit?testId=<id>` via `router.push(buildEditHref(id))` (Req
// 1.4); the in-place edit view previously hosted here now lives on that route.
// All styling lives in `TestManager.module.scss` (no inline CSS) and derives
// from the shared theme.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import EmptyState from '@/components/EmptyState/EmptyState';
import { useAdminTests } from '@/hooks/api/useAdminTests';
import type { TestSeriesListingDto } from '@/types/testSeries.types';
import type { HttpError } from '@/utils/http.types';
import { classifyPrice, formatPrice } from '@/utils/price';
import { DEFAULT_CURRENCY, PRICE_CLASSIFICATION } from '@/utils/price.constant';

import { buildEditHref } from '@/app/admin/tests/edit/page.helpers';
import styles from './TestManager.module.scss';
import type {
  CreateTestDraft,
  CreateTestFieldErrors,
  ParsedPrice,
  TestManagerFeedback,
} from './TestManager.types';
import {
  CREATE_SECTION_TITLE,
  CREATE_SUBMIT_LABEL,
  CREATE_SUCCESS_MESSAGE,
  DEFAULT_TIMING_MODE,
  EDIT_LABEL,
  FREE_BADGE_LABEL,
  GENERIC_ACTION_ERROR,
  MANAGER_SUBTITLE,
  MANAGER_TITLE,
  PRICE_INVALID_ERROR,
  RETRY_LABEL,
  TEST_PRICE_FIELD_ID,
  TEST_PRICE_HINT,
  TEST_PRICE_LABEL,
  TEST_PRICE_PLACEHOLDER,
  TEST_TIME_LIMIT_FIELD_ID,
  TEST_TIME_LIMIT_HINT,
  TEST_TIME_LIMIT_LABEL,
  TEST_TIME_LIMIT_PLACEHOLDER,
  TEST_TIMING_FIELD_ID,
  TEST_TIMING_LABEL,
  TEST_TITLE_FIELD_ID,
  TEST_TITLE_LABEL,
  TEST_TITLE_MAX_LENGTH,
  TEST_TITLE_MIN_LENGTH,
  TEST_TITLE_PLACEHOLDER,
  TESTS_EMPTY_MESSAGE,
  TESTS_ERROR_MESSAGE,
  TESTS_ERROR_TITLE,
  TESTS_SECTION_TITLE,
  TIME_LIMIT_INVALID_ERROR,
  TIMING_MODE_OPTIONS,
  TITLE_REQUIRED_ERROR,
} from './TestManager.constant';

/** The empty create-Test form draft. */
const EMPTY_DRAFT: CreateTestDraft = {
  title: '',
  timingMode: DEFAULT_TIMING_MODE,
  timeLimitSeconds: '',
  price: '',
};

/**
 * Parse the raw price-field input into a Price amount in paise. An empty/
 * whitespace value or 0 maps to a free Test (`amount: null`); a positive whole
 * number maps to a priced Test; any other value (non-numeric, fractional,
 * negative) is rejected (Req 2.4). The Backend API re-validates the Price.
 */
function parsePriceInput(raw: string): ParsedPrice {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, amount: null };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false };
  }
  const amount = Number(trimmed);
  if (!Number.isInteger(amount) || amount < 0) {
    return { ok: false };
  }
  return { ok: true, amount: amount === 0 ? null : amount };
}

/**
 * Map a Backend API validation envelope's per-field reasons onto the create-Test
 * form's field-error keys, so a 422 surfaces inline beneath the right field
 * (Req 2.5). Backend field names (`title`, `timingMode`, `timeLimitSeconds`,
 * `priceAmount`) are matched; unknown fields are ignored (surfaced via the
 * banner instead).
 */
function mapFieldErrors(error: HttpError): CreateTestFieldErrors {
  const fieldErrors: CreateTestFieldErrors = {};
  for (const { field, reason } of error.fields ?? []) {
    if (field === 'title') {
      fieldErrors.title = reason;
    } else if (field === 'timingMode') {
      fieldErrors.timingMode = reason;
    } else if (field === 'timeLimitSeconds') {
      fieldErrors.timeLimitSeconds = reason;
    } else if (field === 'priceAmount' || field === 'currency') {
      fieldErrors.price = reason;
    }
  }
  return fieldErrors;
}

/**
 * Render a Test's Price as a currency value, or a free indicator when the Test
 * has no Price (Req 2.4, 5.3). Uses the shared `utils/price.ts` classification
 * and formatting.
 */
function priceLabel(priceAmount: number | null, currency: string): string {
  return classifyPrice(priceAmount) === PRICE_CLASSIFICATION.free
    ? FREE_BADGE_LABEL
    : formatPrice(priceAmount, { currency });
}

function TestManager() {
  const { isAdmin, isLoading, isSubmitting, createTest, listTests } =
    useAdminTests();
  const router = useRouter();

  // ---- Tests list state (reloaded after a successful create) -------------
  const [tests, setTests] = useState<TestSeriesListingDto[] | null>(null);
  const [listError, setListError] = useState<HttpError | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const reloadTests = useCallback(() => {
    setReloadNonce((nonce) => nonce + 1);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    let active = true;
    setListError(null);
    listTests().then((result) => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setTests(result.data);
      } else {
        setListError(result.error);
      }
    });
    return () => {
      active = false;
    };
  }, [isAdmin, listTests, reloadNonce]);

  // ---- Feedback -----------------------------------------------------------
  const [feedback, setFeedback] = useState<TestManagerFeedback | null>(null);

  // ---- Create-Test form state (Req 2.1) ----------------------------------
  const [draft, setDraft] = useState<CreateTestDraft>(EMPTY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<CreateTestFieldErrors>({});

  const clearFieldError = useCallback((key: keyof CreateTestFieldErrors) => {
    setFieldErrors((prev) => {
      if (prev[key] === undefined) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleCreate = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setFeedback(null);

    // Client-side pre-validation mirrors the backend bounds so obvious errors
    // are surfaced inline before a request (Req 2.5); the Backend API remains
    // the authority and re-validates every field.
    const nextErrors: CreateTestFieldErrors = {};
    const title = draft.title.trim();
    if (
      title.length < TEST_TITLE_MIN_LENGTH ||
      title.length > TEST_TITLE_MAX_LENGTH
    ) {
      nextErrors.title = TITLE_REQUIRED_ERROR;
    }
    const timeLimitSeconds = Number(draft.timeLimitSeconds.trim());
    if (
      !/^\d+$/.test(draft.timeLimitSeconds.trim()) ||
      !Number.isInteger(timeLimitSeconds) ||
      timeLimitSeconds < 1
    ) {
      nextErrors.timeLimitSeconds = TIME_LIMIT_INVALID_ERROR;
    }
    const parsedPrice = parsePriceInput(draft.price);
    if (!parsedPrice.ok) {
      nextErrors.price = PRICE_INVALID_ERROR;
    }

    if (
      nextErrors.title ||
      nextErrors.timeLimitSeconds ||
      nextErrors.price ||
      !parsedPrice.ok
    ) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});

    // A positive amount marks the Test priced and carries the Currency (INR);
    // a null amount (blank/0) leaves it free and omits the Price (Req 2.4).
    const isPriced = parsedPrice.amount !== null;
    const result = await createTest({
      title,
      timingMode: draft.timingMode,
      timeLimitSeconds,
      priceAmount: parsedPrice.amount,
      currency: isPriced ? DEFAULT_CURRENCY : undefined,
    });

    if (result.ok) {
      setDraft(EMPTY_DRAFT);
      setFieldErrors({});
      setFeedback({ kind: 'success', message: CREATE_SUCCESS_MESSAGE });
      reloadTests();
      return;
    }

    // Surface a 422 envelope's per-field reasons inline; any other failure is
    // surfaced as a banner (Req 2.5).
    const mapped = mapFieldErrors(result.error);
    setFieldErrors(mapped);
    if (Object.keys(mapped).length === 0) {
      setFeedback({
        kind: 'error',
        message: result.error.message || GENERIC_ACTION_ERROR,
      });
    }
  };

  const feedbackClassName = useMemo(
    () =>
      feedback?.kind === 'success'
        ? `${styles.feedback} ${styles.feedbackSuccess}`
        : `${styles.feedback} ${styles.feedbackError}`,
    [feedback],
  );

  // Only an Admin may see the Test authoring interface (Req 1.4); the Manage
  // Page also gates on this, but the guard is repeated here for safety.
  if (!isAdmin) {
    return null;
  }

  return (
    <section className={styles.manager} aria-label={MANAGER_TITLE}>
      <header className={styles.header}>
        <h2 className={styles.title}>{MANAGER_TITLE}</h2>
        <p className={styles.subtitle}>{MANAGER_SUBTITLE}</p>
      </header>

      {feedback && (
        <p className={feedbackClassName} role="status">
          {feedback.message}
        </p>
      )}

      {/* Create-Test form (Req 2.1, 2.5) */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>{CREATE_SECTION_TITLE}</h3>
        <form className={styles.form} onSubmit={handleCreate} noValidate>
          <Input
            id={TEST_TITLE_FIELD_ID}
            label={TEST_TITLE_LABEL}
            value={draft.title}
            placeholder={TEST_TITLE_PLACEHOLDER}
            maxLength={TEST_TITLE_MAX_LENGTH}
            error={fieldErrors.title}
            disabled={isSubmitting}
            onChange={(event) => {
              const { value } = event.target;
              setDraft((prev) => ({ ...prev, title: value }));
              clearFieldError('title');
            }}
          />

          <div className={styles.fieldGroup}>
            <label className={styles.selectLabel} htmlFor={TEST_TIMING_FIELD_ID}>
              {TEST_TIMING_LABEL}
            </label>
            <select
              id={TEST_TIMING_FIELD_ID}
              className={styles.select}
              value={draft.timingMode}
              disabled={isSubmitting}
              onChange={(event) => {
                const value = event.target
                  .value as CreateTestDraft['timingMode'];
                setDraft((prev) => ({ ...prev, timingMode: value }));
                clearFieldError('timingMode');
              }}
            >
              {TIMING_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.timingMode && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.timingMode}
              </p>
            )}
          </div>

          <Input
            id={TEST_TIME_LIMIT_FIELD_ID}
            label={TEST_TIME_LIMIT_LABEL}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={draft.timeLimitSeconds}
            placeholder={TEST_TIME_LIMIT_PLACEHOLDER}
            hint={TEST_TIME_LIMIT_HINT}
            error={fieldErrors.timeLimitSeconds}
            disabled={isSubmitting}
            onChange={(event) => {
              const { value } = event.target;
              setDraft((prev) => ({ ...prev, timeLimitSeconds: value }));
              clearFieldError('timeLimitSeconds');
            }}
          />

          <Input
            id={TEST_PRICE_FIELD_ID}
            label={TEST_PRICE_LABEL}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={draft.price}
            placeholder={TEST_PRICE_PLACEHOLDER}
            hint={TEST_PRICE_HINT}
            error={fieldErrors.price}
            disabled={isSubmitting}
            onChange={(event) => {
              const { value } = event.target;
              setDraft((prev) => ({ ...prev, price: value }));
              clearFieldError('price');
            }}
          />

          <div className={styles.actions}>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {CREATE_SUBMIT_LABEL}
            </Button>
          </div>
        </form>
      </div>

      {/* Tests list with a per-Test edit entry point (Req 1.4, 5.3) */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>{TESTS_SECTION_TITLE}</h3>

        {listError && (
          <ErrorMessage
            title={TESTS_ERROR_TITLE}
            message={TESTS_ERROR_MESSAGE}
            retryLabel={RETRY_LABEL}
            onRetry={reloadTests}
          />
        )}

        {!listError && tests === null && isLoading && <LoadingIndicator />}

        {!listError && tests !== null && tests.length === 0 && (
          <EmptyState message={TESTS_EMPTY_MESSAGE} />
        )}

        {!listError && tests !== null && tests.length > 0 && (
          <ul className={styles.testList}>
            {tests.map((test) => (
              <li key={test.id} className={styles.testItem}>
                <div className={styles.testMeta}>
                  <h4 className={styles.testName}>{test.title}</h4>
                  <span className={styles.testPrice}>
                    {priceLabel(test.priceAmount, test.currency)}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isLoading || isSubmitting}
                  onClick={() => router.push(buildEditHref(test.id))}
                >
                  {EDIT_LABEL}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default TestManager;
