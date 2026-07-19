"use client";

// SectionEditor — the incremental Section + Questions editor rendered inside
// the TestManager edit view (Requirements 3.1, 4.1, 5.1, 5.2, 5.3).
//
// It seeds from the loaded Test's ordered Sections and lets an Admin:
//   - add a new Section (title, Time Limit, Correct/Negative Mark, optional
//     Price) with its Questions/Options authored inline, persisted via
//     `useAdminTests().addSection` so each Section persists independently
//     (Req 3.1, 5.1);
//   - once saved, see each Section's state with an Edit action for the Section
//     and for each of its Questions (Req 5.3), driven by `editSection`,
//     `addQuestion`, and `editQuestion`.
//
// After every successful add/edit the Test graph is reloaded via
// `getTestForAdmin` so the saved state is shown (Req 5.3). A 422 envelope's
// per-field reasons are surfaced inline; any other failure is a banner
// (Req 3.5, 4.4). All styling lives in `SectionEditor.module.scss` (no inline
// CSS).

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { useAdminTests } from "@/hooks/api/useAdminTests";
import type {
  CreateQuestionInput,
  CreateSectionInput,
  EditSectionInput,
  OptionInput,
  QuestionDto,
  SectionDto,
} from "@/types/testSeries.types";
import type { HttpError } from "@/utils/http.types";
import { classifyPrice, formatPrice } from "@/utils/price";
import { DEFAULT_CURRENCY, PRICE_CLASSIFICATION } from "@/utils/price.constant";

import styles from "./SectionEditor.module.scss";
import type {
  OptionDraft,
  ParsedNumber,
  ParsedPrice,
  QuestionDraft,
  QuestionFieldErrors,
  SectionDraft,
  SectionEditorFeedback,
  SectionEditorMode,
  SectionEditorProps,
  SectionFieldErrors,
} from "./SectionEditor.types";
import {
  ADD_OPTION_LABEL,
  ADD_QUESTION_LABEL,
  ADD_QUESTION_TO_SECTION_LABEL,
  ADD_SECTION_HEADING,
  ADD_SECTION_SUBMIT_LABEL,
  CANCEL_LABEL,
  EDIT_QUESTION_LABEL,
  EDIT_SECTION_LABEL,
  EMPTY_OPTION,
  GENERIC_ACTION_ERROR,
  MARK_ERROR,
  MIN_TIME_LIMIT_SECONDS,
  NO_QUESTIONS_TEXT,
  NO_SECTIONS_MESSAGE,
  OPTION_CORRECT_LABEL,
  OPTION_TEXT_LABEL,
  OPTION_TEXT_MAX_LENGTH,
  OPTION_TEXT_PLACEHOLDER,
  OPTIONS_COUNT_SUFFIX,
  OPTIONS_ERROR,
  PRICE_ERROR,
  QUESTION_ADDED_MESSAGE,
  QUESTION_LABEL_PREFIX,
  QUESTION_TEXT_ERROR,
  QUESTION_TEXT_LABEL,
  QUESTION_TEXT_MAX_LENGTH,
  QUESTION_TEXT_MIN_LENGTH,
  QUESTION_TEXT_PLACEHOLDER,
  QUESTION_UPDATED_MESSAGE,
  QUESTIONS_HEADING,
  RELOAD_ERROR_MESSAGE,
  REMOVE_OPTION_LABEL,
  REMOVE_QUESTION_LABEL,
  SAVE_QUESTION_LABEL,
  SAVE_SECTION_LABEL,
  SAVED_SECTIONS_HEADING,
  SECTION_ADDED_MESSAGE,
  SECTION_CORRECT_MARK_HINT,
  SECTION_CORRECT_MARK_LABEL,
  SECTION_CORRECT_MARK_PLACEHOLDER,
  SECTION_NEGATIVE_MARK_HINT,
  SECTION_NEGATIVE_MARK_LABEL,
  SECTION_NEGATIVE_MARK_PLACEHOLDER,
  SECTION_PRICE_HINT,
  SECTION_PRICE_LABEL,
  SECTION_PRICE_PLACEHOLDER,
  SECTION_TITLE_ERROR,
  SECTION_TITLE_LABEL,
  SECTION_TITLE_MAX_LENGTH,
  SECTION_TITLE_MIN_LENGTH,
  SECTION_TITLE_PLACEHOLDER,
  SECTION_TIME_LIMIT_HINT,
  SECTION_TIME_LIMIT_LABEL,
  SECTION_TIME_LIMIT_PLACEHOLDER,
  SECTION_UPDATED_MESSAGE,
  TIME_LIMIT_ERROR,
} from "./SectionEditor.constant";

