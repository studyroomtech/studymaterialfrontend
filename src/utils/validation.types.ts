// Types for shared client-side validation (`validation.ts`).

// The outcome of validating a single field: whether it is valid and, when
// invalid, a human-readable reason suitable for surfacing next to the field.
export interface FieldValidationResult {
  valid: boolean;
  reason?: string;
}
