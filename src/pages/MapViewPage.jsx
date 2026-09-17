// src/pages/MapViewPage.jsx
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Plus, Save, X, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import MapComponent from '../features/map/components/MapComponent';
import LocationPicker from '../features/location/components/LocationPicker';
import MapCalculator from '../features/map/components/MapCalculator';
import MapErrorBoundary from '../features/map/components/MapErrorBoundary';
import DraggableFarmWindow from '../features/farm-registration/components/DraggableFarmWindow';

import {
  useFarmsQuery,
  farmKeys,
} from '../features/farm-registration/hooks/useFarmsQuery';
import { useFarmMutation } from '../features/farm-registration/hooks/useFarmMutation';
import { fetchFarmById } from '../services/api/farmApi';
import {
  extractGeometry,
  calculateTotalArea,
} from '../features/farm-registration/utils/geometryUtils';
import { calculateAreaInHectares } from '../features/map/utils/areaCalculations';

// ============================================
// ثابت‌های مشترک
// ============================================
const FARM_LIST_QUERY_PARAMS = {
  page: 1,
  pageSize: 50,
  search: null,
};

// ============================================================
// ✅ نرمال‌سازی geojson به آرایه‌ای از features
// ============================================================
const normalizeGeojsonToFeatures = (geojson) => {
  if (!geojson) return [];

  if (geojson.type === 'FeatureCollection') {
    return geojson.features || [];
  }

  if (Array.isArray(geojson)) {
    return geojson;
  }

  if (geojson.type === 'Feature') {
    return [geojson];
  }

  if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
    return [{ type: 'Feature', properties: {}, geometry: geojson }];
  }

  return [];
};

