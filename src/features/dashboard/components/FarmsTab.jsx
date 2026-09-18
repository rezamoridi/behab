// src/features/dashboard/components/FarmsTab.jsx
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, X, Eye } from 'lucide-react';

import { useFarmsQuery } from '../../farm-registration/hooks/useFarmsQuery';
import { useDeleteFarmMutation } from '../../farm-registration/hooks/useFarmMutation';
import FarmsTable from './FarmsTable';
import FarmsTableSkeleton from './FarmsTableSkeleton';
import FarmDetailsPanel from './FarmDetailsPanel';
import FarmsStatsBar from './FarmsStatsBar';
import Drawer from '../../../shared/components/Drawer/Drawer';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

const FARM_LIST_QUERY_PARAMS = {
  page: 1,
  pageSize: 100,
  search: null,
};

const FarmsTab = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [deletingFarmId, setDeletingFarmId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } =
    useFarmsQuery(FARM_LIST_QUERY_PARAMS);

  const farms = useMemo(() => data?.farms || [], [data]);

  const deleteFarmMutation = useDeleteFarmMutation();

  const filteredFarms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return farms;

    return farms.filter((f) => {
      return (
        (f.farmer_name || '').toLowerCase().includes(term) ||
        (f.crop || '').toLowerCase().includes(term) ||
        (f.village || '').toLowerCase().includes(term) ||
        (f.county || '').toLowerCase().includes(term) ||
        (f.province || '').toLowerCase().includes(term) ||
        (f.farm_id || '').toLowerCase().includes(term)
      );
    });
  }, [farms, searchTerm]);

  const selectedFarm = useMemo(() => {
    if (!selectedFarmId) return null;
    return (
      farms.find(
        (f) => String(f.farm_id) === String(selectedFarmId)
      ) || null
    );
  }, [selectedFarmId, farms]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleViewOnMap = useCallback(
    (farm) => {
      if (!farm?.farm_id) return;
      navigate('/map', { state: { focusFarmId: farm.farm_id } });
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (farm) => {
      if (!farm?.farm_id) return;
      navigate('/map', { state: { editFarmId: farm.farm_id } });
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (farm) => {
      if (!farm?.farm_id) return;

      const ok = await confirm({
        title: 'حذف زمین',
        message: `آیا از حذف زمین «${farm.farmer_name || 'بدون نام'}» اطمینان دارید؟ این عمل قابل بازگشت نیست.`,
        confirmText: 'حذف کن',
        cancelText: 'انصراف',
        variant: 'danger',
      });

      if (!ok) return;

      setDeletingFarmId(farm.farm_id);

      try {
        await deleteFarmMutation.mutateAsync(farm.farm_id);

        if (String(selectedFarmId) === String(farm.farm_id)) {
          setSelectedFarmId(null);
          setDrawerOpen(false);
        }

        toast.success(
          `زمین «${farm.farmer_name || 'بدون نام'}» با موفقیت حذف شد`,
          'حذف موفق'
        );
      } catch (err) {
        const raw =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'خطا در حذف زمین';

        const finalMsg =
          typeof raw === 'object' && raw !== null
            ? raw.message || raw.detail || JSON.stringify(raw)
            : raw;

        toast.error(finalMsg, 'خطا در حذف');
      } finally {
        setDeletingFarmId(null);
      }
    },
    [confirm, deleteFarmMutation, selectedFarmId, toast]
  );

  const handleRowClick = useCallback(
    (farm) => {
      const farmId = farm?.farm_id ?? null;
      const sameId = String(farmId) === String(selectedFarmId);

      if (sameId) {
        setSelectedFarmId(null);
        setDrawerOpen(false);
      } else {
        setSelectedFarmId(farmId);
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setDrawerOpen(true);
        }
      }
    },
    [selectedFarmId]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedFarmId(null);
    setDrawerOpen(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const hasSearch = searchTerm.trim().length > 0;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="h-full flex flex-col p-4 gap-3" dir="rtl">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* Row 1: Stats + Search + Actions                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        {/* Stats */}
        <FarmsStatsBar farms={farms} />

        {/* Search + Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="جستجوی کشاورز، محصول، روستا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-64 pr-9 pl-8 py-2 rounded-lg
                border border-gray-200 text-sm bg-white
                focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all
              "
              aria-label="جستجو"
            />
            {hasSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="
                  absolute left-2 top-1/2 -translate-y-1/2
                  p-1 rounded-md text-gray-400
                  hover:bg-gray-100 hover:text-gray-600
                  transition-colors
                "
                aria-label="پاک کردن جستجو"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="
              p-2 rounded-lg bg-white border border-gray-200
              text-gray-500 hover:bg-gray-50 hover:text-gray-700
              transition-colors
              disabled:opacity-50 disabled:cursor-wait
            "
            title="بروزرسانی"
            aria-label="بروزرسانی لیست"
          >
            <RefreshCw
              size={16}
              className={isFetching ? 'animate-spin' : ''}
            />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Result count                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      {hasSearch && (
        <div className="text-xs text-gray-500 flex-shrink-0">
          {filteredFarms.length > 0 ? (
            <>
              <span className="font-semibold text-gray-700">
                {filteredFarms.length.toLocaleString('fa-IR')}
              </span>
              <span> نتیجه برای «{searchTerm}»</span>
            </>
          ) : (
            <span>نتیجه‌ای برای «{searchTerm}» یافت نشد</span>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Main Split: Details (Right) + Table (Left)             */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3 min-h-0">
        {/* ─── Details Panel — سمت راست (شروع RTL) ─── */}
        <div className="hidden lg:flex flex-col min-h-0">
          {selectedFarm ? (
            <div className="flex-1 min-h-0 animate-scaleIn">
              <FarmDetailsPanel
                farm={selectedFarm}
                onClose={handleClosePanel}
              />
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
                  <Eye size={20} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  برای دیدن جزئیات،
                  <br />
                  یک زمین را انتخاب کنید
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Table — سمت چپ ─── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <FarmsTableSkeleton rows={6} />
            ) : (
              <FarmsTable
                farms={filteredFarms}
                isLoading={false}
                selectedFarmId={selectedFarmId}
                deletingFarmId={deletingFarmId}
                onRowClick={handleRowClick}
                onViewOnMap={handleViewOnMap}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddNew={() => navigate('/map')}
              />
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Mobile Drawer                                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Drawer
        isOpen={drawerOpen && !!selectedFarm}
        onClose={() => setDrawerOpen(false)}
        title={
          selectedFarm
            ? `جزئیات: ${selectedFarm.farmer_name || 'بدون نام'}`
            : ''
        }
      >
        {selectedFarm && (
          <FarmDetailsPanel
            farm={selectedFarm}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </Drawer>
    </div>
  );
};

export default FarmsTab;