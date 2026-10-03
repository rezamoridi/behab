// src/features/farm-registration/panel/FarmPanelContent.jsx
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { FarmFormContainer } from '../forms/FarmFormContainer';
import { useFarmsQuery } from '../hooks/useFarmsQuery';
import { useFarmPanel } from './FarmPanelContext';
import useSessionState from '../../../shared/hooks/useSessionState';

const FARM_LIST_QUERY_PARAMS = {
  page: 1,
  pageSize: 100,
  search: null,
};

/**
 * FarmPanelContent
 * محتوای پنل ثبت/ویرایش زمین.
 *
 * state ها از sessionStorage (هماهنگ با MapViewPage):
 *   - map_selected_farm_id   → برای حالت ویرایش
 *   - map_pending_geojson    → برای geojson زمین در حال رسم
 *   - map_pending_area       → برای area_ha
 *   - map_selected_location  → برای locationData
 */
const FarmPanelContent = () => {
  const location = useLocation();
  const { isOpen } = useFarmPanel();

  // ── state مشترک با MapViewPage ──
  const [selectedFarmId] = useSessionState(
    'map_selected_farm_id',
    null,
  );

  const [pendingGeojson] = useSessionState(
    'map_pending_geojson',
    null,
  );

  const [pendingArea] = useSessionState('map_pending_area', 0);

  const [selectedLocation] = useSessionState(
    'map_selected_location',
    null,
  );

  // ── farm ها ──
  const { data: farmsData, isLoading: farmsLoading } = useFarmsQuery(
    FARM_LIST_QUERY_PARAMS,
  );

  const savedFarms = useMemo(
    () => farmsData?.farms || [],
    [farmsData],
  );

  // ── حالت ویرایش ──
  const [editingFarmId, setEditingFarmId] = useState(null);

  const navEditFarmId = location.state?.editFarmId || null;

  useEffect(() => {
    const nextId = navEditFarmId || selectedFarmId || null;
    if (!nextId) return;

    const timer = setTimeout(() => {
      setEditingFarmId(nextId);
    }, 0);

    return () => clearTimeout(timer);
  }, [navEditFarmId, selectedFarmId]);

  const editingFarm = useMemo(() => {
    if (!editingFarmId) return null;
    return (
      savedFarms.find(
        (f) => String(f.farm_id) === String(editingFarmId),
      ) || null
    );
  }, [editingFarmId, savedFarms]);

  // ── محاسبه polygon count ──
  const polygonCount = useMemo(() => {
    if (!pendingGeojson) return 0;
    if (Array.isArray(pendingGeojson)) return pendingGeojson.length;
    return 1;
  }, [pendingGeojson]);

  // ── geojson و areaHa نهایی ──
  const finalGeojson = editingFarm?.geojson || pendingGeojson || null;
  const finalAreaHa = editingFarm?.area_ha || pendingArea || 0;

  if (!isOpen) return null;

  return (
    <div className="h-full">
      <FarmFormContainer
        initialData={editingFarm}
        areaHa={finalAreaHa}
        geojson={finalGeojson}
        locationData={selectedLocation}
        isEditing={!!editingFarm}
        editingFarmId={editingFarmId}
        isLoading={farmsLoading}
        onSuccess={() => {
          setEditingFarmId(null);
        }}
        onCancel={() => {
          setEditingFarmId(null);
        }}
      />
    </div>
  );
};

export default FarmPanelContent;