const MapViewPage = () => {
  // ============================================
  // State - Create/Edit Form
  // ============================================
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [areaHa, setAreaHa] = useState(0);
  const [polygonGeojsons, setPolygonGeojsons] = useState([]);
  const [polygonCount, setPolygonCount] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clearDrawTrigger, setClearDrawTrigger] = useState(0);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFarmId, setEditingFarmId] = useState(null);
  const [editingFarmData, setEditingFarmData] = useState(null);
  const [isLoadingFarm, setIsLoadingFarm] = useState(false);

  const [selectedFarmId, setSelectedFarmId] = useState(null);

  // ✅ آیا قطعات فعلی قبلاً ثبت شده‌اند؟
  const [polygonsSubmitted, setPolygonsSubmitted] = useState(false);

  // ============================================
  // State - Snap to Vertex
  // ============================================
  const [snapEnabled, setSnapEnabled] = useState(false);

  // ============================================
  // State - Geometry Edit Mode
  // ============================================
  const [isGeometryEditMode, setIsGeometryEditMode] = useState(false);
  const [editingGeometryFarm, setEditingGeometryFarm] = useState(null);
  const [editGeometryTrigger, setEditGeometryTrigger] = useState(0);
  const [geometriesToEdit, setGeometriesToEdit] = useState(null);
  const [isSavingGeometry, setIsSavingGeometry] = useState(false);

  // ============================================
  // Refs
  // ============================================
  const isSavingRef = useRef(false);
  const isEditTriggeredRef = useRef(false);

  // ============================================
  // Query Client
  // ============================================
  const queryClient = useQueryClient();

  // ============================================
  // Fetch Farms
  // ============================================
  const { data, isLoading } = useFarmsQuery(FARM_LIST_QUERY_PARAMS);

  const farms = useMemo(() => data?.farms || [], [data]);

  // ============================================
  // Mutations
  // ============================================
  const { updateFarmGeometry } = useFarmMutation();

  // ============================================
  // Location & Polygons handlers
  // ============================================
  const handleLocationSelect = useCallback((location) => {
    if (!location) return;
    const lat = Number(location.lat);
    const lon = Number(location.lon ?? location.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      console.warn('مختصات مکان انتخاب‌شده معتبر نیست:', location);
      return;
    }
    setSelectedLocation({ ...location, lat, lon });
  }, []);

  // ============================================================
  // ✅ به‌روزرسانی پلی‌گون‌ها
  // ============================================================
  const handlePolygonsUpdate = useCallback(
    ({ totalArea, geojsons, count }) => {
      setAreaHa(totalArea || 0);
      setPolygonGeojsons(geojsons || []);
      setPolygonCount(count || 0);

      // ✅ اگر قطعات قبلاً ثبت شده بودند ولی حالا تعداد تغییر کرده،
      // یعنی کاربر قطعه جدیدی رسم کرده → flag را ریست کن
      if (polygonsSubmitted && count > 0) {
        setPolygonsSubmitted(false);
      }
    },
    [polygonsSubmitted]
  );

  // ============================================
  // Farm click (select/deselect)
  // ============================================
  const handleFarmClick = useCallback(
    (farm) => {
      if (isGeometryEditMode) return;

      if (!farm) {
        setSelectedFarmId(null);
        return;
      }

      if (selectedFarmId === farm.farm_id) {
        setSelectedFarmId(null);
      } else {
        setSelectedFarmId(farm.farm_id);
      }
    },
    [selectedFarmId, isGeometryEditMode]
  );

  // ============================================================
  // ✅ شروع ویرایش لایه از روی پاپ‌آپ
  // ============================================================
  const handleFarmEditGeometry = useCallback(
    async (farm) => {
      if (!farm || !farm.farm_id) {
        console.error('❌ Invalid farm for geometry edit');
        return;
      }

      if (isEditTriggeredRef.current) return;
      isEditTriggeredRef.current = true;

      try {
        const cached = queryClient.getQueryData(
          farmKeys.detail(farm.farm_id)
        );
        const farmData =
          cached && cached.geojson
            ? cached
            : await fetchFarmById(farm.farm_id);

        if (!farmData) {
          throw new Error('اطلاعات مزرعه یافت نشد');
        }

        const geojsons = normalizeGeojsonToFeatures(farmData.geojson);

        if (geojsons.length === 0) {
          alert('این مزرعه هندسه‌ای برای ویرایش ندارد.');
          isEditTriggeredRef.current = false;
          return;
        }

        setIsFormOpen(false);
        setIsEditMode(false);
        setEditingFarmId(null);
        setEditingFarmData(null);

        setEditingGeometryFarm(farmData);
        setGeometriesToEdit(geojsons);
        setIsGeometryEditMode(true);
        setSelectedFarmId(farm.farm_id);

        setClearDrawTrigger((prev) => prev + 1);
        setEditGeometryTrigger((prev) => prev + 1);
      } catch (error) {
        console.error('Error entering geometry edit mode:', error);
        alert(
          error?.response?.data?.detail ||
            error?.message ||
            'خطا در بارگذاری لایه. لطفاً دوباره تلاش کنید.'
        );
        setIsGeometryEditMode(false);
        setEditingGeometryFarm(null);
        setGeometriesToEdit(null);
        setSelectedFarmId(null);
      } finally {
        isEditTriggeredRef.current = false;
      }
    },
    [queryClient]
  );

  // ============================================================
  // ✅ ذخیره تغییرات لایه
  // ============================================================
  const handleSaveGeometry = useCallback(async () => {
    if (!editingGeometryFarm || !editingGeometryFarm.farm_id) {
      alert('اطلاعات مزرعه موجود نیست.');
      return;
    }

    if (polygonCount === 0) {
      alert('لطفاً حداقل یک قطعه روی نقشه داشته باشید.');
      return;
    }

    setIsSavingGeometry(true);

    try {
      const finalGeometry = extractGeometry(polygonGeojsons);

      if (!finalGeometry) {
        alert('هندسه معتبر نیست. لطفاً مجدداً تلاش کنید.');
        return;
      }

      const totalArea = calculateTotalArea(polygonGeojsons) || areaHa;
      const finalAreaHa = Number(totalArea.toFixed(4));

      await updateFarmGeometry({
        farmId: editingGeometryFarm.farm_id,
        payload: {
          geojson: finalGeometry,
          area_ha: finalAreaHa,
          polygon_count: polygonCount,
        },
      });

      alert('لایه با موفقیت ذخیره شد.');

      setAreaHa(0);
      setPolygonGeojsons([]);
      setPolygonCount(0);
      setIsGeometryEditMode(false);
      setEditingGeometryFarm(null);
      setGeometriesToEdit(null);
      setSelectedFarmId(null);
      setPolygonsSubmitted(false);

      setClearDrawTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Error saving geometry:', error);
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        'خطا در ذخیره لایه. لطفاً دوباره تلاش کنید.';
      alert(msg);
    } finally {
      setIsSavingGeometry(false);
    }
  }, [
    editingGeometryFarm,
    polygonGeojsons,
    polygonCount,
    areaHa,
    updateFarmGeometry,
  ]);

  // ============================================
  // ✅ لغو ویرایش لایه
  // ============================================
  const handleCancelGeometryEdit = useCallback(() => {
    if (isSavingGeometry) return;

    setAreaHa(0);
    setPolygonGeojsons([]);
    setPolygonCount(0);
    setIsGeometryEditMode(false);
    setEditingGeometryFarm(null);
    setGeometriesToEdit(null);
    setSelectedFarmId(null);
    setPolygonsSubmitted(false);

    setClearDrawTrigger((prev) => prev + 1);
  }, [isSavingGeometry]);

  // ============================================================
  // ویرایش فرم (از پاپ‌آپ)
  // ============================================================
  const handleFarmEdit = useCallback(
    async (farm) => {
      if (!farm || !farm.farm_id) return;
      if (isEditTriggeredRef.current) return;

      isEditTriggeredRef.current = true;

      try {
        setIsEditMode(true);
        setEditingFarmId(farm.farm_id);
        setIsLoadingFarm(true);
        setIsFormOpen(true);
        setPolygonsSubmitted(true);

        const cached = queryClient.getQueryData(
          farmKeys.detail(farm.farm_id)
        );
        const farmData =
          cached && cached.geojson
            ? cached
            : await fetchFarmById(farm.farm_id);

        if (!farmData) {
          throw new Error('اطلاعات مزرعه یافت نشد');
        }

        setEditingFarmData(farmData);

        let area = 0;
        if (farmData.area_ha) {
          area = Number(farmData.area_ha) || 0;
          setAreaHa(area);
        }

        const geojsons = normalizeGeojsonToFeatures(farmData.geojson);
        setPolygonGeojsons(geojsons);
        setPolygonCount(geojsons.length);

        if (geojsons.length > 0 && area === 0) {
          let totalArea = 0;
          geojsons.forEach((g) => {
            try {
              const a = calculateAreaInHectares(g);
              if (a > 0) totalArea += a;
            } catch (e) {
              console.warn('Error calculating area:', e);
            }
          });
          if (totalArea > 0) setAreaHa(totalArea);
        }

        queryClient.setQueryData(farmKeys.detail(farm.farm_id), farmData);
        setSelectedFarmId(farm.farm_id);
      } catch (error) {
        console.error('Error fetching farm:', error);
        alert(
          error?.response?.data?.detail ||
            error?.message ||
            'خطا در دریافت اطلاعات مزرعه. لطفاً مجدداً تلاش کنید.'
        );
        setIsFormOpen(false);
        setIsEditMode(false);
        setEditingFarmId(null);
        setEditingFarmData(null);
        setPolygonsSubmitted(false);
      } finally {
        setIsLoadingFarm(false);
        isEditTriggeredRef.current = false;
      }
    },
    [queryClient]
  );

  // ============================================================
  // ✅ ذخیره فرم (Create/Edit)
  // ============================================================
  const handleSaveFarm = useCallback(
    (savedFarm) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        if (isEditMode) {
          setIsEditMode(false);
          setEditingFarmId(null);
          setEditingFarmData(null);
          setSelectedFarmId(null);
        }

        setPolygonsSubmitted(true);

        queryClient.invalidateQueries({ queryKey: farmKeys.lists() });

        if (savedFarm?.farm_id) {
          queryClient.invalidateQueries({
            queryKey: farmKeys.detail(savedFarm.farm_id),
          });
        }

        isEditTriggeredRef.current = false;
      } catch (error) {
        console.error('Error in handleSaveFarm:', error);
        alert('خطا در به‌روزرسانی. لطفاً مجدداً تلاش کنید.');
      } finally {
        setTimeout(() => {
          isSavingRef.current = false;
        }, 500);
      }
    },
    [isEditMode, queryClient]
  );

  // ============================================
  // Cancel Handler (فرم)
  // ============================================
  const handleCancel = useCallback(() => {
    if (!isEditMode && polygonCount > 0) {
      setClearDrawTrigger((prev) => prev + 1);
      setAreaHa(0);
      setPolygonGeojsons([]);
      setPolygonCount(0);
    }

    setIsEditMode(false);
    setEditingFarmId(null);
    setEditingFarmData(null);
    setIsLoadingFarm(false);
    setIsFormOpen(false);
    setSelectedFarmId(null);
    setPolygonsSubmitted(false);
    isEditTriggeredRef.current = false;
  }, [isEditMode, polygonCount]);

  // ============================================
  // Close Form (دکمه X)
  // ============================================
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setIsEditMode(false);
    setEditingFarmId(null);
    setEditingFarmData(null);
    setSelectedFarmId(null);
    setPolygonsSubmitted(false);
  }, []);

  // ============================================
  // Open Create Form
  // ============================================
  const handleOpenForm = useCallback(() => {
    setIsEditMode(false);
    setEditingFarmId(null);
    setEditingFarmData(null);
    setIsLoadingFarm(false);
    setIsFormOpen(true);
    setSelectedFarmId(null);
    isEditTriggeredRef.current = false;
  }, []);

  // ============================================
  // Toggle Snap
  // ============================================
  const handleToggleSnap = useCallback(() => {
    setSnapEnabled((prev) => !prev);
  }, []);

  // ============================================
  // ✅ محاسبه تعداد قطعات قابل نمایش در دکمه
  // ============================================
  const displayPolygonCount = useMemo(() => {
    if (polygonsSubmitted) return 0;
    return polygonCount;
  }, [polygonsSubmitted, polygonCount]);

  // ============================================
  // Render
  // ============================================
  return (
    <div className="h-full relative" dir="rtl">
      <LocationPicker onLocationSelect={handleLocationSelect} />

      <MapErrorBoundary>
        <MapComponent
          selectedLocation={selectedLocation}
          onPolygonsUpdate={handlePolygonsUpdate}
          savedFarms={farms}
          clearTrigger={clearDrawTrigger}
          onFarmClick={handleFarmClick}
          onFarmEdit={handleFarmEdit}
          onFarmEditGeometry={handleFarmEditGeometry}
          selectedFarmId={selectedFarmId}
          editGeometryTrigger={editGeometryTrigger}
          geometriesToEdit={geometriesToEdit}
          snapEnabled={snapEnabled}
          onToggleSnap={handleToggleSnap}
          snapToggleHidden={isGeometryEditMode || isEditMode}
        />
      </MapErrorBoundary>

      {/* ✅ MapCalculator — مستقل، انتخاب محصول داخل خودش */}
      <MapCalculator
        polygonCount={polygonsSubmitted ? 0 : polygonCount}
        areaHa={polygonsSubmitted ? 0 : areaHa}
        showWater={true}
      />

      {/* نوار حالت ویرایش لایه */}
      {isGeometryEditMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1500] bg-orange-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 font-vazir">
          <Pencil size={16} />
          <span className="text-sm font-medium">
            حالت ویرایش لایه - مزرعه{' '}
            {editingGeometryFarm?.farmer_name || ''}
          </span>
        </div>
      )}

      {/* دکمه باز کردن فرم */}
      {!isEditMode && !isGeometryEditMode && !isFormOpen && (
        <button
          type="button"
          onClick={handleOpenForm}
          className="
            absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]
            px-6 py-3 bg-primary-600 text-white
            rounded-xl font-semibold text-base font-vazir
            shadow-lg shadow-primary-600/40
            hover:bg-primary-700 hover:scale-105
            transition-all duration-200
            flex items-center gap-2
          "
        >
          <Plus size={18} />
          {displayPolygonCount > 0
            ? `ثبت ${displayPolygonCount} قطعه`
            : 'ثبت مزرعه جدید'}
        </button>
      )}

      {/* دکمه‌های ذخیره/انصراف در حالت ویرایش لایه */}
      {isGeometryEditMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-3 font-vazir">
          <button
            type="button"
            onClick={handleCancelGeometryEdit}
            disabled={isSavingGeometry}
            className="
              px-6 py-3 bg-gray-200 text-gray-700
              rounded-xl font-semibold text-base
              hover:bg-gray-300 transition-colors
              disabled:opacity-50
              flex items-center gap-2
            "
          >
            <X size={18} />
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSaveGeometry}
            disabled={isSavingGeometry || polygonCount === 0}
            className="
              px-6 py-3 bg-primary-600 text-white
              rounded-xl font-semibold text-base
              shadow-lg shadow-primary-600/40
              hover:bg-primary-700 hover:scale-105
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              flex items-center gap-2
            "
          >
            {isSavingGeometry ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save size={18} />
                ذخیره لایه
              </>
            )}
          </button>
        </div>
      )}

      {/* Draggable Window */}
      <DraggableFarmWindow
        isOpen={isFormOpen && !isGeometryEditMode}
        onClose={handleCloseForm}
        onCancel={handleCancel}
        onSuccess={handleSaveFarm}
        areaHa={polygonsSubmitted ? 0 : areaHa}
        geojson={polygonGeojsons.length > 0 ? polygonGeojsons : null}
        locationData={selectedLocation}
        isEditMode={isEditMode}
        editingFarmId={editingFarmId}
        isLoading={isLoadingFarm}
        initialData={editingFarmData}
      />

      {/* Global Loading */}
      {isLoading && farms.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-black/70 text-white px-6 py-3 rounded-lg font-vazir text-sm">
          در حال بارگذاری مزارع...
        </div>
      )}
    </div>
  );
};

export default React.memo(MapViewPage);