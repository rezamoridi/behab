import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { farmSchema, farmUpdateSchema } from '../schemas/farmSchema';
import { defaultFarmFormValues, apiToForm, formToApi } from '../constants/defaultValues';
import { LocationSection } from './sections/LocationSection';
import { FarmerSection } from './sections/FarmerSection';
import { LandSection } from './sections/LandSection';
import { WaterSection } from './sections/WaterSection';
import { useFarmMutation } from '../hooks/useFarmMutation';

// Tab configuration
const TABS = [
  { id: 'location', label: 'موقعیت', component: LocationSection },
  { id: 'farmer', label: 'کشاورز', component: FarmerSection },
  { id: 'land', label: 'زمین', component: LandSection },
  { id: 'water', label: 'شبکه', component: WaterSection },
];

export const FarmFormNew = ({
  initialData = null,
  areaHa = 0,
  geojson = null,
  locationData = null,
  isEditing = false,
  editingFarmId = null,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState('location');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // تبدیل داده‌های اولیه
  const defaultValues = useMemo(() => {
    if (isEditing && initialData) {
      return apiToForm(initialData);
    }
    return defaultFarmFormValues;
  }, [isEditing, initialData]);
  
  // Schema بر اساس حالت
  const schema = useMemo(() => {
    return isEditing ? farmUpdateSchema : farmSchema;
  }, [isEditing]);
  
  // تنظیمات فرم
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });
  
  const { handleSubmit, reset, formState: { errors, isValid } } = methods;
  
  // Mutation
  const { saveFarm, updateFarm } = useFarmMutation();
  
  // وقتی داده‌های ویرایش تغییر می‌کنند، فرم ریست شود
  useEffect(() => {
    if (isEditing && initialData) {
      reset(apiToForm(initialData));
    }
  }, [isEditing, initialData, reset]);
  
  // محاسبه تعداد و مساحت پلی‌گون‌ها
  const polygonCount = useMemo(() => {
    if (!geojson) return 0;
    if (Array.isArray(geojson)) return geojson.length;
    return 1;
  }, [geojson]);
  
  const totalArea = useMemo(() => {
    if (areaHa > 0) return areaHa;
    if (!geojson) return 0;
    
    let total = 0;
    if (Array.isArray(geojson)) {
      geojson.forEach((poly) => {
        const area = poly.properties?.areaHa || poly.properties?.area || 0;
        if (area) total += Number(area);
      });
    }
    return total || areaHa || 0;
  }, [areaHa, geojson]);
  
  // دریافت مساحت هر قطعه
  const getPolygonArea = useCallback((poly) => {
    if (!poly) return 0;
    return poly.properties?.areaHa || poly.properties?.area || 0;
  }, []);
  
  // ارسال فرم
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const payload = formToApi(formData, totalArea, polygonCount, geojson);
      
      let result;
      if (isEditing && editingFarmId) {
        result = await updateFarm(editingFarmId, payload);
      } else {
        result = await saveFarm(payload);
      }
      
      onSuccess?.(result);
      reset(defaultFarmFormValues);
    } catch (err) {
      console.error('خطا در ذخیره:', err);
      setError(err.message || 'خطا در ذخیره مزرعه');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // رندر بخش فعال
  const ActiveSection = TABS.find(t => t.id === activeTab)?.component || LocationSection;
  
  const sectionProps = {
    isSubmitting,
    totalArea,
    polygonCount,
    geojson,
    locationData,
    getPolygonArea,
  };
  
  return (
    <FormProvider {...methods}>
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="flex flex-col h-full"
        dir="rtl"
      >
        {/* نمایش خطا */}
        {error && (
          <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-red-700">❌ {error}</span>
            <button 
              type="button" 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}
        
        {/* تب‌ها */}
        <div className="flex border-b border-gray-200 px-4 bg-gray-50 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium transition-colors
                border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* محتوای فرم - با اسکرول داخلی و ارتفاع ثابت */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[400px]">
          <ActiveSection {...sectionProps} />
        </div>
        
        {/* فوتر - ثابت */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>💧</span>
            <strong className="text-primary-700" dir="ltr">
              {(totalArea * 5000).toLocaleString('fa-IR')} m³
            </strong>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? 'در حال ثبت...' 
                : isEditing 
                  ? 'ذخیره تغییرات' 
                  : 'ثبت نهایی مزرعه'
              }
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};