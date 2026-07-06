// Type declarations for the reusable Button component (Requirements 1.2, 1.15).

import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Visual variants a Button can render as. Each maps to a class defined in the
 * component's module stylesheet, which in turn consumes the shared theme.
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

/** Size steps for a Button, keyed to the shared spacing/typography scale. */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Props for the Button component. Extends the native button attributes so any
 * standard button behavior (`onClick`, `type`, `disabled`, `aria-*`, etc.) is
 * supported, while adding presentation and state props.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant. Defaults to the primary variant. */
  variant?: ButtonVariant;
  /** Size step. Defaults to the medium size. */
  size?: ButtonSize;
  /** When true, shows a loading affordance and blocks interaction. */
  isLoading?: boolean;
  /** When true, the Button stretches to fill its container's width. */
  fullWidth?: boolean;
  /** Optional element rendered before the Button label. */
  leadingIcon?: ReactNode;
  /** Optional element rendered after the Button label. */
  trailingIcon?: ReactNode;
}
