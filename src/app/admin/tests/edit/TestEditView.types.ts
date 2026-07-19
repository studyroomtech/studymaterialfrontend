// Prop types for the relocated `TestEditView` editor on the Edit Page.
//
// Type declarations only — no logic. Kept in a `*.types.ts` module per the
// project's structure lint (interfaces are declared only in types files).

import type { AdminTestDto } from '@/types/testSeries.types';

/**
 * Props for {@link TestEditView}: the loaded Admin_Test to author and the
 * Back callback that returns the Admin_User to the dashboard (Req 2.3, 5.2).
 */
export interface TestEditViewProps {
  /** The loaded Admin_Test to author (metadata + ordered Sections). */
  test: AdminTestDto;
  /** Invoked when the Admin_User activates the Back control (Req 5.2). */
  onBack: () => void;
}
