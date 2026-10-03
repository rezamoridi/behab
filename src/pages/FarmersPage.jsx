// src/pages/FarmersPage.jsx
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import FarmersManagement from '../features/dashboard/components/FarmersManagement';

const FarmersPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="
        h-full overflow-y-auto
        pt-20 md:pt-24 pb-32
        px-4 md:px-6
      "
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div
          className="
            relative overflow-hidden
            rounded-3xl
            p-5 md:p-6
            bg-gradient-to-br from-primary-500/15 via-white/40 to-blue-500/10
            backdrop-blur-xl
            border border-white/70
            shadow-[0_8px_32px_rgba(31,38,135,0.10),inset_0_1px_0_rgba(255,255,255,0.95)]
            animate-fadeInUp
          "
        >
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="
                  w-11 h-11 md:w-12 md:h-12 rounded-2xl
                  bg-gradient-to-br from-primary-500/30 to-primary-700/10
                  border border-primary-300/40
                  flex items-center justify-center
                  flex-shrink-0
                  shadow-sm
                "
              >
                <Users size={20} className="text-primary-600" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-slate-900">
                  مدیریت کشاورزان
                </h1>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                  لیست، ویرایش و مدیریت کشاورزان ثبت‌شده در سیستم
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="
                hidden md:flex items-center gap-2
                px-4 py-2 rounded-xl
                bg-white/60 backdrop-blur-sm
                border border-white/70
                text-slate-700 text-xs font-semibold
                shadow-[0_2px_8px_rgba(31,38,135,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
                hover:bg-white/80 transition-colors
                cursor-pointer
                flex-shrink-0
              "
            >
              <ArrowRight size={14} />
              بازگشت به داشبورد
            </button>
          </div>
        </div>

        {/* Farmers Management */}
        <FarmersManagement />
      </div>
    </div>
  );
};

export default FarmersPage;