// src/pages/DashboardPage.jsx
import React, { Suspense, lazy } from 'react';
import LoadingSpinner from '../shared/components/LoadingSpinner/LoadingSpinner';

// ✅ lazy برای اولین لود سریع‌تر
const DashboardContainer = lazy(() =>
  import('../features/dashboard/DashboardContainer')
);

const DashboardPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="در حال آماده‌سازی داشبورد..." />}>
      <DashboardContainer />
    </Suspense>
  );
};

export default DashboardPage;