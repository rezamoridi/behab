// src/features/farm-registration/schemas/farmSchema.js
import { z } from 'zod';

// ============================================
// Regex ها
// ============================================
const NATIONAL_ID_REGEX = /^\d{10}$/;
const PHONE_REGEX = /^09\d{9}$/;

// ============================================
// Schema اصلی فرم مزرعه
// ============================================
export const farmSchema = z
  .object({
    // ---------- موقعیت ----------
    province: z.string().min(1, 'استان را انتخاب کنید'),
    county: z.string().min(1, 'شهرستان را انتخاب کنید'),
    bakhsh: z.string().optional().default(''),
    dehestan: z.string().optional().default(''),
    village: z.string().optional().default(''),

    // ---------- اطلاعات کشاورز ----------
    farmerName: z
      .string()
      .min(2, 'نام کشاورز باید حداقل ۲ حرف باشد')
      .max(100, 'نام کشاورز حداکثر ۱۰۰ حرف باشد'),
    nationalId: z
      .string()
      .regex(NATIONAL_ID_REGEX, 'کد ملی باید ۱۰ رقم باشد'),
    phone: z
      .string()
      .regex(PHONE_REGEX, 'شماره تماس باید با ۰۹ شروع شده و ۱۱ رقم باشد'),

    // ---------- مشخصات زمین ----------
    landType: z.string().optional().default(''),
    crop: z.string().optional().default(''),
    irrigationType: z
      .union([z.literal('aabi'), z.literal('dim'), z.literal('')])
      .optional()
      .default(''),

    // ---------- منابع آب ----------
    waterSources: z.array(z.string()).default([]),
    irrigationSystems: z.array(z.string()).default([]),

    // ---------- وضعیت شبکه ----------
    studyArea: z.string().optional().default(''),
    coverageStatus: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.irrigationType === 'aabi' && data.waterSources.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['waterSources'],
        message: 'حداقل یک منبع تأمین آب انتخاب کنید',
      });
    }
  });

// ============================================
// Schema برای ویرایش
// ============================================
export const farmUpdateSchema = farmSchema;

// ============================================
// Schemas جزئی
// ============================================
export const locationSchema = z.object({
  province: z.string().min(1, 'استان را انتخاب کنید'),
  county: z.string().min(1, 'شهرستان را انتخاب کنید'),
});

export const farmerSchema = z.object({
  farmerName: z.string().min(2, 'نام کشاورز باید حداقل ۲ حرف باشد'),
  nationalId: z.string().regex(NATIONAL_ID_REGEX, 'کد ملی باید ۱۰ رقم باشد'),
  phone: z.string().regex(PHONE_REGEX, 'شماره تماس نامعتبر است'),
});