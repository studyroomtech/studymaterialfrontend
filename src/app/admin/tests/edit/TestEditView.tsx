'use client';

// TestEditView — the Test authoring editor rendered by the Edit Page on a
// successful Load Operation (Req 2.3, 5.1).
//
// Relocated from the dashboard's `TestManager` inline edit branch into the
// dedicated `/admin/tests/edit` route module. It renders the loaded Test's
// metadata header (title + Price / free indicator), a Back control that returns
// to the dashboard, and the shared `SectionEditor` seeded with the Test's
// ordered `sections`. The in-place save flow is unchanged: `SectionEditor`
// persists each mutation and reloads the graph in place, so the page stays put
// after a save (Req 5.1). All styling lives in `TestEditView.module.scss` (no
// inline CSS).

import Button from '@/components/Button/Button';
import SectionEditor from '@/components/TestManager/SectionEditor';
import type { AdminTestDto } from '@/types/testSeries.types';
import { classifyPrice, formatPrice } from '@/utils/price';
import { PRICE_CLASSIFICATION } from '@/utils/price.constant';

import { BACK_TO_LIST_LABEL, FREE_BADGE_LABEL } from './page.constant';
import styles from './TestEditView.module.scss';
import type { TestEditViewProps } from './TestEditView.types';

/**
 * Render a Test's Price as a currency value, or a free indicator when the Test
 * has no Price (Req 2.3). Uses the shared `utils/price.ts` classification and
 * formatting so the editor matches the dashboard list.
 */
function priceLabel(priceAmount: number | null, currency: string): string {
  return classifyPrice(priceAmount) === PRICE_CLASSIFICATION.free
    ? FREE_BADGE_LABEL
    : formatPrice(priceAmount, { currency });
}

/**
 * The Test authoring editor: metadata header, Back control, and the seeded
 * `SectionEditor`. Presentational aside from the `onBack` callback — the load
 * and page-state resolution are owned by the Edit Page (`page.tsx`).
 */
function TestEditView({ test, onBack }: TestEditViewProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.editHeader}>
        <div className={styles.testMeta}>
          <h3 className={styles.panelTitle}>{test.title}</h3>
          <span className={styles.testPrice}>
            {priceLabel(test.priceAmount, test.currency)}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          {BACK_TO_LIST_LABEL}
        </Button>
      </div>

      {/* Sections region — the incremental Section + Questions editor. It seeds
          from the loaded ordered graph on `test.sections`, persists each
          Section independently, and reloads the graph after every successful
          add/edit so the page stays put after a save (Req 5.1). */}
      <div className={styles.sections}>
        <SectionEditor testId={test.id} initialSections={test.sections} />
      </div>
    </div>
  );
}

export default TestEditView;
