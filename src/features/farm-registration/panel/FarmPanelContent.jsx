// src/features/farm-registration/panel/FarmPanelContent.jsx
import { useCallback, useEffect, useMemo } from "react";
import { FarmFormContainer } from "../forms/FarmFormContainer";
import {
  useFarmsQuery,
  useFarmQuery,
  useFarmerQuery,
} from "../hooks/useFarmsQuery";
import { FARM_LIST_QUERY_PARAMS } from "../hooks/farmQueryKeys";
import { useFarmPanel } from "./FarmPanelContext";
import useSessionState from "../../../shared/hooks/useSessionState";

const FarmPanelContent = () => {
  // ✅ خواندن state از Context (پایدار)
  const { 
    isOpen, 
    closePanel, 
    editingFarmId, 
    setEditingFarmId 
  } = useFarmPanel();

  // ── state مشترک با MapViewPage ──
  const [, setSelectedFarmId] = useSessionState("map_selected_farm_id", null);

  const [pendingGeojson, setPendingGeojson] = useSessionState(
    "map_pending_geojson",
    null,
  );

  const [pendingArea, setPendingArea] = useSessionState("map_pending_area", 0);

  const [selectedLocation, setSelectedLocation] = useSessionState(
    "map_selected_location",
    null,
  );

  // ── واکشی مستقیم مزرعه با ID ──
  const { data: fetchedFarm, isLoading: farmDetailLoading } = useFarmQuery(
    editingFarmId,
    { enabled: !!editingFarmId },
  );

  // ── fallback: لیست صفحه‌بندی‌شده ──
  const { data: farmsData, isLoading: farmsLoading } = useFarmsQuery({
    ...FARM_LIST_QUERY_PARAMS,
    enabled: !!editingFarmId && !fetchedFarm,
  });

  const listFarm = useMemo(() => {
    if (!editingFarmId) return null;
    const savedFarms = farmsData?.farms || [];
    return (
      savedFarms.find((f) => String(f.farm_id) === String(editingFarmId)) ||
      null
    );
  }, [editingFarmId, farmsData]);

  // ── مزرعه ویرایشی نهایی ──
  const editingFarm = fetchedFarm ?? listFarm ?? null;

  // ── واکشی مستقل کشاورز ──
  const farmerId = editingFarm?.farmer_id ?? null;

  const {
    data: fetchedFarmer,
    isLoading: farmerLoading,
    error: farmerError,
  } = useFarmerQuery(farmerId, { enabled: !!farmerId });

  // ── ترکیب مزرعه + کشاورز ──
  const editingFarmWithFarmer = useMemo(() => {
    if (!editingFarm) return null;
    if (!fetchedFarmer) return editingFarm;

    return {
      ...editingFarm,
      
      // ✅ فیلدهای استاندارد که apiToForm در FarmFormContainer انتظار دارد:
      fname: fetchedFarmer.fname ?? editingFarm.fname,
      lname: fetchedFarmer.lname ?? editingFarm.lname,
      phone_number: fetchedFarmer.phone_number ?? editingFarm.phone_number,
      national_id: fetchedFarmer.national_id ?? editingFarm.national_id,

      // ✅ فیلدهای کمکی (برای اطمینان از سازگاری در سایر بخش‌ها)
      farmer_first_name: fetchedFarmer.fname ?? editingFarm.fname,
      farmer_last_name: fetchedFarmer.lname ?? editingFarm.lname,
      farmer_phone: fetchedFarmer.phone_number ?? editingFarm.phone_number,
      farmer_national_id:
        fetchedFarmer.national_id ?? editingFarm.national_id,
    };
  }, [editingFarm, fetchedFarmer]);

  // ── پاک‌سازی session state ──
  const clearMapSessionState = useCallback(() => {
    setSelectedFarmId(null);
    setPendingGeojson(null);
    setPendingArea(0);
    setSelectedLocation(null);
  }, [
    setSelectedFarmId,
    setPendingGeojson,
    setPendingArea,
    setSelectedLocation,
  ]);

  // ═══════════════════════════════════════════════════════════
  // ✅ گوش دادن به event 'farm:edit-cancel'
  // وقتی کاربر در حالت ویرایش، زمین جدید رسم می‌کند و تایید می‌کند.
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleCancelEdit = () => {
      setEditingFarmId(null);
    };

    window.addEventListener("farm:edit-cancel", handleCancelEdit);
    return () =>
      window.removeEventListener("farm:edit-cancel", handleCancelEdit);
  }, [setEditingFarmId]);

  // ── مقادیر نهایی ──
  const isEditing = !!editingFarmWithFarmer;

  const finalGeojson = isEditing
    ? editingFarmWithFarmer?.geojson ?? pendingGeojson ?? null
    : pendingGeojson ?? editingFarmWithFarmer?.geojson ?? null;

  const finalAreaHa = isEditing
    ? editingFarmWithFarmer?.area_ha ?? pendingArea ?? 0
    : pendingArea ?? editingFarmWithFarmer?.area_ha ?? 0;

  // ── ترکیب loading ──
  const combinedLoading = farmDetailLoading || farmsLoading || farmerLoading;

  // ── تشخیص ۴۰۳ ──
  const isForbidden = farmerError?.response?.status === 403;

  if (!isOpen) return null;

  return (
    <div className="h-full">
      {isForbidden && (
        <div
          className="
            mx-3 mt-3 px-3 py-2.5 rounded-xl
            bg-amber-50 border border-amber-200
            text-[11px] text-amber-800 leading-relaxed
            font-vazir
          "
          dir="rtl"
          role="alert"
        >
          دسترسی به اطلاعات کامل کشاورز محدود است. فقط داده‌های موجود نمایش داده
          می‌شود.
        </div>
      )}

      <FarmFormContainer
        key={editingFarmId ?? "new"}
        initialData={editingFarmWithFarmer}
        areaHa={finalAreaHa}
        geojson={finalGeojson}
        locationData={selectedLocation}
        isEditing={isEditing}
        editingFarmId={editingFarmId}
        isLoading={combinedLoading}
        onSuccess={() => {
          // ✅ پنل باز می‌ماند
          setEditingFarmId(null);
          clearMapSessionState();
        }}
        onCancel={() => {
          setEditingFarmId(null);
          clearMapSessionState();

          try {
            window.dispatchEvent(
              new CustomEvent("farm:geometry-reset", {
                detail: { reason: "cancel" },
              }),
            );
          } catch (err) {
            console.warn("cancel dispatch failed:", err);
          }

          closePanel();
        }}
      />
    </div>
  );
};

export default FarmPanelContent;