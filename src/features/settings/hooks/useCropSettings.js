// src/features/settings/hooks/useCropSettings.js
import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAgricultureSettings, cropKeys } from './useAgricultureSettings';
import { DEFAULT_FARM_COLOR, normalizeHex } from '../constants/cropColors';

export const useCropSettings = () => {
  const {
    crops,
    isLoading,
    addCrop,
    updateCrop,
    deleteCrop,
  } = useAgricultureSettings();

  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [editModalCrop, setEditModalCrop] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // ============================================
  // داده‌ها
  // ============================================
  const cropsWithRate = useMemo(() => {
    return crops.map((c) => {
      const hasRate =
        (c.requirement ?? 0) > 0 ||
        (c.price ?? 0) > 0 ||
        (c.fertilizer ?? 0) > 0 ||
        (c.pesticide ?? 0) > 0;

      return {
        id: c.id,
        name: c.name,
        isActive: c.is_active,
        color: normalizeHex(c.color) || DEFAULT_FARM_COLOR,
        requirement: c.requirement,
        price: c.price,
        fertilizer: c.fertilizer,
        pesticide: c.pesticide,
        hasRate,
        rate: {
          requirement: c.requirement,
          price: c.price,
          fertilizer: c.fertilizer,
          pesticide: c.pesticide,
        },
      };
    });
  }, [crops]);

  const filteredCrops = useMemo(() => {
    if (!searchTerm.trim()) return cropsWithRate;
    return cropsWithRate.filter((c) => c.name.includes(searchTerm.trim()));
  }, [cropsWithRate, searchTerm]);

  const stats = useMemo(() => {
    const total = cropsWithRate.length;
    const active = cropsWithRate.filter((c) => c.isActive).length;
    const withoutRate = cropsWithRate.filter(
      (c) => c.isActive && !c.hasRate,
    ).length;
    return { total, active, withoutRate };
  }, [cropsWithRate]);

  // ============================================
  // Handlers
  // ============================================

  const handleAddCrop = async (payload) => {
    const data =
      typeof payload === 'string' ? { name: payload } : payload;

    await addCrop({
      name: data.name,
      color: data.color || DEFAULT_FARM_COLOR,
      is_active: true,
    });

    setAddModalOpen(false);

    // ✅ اطمینان نهایی: force refresh
    queryClient.refetchQueries({ queryKey: cropKeys.lists() });
  };

  const handleToggleActive = async (crop) => {
    await updateCrop(crop.id, { is_active: !crop.isActive });
    queryClient.refetchQueries({ queryKey: cropKeys.lists() });
  };

  const handleDeleteCrop = async (crop) => {
    if (window.confirm(`حذف محصول «${crop.name}»؟`)) {
      await deleteCrop(crop.id);
      queryClient.refetchQueries({ queryKey: cropKeys.lists() });
    }
  };

  const handleSubmitEdit = async (payload) => {
    if (!editModalCrop) return;
    await updateCrop(editModalCrop.id, payload);
    setEditModalCrop(null);
    queryClient.refetchQueries({ queryKey: cropKeys.lists() });
  };

  return {
    crops: cropsWithRate,
    filteredCrops,
    stats,
    isLoading,

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

export default useCropSettings;