// --- Pure helpers ----------------------------------------------------------

/** Parse a positive whole-second Time Limit from raw input (Req 3.1). */
function parseTimeLimit(raw: string): ParsedNumber {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false };
  }
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < MIN_TIME_LIMIT_SECONDS) {
    return { ok: false };
  }
  return { ok: true, value };
}

/** Parse a non-negative decimal-mark value from raw input (Req 3.1). */
function parseMark(raw: string): ParsedNumber {
  const trimmed = raw.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return { ok: false };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) {
    return { ok: false };
  }
  return { ok: true, value };
}

/**
 * Parse the raw price-field input into a Price amount in paise. An empty value
 * or 0 maps to `amount: null` (reachable only via the parent Test, Req 3.4); a
 * positive whole number maps to a priced Section; any other value is rejected.
 */
function parsePriceInput(raw: string): ParsedPrice {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, amount: null };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false };
  }
  const amount = Number(trimmed);
  if (!Number.isInteger(amount) || amount < 0) {
    return { ok: false };
  }
  return { ok: true, amount: amount === 0 ? null : amount };
}

/** A fresh Question draft with the minimum two empty Options. */
function emptyQuestionDraft(): QuestionDraft {
  return { text: "", options: [{ ...EMPTY_OPTION }, { ...EMPTY_OPTION }] };
}

/** A fresh add-Section draft carrying one inline Question to start (Req 3.1). */
function emptySectionDraft(): SectionDraft {
  return {
    title: "",
    timeLimitSeconds: "",
    correctMark: "",
    negativeMark: "",
    price: "",
    questions: [emptyQuestionDraft()],
  };
}

/** Seed the edit-Section form from a persisted Section (Questions edited separately). */
function sectionToDraft(section: SectionDto): SectionDraft {
  return {
    title: section.title,
    timeLimitSeconds: String(section.timeLimitSeconds),
    correctMark: String(section.correctMark),
    negativeMark: String(section.negativeMark),
    price: section.priceAmount === null ? "" : String(section.priceAmount),
    questions: [],
  };
}

