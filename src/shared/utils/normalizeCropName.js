// src/shared/utils/normalizeCropName.js

/**
 * نرمال‌سازی نام محصول برای مقایسه ایمن
 *
 * مشکلات رایج:
 * - ی عربی (ي) vs ی فارسی (ی)
 * - ک عربی (ك) vs ک فارسی (ک)
 * - ه با ۀ / ة
 * - انواع الف (آ، أ، إ)
 * - ZWNJ (نیم‌فاصله)
 * - فاصله‌های اضافی
 */
export const normalizeCropName = (name) => {
  if (!name) return '';
  return String(name)
    .trim()
    .replace(/ي/g, 'ی')          // ی عربی → فارسی
    .replace(/ك/g, 'ک')          // ک عربی → فارسی
    .replace(/ۀ/g, 'ه')
    .replace(/ة/g, 'ه')
    .replace(/[آأإا]/g, 'ا')     // انواع الف
    .replace(/\u200c/g, '')      // ZWNJ (نیم‌فاصله)
    .replace(/\s+/g, ' ')        // فاصله تکراری
    .toLowerCase();
};

/**
 * ساخت Map از محصولات با کلید نرمال‌شده + نام اصلی
 */
export const buildCropsMap = (crops = []) => {
  const map = {};
  (crops || []).forEach((c) => {
    if (!c?.name) return;
    const normalized = normalizeCropName(c.name);
    map[normalized] = c;
    map[c.name] = c; // fallback با نام اصلی
  });
  return map;
};

/**
 * پیدا کردن محصول از Map با نام نرمال‌شده
 */
export const findCropByName = (cropsMap, name) => {
  if (!name || !cropsMap) return null;
  return (
    cropsMap[normalizeCropName(name)] ||
    cropsMap[name] ||
    null
  );
};

export default normalizeCropName;