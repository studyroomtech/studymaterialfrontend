'use client';

// Section-scoped attempt page (task 18.4) — Req 8.2, 9.1, 11.4, 12.7, 15.1.
//
// Resolves the Section id from the dynamic route and hands it to the shared
// `AttemptRunner` with the `section` scope: the runner starts/resumes a
// Section-scoped attempt via `useAttempt().startSection(id)` on mount, renders
// the server-driven `TestPlayer`, and navigates to the review page
// (`/attempts/:attemptId`) once the attempt is submitted. Auth/payment/
// not-found/invalid outcomes and errors are handled inside the runner
// (Req 8.4, 8.5, 8.6). When no id is present in the route, nothing can be
// started, so an error message is shown without any partial content.
//
// All styling lives in `page.module.scss` (no inline CSS); constants live in
// `page.constant.ts`.

import { useParams } from 'next/navigation';

import AttemptRunner from '@/components/AttemptRunner/AttemptRunner';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';

import styles from './page.module.scss';
import {
  INVALID_ID_MESSAGE,
  INVALID_ID_TITLE,
  SECTION_ATTEMPT_SCOPE,
} from './page.constant';

/**
 * Resolve the Section id from the dynamic route params. A catch-all/array value
 * is narrowed to its first entry; an absent id yields an empty string.
 * @param rawId the raw `id` route param.
 * @returns the Section id, or an empty string when none is present.
 */
function resolveSectionId(rawId: string | string[] | undefined): string {
  if (typeof rawId === 'string') {
    return rawId;
  }
  if (Array.isArray(rawId)) {
    return rawId[0] ?? '';
  }
  return '';
}

function SectionAttemptPage() {
  const params = useParams();
  const sectionId = resolveSectionId(params?.id);

  if (sectionId.length === 0) {
    return (
      <main className={styles.main}>
        <ErrorMessage title={INVALID_ID_TITLE} message={INVALID_ID_MESSAGE} />
      </main>
    );
  }

  return <AttemptRunner scope={SECTION_ATTEMPT_SCOPE} id={sectionId} />;
}

export default SectionAttemptPage;
