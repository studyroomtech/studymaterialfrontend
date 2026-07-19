// Inline load-error presentational piece for the Edit Page (`/admin/tests/edit`).
//
// Renders a load / auth / missing-id failure inline (no redirect) using the
// shared `ErrorMessage` component, paired with a `next/link` back-to-dashboard
// affordance pointing at `ADMIN_DASHBOARD_PATH`. This satisfies the "inline
// error message + link to /admin/dashboard, without an automatic redirect"
// requirement shared by the auth-error, missing-id, and load-error page states
// (Req 3.1–3.5, 4.2, 5.3).
//
// This is a pure presentational component: it takes the already-resolved
// `title` / `message` copy (produced by `resolvePageState`) and renders it. It
// owns no state and performs no navigation itself.

import Link from 'next/link';

import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';

import { ADMIN_DASHBOARD_PATH } from './page.constant';

// Label for the back-to-dashboard link rendered beneath the error message.
const BACK_TO_DASHBOARD_LABEL = 'Back to dashboard';

/**
 * Renders an inline error (title + message) with a link back to the Admin
 * Dashboard. Used for the `auth-error`, `missing-id`, and `load-error` Edit
 * Page states — the page stays at `/admin/tests/edit` and navigation to the
 * dashboard happens only when the user activates this link (Req 3.5, 5.3).
 *
 * @param title short heading describing the failure (e.g. "Unable to load test").
 * @param message human-readable explanation of the failure.
 * @returns the inline error surface with a back-to-dashboard link.
 */
function InlineLoadError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <>
      <ErrorMessage title={title} message={message} />
      <Link href={ADMIN_DASHBOARD_PATH}>{BACK_TO_DASHBOARD_LABEL}</Link>
    </>
  );
}

export default InlineLoadError;
