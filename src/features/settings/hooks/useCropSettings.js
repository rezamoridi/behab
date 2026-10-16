// src/features/settings/hooks/useCropSettings.js
import { useCallback, useMemo, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { cropApi } from "@/services/api/settingsApi";

// ============================================================
// Query Keys
// ============================================================
const CROPS_KEY = ["crops"];
const CROPS_ACTIVE_KEY = ["crops", "active"];

// ============================================================
// API helpers — استفاده از cropApi موجود
// ============================================================
const fetchCrops = async (activeOnly = false) => {
  const { data } = await cropApi.list(activeOnly);
  return data;
};

const createCropApi = async (payload) => {
  const { data } = await cropApi.create(payload);
  return data;
};

const updateCropApi = async ({ id, payload }) => {
  const { data } = await cropApi.update(id, payload);
  return data;
};

const deleteCropApi = async (id) => {
  const { data } = await cropApi.delete(id);
  return data;
};

// ============================================================
// main hook
// ============================================================
export const useCropSettings = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalCrop, setEditModalCrop] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const {
    data: crops = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: CROPS_KEY,
    queryFn: () => fetchCrops(false),
  });

  // ── آمار ──
  const stats = useMemo(() => {
    const total = crops.length;
    const active = crops.filter((c) => c.is_active).length;
    const withoutRate = crops.filter(
      (c) => c.is_active && !hasAnyRate(c)
    ).length;
    return { total, active, withoutRate };
  }, [crops]);

  // ── فیلتر ──
  const filteredCrops = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return crops;
    return crops.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.irrigation_type || "").toLowerCase().includes(q)
    );
  }, [crops, searchTerm]);

  // ── Mutations ──
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: CROPS_KEY });
    queryClient.invalidateQueries({ queryKey: CROPS_ACTIVE_KEY });
  }, [queryClient]);

  const addMutation = useMutation({
    mutationFn: createCropApi,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: updateCropApi,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCropApi,
    onSuccess: invalidate,
  });

  // ── Handlers ──
  const handleAddCrop = useCallback(
    async ({ name, color, irrigation_type = "آبی" }) => {
      await addMutation.mutateAsync({
        name,
        color,
        irrigation_type,
        is_active: true,
        requirement: 0,
        price: 0,
        fertilizer: 0,
        pesticide: 0,
        seed_rate: null,
        crop_yield: null,
        nitrogen: null,
        phosphate: null,
        potassium: null,
        machinery_primary_tillage: null,
        machinery_secondary_tillage: null,
        machinery_planting: null,
        machinery_spraying: null,
        machinery_fertilizing: null,
        machinery_harvesting: null,
      });
      setAddModalOpen(false);
    },
    [addMutation]
  );

  const handleToggleActive = useCallback(
    async (crop) => {
      await updateMutation.mutateAsync({
        id: crop.id,
        payload: { is_active: !crop.is_active },
      });
    },
    [updateMutation]
  );

  const handleDeleteCrop = useCallback(
    async (crop) => {
      if (
        !window.confirm(
          `حذف محصول «${crop.name}» (${crop.irrigation_type || "آبی"})؟`
        )
      )
        return;
      await deleteMutation.mutateAsync(crop.id);
    },
    [deleteMutation]
  );

  const handleSubmitEdit = useCallback(
    async (payload) => {
      if (!editModalCrop) return;
      await updateMutation.mutateAsync({
        id: editModalCrop.id,
        payload,
      });
      setEditModalCrop(null);
    },
    [editModalCrop, updateMutation]
  );

  return {
    crops,
    filteredCrops,
    stats,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    editModalCrop,
    setEditModalCrop,
    addModalOpen,
    setAddModalOpen,
    handleAddCrop,
    handleToggleActive,
    handleDeleteCrop,
    handleSubmitEdit,
  };
};

// ── helper ──
const hasAnyRate = (crop) =>
  [
    "requirement",
    "fertilizer",
    "pesticide",
    "price",
    "seed_rate",
    "crop_yield",
    "nitrogen",
    "phosphate",
    "potassium",
    "machinery_primary_tillage",
    "machinery_secondary_tillage",
    "machinery_planting",
    "machinery_spraying",
    "machinery_fertilizing",
    "machinery_harvesting",
  ].some((k) => {
    const v = crop[k];
    return v !== null && v !== undefined && Number(v) > 0;
  });