/** Seed a Question form from a persisted Question and its ordered Options. */
function questionToDraft(question: QuestionDto): QuestionDraft {
  return {
    text: question.text,
    options: question.options.map((option) => ({
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  };
}

/** Map a draft's Options to the Backend API `OptionInput[]` (trimming text). */
function toOptionInputs(options: OptionDraft[]): OptionInput[] {
  return options.map((option) => ({
    text: option.text.trim(),
    isCorrect: option.isCorrect,
  }));
}

/**
 * Client-side pre-validation of a single Question draft mirroring the backend
 * bounds (Req 4.1, 4.2). The Backend API remains the authority.
 */
function validateQuestionDraft(draft: QuestionDraft): QuestionFieldErrors {
  const errors: QuestionFieldErrors = {};
  const text = draft.text.trim();
  if (
    text.length < QUESTION_TEXT_MIN_LENGTH ||
    text.length > QUESTION_TEXT_MAX_LENGTH
  ) {
    errors.text = QUESTION_TEXT_ERROR;
  }
  const options = toOptionInputs(draft.options);
  const enoughOptions = options.length >= 2;
  const allTextValid = options.every(
    (option) =>
      option.text.length >= 1 && option.text.length <= OPTION_TEXT_MAX_LENGTH,
  );
  const enoughCorrect = options.some((option) => option.isCorrect);
  if (!enoughOptions || !allTextValid || !enoughCorrect) {
    errors.options = OPTIONS_ERROR;
  }
  return errors;
}

/** Map a 422 envelope's per-field reasons onto the Section form's error keys. */
function mapSectionFieldErrors(error: HttpError): SectionFieldErrors {
  const fieldErrors: SectionFieldErrors = {};
  for (const { field, reason } of error.fields ?? []) {
    if (field === "title") {
      fieldErrors.title = reason;
    } else if (field === "timeLimitSeconds") {
      fieldErrors.timeLimitSeconds = reason;
    } else if (field === "correctMark") {
      fieldErrors.correctMark = reason;
    } else if (field === "negativeMark") {
      fieldErrors.negativeMark = reason;
    } else if (field === "priceAmount" || field === "currency") {
      fieldErrors.price = reason;
    } else if (field === "text" || field.startsWith("options")) {
      fieldErrors.questions = reason;
    } else {
      fieldErrors.form = reason;
    }
  }
  return fieldErrors;
}

/** Map a 422 envelope's per-field reasons onto the Question form's error keys. */
function mapQuestionFieldErrors(error: HttpError): QuestionFieldErrors {
  const fieldErrors: QuestionFieldErrors = {};
  for (const { field, reason } of error.fields ?? []) {
    if (field === "text") {
      fieldErrors.text = reason;
    } else if (field.startsWith("options")) {
      fieldErrors.options = reason;
    } else {
      fieldErrors.form = reason;
    }
  }
  return fieldErrors;
}

/** Render a Section's Price as a currency value, or a free/bundled indicator. */
function sectionPriceLabel(
  priceAmount: number | null,
  currency: string,
): string {
  return classifyPrice(priceAmount) === PRICE_CLASSIFICATION.free
    ? "Included with test"
    : formatPrice(priceAmount, { currency });
}

// --- Reusable Question draft fields ---------------------------------------

/**
 * The controlled editor for a single Question draft: its text plus its Option
 * rows (text + a "correct" flag), with add/remove-Option controls and an
 * optional remove-Question control (Req 4.1, 4.2). Emits the updated draft via
 * `onChange` so the parent owns the state.
 */
function QuestionDraftFields({
  draft,
  error,
  disabled,
  idPrefix,
  onChange,
  onRemove,
}: {
  draft: QuestionDraft;
  error?: string;
  disabled: boolean;
  idPrefix: string;
  onChange: (next: QuestionDraft) => void;
  onRemove?: () => void;
}) {
  const setText = (text: string): void => onChange({ ...draft, text });

  const setOption = (index: number, next: OptionDraft): void => {
    const options = draft.options.map((option, i) =>
      i === index ? next : option,
    );
    onChange({ ...draft, options });
  };

  const addOption = (): void => {
    onChange({ ...draft, options: [...draft.options, { ...EMPTY_OPTION }] });
  };

  const removeOption = (index: number): void => {
    onChange({
      ...draft,
      options: draft.options.filter((_, i) => i !== index),
    });
  };

  return (
    <div className={styles.questionEditor}>
      <Input
        id={`${idPrefix}-text`}
        label={QUESTION_TEXT_LABEL}
        value={draft.text}
        placeholder={QUESTION_TEXT_PLACEHOLDER}
        maxLength={QUESTION_TEXT_MAX_LENGTH}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
      />

      {draft.options.map((option, index) => (
        <div className={styles.optionRow} key={`${idPrefix}-option-${index}`}>
          <Input
            id={`${idPrefix}-option-${index}`}
            label={`${OPTION_TEXT_LABEL} ${index + 1}`}
            hideLabel
            value={option.text}
            placeholder={OPTION_TEXT_PLACEHOLDER}
            maxLength={OPTION_TEXT_MAX_LENGTH}
            disabled={disabled}
            onChange={(event) =>
              setOption(index, { ...option, text: event.target.value })
            }
          />
          <label className={styles.optionCorrect}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={option.isCorrect}
              disabled={disabled}
              onChange={(event) =>
                setOption(index, { ...option, isCorrect: event.target.checked })
              }
            />
            {OPTION_CORRECT_LABEL}
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || draft.options.length <= 2}
            onClick={() => removeOption(index)}
          >
            {REMOVE_OPTION_LABEL}
          </Button>
        </div>
      ))}

      {error && (
        <p className={styles.fieldError} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={addOption}
        >
          {ADD_OPTION_LABEL}
        </Button>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onRemove}
          >
            {REMOVE_QUESTION_LABEL}
          </Button>
        )}
      </div>
    </div>
  );
}

// --- Reusable Section form fields -----------------------------------------

/**
 * The controlled add/edit-Section form: the Section's own fields (title, Time
 * Limit, Correct/Negative Mark, optional Price) and — when `withQuestions` is
 * set for the add flow — its Questions authored inline (Req 3.1, 5.1). Emits the
 * updated draft via `onChange` so the parent owns the state.
 */
function SectionFormFields({
  draft,
  errors,
  disabled,
  submitLabel,
  withQuestions = false,
  onChange,
  onSubmit,
  onCancel,
}: {
  draft: SectionDraft;
  errors: SectionFieldErrors;
  disabled: boolean;
  submitLabel: string;
  withQuestions?: boolean;
  onChange: (next: SectionDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const setField = (field: keyof SectionDraft, value: string): void =>
    onChange({ ...draft, [field]: value });

  const setQuestion = (index: number, next: QuestionDraft): void =>
    onChange({
      ...draft,
      questions: draft.questions.map((question, i) =>
        i === index ? next : question,
      ),
    });

  const addQuestion = (): void =>
    onChange({
      ...draft,
      questions: [...draft.questions, emptyQuestionDraft()],
    });

  const removeQuestion = (index: number): void =>
    onChange({
      ...draft,
      questions: draft.questions.filter((_, i) => i !== index),
    });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Input
        id="section-title"
        label={SECTION_TITLE_LABEL}
        value={draft.title}
        placeholder={SECTION_TITLE_PLACEHOLDER}
        maxLength={SECTION_TITLE_MAX_LENGTH}
        error={errors.title}
        disabled={disabled}
        onChange={(event) => setField("title", event.target.value)}
      />

      <div className={styles.fieldRow}>
        <Input
          id="section-time-limit"
          label={SECTION_TIME_LIMIT_LABEL}
          type="number"
          inputMode="numeric"
          min={MIN_TIME_LIMIT_SECONDS}
          step={1}
          value={draft.timeLimitSeconds}
          placeholder={SECTION_TIME_LIMIT_PLACEHOLDER}
          hint={SECTION_TIME_LIMIT_HINT}
          error={errors.timeLimitSeconds}
          disabled={disabled}
          onChange={(event) => setField("timeLimitSeconds", event.target.value)}
        />
        <Input
          id="section-price"
          label={SECTION_PRICE_LABEL}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={draft.price}
          placeholder={SECTION_PRICE_PLACEHOLDER}
          hint={SECTION_PRICE_HINT}
          error={errors.price}
          disabled={disabled}
          onChange={(event) => setField("price", event.target.value)}
        />
      </div>

      <div className={styles.fieldRow}>
        <Input
          id="section-correct-mark"
          label={SECTION_CORRECT_MARK_LABEL}
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          value={draft.correctMark}
          placeholder={SECTION_CORRECT_MARK_PLACEHOLDER}
          hint={SECTION_CORRECT_MARK_HINT}
          error={errors.correctMark}
          disabled={disabled}
          onChange={(event) => setField("correctMark", event.target.value)}
        />
        <Input
          id="section-negative-mark"
          label={SECTION_NEGATIVE_MARK_LABEL}
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          value={draft.negativeMark}
          placeholder={SECTION_NEGATIVE_MARK_PLACEHOLDER}
          hint={SECTION_NEGATIVE_MARK_HINT}
          error={errors.negativeMark}
          disabled={disabled}
          onChange={(event) => setField("negativeMark", event.target.value)}
        />
      </div>

      {withQuestions && (
        <>
          <h6 className={styles.subHeading}>{QUESTIONS_HEADING}</h6>
          {draft.questions.map((question, index) => (
            <QuestionDraftFields
              key={`section-question-${index}`}
              draft={question}
              disabled={disabled}
              idPrefix={`section-question-${index}`}
              onChange={(next) => setQuestion(index, next)}
              onRemove={
                draft.questions.length > 1
                  ? () => removeQuestion(index)
                  : undefined
              }
            />
          ))}
          {errors.questions && (
            <p className={styles.fieldError} role="alert">
              {errors.questions}
            </p>
          )}
          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={addQuestion}
            >
              {ADD_QUESTION_LABEL}
            </Button>
          </div>
        </>
      )}

      {errors.form && (
        <p className={styles.fieldError} role="alert">
          {errors.form}
        </p>
      )}

      <div className={styles.actions}>
        <Button type="submit" variant="primary" isLoading={disabled}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          onClick={onCancel}
        >
          {CANCEL_LABEL}
        </Button>
      </div>
    </form>
  );
}

// --- Section editor --------------------------------------------------------

function SectionEditor({ testId, initialSections }: SectionEditorProps) {
  const {
    isSubmitting,
    addSection,
    editSection,
    addQuestion,
    editQuestion,
    getTestForAdmin,
  } = useAdminTests();

  // The persisted Sections shown as saved state, re-seeded whenever a different
  // Test is loaded and refreshed after each successful add/edit (Req 5.3).
  const [sections, setSections] = useState<SectionDto[]>(initialSections);
  useEffect(() => {
    setSections(initialSections);
  }, [testId, initialSections]);

  const [mode, setMode] = useState<SectionEditorMode>({ kind: "idle" });
  const [feedback, setFeedback] = useState<SectionEditorFeedback | null>(null);

  const [sectionDraft, setSectionDraft] =
    useState<SectionDraft>(emptySectionDraft);
  const [sectionErrors, setSectionErrors] = useState<SectionFieldErrors>({});

  const [questionDraft, setQuestionDraft] =
    useState<QuestionDraft>(emptyQuestionDraft);
  const [questionErrors, setQuestionErrors] = useState<QuestionFieldErrors>({});

  /** Reload the Test graph so the saved state is shown after a mutation. */
  const reloadSections = useCallback(async (): Promise<boolean> => {
    const result = await getTestForAdmin(testId);
    if (result.ok) {
      setSections(result.data.sections);
      return true;
    }
    setFeedback({ kind: "error", message: RELOAD_ERROR_MESSAGE });
    return false;
  }, [getTestForAdmin, testId]);

  const closeForms = useCallback((): void => {
    setMode({ kind: "idle" });
    setSectionErrors({});
    setQuestionErrors({});
  }, []);

  // ---- Add Section (with inline Questions, Req 3.1, 5.1) -----------------

  const openAddSection = useCallback((): void => {
    setSectionDraft(emptySectionDraft());
    setSectionErrors({});
    setFeedback(null);
    setMode({ kind: "add-section" });
  }, []);

  const handleAddSection = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setFeedback(null);

    const nextErrors: SectionFieldErrors = {};
    const title = sectionDraft.title.trim();
    if (
      title.length < SECTION_TITLE_MIN_LENGTH ||
      title.length > SECTION_TITLE_MAX_LENGTH
    ) {
      nextErrors.title = SECTION_TITLE_ERROR;
    }
    const time = parseTimeLimit(sectionDraft.timeLimitSeconds);
    if (!time.ok) {
      nextErrors.timeLimitSeconds = TIME_LIMIT_ERROR;
    }
    const correct = parseMark(sectionDraft.correctMark);
    if (!correct.ok) {
      nextErrors.correctMark = MARK_ERROR;
    }
    const negative = parseMark(sectionDraft.negativeMark);
    if (!negative.ok) {
      nextErrors.negativeMark = MARK_ERROR;
    }
    const price = parsePriceInput(sectionDraft.price);
    if (!price.ok) {
      nextErrors.price = PRICE_ERROR;
    }
    const questionInvalid = sectionDraft.questions.some(
      (question) => Object.keys(validateQuestionDraft(question)).length > 0,
    );
    if (questionInvalid) {
      nextErrors.questions = OPTIONS_ERROR;
    }

    if (
      !time.ok ||
      !correct.ok ||
      !negative.ok ||
      !price.ok ||
      Object.keys(nextErrors).length > 0
    ) {
      setSectionErrors(nextErrors);
      return;
    }
    setSectionErrors({});

    const questions: CreateQuestionInput[] = sectionDraft.questions.map(
      (question) => ({
        text: question.text.trim(),
        options: toOptionInputs(question.options),
      }),
    );
    const input: CreateSectionInput = {
      title,
      timeLimitSeconds: time.value,
      correctMark: correct.value,
      negativeMark: negative.value,
      priceAmount: price.amount,
      currency: price.amount === null ? undefined : DEFAULT_CURRENCY,
      questions,
    };

    const result = await addSection(testId, input);
    if (result.ok) {
      await reloadSections();
      setFeedback({ kind: "success", message: SECTION_ADDED_MESSAGE });
      closeForms();
      return;
    }
    const mapped = mapSectionFieldErrors(result.error);
    setSectionErrors(mapped);
    if (Object.keys(mapped).length === 0) {
      setFeedback({
        kind: "error",
        message: result.error.message || GENERIC_ACTION_ERROR,
      });
    }
  };

  // ---- Edit Section (fields only; Questions edited separately, Req 5.2) --

  const openEditSection = useCallback((section: SectionDto): void => {
    setSectionDraft(sectionToDraft(section));
    setSectionErrors({});
    setFeedback(null);
    setMode({ kind: "edit-section", sectionId: section.id });
  }, []);

  const handleEditSection = async (
    event: FormEvent<HTMLFormElement>,
    sectionId: string,
  ): Promise<void> => {
    event.preventDefault();
    setFeedback(null);

    const nextErrors: SectionFieldErrors = {};
    const title = sectionDraft.title.trim();
    if (
      title.length < SECTION_TITLE_MIN_LENGTH ||
      title.length > SECTION_TITLE_MAX_LENGTH
    ) {
      nextErrors.title = SECTION_TITLE_ERROR;
    }
    const time = parseTimeLimit(sectionDraft.timeLimitSeconds);
    if (!time.ok) {
      nextErrors.timeLimitSeconds = TIME_LIMIT_ERROR;
    }
    const correct = parseMark(sectionDraft.correctMark);
    if (!correct.ok) {
      nextErrors.correctMark = MARK_ERROR;
    }
    const negative = parseMark(sectionDraft.negativeMark);
    if (!negative.ok) {
      nextErrors.negativeMark = MARK_ERROR;
    }
    const price = parsePriceInput(sectionDraft.price);
    if (!price.ok) {
      nextErrors.price = PRICE_ERROR;
    }

    if (!time.ok || !correct.ok || !negative.ok || !price.ok) {
      setSectionErrors(nextErrors);
      return;
    }
    setSectionErrors({});

    const input: EditSectionInput = {
      title,
      timeLimitSeconds: time.value,
      correctMark: correct.value,
      negativeMark: negative.value,
      priceAmount: price.amount,
      currency: price.amount === null ? undefined : DEFAULT_CURRENCY,
    };

    const result = await editSection(sectionId, input);
    if (result.ok) {
      await reloadSections();
      setFeedback({ kind: "success", message: SECTION_UPDATED_MESSAGE });
      closeForms();
      return;
    }
    const mapped = mapSectionFieldErrors(result.error);
    setSectionErrors(mapped);
    if (Object.keys(mapped).length === 0) {
      setFeedback({
        kind: "error",
        message: result.error.message || GENERIC_ACTION_ERROR,
      });
    }
  };

  // ---- Add / Edit a Question (Req 4.1, 5.2) ------------------------------

  const openAddQuestion = useCallback((sectionId: string): void => {
    setQuestionDraft(emptyQuestionDraft());
    setQuestionErrors({});
    setFeedback(null);
    setMode({ kind: "add-question", sectionId });
  }, []);

  const openEditQuestion = useCallback(
    (sectionId: string, question: QuestionDto): void => {
      setQuestionDraft(questionToDraft(question));
      setQuestionErrors({});
      setFeedback(null);
      setMode({ kind: "edit-question", sectionId, questionId: question.id });
    },
    [],
  );

  const submitQuestion = async (
    event: FormEvent<HTMLFormElement>,
    run: () => Promise<{ ok: true } | { ok: false; error: HttpError }>,
    successMessage: string,
  ): Promise<void> => {
    event.preventDefault();
    setFeedback(null);

    const errors = validateQuestionDraft(questionDraft);
    if (Object.keys(errors).length > 0) {
      setQuestionErrors(errors);
      return;
    }
    setQuestionErrors({});

    const result = await run();
    if (result.ok) {
      await reloadSections();
      setFeedback({ kind: "success", message: successMessage });
      closeForms();
      return;
    }
    const mapped = mapQuestionFieldErrors(result.error);
    setQuestionErrors(mapped);
    if (Object.keys(mapped).length === 0) {
      setFeedback({
        kind: "error",
        message: result.error.message || GENERIC_ACTION_ERROR,
      });
    }
  };

  const questionInput = (): CreateQuestionInput => ({
    text: questionDraft.text.trim(),
    options: toOptionInputs(questionDraft.options),
  });

  const feedbackClassName = useMemo(
    () =>
      feedback?.kind === "success"
        ? `${styles.feedback} ${styles.feedbackSuccess}`
        : `${styles.feedback} ${styles.feedbackError}`,
    [feedback],
  );

  return (
    <div className={styles.editor}>
      <h4 className={styles.heading}>{SAVED_SECTIONS_HEADING}</h4>

      {feedback && (
        <p className={feedbackClassName} role="status">
          {feedback.message}
        </p>
      )}

      {!sections?.length ? (
        <p className={styles.emptyText}>{NO_SECTIONS_MESSAGE}</p>
      ) : (
        <ul className={styles.sectionList}>
          {sections.map((section) => (
            <li key={section.id} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionMeta}>
                  <h5 className={styles.sectionName}>{section.title}</h5>
                  <span className={styles.sectionDetail}>
                    {section.timeLimitSeconds}s · +{section.correctMark} / −
                    {section.negativeMark} ·{" "}
                    {sectionPriceLabel(section.priceAmount, section.currency)}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => openEditSection(section)}
                >
                  {EDIT_SECTION_LABEL}
                </Button>
              </div>

              {/* Edit-Section form (Req 5.2) */}
              {mode.kind === "edit-section" &&
                mode.sectionId === section.id && (
                  <SectionFormFields
                    draft={sectionDraft}
                    errors={sectionErrors}
                    disabled={isSubmitting}
                    submitLabel={SAVE_SECTION_LABEL}
                    onChange={setSectionDraft}
                    onSubmit={(event) => handleEditSection(event, section.id)}
                    onCancel={closeForms}
                  />
                )}

              {/* Questions of the saved Section, each with an Edit action (Req 5.3) */}
              <h6 className={styles.subHeading}>{QUESTIONS_HEADING}</h6>
              {section.questions.length === 0 ? (
                <p className={styles.emptyText}>{NO_QUESTIONS_TEXT}</p>
              ) : (
                <ul className={styles.questionList}>
                  {section.questions.map((question, index) => (
                    <li key={question.id} className={styles.questionItem}>
                      <div className={styles.sectionMeta}>
                        <p className={styles.questionText}>
                          {QUESTION_LABEL_PREFIX} {index + 1}: {question.text}
                        </p>
                        <span className={styles.questionMeta}>
                          {question.options.length} {OPTIONS_COUNT_SUFFIX}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => openEditQuestion(section.id, question)}
                      >
                        {EDIT_QUESTION_LABEL}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Edit-Question form (Req 5.2) */}
              {mode.kind === "edit-question" &&
                mode.sectionId === section.id && (
                  <form
                    className={styles.form}
                    onSubmit={(event) =>
                      submitQuestion(
                        event,
                        () => editQuestion(mode.questionId, questionInput()),
                        QUESTION_UPDATED_MESSAGE,
                      )
                    }
                    noValidate
                  >
                    <QuestionDraftFields
                      draft={questionDraft}
                      error={questionErrors.options ?? questionErrors.text}
                      disabled={isSubmitting}
                      idPrefix={`edit-question-${mode.questionId}`}
                      onChange={setQuestionDraft}
                    />
                    {questionErrors.form && (
                      <p className={styles.fieldError} role="alert">
                        {questionErrors.form}
                      </p>
                    )}
                    <div className={styles.actions}>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isSubmitting}
                      >
                        {SAVE_QUESTION_LABEL}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={closeForms}
                      >
                        {CANCEL_LABEL}
                      </Button>
                    </div>
                  </form>
                )}

              {/* Add-Question form / trigger (Req 4.1) */}
              {mode.kind === "add-question" && mode.sectionId === section.id ? (
                <form
                  className={styles.form}
                  onSubmit={(event) =>
                    submitQuestion(
                      event,
                      () => addQuestion(section.id, questionInput()),
                      QUESTION_ADDED_MESSAGE,
                    )
                  }
                  noValidate
                >
                  <QuestionDraftFields
                    draft={questionDraft}
                    error={questionErrors.options ?? questionErrors.text}
                    disabled={isSubmitting}
                    idPrefix={`add-question-${section.id}`}
                    onChange={setQuestionDraft}
                  />
                  {questionErrors.form && (
                    <p className={styles.fieldError} role="alert">
                      {questionErrors.form}
                    </p>
                  )}
                  <div className={styles.actions}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSubmitting}
                    >
                      {SAVE_QUESTION_LABEL}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={closeForms}
                    >
                      {CANCEL_LABEL}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => openAddQuestion(section.id)}
                  >
                    {ADD_QUESTION_TO_SECTION_LABEL}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add-Section form / trigger (Req 3.1, 5.1) */}
      {mode.kind === "add-section" ? (
        <div className={styles.panel}>
          <h5 className={styles.subHeading}>{ADD_SECTION_HEADING}</h5>
          <SectionFormFields
            draft={sectionDraft}
            errors={sectionErrors}
            disabled={isSubmitting}
            submitLabel={ADD_SECTION_SUBMIT_LABEL}
            withQuestions
            onChange={setSectionDraft}
            onSubmit={handleAddSection}
            onCancel={closeForms}
          />
        </div>
      ) : (
        mode.kind === "idle" && (
          <div className={styles.actions}>
            <Button variant="primary" onClick={openAddSection}>
              {ADD_SECTION_SUBMIT_LABEL}
            </Button>
          </div>
        )
      )}
    </div>
  );
}

export default SectionEditor;
