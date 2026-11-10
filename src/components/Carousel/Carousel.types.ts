// Type declarations for the Carousel component.
import type { ReactNode } from "react";

/** Props for the autoplaying {@link Carousel}. */
export interface CarouselProps {
  /** The slides, shown one at a time in order and looping forever. */
  items: ReactNode[];
  /** Optional class applied to the root element (size it from the parent). */
  className?: string;
}
