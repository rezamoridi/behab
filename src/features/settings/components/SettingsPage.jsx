// src/pages/SettingsPage.jsx
// بالای فایل — import جدید:
import RegionSettings from '../features/settings/components/RegionSettings';
import { Map } from 'lucide-react'; // اگر قبلاً نبود

// ... VALID_TABS:
const VALID_TABS = [
  'profile',
  'agriculture',
  'layer-style',
  'crops',
  'regions',    // ✅ جدید
  'users',
  'sms',
];

// ... tabs array:
const tabs = [
  { id: 'profile', label: 'پروفایل کاربری' },
  { id: 'agriculture', label: 'تنظیمات کشاورزی' },
  { id: 'layer-style', label: 'ظاهر لایه‌ها' },
  { id: 'crops', label: 'تنظیمات محصولات' },
  { id: 'regions', label: 'مناطق' },        // ✅ جدید
  { id: 'users', label: 'مدیریت کاربران' },
  { id: 'sms', label: 'تنظیمات پیامک' },
];

// ... در content:
{activeTab === 'regions' && <RegionSettings />}   {/* ✅ جدید */}