// Type declarations for the ResultSummary component.

import type { AttemptSummaryDto } from '@/types/testSeries.types';

export interface ResultSummaryProps {
  /** The server-computed headline result of one completed attempt. */
  summary: AttemptSummaryDto;
}

/**
 * One statistic in the answer-breakdown row. `tone` selects the colour
 * treatment: correct answers read positive, incorrect negative, and skipped
 * neutral (a skipped Question is neither, since it scores zero).
 */
export interface BreakdownStat {
  label: string;
  value: number;
  tone: 'positive' | 'negative' | 'neutral';
}
