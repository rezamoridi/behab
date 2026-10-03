// src/features/dashboard/components/QuickAccessGrid.jsx
import { useNavigate } from 'react-router-dom';
import {
  Settings2,
  Sprout,
  Users,
  Layers,
  UserCircle2,
  Map as MapIcon,
} from 'lucide-react';
import QuickAccessCard from './QuickAccessCard';

const ITEMS = [
  {
    id: 'agriculture-settings',
    icon: Settings2,
    title: 'تنظیمات کشاورزی',
    description: 'واحدها، مرکز نقشه و لایه پیش‌فرض',
    color: 'primary',
    path: '/settings',
    tab: 'agriculture',
  },
  {
    id: 'crops',
    icon: Sprout,
    title: 'مدیریت محصولات',
    description: 'افزودن محصول، رنگ لایه و نرخ‌های مصرفی',
    color: 'emerald',
    path: '/settings',
    tab: 'crops',
  },
  {
    id: 'users',
    icon: Users,
    title: 'مدیریت کاربران',
    description: 'افزودن، ویرایش و حذف کاربران سیستم',
    color: 'blue',
    path: '/settings',
    tab: 'users',
  },
  {
    id: 'layer-style',
    icon: Layers,
    title: 'ظاهر لایه‌ها',
    description: 'شفافیت، رنگ مرز و نوع خط لایه‌های نقشه',
    color: 'purple',
    path: '/settings',
    tab: 'layer-style',
  },
  {
    id: 'profile',
    icon: UserCircle2,
    title: 'پروفایل کاربری',
    description: 'اطلاعات حساب و تغییر رمز عبور',
    color: 'amber',
    path: '/settings',
    tab: 'profile',
  },
  {
    id: 'map',
    icon: MapIcon,
    title: 'رفتن به نقشه',
    description: 'مشاهده و مدیریت مزارع روی نقشه',
    color: 'rose',
    path: '/map',
  },
];

/**
 * QuickAccessGrid
 * شبکه کارت‌های دسترسی سریع در داشبورد.
 */
const QuickAccessGrid = () => {
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.tab) {
      navigate(item.path, { state: { activeTab: item.tab } });
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
        {ITEMS.map((item) => (
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