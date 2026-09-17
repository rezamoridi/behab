// src/features/settings/hooks/useCropSettings.js
import { useState, useMemo } from "react";
import { useAgricultureSettings } from "./useAgricultureSettings";

// ============================================================
// ✅ useCropSettings
// منطق مدیریت محصولات + نرخ‌ها + state مدال‌ها
// ============================================================
export const useCropSettings = () => {
  const {
    crops,
    cropWaterRates,
    isLoading,
    addCrop,
    updateCrop,
    deleteCrop,
    addCropWaterRate,
    updateCropWaterRate,
  } = useAgricultureSettings();

  // ============================================
  // UI State
  // ============================================
  const [searchTerm, setSearchTerm] = useState("");
  const [rateModalCrop, setRateModalCrop] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [renameModalCrop, setRenameModalCrop] = useState(null);

  // ============================================
  // Merge crops + rates
  // ============================================
  const cropsWithRate = useMemo(() => {
    const rateMap = {};
    cropWaterRates.forEach((r) => {
      rateMap[r.crop] = r;
    });

    return crops.map((c) => ({
      id: c.id,
      name: c.name,
      isActive: c.is_active,
      rate: rateMap[c.name] || null,
    }));
  }, [crops, cropWaterRates]);

  // ============================================
  // Filter
  // ============================================
  const filteredCrops = useMemo(() => {
    if (!searchTerm.trim()) return cropsWithRate;
    return cropsWithRate.filter((c) => c.name.includes(searchTerm.trim()));
  }, [cropsWithRate, searchTerm]);

  // ============================================
  // Stats
  // ============================================
  const stats = useMemo(() => {
    const total = cropsWithRate.length;
    const active = cropsWithRate.filter((c) => c.isActive).length;
    const withoutRate = cropsWithRate.filter(
      (c) => c.isActive && c.rate === null,
    ).length;
    return { total, active, withoutRate };
  }, [cropsWithRate]);

  // ============================================
  // Handlers — Crops
  // ============================================
  const handleAddCrop = async (name) => {
    await addCrop({ name, is_active: true });
    setAddModalOpen(false);
  };

  const handleRename = async (newName) => {
    if (!renameModalCrop) return;
    await updateCrop(renameModalCrop.id, { name: newName });
    setRenameModalCrop(null);
  };

  const handleToggleActive = async (crop) => {
    await updateCrop(crop.id, { is_active: !crop.isActive });
  };

  const handleDeleteCrop = async (crop) => {
    if (
      window.confirm(
        `حذف محصول «${crop.name}»؟ نرخ‌های مربوطه هم حذف خواهند شد.`,
      )
    ) {
      await deleteCrop(crop.id);
    }
  };

  // ============================================
  // Handlers — Rate
  // ============================================
  const handleSubmitRate = async (payload) => {
    if (!rateModalCrop) return;

    if (rateModalCrop.rate) {
      await updateCropWaterRate(rateModalCrop.name, payload);
    } else {
      await addCropWaterRate({ crop: rateModalCrop.name, ...payload });
    }
    setRateModalCrop(null);
  };

  // ============================================
  // Return
  // ============================================
  return {
    // Data
    crops: cropsWithRate,
    filteredCrops,
    stats,
    isLoading,

    // UI State
    searchTerm,
    setSearchTerm,
    rateModalCrop,
    setRateModalCrop,
    addModalOpen,
    setAddModalOpen,
    renameModalCrop,
    setRenameModalCrop,

    // Handlers
    handleAddCrop,
    handleRename,
    handleToggleActive,
    handleDeleteCrop,
    handleSubmitRate,
  };
};

export default useCropSettings;