'use client';

// Admin login page — deprecated.
//
// There is no separate admin login anymore: admin access is granted by signing
// in on the account page with a user whose `roles` include `role_admin`
// (Req 10.4). This route now simply redirects to the account page so any old
// links or bookmarks land in the right place.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { ACCOUNT_PATH } from './page.constant';

function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ACCOUNT_PATH);
  }, [router]);

  return null;
}

export default AdminLoginPage;
