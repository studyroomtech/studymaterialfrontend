"use client";

// ReviewsSection — ratings & reviews for a Study Material (detail page).
//
// Renders three things:
//   1. An aggregate header (average stars + count).
//   2. A review form for an eligible signed-in learner (interactive stars +
//      optional body), prefilled from the learner's existing review so it edits
//      in place, with Update/Delete. When signed out, a Download-Gate flow mints
//      a learner token before reviewing; when signed in but not entitled to a
//      Paid Material, an "unlock to review" note is shown instead.
//   3. The list of reviews (display name only, stars, body, date). A learner's
//      own review offers edit/delete; an admin can remove any review.
//
// Styling lives in `ReviewsSection.module.scss` (no inline CSS beyond the star
// fill width); copy lives in `ReviewsSection.constant.ts`.

import { useEffect, useRef, useState } from "react";

import Button from "@/components/Button/Button";
import DownloadGateModal from "@/components/DownloadGateModal/DownloadGateModal";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator";
import StarRating from "@/components/StarRating/StarRating";
import type { DownloadGateValues } from "@/components/DownloadGateModal/DownloadGateModal.types";
import { buildApiUrl } from "@/hooks/api/apiClient";
import { ADMIN_API_ROUTES } from "@/hooks/api/useAdminMaterials.constant";
import { useMaterialReviews } from "@/hooks/api/useMaterialReviews";
import { useSubmitReview } from "@/hooks/api/useSubmitReview";
import { useAccessToken } from "@/hooks/useAccessToken";
import { httpRequest } from "@/utils/http";
import type { MaterialReview } from "@/hooks/api/apiHooks.types";

import styles from "./ReviewsSection.module.scss";
import {
  ADMIN_REMOVE_LABEL,
  BE_FIRST_TO_REVIEW,
  CANCEL_EDIT_LABEL,
  DELETE_LABEL,
  DOWNLOADS_GATE_ROUTE,
  EDIT_LABEL,
  NO_REVIEWS_YET,
  RATING_FIELD_LABEL,
  RATING_REQUIRED_MESSAGE,
  REVIEW_BODY_MAX_LENGTH,
  REVIEW_FIELD_LABEL,
  REVIEW_NOUN,
  REVIEW_PLACEHOLDER,
  REVIEWS_HEADING,
  SIGN_IN_LABEL,
  SIGN_IN_TO_REVIEW,
  SUBMIT_LABEL,
  UNLOCK_TO_REVIEW,
  UPDATE_LABEL,
} from "./ReviewsSection.constant";
import type { ReviewsSectionProps } from "./ReviewsSection.types";

