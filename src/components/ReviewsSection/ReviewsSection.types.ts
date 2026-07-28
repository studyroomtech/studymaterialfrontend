// Type declarations for the ReviewsSection component.

/**
 * Props for the ReviewsSection rendered on the material detail page. The section
 * loads the material's reviews, shows the aggregate, and — for an eligible
 * signed-in learner — a form to upsert/delete their own review. Admins may
 * delete any review.
 */
export interface ReviewsSectionProps {
  /** The Study Material whose reviews are shown/managed. */
  materialId: string;
  /**
   * Whether the material is a Paid Material. Used only to tailor the "unlock to
   * review" copy shown to a signed-in learner who is not yet entitled.
   */
  isPaid: boolean;
}
