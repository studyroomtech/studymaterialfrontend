// Constant values for the whole-Test attempt page (task 18.4).
//
// The page starts/resumes a whole-Test attempt and renders the TestPlayer via
// the shared AttemptRunner. These literals live here so the page module stays
// free of constant-literal exports (mirroring the sibling route convention).

import type { AttemptScope } from '@/components/AttemptRunner/AttemptRunner.types';

/** This route attempts a whole Test (`useAttempt.start`). */
export const TEST_ATTEMPT_SCOPE: AttemptScope = 'test';

/** Copy shown when the route carries no Test id, so nothing can be started. */
export const INVALID_ID_TITLE = 'Test not found';
export const INVALID_ID_MESSAGE =
  'No test was specified, so there is nothing to attempt.';
