// Type declarations for the SectionBreakdown component.

import type { SectionResultDto } from '@/types/testSeries.types';

export interface SectionBreakdownProps {
  /** Per-Section results in Admin-defined order, as returned by the Backend. */
  sections: SectionResultDto[];
}
