'use client';

// Admin dashboard Manage Page (Requirements 1.1, 1.2, 1.3, 1.4).
//
// The content-management surface for an authenticated Admin, presented as two
// tabs: a Study Material Tab (the extracted `StudyMaterialTab` component) active
// by default (Req 1.1), and a Test Series Tab rendering `TestManager` (Req 1.3).
// The tab controls and the Test management interface are rendered only when the
// signed-in user holds `role_admin` — derived from `useAdminMaterials().isAdmin`,
// the same hook `StudyMaterialTab` uses (Req 1.1, 1.4). Switching tabs is local
// component state with no route change; the inactive interface is unmounted so
// exactly one management surface is shown at a time (Req 1.2, 1.3).
//
// When the visitor is not an admin, only `StudyMaterialTab` is rendered, which
// owns the unauthenticated redirect and the pre-mount loading state; neither the
// tab controls nor the Test Series interface are rendered (Req 1.4). All styling
// lives in `page.module.scss` (no inline CSS).

import { useEffect, useState } from 'react';

import StudyMaterialTab from '@/components/StudyMaterialTab/StudyMaterialTab';
import TestManager from '@/components/TestManager/TestManager';
import { useAdminMaterials } from '@/hooks/api/useAdminMaterials';

import styles from './page.module.scss';
import type { ManageTabId } from './page.types';
import {
  DEFAULT_TAB,
  STUDY_MATERIAL_TAB,
  STUDY_MATERIAL_TAB_LABEL,
  TABS_ARIA_LABEL,
  TEST_SERIES_TAB,
  TEST_SERIES_TAB_LABEL,
} from './page.constant';

function AdminDashboardPage() {
  const { isAdmin } = useAdminMaterials();
  const [activeTab, setActiveTab] = useState<ManageTabId>(DEFAULT_TAB);

  // `isAdmin` is derived from the client-only Access Token, so it is always
  // `false` during SSR and on the first client render. Gate the admin-only tab
  // bar behind a post-mount flag so the server-rendered HTML and the first
  // client render agree (both render `StudyMaterialTab`), avoiding a hydration
  // mismatch; the tab bar appears after mount once the token is resolved.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Non-admins (and every pre-mount render) show only `StudyMaterialTab`, which
  // owns the redirect and pre-mount loading state; neither the tab controls nor
  // the Test Series interface are rendered (Req 1.4).
  if (!hasMounted || !isAdmin) {
    return <StudyMaterialTab />;
  }

  const tabs: { id: ManageTabId; label: string }[] = [
    { id: STUDY_MATERIAL_TAB, label: STUDY_MATERIAL_TAB_LABEL },
    { id: TEST_SERIES_TAB, label: TEST_SERIES_TAB_LABEL },
  ];

  return (
    <>
      <div className={styles.tabBar} role="tablist" aria-label={TABS_ARIA_LABEL}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={
                isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Render exactly one management surface; the inactive one is unmounted
          so its interface is hidden (Req 1.2, 1.3). */}
      {activeTab === STUDY_MATERIAL_TAB ? <StudyMaterialTab /> : <TestManager />}
    </>
  );
}

export default AdminDashboardPage;
