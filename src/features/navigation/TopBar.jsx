// src/features/navigation/TopBar.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  Bell,
} from 'lucide-react';
import {
  getUserData,
  getCurrentUser,
  logout as logoutApi,
} from '../../services/api/authApi';
import { useAuth } from '../../context/useAuth';
import { useFarmPanel } from '../farm-registration/panel/FarmPanelContext';
import LocationPicker from '../location/components/LocationPicker';

const ROLE_LABELS = {
  admin: 'مدیر سیستم',
  manager: 'مدیر',
  operator: 'اپراتور',
  user: 'کاربر',
};

const TopBar = ({ onLocationSelect, selectedLocation }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: logoutContext } = useAuth();
  const { isOpen: isPanelOpen } = useFarmPanel();

  const isMapPage = location.pathname.startsWith('/map');
  const isDashboard = location.pathname === '/';

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const getInitials = (name) => {
    if (!name) return 'ع';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0);
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getFullName = () => {
    if (!userData) return 'کاربر';
    return (
      userData.full_name ||
      `${userData.fname || ''} ${userData.lname || ''}`.trim() ||
      userData.username ||
      'کاربر'
    );
  };

  const getUserRole = () => {
    if (!userData) return 'کاربر';
    return ROLE_LABELS[userData.role] || userData.role || 'کاربر';
  };

  const handleLogout = async () => {
    if (!window.confirm('آیا از خروج از سیستم اطمینان دارید؟')) return;
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logoutContext();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-[1090]
        pointer-events-none
        font-vazir
      "
      dir="rtl"
    >
      <div
        className="
          flex items-center gap-2 md:gap-3
          px-3 md:px-4 py-2.5
        "
      >
        {/* ─── راست: لوگو ─── */}
        {/* 
          ✅ نکته: کارت «آب خوان» در داشبورد حذف می‌شود چون در داشبورد هستیم.
          در `/map` و بقیه صفحات، باقی می‌ماند.
        */}
        {!isDashboard && (
          <div className="pointer-events-auto shrink-0">
            <button
              type="button"
              onClick={() => navigate('/')}
              title="آب خوان - داشبورد"
              className="
                flex items-center gap-2
                px-2.5 py-2 rounded-2xl
                bg-white/70 backdrop-blur-xl
                border border-white/70
                shadow-[0_4px_20px_rgba(31,38,135,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]
                hover:bg-white/90 transition-colors
                cursor-pointer
              "
            >
              <div
                className="
                  w-8 h-8 rounded-xl
                  bg-gradient-to-br from-green-400 to-green-700
                  flex items-center justify-center
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_6px_rgba(46,125,50,0.3)]
                "
              >
                <span className="text-white text-sm font-bold drop-shadow">آ</span>
              </div>
              <span className="text-slate-800 text-sm font-bold">آب خوان</span>
            </button>
          </div>
        )}

        {/* ─── وسط: Search (فقط در /map) ─── */}
        {isMapPage && (
          <div
            className={`
              flex-1 pointer-events-auto flex px-1
              transition-[padding] duration-150 ease-out
              ${isPanelOpen ? 'md:pr-[436px]' : ''}
            `}
          >
            <div className="w-full max-w-[520px] mx-auto">
              <LocationPicker
                onLocationSelect={onLocationSelect}
                onSearchChange={() => {}}
                embedded
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        )}

        {!isMapPage && <div className="flex-1" />}

        {/* ─── چپ: کاربر + آیکون‌ها ─── */}
        <div className="pointer-events-auto shrink-0">
          <div
            className={`
              flex items-center
              rounded-2xl
              bg-white/70 backdrop-blur-xl
              border border-white/70
              shadow-[0_4px_20px_rgba(31,38,135,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]
              ${
                isDashboard
                  ? 'gap-0.5 px-1 py-1' /* داشبورد: فشرده‌تر */
                  : 'gap-0.5 md:gap-1 px-1.5 py-1.5'
              }
            `}
          >
            {/* Notifications */}
            <button
              type="button"
              title="اعلان‌ها"
              aria-label="اعلان‌ها"
              className="
                relative flex
                w-9 h-9 rounded-xl items-center justify-center
                text-slate-600 hover:text-slate-900
                hover:bg-white/70 transition-colors
                cursor-pointer
              "
            >
              <Bell size={17} strokeWidth={2.2} />
              {/* نقطه اعلان — فقط برای نمونه */}
              {!isDashboard && (
                <span
                  className="
                    absolute top-1.5 left-1.5
                    w-2 h-2 rounded-full
                    bg-rose-500 ring-2 ring-white/80
                  "
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Settings */}
            {!isDashboard && (
              <button
                type="button"
                onClick={() => navigate('/settings')}
                title="تنظیمات"
                aria-label="تنظیمات"
                className="
                  flex
                  w-9 h-9 rounded-xl items-center justify-center
                  text-slate-600 hover:text-slate-900
                  hover:bg-white/70 transition-colors
                  cursor-pointer
                "
              >
                <SettingsIcon size={17} strokeWidth={2.2} />
              </button>
            )}

            {/* جداکننده */}
            <div className="block w-px h-6 bg-slate-300/60" />

            {/* کاربر */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                title="حساب کاربری"
                className="
                  flex items-center gap-2
                  px-1.5 py-1 rounded-xl
                  hover:bg-white/70 transition-colors
                  cursor-pointer
                "
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="منوی کاربر"
              >
                <div
                  className="
                    w-8 h-8 rounded-xl
                    bg-gradient-to-br from-primary-400 to-primary-700
                    flex items-center justify-center
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_6px_rgba(46,125,50,0.25)]
                    shrink-0
                  "
                >
                  <span className="text-white text-xs font-bold">
                    {isLoading ? '...' : getInitials(getFullName())}
                  </span>
                </div>
                {/* نام کاربر — فقط در /map و صفحات غیرداشبورد */}
                {!isDashboard && (
                  <div className="hidden md:flex flex-col items-start pr-0.5 max-w-[120px]">
                    <span className="text-slate-800 text-xs font-semibold leading-tight truncate w-full">
                      {isLoading ? '...' : getFullName()}
                    </span>
                    <span className="text-slate-500 text-[10px] leading-tight truncate w-full">
                      {isLoading ? '' : getUserRole()}
                    </span>
                  </div>
                )}
              </button>

              {menuOpen && (
                <div
                  className="
                    absolute top-full left-0 mt-2 z-[1090]
                    min-w-[220px]
                    rounded-2xl
                    bg-white/95 backdrop-blur-xl
                    border border-white/70
                    shadow-[0_8px_32px_rgba(31,38,135,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]
                    overflow-hidden
                    animate-panel-fade-in
                  "
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-slate-200/60">
                    <div className="text-slate-800 text-xs font-semibold truncate">
                      {getFullName()}
                    </div>
                    <div className="text-slate-500 text-[10px] mt-0.5">
                      {getUserRole()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/settings', {
                        state: { activeTab: 'profile' },
                      });
                    }}
                    className="
                      w-full flex items-center gap-2.5
                      px-4 py-2.5
                      text-slate-700 text-xs
                      hover:bg-slate-100/80 transition-colors
                      cursor-pointer
                    "
                    role="menuitem"
                  >
                    <UserIcon size={14} />
                    پروفایل کاربری
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="
                      w-full flex items-center gap-2.5
                      px-4 py-2.5
                      text-slate-700 text-xs
                      hover:bg-slate-100/80 transition-colors
                      cursor-pointer
                    "
                    role="menuitem"
                  >
                    <SettingsIcon size={14} />
                    تنظیمات
                  </button>

                  <div className="h-px bg-slate-200/60" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="
                      w-full flex items-center gap-2.5
                      px-4 py-2.5
                      text-red-600 text-xs
                      hover:bg-red-50 transition-colors
                      cursor-pointer
                    "
                    role="menuitem"
                  >
                    <LogOut size={14} />
                    خروج از حساب
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;