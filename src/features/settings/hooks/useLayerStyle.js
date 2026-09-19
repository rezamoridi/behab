// src/features/settings/hooks/useLayerStyle.js
import { useMemo } from 'react';
import useLocalStorageState from '../../../shared/hooks/useLocalStorageState';

// ============================================================
// انواع خط
// ============================================================
export const LINE_STYLE_OPTIONS = [
  { value: 'solid',    label: 'خط ممتد',    dashArray: null },
  { value: 'dashed',   label: 'خط تیره',    dashArray: '10, 6' },
  { value: 'dotted',   label: 'خط نقطه‌ای', dashArray: '2, 6' },
  { value: 'dashdot',  label: 'تیره-نقطه',  dashArray: '12, 6, 2, 6' },
  { value: 'longdash', label: 'تیره بلند',  dashArray: '20, 8' },
];

// ============================================================
// مقادیر پیش‌فرض
//
// نکته:
// - Fill همیشه از رنگ محصول (کاربر نمی‌تونه تغییرش بده)
// - Stroke: یا همرنگ محصول یا رنگ دلخواه (customStrokeColor)
// ============================================================
export const DEFAULT_LAYER_STYLE = {
  // ─── Fill (همیشه از رنگ محصول) ───
  fillOpacity: 0.25,

  // ─── Stroke ───
  customStrokeColor: false,      // false = همرنگ محصول، true = رنگ دلخواه
  strokeColor: '#2E7D32',        // رنگ مرز وقتی customStrokeColor = true
  strokeWeight: 2.5,
  strokeOpacity: 0.95,
  strokeStyle: 'solid',

  // ─── حالت انتخاب ───
  selectedStrokeColor: '#FF6B35',
  selectedStrokeWeight: 4,
  selectedFillOpacity: 0.5,
  selectedStrokeStyle: 'solid',
};

export const LAYER_STYLE_KEY = 'map_layer_style_v1';

// ============================================================
// Helper: dashArray
// ============================================================
export const getDashArray = (styleName) => {
  const option = LINE_STYLE_OPTIONS.find((o) => o.value === styleName);
  return option?.dashArray ?? null;
};

// ============================================================
// Hook
// ============================================================
export const useLayerStyle = () => {
  const [style, setStyle, clearStyle] = useLocalStorageState(
    LAYER_STYLE_KEY,
    DEFAULT_LAYER_STYLE
  );

  const mergedStyle = useMemo(
    () => ({
      ...DEFAULT_LAYER_STYLE,
      ...(style || {}),
    }),
    [style]
  );

  const updateField = (field, value) => {
    setStyle((prev) => ({
      ...DEFAULT_LAYER_STYLE,
      ...(prev || {}),
      [field]: value,
    }));
  };

  const resetStyle = () => {
    setStyle(DEFAULT_LAYER_STYLE);
  };

  return {
    style: mergedStyle,
    setStyle,
    updateField,
    resetStyle,
    clearStyle,
  };
};

export default useLayerStyle;