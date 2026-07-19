'use client';

// EditTestPage — the dedicated, shareable App Router page for editing a Test,
// served at `/admin/tests/edit?testId=<id>` (Req 1.1, 1.2).
//
// This client component reads the target Test id from the `testId` search param
// (Req 1.2), gates the authoring editor on `useAdminTests().isAdmin` (Req 4.1),
// and loads the Test on mount via `getTestForAdmin(testId)` (Req 2.1, 2.4). All
// view-branching lives in the pure `resolvePageState` helper, so this component
// only wires inputs → resolved state → rendered branch:
//   - `loading`  → a loading indicator while pre-mount or the load is in flight
//     (Req 2.2);
//   - `editor`   → the relocated `TestEditView` seeded with the loaded Test; a
//     successful save stays on the page so the URL remains shareable (Req 2.3,
//     5.1);
//   - `auth-error` / `missing-id` / `load-error` → an inline error surface with
//     a link back to `/admin/dashboard`, with no automatic redirect (Req 3.1–
//     3.5, 4.2, 5.3).
// The Back control navigates to `/admin/dashboard` via `router.push` (Req 5.2),
// and that plus the inline error link are the only paths to the dashboard
// (Req 5.3). All styling lives in `page.module.scss` (no inline CSS).

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';
import { useAdminTests } from '@/hooks/api/useAdminTests';

import InlineLoadError from './InlineLoadError';
import { ADMIN_DASHBOARD_PATH, TEST_ID_PARAM } from './page.constant';
import { resolvePageState, resolveTestId } from './page.helpers';
import type { LoadState } from './page.types';
import styles from './page.module.scss';
import TestEditView from './TestEditView';

function EditTestPageContent() {
  const { isAdmin, getTestForAdmin } = useAdminTests();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = resolveTestId(searchParams.get(TEST_ID_PARAM));

  // `isAdmin` is derived from the client-only Access Token, so it is always
  // `false` during SSR and on the first client render. Gate the load and the
  // admin-only editor behind a post-mount flag so the server-rendered HTML and
  // the first client render agree (both render the loading state), avoiding a
  // hydration mismatch — mirroring the dashboard's pattern (Req 2.2, 4.1).
  const [hasMounted, setHasMounted] = useState(false);
  const [load, setLoad] = useState<LoadState>({ status: 'pending' });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Run the Load Operation on mount and whenever the inputs change. Guarded so
  // it only fires once mounted, for an admin, and with a non-empty `testId` —
  // a blank id resolves to the `missing-id` state without contacting the API
  // (Req 2.1, 2.4, 3.1). The `active` flag ignores a resolved response after
  // the effect has been cleaned up (id change / unmount).
  useEffect(() => {
    if (!hasMounted || !isAdmin || testId.length === 0) {
      return;
    }
    let active = true;
    setLoad({ status: 'pending' });
    void getTestForAdmin(testId).then((result) => {
      if (!active) {
        return;
      }
      setLoad(
        result.ok
          ? { status: 'success', test: result.data }
          : { status: 'error', error: result.error },
      );
    });
    return () => {
      active = false;
    };
  }, [hasMounted, isAdmin, testId, getTestForAdmin]);

  const state = resolvePageState({ hasMounted, isAdmin, testId, load });

  return (
    <div className={styles.page}>
      {state.kind === 'loading' && <LoadingIndicator fullPanel />}

      {state.kind === 'editor' && (
        <TestEditView
          test={state.test}
          onBack={() => router.push(ADMIN_DASHBOARD_PATH)}
        />
      )}

      {(state.kind === 'auth-error' ||
        state.kind === 'missing-id' ||
        state.kind === 'load-error') && (
        <InlineLoadError title={state.title} message={state.message} />
      )}
    </div>
  );
}

// `useSearchParams()` opts a route out of static prerendering unless it is
// rendered inside a Suspense boundary; wrap the content so the build can emit
// the fallback for the prerendered shell (Next.js CSR bailout). The fallback
// mirrors the in-page `loading` state so the shell is visually consistent.
function EditTestPage() {
  return (
    <Suspense fallback={<div className={styles.page}><LoadingIndicator fullPanel /></div>}>
      <EditTestPageContent />
    </Suspense>
  );
}

export default EditTestPage;
