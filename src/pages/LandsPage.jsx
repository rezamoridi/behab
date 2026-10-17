// src/pages/LandsPage.jsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import LandsFiltersBar from '../features/lands/components/LandsFiltersBar';
import LandsStatsBar from '../features/lands/components/LandsStatsBar';
import LandsTable from '../features/lands/components/LandsTable';
import FarmDetailsPanel from '../features/dashboard/components/FarmDetailsPanel';
import FarmImportExportBar from '../features/farm-registration/components/FarmImportExportBar';
import FarmImportModal from '../features/farm-registration/components/FarmImportModal';

import {
  useLands,
  useLandsFilters,
} from '../features/lands/hooks/useLands';

import { useDeleteFarmMutation } from '../features/farm-registration/hooks/useFarmMutation';
import { farmImportExportApi } from '../services/api/farmImportExportApi';
import { useToast } from '../shared/components/Toast/ToastProvider';
import { useConfirm } from '../shared/components/ConfirmDialog/ConfirmDialogProvider';

const LandsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  // ─── Filters ───
  const {
    page,
    setPage,
    search,
    setSearch,
    debouncedSearch,
    sortBy,
    setSortBy,
    missingFilter,
    setMissingFilter,
    cropFilter,
    setCropFilter,
    regionFilter,
    setRegionFilter,
    villageFilter,
    setVillageFilter,
    hasActiveFilters,
    resetFilters,
  } = useLandsFilters();

  // ─── UI state ───
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // ─── Data ───
  const {
    farms,
    total,
    stats,
    isLoading,
    isFetching,
    refetch,
  } = useLands({
    page,
    search: debouncedSearch,
    sortBy,
    missingFilter,
    cropFilter,
    regionFilter,
    villageFilter,
  });

  const deleteFarmMutation = useDeleteFarmMutation();

  // ═══════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════

  // ─── Delete ───
  const handleDelete = useCallback(
    async (farm) => {
      const ok = await confirm({
        title: 'حذف زمین',
        message: `آیا از حذف زمین «${farm.farmer_name || farm.farm_id}» اطمینان دارید؟\nاین عمل قابل بازگشت نیست.`,
        confirmText: 'حذف کن',
        cancelText: 'انصراف',
        variant: 'danger',
      });
      if (!ok) return;

      try {
        await deleteFarmMutation.mutateAsync(farm.farm_id);
        toast.success('زمین حذف شد', 'موفق');

        if (String(selectedFarm?.farm_id) === String(farm.farm_id)) {
          setSelectedFarm(null);
        }
        refetch();
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          'خطا در حذف';
        toast.error(
          typeof msg === 'string' ? msg : JSON.stringify(msg),
          'خطا',
        );
      }
    },
    [confirm, deleteFarmMutation, toast, refetch, selectedFarm],
  );

  // ─── View on Map ───
  const handleViewOnMap = useCallback(
    (farm) => {
      navigate('/map', {
        state: { focusFarmId: farm.farm_id },
      });
    },
    [navigate],
  );

  // ─── Edit ───
  const handleEdit = useCallback(
    (farm) => {
      navigate('/map', {
        state: {
          editFarmId: farm.farm_id,
          focusFarmId: farm.farm_id,
        },
      });
    },
    [navigate],
  );

  // ─── Export ───
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await farmImportExportApi.export({
        search: debouncedSearch || null,
        regionId: regionFilter ? Number(regionFilter) : null,
        crop: cropFilter || null,
        includeInputs: true,
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `farms-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('خروجی Excel دانلود شد', 'موفق');
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || 'خطا در خروجی',
        'خطا',
      );
    } finally {
      setIsExporting(false);
    }
  }, [debouncedSearch, regionFilter, cropFilter, toast]);

  // ─── Stats click: filter by missing ───
  const handleFilterMissingRegion = useCallback(() => {
    setMissingFilter(
      missingFilter === 'region' ? 'either' : 'region',
    );
  }, [missingFilter, setMissingFilter]);

  const handleFilterMissingOwner = useCallback(() => {
    setMissingFilter(
      missingFilter === 'owner' ? 'either' : 'owner',
    );
  }, [missingFilter, setMissingFilter]);

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      className="h-full overflow-y-auto pt-20 md:pt-24 pb-28 px-4 md:px-5"
      dir="rtl"
    >
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* ═══════════════════════════════════════════════ */}
        {/* Header                                          */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900">
              مدیریت زمین‌ها
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              لیست، فیلتر و مدیریت همه‌ی زمین‌های ثبت‌شده
            </p>
          </div>

          <FarmImportExportBar
            onImportClick={() => setImportModalOpen(true)}
            filters={{
              search: debouncedSearch || null,
              region_id: regionFilter ? Number(regionFilter) : null,
              crop: cropFilter || null,
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* Stats Bar                                       */}
        {/* ═══════════════════════════════════════════════ */}
        <LandsStatsBar
          stats={stats}
          onFilterMissingRegion={handleFilterMissingRegion}
          onFilterMissingOwner={handleFilterMissingOwner}
        />

        {/* ═══════════════════════════════════════════════ */}
        {/* Main grid: table + detail panel                */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
          {/* ─── Table Card ─── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <LandsFiltersBar
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortChange={setSortBy}
                missingFilter={missingFilter}
                onMissingFilterChange={setMissingFilter}
                cropFilter={cropFilter}
                onCropFilterChange={setCropFilter}
                regionFilter={regionFilter}
                onRegionFilterChange={setRegionFilter}
                villageFilter={villageFilter}
                onVillageFilterChange={setVillageFilter}
                onClearFilters={resetFilters}
                onExport={handleExport}
                isExporting={isExporting}
                onRefresh={refetch}
                isFetching={isFetching}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            <LandsTable
              farms={farms}
              isLoading={isLoading}
              onView={setSelectedFarm}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewOnMap={handleViewOnMap}
              onRowClick={setSelectedFarm}
              selectedFarmId={selectedFarm?.farm_id}
            />

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-[11px] text-gray-500 flex items-center justify-between">
              <span>
                مجموع:{' '}
                <strong className="text-gray-700">
                  {total.toLocaleString('fa-IR')}
                </strong>{' '}
                زمین
              </span>
              {isFetching && !isLoading && (
                <span className="text-[10px] text-primary-600">
                  در حال بروزرسانی...
                </span>
              )}
            </div>
          </div>

          {/* ─── Detail Panel (Desktop) ─── */}
          <div className="hidden lg:block">
            {selectedFarm ? (
              <div className="sticky top-4">
                <FarmDetailsPanel
                  farm={selectedFarm}
                  onClose={() => setSelectedFarm(null)}
                />
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-xl border border-dashed border-gray-200">
                <div className="text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle size={20} />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    برای مشاهده جزئیات،
                    <br />
                    یک زمین را از جدول انتخاب کنید
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* Import Modal                                   */}
      {/* ═══════════════════════════════════════════════ */}
      {importModalOpen && (
        <FarmImportModal
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            refetch();
            setImportModalOpen(false);
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* Mobile Detail Modal                            */}
      {/* ═══════════════════════════════════════════════ */}
      {selectedFarm && (
        <div
          className="lg:hidden fixed inset-0 z-[10000] flex items-end md:items-center justify-center bg-black/40"
          onClick={() => setSelectedFarm(null)}
        >
          <div
            className="w-full md:w-[500px] max-h-[85vh] md:max-h-[80vh] bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <FarmDetailsPanel
              farm={selectedFarm}
              onClose={() => setSelectedFarm(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandsPage;