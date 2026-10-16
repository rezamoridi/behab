// src/features/agri/hooks/useInputs.js
import { useCallback, useMemo, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { inputApi } from '../../../services/api/inputApi';

// ═══════════════════════════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════════════════════════
const INPUTS_KEY = ['inputs'];

// ═══════════════════════════════════════════════════════════
// API helpers
// ═══════════════════════════════════════════════════════════
const fetchInputs = async () => {
  const { data } = await inputApi.list({});
  return data;
};

const createInputApi = async (payload) => {
  const { data } = await inputApi.create(payload);
  return data;
};

const updateInputApi = async ({ id, payload }) => {
  const { data } = await inputApi.update(id, payload);
  return data;
};

const deleteInputApi = async (id) => {
  const { data } = await inputApi.delete(id);
  return data;
};

// ═══════════════════════════════════════════════════════════
// main hook
// ═══════════════════════════════════════════════════════════
export const useInputs = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editModalInput, setEditModalInput] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const {
    data: inputs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: INPUTS_KEY,
    queryFn: fetchInputs,
  });

  // ── آمار ──
  const stats = useMemo(() => {
    const total = inputs.length;
    const active = inputs.filter((i) => i.is_active).length;
    const fertilizers = inputs.filter(
      (i) => i.category === 'fertilizer'
    ).length;
    const pesticides = inputs.filter(
      (i) => i.category === 'pesticide'
    ).length;
    const seeds = inputs.filter((i) => i.category === 'seed').length;
    return { total, active, fertilizers, pesticides, seeds };
  }, [inputs]);

  // ── فیلتر ──
  const filteredInputs = useMemo(() => {
    let list = inputs;

    if (categoryFilter) {
      list = list.filter((i) => i.category === categoryFilter);
    }

    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q)
    );
  }, [inputs, searchTerm, categoryFilter]);

  // ── Mutations ──
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: INPUTS_KEY });
  }, [queryClient]);

  const addMutation = useMutation({
    mutationFn: createInputApi,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: updateInputApi,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInputApi,
    onSuccess: invalidate,
  });

  // ── Handlers ──
  const handleAddInput = useCallback(
    async (payload) => {
      await addMutation.mutateAsync(payload);
      setAddModalOpen(false);
    },
    [addMutation]
  );

  const handleToggleActive = useCallback(
    async (item) => {
      await updateMutation.mutateAsync({
        id: item.id,
        payload: { is_active: !item.is_active },
      });
    },
    [updateMutation]
  );

  const handleDeleteInput = useCallback(
    async (item) => {
      if (!window.confirm(`حذف نهاده «${item.name}»؟`)) return;
      await deleteMutation.mutateAsync(item.id);
    },
    [deleteMutation]
  );

  const handleSubmitEdit = useCallback(
    async (payload) => {
      if (!editModalInput) return;
      await updateMutation.mutateAsync({
        id: editModalInput.id,
        payload,
      });
      setEditModalInput(null);
    },
    [editModalInput, updateMutation]
  );

  return {
    inputs,
    filteredInputs,
    stats,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    editModalInput,
    setEditModalInput,
    addModalOpen,
    setAddModalOpen,
    handleAddInput,
    handleToggleActive,
    handleDeleteInput,
    handleSubmitEdit,
  };
};

export default useInputs;