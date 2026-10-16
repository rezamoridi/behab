// src/features/dashboard/components/QuickAccessGrid.jsx
import { useNavigate } from 'react-router-dom';
import {
  Settings2,
  Users,
  UserCog,
  Layers,
  UserCircle2,
  Map as MapIcon,
  Leaf,
  Sprout,
} from 'lucide-react';
import QuickAccessCard from './QuickAccessCard';
import { usePermissions } from '../../auth/hooks/usePermissions';

// ═══════════════════════════════════════════════════════════
// ALL_ITEMS — هر آیتم با permission داینامیک
//
// ساختار هر آیتم:
//   permission: [resource, action] | null
//   - null → همه کاربران لاگین‌شده
//   - [resource, action] → از can(resource, action) چک می‌شود
// ═══════════════════════════════════════════════════════════
const ALL_ITEMS = [
  // ─── مدیریت کشاورزی (محصولات + نهاده‌ها) ───
  {
    id: 'agri',
    icon: Leaf,
    title: 'مدیریت کشاورزی',
    description: 'بذر، نیازهای زراعی و نهاده‌ها',
    color: 'emerald',
    path: '/agri',
    permission: ['input', 'view'],          // ✅ داینامیک
  },

  // ─── تنظیمات کشاورزی ───
  {
    id: 'agriculture-settings',
    icon: Settings2,
    title: 'تنظیمات کشاورزی',
    description: 'واحدها، مرکز نقشه و لایه پیش‌فرض',
    color: 'primary',
    path: '/settings',
    tab: 'agriculture',
    permission: ['settings', 'view'],       // ✅ داینامیک
  },

  // ─── کشاورزان ───
  {
    id: 'farmers',
    icon: Users,
    title: 'کشاورزان',
    description: 'مدیریت کشاورزان ثبت‌شده',
    color: 'blue',
    path: '/farmers',
    permission: ['farmer', 'view_own'],     // ✅ داینامیک
  },

  // ─── کاربران ───
  {
    id: 'users',
    icon: UserCog,
    title: 'کاربران',
    description: 'مدیریت کاربران و مسئولان سیستم',
    color: 'rose',
    path: '/farmers',
    tab: 'users',
    permission: ['user', 'view'],           // ✅ داینامیک
  },

  // ─── ظاهر لایه‌ها ───
  {
    id: 'layer-style',
    icon: Layers,
    title: 'ظاهر لایه‌ها',
    description: 'شفافیت، رنگ مرز و نوع خط لایه‌های نقشه',
    color: 'purple',
    path: '/settings',
    tab: 'layer-style',
    permission: ['settings', 'view'],       // ✅ داینامیک
  },

  // ─── پروفایل ───
  {
    id: 'profile',
    icon: UserCircle2,
    title: 'پروفایل کاربری',
    description: 'اطلاعات حساب و تغییر رمز عبور',
    color: 'amber',
    path: '/settings',
    tab: 'profile',
    permission: null,                        // ✅ همه کاربران
  },

  // ─── نقشه ───
  {
    id: 'map',
    icon: MapIcon,
    title: 'رفتن به نقشه',
    description: 'مشاهده و مدیریت مزارع روی نقشه',
    color: 'rose',
    path: '/map',
    permission: null,                        // ✅ همه کاربران
  },
];

// ═══════════════════════════════════════════════════════════
// QuickAccessGrid
// ═══════════════════════════════════════════════════════════
const QuickAccessGrid = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();

  // ✅ فیلتر داینامیک
  const items = ALL_ITEMS.filter((item) => {
    if (!item.permission) return true;      // همه
    const [resource, action] = item.permission;
    return can(resource, action);
  });

  const handleClick = (item) => {
    if (item.tab) {
      if (item.path === '/settings') {
        navigate(item.path, { state: { activeTab: item.tab } });
      } else {
        navigate(`${item.path}?tab=${item.tab}`);
      }
    } else {
      navigate(item.path);
    }
  };

  return (
    <div dir="rtl" className="font-vazir">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-gray-900">
          دسترسی سریع
        </h2>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <QuickAccessCard
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            color={item.color}
            onClick={() => handleClick(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickAccessGrid;