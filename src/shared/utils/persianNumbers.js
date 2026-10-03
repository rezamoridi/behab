// src/shared/utils/persianNumbers.js

/**
 * تبدیل ارقام انگلیسی به فارسی
 * "0912" → "۰۹۱۲"
 */
export const toPersianDigits = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
};

/**
 * تبدیل ارقام فارسی و عربی به انگلیسی
 * "۰۹۱۲" → "0912"
 * "٠٩١٢" → "0912"
 */
export const toEnglishDigits = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
};

/**
 * فقط ارقام (پس از تبدیل به انگلیسی)
 * "۰۹۱۲-۳۴" → "091234"
 */
export const onlyDigits = (value) => {
  if (!value) return '';
  return toEnglishDigits(value).replace(/\D/g, '');
};

export default toPersianDigits;