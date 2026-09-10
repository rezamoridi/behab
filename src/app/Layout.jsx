// src/app/Layout.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../features/sidebar/SidebarComponent';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const pathname = location.pathname;

  const showShell = isAuthenticated && pathname !== '/login';

  return (
    <div className="app-layout" dir="rtl">
      {showShell && <Sidebar />}
      <main className={`app-content ${!showShell ? 'full-width' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;