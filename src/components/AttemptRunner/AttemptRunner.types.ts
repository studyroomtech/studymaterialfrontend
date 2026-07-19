// Type declarations for the {@link AttemptRunner} component (task 18.4).
//
// The AttemptRunner is the shared client surface behind both attempt routes
// (`app/tests/[id]` and `app/sections/[id]`). It owns the `useAttempt`
// lifecycle for one scope, renders the `TestPlayer` against the
// server-authoritative `AttemptStateDto`, and navigates to the review page on a
// successful submit (Req 8.1, 8.2, 9.1, 11.4, 12.7, 15.1). All type/interface
// declarations live here so the component module stays free of them (mirroring
// the sibling component convention).

/**
 * The scope an attempt covers, selecting which `useAttempt` starter runs on
 * mount: a whole Test (`useAttempt.start`) or a single Section
 * (`useAttempt.startSection`).
 */
export type AttemptScope = 'test' | 'section';

/**
 * Props for the {@link AttemptRunner}. The runner is given the scope and the
 * Test/Section identifier from the dynamic route; it starts/resumes the attempt
 * on mount and drives the `TestPlayer` from there.
 */
export interface AttemptRunnerProps {
  /** Whether the attempt covers a whole Test or a single Section. */
  scope: AttemptScope;
  /** The Test id (scope `test`) or Section id (scope `section`) to attempt. */
  id: string;
}
