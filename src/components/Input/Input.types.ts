// Type declarations for the reusable Input component (Requirements 1.2, 1.15).

import type { InputHTMLAttributes, ReactNode } from "react";

/** Size steps for an Input, keyed to the shared spacing/typography scale. */
export type InputSize = "sm" | "md" | "lg";

/**
 * Props for the Input component. Extends the native input attributes (the
 * native `size` attribute is omitted and replaced with the theme-aware
 * `inputSize`) and always requires an `id` + `label` so the field is
 * accessible.
 */
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Unique id for the input; used to associate the label and messages. */
  id: string;
  /** Human-readable label. Always rendered for assistive technologies. */
  label: string;
  /** When true, the label is visually hidden but still available to AT. */
  hideLabel?: boolean;
  /** Size step. Defaults to the medium size. */
  inputSize?: InputSize;
  /** Error message; when present the field is marked invalid. */
  error?: string;
  /** Optional supplementary hint shown below the field. */
  hint?: string;
  /** Optional element rendered inside the field, before the input. */
  leadingIcon?: ReactNode;
}
