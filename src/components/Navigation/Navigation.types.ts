// Types for the Navigation component (Requirements 1.15, 1.17).

/** A single primary navigation destination (Req 7.6). */
export interface NavLink {
  /** Human-readable label shown in the navigation bar. */
  label: string;
  /** App Router path the link navigates to. */
  href: string;
}

/** Props accepted by the Navigation component. */
export interface NavigationProps {
  /** Optional additional class name applied to the nav container. */
  className?: string;
}
