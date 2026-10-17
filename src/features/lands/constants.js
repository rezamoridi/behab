// src/features/lands/constants.js

// ═══════════════════════════════════════════════════════════
// تنظیمات صفحه
// ═══════════════════════════════════════════════════════════
export const LANDS_PAGE_SIZE = 20;

// ═══════════════════════════════════════════════════════════
// گزینه‌های فیلتر
// ═══════════════════════════════════════════════════════════
export const FILTER_OPTIONS = {
  missing: [
    { value: 'either', label: 'همه' },
    { value: 'region', label: 'بدون منطقه' },
    { value: 'owner', label: 'بدون مالک' },
    { value: 'both', label: 'بدون هر دو' },
  ],
};

// ═══════════════════════════════════════════════════════════
// گزینه‌های مرتب‌سازی
// ═══════════════════════════════════════════════════════════
export const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'oldest', label: 'قدیمی‌ترین' },
  { value: 'area_desc', label: 'بزرگ‌ترین مساحت' },
  { value: 'area_asc', label: 'کوچک‌ترین مساحت' },
];

// ═══════════════════════════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════════════════════════
export const landKeys = {
  all: ['lands'],
  lists: () => [...landKeys.all, 'list'],
  list: (filters) => [...landKeys.lists(), filters],
  stats: () => [...landKeys.all, 'stats'],
};

export default {
  LANDS_PAGE_SIZE,
  FILTER_OPTIONS,
  SORT_OPTIONS,
  landKeys,
};