// src/app/ProtectedLayout.jsx
import { Navigate, Outlet } from 'react-router-dom';
import Layout from './Layout';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from '../shared/components/LoadingSpinner/LoadingSpinner';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedLayout;