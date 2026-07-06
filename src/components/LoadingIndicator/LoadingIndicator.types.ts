// Types for the LoadingIndicator component (Requirements 1.15, 1.17).

import type { LOADING_INDICATOR_SIZES } from "./LoadingIndicator.constant";

/** Visual size of the spinner. */
export type LoadingIndicatorSize = (typeof LOADING_INDICATOR_SIZES)[number];

/** Props accepted by the LoadingIndicator component. */
export interface LoadingIndicatorProps {
  /**
   * Accessible label announced to assistive technology while loading.
   * Defaults to a generic loading message.
   */
  label?: string;
  /** Spinner size. Defaults to "md". */
  size?: LoadingIndicatorSize;
  /**
   * When true, the indicator fills its container and centers itself, suitable
   * for replacing a full panel while its data loads.
   */
  fullPanel?: boolean;
  /** Optional additional class name applied to the root element. */
  className?: string;
}
