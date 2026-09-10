// src/features/sidebar/SidebarComponent.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map as MapIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  getUserData,
  getCurrentUser,
  logout as logoutApi,
} from '../../services/api/authApi';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'داشبورد', icon: LayoutDashboard, path: '/' },
  { label: 'نقشه', icon: MapIcon, path: '/map' },
  { label: 'تنظیمات', icon: Settings, path: '/settings' },
];

const ROLE_LABELS = {
  admin: 'مدیر سیستم',
  manager: 'مدیر',
  operator: 'اپراتور',
  user: 'کاربر',
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: logoutContext } = useAuth();

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const cachedUser = getUserData();
        if (cachedUser && isMounted) {
          setUserData(cachedUser);
          setIsLoading(false);
        }

        try {
          const user = await getCurrentUser();
          if (user && isMounted) setUserData(user);
        } catch (error) {
          console.warn('Could not refresh user data:', error);
        }
      } catch (error) {
        console.error('خطا در دریافت اطلاعات کاربر:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'ع';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0);
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getFullName = () => {
    if (!userData) return 'کاربر';
    return (
      userData.full_name ||
      userData.username ||
      userData.name ||
      'کاربر'
    );
  };

  const getUserRole = () => {
    if (!userData) return 'کاربر';
    return ROLE_LABELS[userData.role] || userData.role || 'کاربر';
  };

  const handleLogout = async () => {
    if (window.confirm('آیا از خروج از سیستم اطمینان دارید؟')) {
      try {
        await logoutApi();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        logoutContext();
        navigate('/login', { replace: true });
      }
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="w-64 h-full bg-white border-l border-gray-200 flex flex-col font-vazir shadow-sm flex-shrink-0"
      dir="rtl"
    >
      {/* User Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200">
        <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-base font-bold">
            {isLoading ? '...' : getInitials(getFullName())}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {isLoading ? 'در حال بارگذاری...' : getFullName()}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {isLoading ? '' : getUserRole()}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ul className="flex-1 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <li key={item.path}>
              <button
                type="button"
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-5 py-3
                  text-sm transition-colors duration-200
                  border-r-[3px]
                  ${
                    active
                      ? 'bg-primary-50 border-primary-600 text-primary-700 font-medium'
                      : 'border-transparent text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon
                  size={18}
                  className={active ? 'text-primary-600' : 'text-gray-500'}
                />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3 px-3 py-2.5
            rounded-lg text-red-600 text-sm font-medium
            hover:bg-red-50 transition-colors duration-200
          "
        >
          <LogOut size={18} />
          <span>خروج از حساب</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;