// Type declarations for the MaterialCoverArt component.

/** Props for the decorative {@link MaterialCoverArt} SVG cover. */
export type CoverProps = {
  /** The cover variant index (any integer; wrapped into range internally). */
  variant: number;
  /** Optional class name applied to the root `<svg>`. */
  className?: string;
  /** Stable unique id used to namespace the SVG `<defs>` ids; defaults to the variant. */
  uid?: string;
};
