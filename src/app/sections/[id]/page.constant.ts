// Constant values for the Section-scoped attempt page (task 18.4).
//
// The page starts/resumes a Section-scoped attempt and renders the TestPlayer
// via the shared AttemptRunner. These literals live here so the page module
// stays free of constant-literal exports (mirroring the sibling route
// convention).

import type { AttemptScope } from '@/components/AttemptRunner/AttemptRunner.types';

/** This route attempts a single Section (`useAttempt.startSection`). */
export const SECTION_ATTEMPT_SCOPE: AttemptScope = 'section';

/** Copy shown when the route carries no Section id, so nothing can be started. */
export const INVALID_ID_TITLE = 'Section not found';
export const INVALID_ID_MESSAGE =
  'No section was specified, so there is nothing to attempt.';