const JSON_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/** Format an ISO timestamp as a short, human date (e.g. "Jan 5, 2026"). */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ReviewsSection({ materialId, isPaid }: ReviewsSectionProps) {
  const { token, hasValidToken, isAdmin, setToken } = useAccessToken();

  const [reloadKey, setReloadKey] = useState<number>(0);
  const { data, isLoading } = useMaterialReviews(materialId, reloadKey);
  const { submit, remove, isSubmitting, error } = useSubmitReview(materialId);

  const myReview = data?.myReview ?? null;
  const canReview = data?.canReview ?? false;
  const reviews = data?.reviews ?? [];
  const reviewCount = data?.reviewCount ?? 0;
  const averageRating = data?.averageRating ?? null;

  // Form state (seeded from the learner's existing review when present).
  const [rating, setRating] = useState<number>(0);
  const [body, setBody] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Re-seed the form whenever the loaded own-review identity changes (e.g. after
  // a refetch following submit/delete), unless the learner is mid-edit.
  const seededRef = useRef<string | null>(null);
  useEffect(() => {
    const signature =
      myReview !== null ? `${myReview.id}:${myReview.updatedAt}` : "none";
    if (seededRef.current === signature) {
      return;
    }
    seededRef.current = signature;
    if (myReview !== null) {
      setRating(myReview.rating);
      setBody(myReview.body);
    } else {
      setRating(0);
      setBody("");
    }
    setIsEditing(false);
  }, [myReview]);

  // Sign-in (Download Gate) state, used to mint a learner token before review.
  const [isGateOpen, setIsGateOpen] = useState<boolean>(false);
  const [isSubmittingGate, setIsSubmittingGate] = useState<boolean>(false);
  const [gateError, setGateError] = useState<string | undefined>(undefined);
  const [requirePassword, setRequirePassword] = useState<boolean>(false);

  // Admin moderation state.
  const [adminDeletingId, setAdminDeletingId] = useState<string | null>(null);

  const refresh = (): void => setReloadKey((key) => key + 1);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setLocalError(null);
    if (rating < 1) {
      setLocalError(RATING_REQUIRED_MESSAGE);
      return;
    }
    const outcome = await submit({ rating, body: body.trim() });
    if (outcome.ok) {
      setIsEditing(false);
      refresh();
    }
  };

  const handleDelete = async (): Promise<void> => {
    const outcome = await remove();
    if (outcome.ok) {
      setRating(0);
      setBody("");
      setIsEditing(false);
      seededRef.current = "none";
      refresh();
    }
  };

  const handleAdminDelete = async (reviewId: string): Promise<void> => {
    if (token === null || token.length === 0) {
      return;
    }
    setAdminDeletingId(reviewId);
    const result = await httpRequest<unknown>(
      buildApiUrl(`${ADMIN_API_ROUTES.reviews}/${encodeURIComponent(reviewId)}`),
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        suppressErrorToast: true,
      },
    );
    setAdminDeletingId(null);
    if (result.ok) {
      refresh();
    }
  };

  const submitGate = async (values: DownloadGateValues): Promise<void> => {
    setIsSubmittingGate(true);
    setGateError(undefined);
    const result = await httpRequest<{ accessToken: string }>(
      buildApiUrl(DOWNLOADS_GATE_ROUTE),
      {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(values),
        suppressErrorToast: true,
      },
    );
    setIsSubmittingGate(false);
    if (!result.ok) {
      if (result.error.status === 401 && result.error.code === "PASSWORD_REQUIRED") {
        setRequirePassword(true);
      }
      setGateError(result.error.message);
      return;
    }
    setRequirePassword(false);
    setToken(result.data.accessToken);
    setIsGateOpen(false);
    refresh();
  };

  const cancelGate = (): void => {
    setIsGateOpen(false);
    setGateError(undefined);
    setRequirePassword(false);
  };

  const displayError = localError ?? (error !== null ? error.message : null);
  const showForm = hasValidToken && canReview && (myReview === null || isEditing);
  const showMyReviewCard =
    hasValidToken && canReview && myReview !== null && !isEditing;

  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      <div className={styles.head}>
        <h2 id="reviews-heading" className={styles.heading}>
          {REVIEWS_HEADING}
        </h2>
      </div>

      <div className={styles.aggregate}>
        {reviewCount > 0 && averageRating !== null ? (
          <>
            <span className={styles.average}>{averageRating.toFixed(1)}</span>
            <StarRating value={averageRating} size="md" />
            <span className={styles.count}>
              {reviewCount} {REVIEW_NOUN}
              {reviewCount === 1 ? "" : "s"}
            </span>
          </>
        ) : (
          <span className={styles.count}>{NO_REVIEWS_YET}</span>
        )}
      </div>

      {/* Compose / edit area, tailored to auth + eligibility. */}
      {!hasValidToken ? (
        <div className={styles.prompt}>
          <p className={styles.promptText}>{SIGN_IN_TO_REVIEW}</p>
          <Button variant="secondary" onClick={() => setIsGateOpen(true)}>
            {SIGN_IN_LABEL}
          </Button>
        </div>
      ) : null}

      {hasValidToken && !canReview ? (
        <p className={styles.lockedNote}>{isPaid ? UNLOCK_TO_REVIEW : ""}</p>
      ) : null}

      {showMyReviewCard && myReview !== null ? (
        <div className={styles.myReview}>
          <div className={styles.myReviewHead}>
            <StarRating value={myReview.rating} size="sm" />
            <div className={styles.ownActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setLocalError(null);
                }}
              >
                {EDIT_LABEL}
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleDelete}
              >
                {DELETE_LABEL}
              </Button>
            </div>
          </div>
          {myReview.body.length > 0 ? (
            <p className={styles.reviewBody}>{myReview.body}</p>
          ) : null}
        </div>
      ) : null}

      {showForm ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{RATING_FIELD_LABEL}</span>
            <StarRating
              value={rating}
              onChange={(next) => {
                setRating(next);
                setLocalError(null);
              }}
              size="lg"
              ariaLabel={RATING_FIELD_LABEL}
            />
          </div>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{REVIEW_FIELD_LABEL}</span>
            <textarea
              className={styles.textarea}
              value={body}
              maxLength={REVIEW_BODY_MAX_LENGTH}
              placeholder={REVIEW_PLACEHOLDER}
              rows={4}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>

          {displayError !== null ? (
            <p className={styles.formError} role="alert">
              {displayError}
            </p>
          ) : null}

          <div className={styles.formActions}>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {myReview !== null ? UPDATE_LABEL : SUBMIT_LABEL}
            </Button>
            {myReview !== null ? (
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setRating(myReview.rating);
                  setBody(myReview.body);
                  setLocalError(null);
                }}
              >
                {CANCEL_EDIT_LABEL}
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}

      {/* Reviews list. */}
      {isLoading && data === null ? (
        <LoadingIndicator label="Loading reviews…" className={styles.loading} />
      ) : null}

      {data !== null && reviews.length === 0 ? (
        <p className={styles.empty}>{BE_FIRST_TO_REVIEW}</p>
      ) : null}

      {reviews.length > 0 ? (
        <ul className={styles.list}>
          {reviews.map((review: MaterialReview) => (
            <li key={review.id} className={styles.item}>
              <div className={styles.itemHead}>
                <div className={styles.reviewer}>
                  <span className={styles.reviewerName}>
                    {review.reviewerName}
                  </span>
                  <StarRating
                    value={review.rating}
                    size="sm"
                    className={styles.itemStars}
                  />
                </div>
                <span className={styles.date}>{formatDate(review.createdAt)}</span>
              </div>
              {review.body.length > 0 ? (
                <p className={styles.reviewBody}>{review.body}</p>
              ) : null}
              {isAdmin && !review.isOwn ? (
                <div className={styles.itemActions}>
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={adminDeletingId === review.id}
                    onClick={() => handleAdminDelete(review.id)}
                  >
                    {ADMIN_REMOVE_LABEL}
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <DownloadGateModal
        isOpen={isGateOpen}
        onSubmit={submitGate}
        onCancel={cancelGate}
        isSubmitting={isSubmittingGate}
        requirePassword={requirePassword}
        submitError={gateError}
      />
    </section>
  );
}

export default ReviewsSection;
