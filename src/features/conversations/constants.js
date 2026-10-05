// src/features/conversations/constants.js

// ============================================
// SMS Kinds
// ============================================
export const SMS_KIND_LABELS = {
  farmer_invitation: 'دعوت کشاورز',
  otp_login: 'کد تایید ورود',
  password_reset: 'بازیابی رمز',
  test: 'تست',
  custom: 'سایر',
};

export const SMS_KIND_COLORS = {
  farmer_invitation: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  otp_login: 'bg-sky-50 text-sky-700 border-sky-200',
  password_reset: 'bg-amber-50 text-amber-700 border-amber-200',
  test: 'bg-slate-50 text-slate-700 border-slate-200',
  custom: 'bg-gray-50 text-gray-700 border-gray-200',
};

// ============================================
// SMS Statuses
// ============================================
export const SMS_STATUS_LABELS = {
  sent: 'ارسال شده',
  failed: 'خطا',
  pending: 'در انتظار',
};

export const SMS_STATUS_COLORS = {
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
};

// ============================================
// Filter options
// ============================================
export const KIND_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'farmer_invitation', label: 'دعوت کشاورز' },
  { value: 'otp_login', label: 'کد تایید ورود' },
  { value: 'password_reset', label: 'بازیابی رمز' },
  { value: 'test', label: 'تست' },
];

export const STATUS_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'sent', label: 'ارسال شده' },
  { value: 'failed', label: 'خطا' },
  { value: 'pending', label: 'در انتظار' },
];

export const PAGE_SIZE = 20;