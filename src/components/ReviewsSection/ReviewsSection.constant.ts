// Constant values for the ReviewsSection component.

/** Section heading. */
export const REVIEWS_HEADING = "Ratings & reviews";

/** Shown in the aggregate header when the material has no ratings yet. */
export const NO_REVIEWS_YET = "No reviews yet";

/** Suffix for the aggregate summary, singular/plural handled at render time. */
export const REVIEW_NOUN = "review";

/** Copy prompting a signed-out learner to identify before reviewing. */
export const SIGN_IN_TO_REVIEW = "Sign in to write a review";

/** Short action label on the sign-in button. */
export const SIGN_IN_LABEL = "Sign in";

/** Copy shown when a signed-in learner must unlock a Paid Material first. */
export const UNLOCK_TO_REVIEW =
  "Unlock this material to rate and review it.";

/** Form labels and actions. */
export const RATING_FIELD_LABEL = "Your rating";
export const REVIEW_FIELD_LABEL = "Your review (optional)";
export const REVIEW_PLACEHOLDER = "Share what you found useful…";
export const SUBMIT_LABEL = "Submit review";
export const UPDATE_LABEL = "Update review";
export const DELETE_LABEL = "Delete";
export const EDIT_LABEL = "Edit";
export const ADMIN_REMOVE_LABEL = "Remove";
export const CANCEL_EDIT_LABEL = "Cancel";

/** Message shown when the learner tries to submit without choosing a rating. */
export const RATING_REQUIRED_MESSAGE = "Please choose a rating from 1 to 5.";

/** Empty-list copy. */
export const BE_FIRST_TO_REVIEW = "Be the first to review this material.";

/** Maximum review body length (mirrors the Backend bound). */
export const REVIEW_BODY_MAX_LENGTH = 2000;

/** Backend API route for the learner Download Gate (mints a learner token). */
export const DOWNLOADS_GATE_ROUTE = "/api/downloads/gate";
