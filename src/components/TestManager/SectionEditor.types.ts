// Type declarations for the incremental Section + Questions editor
// (`SectionEditor.tsx`). All type/interface declarations live here so the
// component module stays free of type declarations, mirroring the platform
// convention. References: Req 3.1, 4.1, 5.1, 5.2, 5.3.

import type { SectionDto } from '@/types/testSeries.types';

/**
 * Props for the Section editor. It is seeded with the loaded Test's identifier
 * and its ordered Sections (from `AdminTestDto.sections`); after any successful
 * add/edit it reloads the Test graph so the saved state is shown (Req 5.1, 5.3).
 */
export interface SectionEditorProps {
  testId: string;
  initialSections: SectionDto[];
}

/**
 * A controlled Option draft within a Question form. `text` is held as typed and
 * `isCorrect` flags membership of the Correct Option Set (Req 4.2).
 */
export interface OptionDraft {
  text: string;
  isCorrect: boolean;
}

/**
 * A controlled Question draft (its text plus its Option drafts). Used both for
 * Questions authored inline while adding a Section and for the add/edit-Question
 * forms (Req 4.1, 5.2).
 */
export interface QuestionDraft {
  text: string;
  options: OptionDraft[];
}

/**
 * The controlled add/edit-Section form draft. `timeLimitSeconds`, `correctMark`,
 * `negativeMark`, and `price` are held as raw strings (as typed) and parsed on
 * submit; `price` is an amount in paise where blank/0 leaves the Section
 * reachable only via its parent Test (Req 3.2, 3.4). `questions` carries the
 * Questions authored inline when adding a new Section (Req 3.1, 5.1).
 */
export interface SectionDraft {
  title: string;
  timeLimitSeconds: string;
  correctMark: string;
  negativeMark: string;
  price: string;
  questions: QuestionDraft[];
}

/**
 * Per-field inline validation errors for the add/edit-Section form, surfaced
 * beneath each field (Req 3.5). A 422 envelope's per-field reasons
 * (`HttpError.fields`) are mapped onto these keys; `questions` collects any
 * inline-question failure and `form` carries a non-field banner.
 */
export interface SectionFieldErrors {
  title?: string;
  timeLimitSeconds?: string;
  correctMark?: string;
  negativeMark?: string;
  price?: string;
  questions?: string;
  form?: string;
}

/**
 * Per-field inline validation errors for the add/edit-Question form (Req 4.4).
 * `options` collects any Option-set failure (too few Options, missing correct
 * Option, or option text out of bounds); `form` carries a non-field banner.
 */
export interface QuestionFieldErrors {
  text?: string;
  options?: string;
  form?: string;
}

/** A success/error banner shown after a Section/Question authoring action. */
export interface SectionEditorFeedback {
  kind: 'success' | 'error';
  message: string;
}

/**
 * Which editing form (if any) is currently open. At most one Section form and
 * one Question form are open at a time to keep the surface focused: adding a new
 * Section, editing a persisted Section, adding a Question to a Section, or
 * editing a persisted Question.
 */
export type SectionEditorMode =
  | { kind: 'idle' }
  | { kind: 'add-section' }
  | { kind: 'edit-section'; sectionId: string }
  | { kind: 'add-question'; sectionId: string }
  | { kind: 'edit-question'; sectionId: string; questionId: string };

/**
 * The result of parsing a raw price-field input into a Price amount in paise.
 * An empty/whitespace value or 0 maps to `amount: null` (not sold separately);
 * a positive whole number maps to a priced Section; any other value is rejected.
 */
export type ParsedPrice = { ok: true; amount: number | null } | { ok: false };

/**
 * The result of parsing a raw marks input into a non-negative decimal-mark
 * number, or a positive whole-second Time Limit.
 */
export type ParsedNumber = { ok: true; value: number } | { ok: false };
