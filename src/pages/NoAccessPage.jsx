// src/pages/NoAccessPage.jsx
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LogOut,
  ArrowLeft,
  Home,
  Phone,
} from 'lucide-react';

import { useAuth } from '../context/useAuth';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import { logout as logoutApi } from '../services/api/authApi';

const NoAccessPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user, role } = usePermissions();

  const handleLogout = async () => {
    if (!window.confirm('آیا از خروج از سیستم اطمینان دارید؟'))
      return;
    try {
      await logoutApi();
    } catch (e) {
      /* ignore */
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const roleLabels = {
    super_admin: 'مدیر ارشد',
    manager: 'مدیر منطقه',
    dehyar: 'دهیار',
    operator: 'اپراتور',
  };

  return (
    <div
      className="
        h-full flex items-center justify-center p-6 pt-24 pb-32
        bg-gradient-to-br from-slate-50 via-white to-amber-50/30
      "
      dir="rtl"
    >
      <div className="max-w-md w-full space-y-4">
        {/* ─── Main Card ─── */}
        <div
          className="
            relative overflow-hidden
            bg-white/70 backdrop-blur-xl
            rounded-3xl border border-white/70
            shadow-[0_8px_32px_rgba(31,38,135,0.10)]
            p-6 text-center
          "
        >
          {/* گرادیانت تزئینی */}
          <div
            className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-amber-500/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10">
            {/* آیکون */}
            <div
              className="
                w-20 h-20 mx-auto mb-4 rounded-3xl
                bg-gradient-to-br from-amber-500/25 to-red-500/10
                border border-amber-300/40
                flex items-center justify-center
                shadow-sm
              "
            >
              <ShieldAlert
                size={36}
                className="text-amber-600"
                strokeWidth={2}
              />
            </div>

            {/* عنوان */}
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              دسترسی شما محدود شده است
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              حساب کاربری شما در حال حاضر به هیچ بخشی از سیستم
              دسترسی ندارد. لطفاً با مدیر ارشد تماس بگیرید.
            </p>

            {/* اطلاعات کاربر */}
            {user && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/70 p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="
                      w-12 h-12 rounded-2xl
                      bg-gradient-to-br from-slate-100 to-slate-50
                      border border-slate-200
                      flex items-center justify-center
                      flex-shrink-0
                    "
                  >
                    <span className="text-base font-bold text-slate-600">
                      {(user.fname || user.username || '؟')
                        .trim()
                        .charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 text-right flex-1">
                    <div className="text-sm font-bold text-slate-800 truncate">
                      {`${user.fname || ''} ${
                        user.lname || ''
                      }`.trim() || user.username}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {roleLabels[role] || role}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* دکمه‌ها */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="
                  w-full flex items-center justify-center gap-2
                  px-4 py-3 rounded-xl
                  bg-primary-600 text-white
                  text-sm font-bold
                  hover:bg-primary-700 transition-colors
                  cursor-pointer
                "
              >
                <ArrowLeft size={15} strokeWidth={2.4} />
                تلاش مجدد
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  w-full flex items-center justify-center gap-2
                  px-4 py-3 rounded-xl
                  bg-white text-red-600
                  border border-red-200 hover:bg-red-50
                  text-sm font-bold
                  transition-colors cursor-pointer
                "
              >
                <LogOut size={15} strokeWidth={2.4} />
                خروج از حساب
              </button>
            </div>
          </div>
        </div>

        {/* ─── Helper Card ─── */}
        <div
          className="
            bg-blue-50/60 backdrop-blur-sm
            rounded-2xl border border-blue-200
            p-4
          "
        >
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-300/40 flex items-center justify-center flex-shrink-0">
              <Phone size={14} className="text-blue-700" />
            </div>
            <div className="text-xs text-blue-800 leading-relaxed">
              <strong>چرا این پیام را می‌بینم؟</strong>
              <br />
              دسترسی‌های شما توسط مدیر ارشد قابل تنظیم است. اگر
              فکر می‌کنید این اشتباه است، با مدیر ارشد تماس
              بگیرید و درخواست دسترسی کنید.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoAccessPage;