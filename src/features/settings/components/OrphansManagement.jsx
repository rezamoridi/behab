// src/features/settings/components/OrphansManagement.jsx
import { useState, useMemo, useCallback } from 'react';
import {
  AlertCircle,
  Layers,
  UserPlus,
  Search,
  X,
  Loader2,
  MapPin,
  Wheat,
  CheckSquare,
  Square,
  RefreshCw,
  Users,
} from 'lucide-react';

import {
  useOrphansSummaryQuery,
  useOrphanFarmsQuery,
  useOrphanFarmersQuery,
  useBulkAssignRegionMutation,
  useBulkAssignOwnerMutation,
} from '../../admin/hooks/useOrphans';
import { useRegionsQuery } from '../../regions/hooks/useRegions';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../../services/api/settingsApi';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ═══════════════════════════════════════════════════════════
// KPI Card
// ═══════════════════════════════════════════════════════════
const KpiCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100">
    <span
      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
    >
      <Icon size={17} strokeWidth={2.2} />
    </span>
    <div className="min-w-0">
      <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
      <div className="text-lg font-bold text-gray-900 tabular-nums leading-none">
        {value}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// Filter Bar
// ═══════════════════════════════════════════════════════════
const MissingFilter = ({ value, onChange }) => {
  const options = [
    { value: 'either', label: 'همه (بدون منطقه یا مالک)' },
    { value: 'region', label: 'بدون منطقه' },
    { value: 'owner', label: 'بدون مالک' },
    { value: 'both', label: 'بدون هر دو' },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        px-3 py-2 rounded-lg border border-gray-200
        text-xs bg-white cursor-pointer
        focus:border-primary-500 focus:ring-2 focus:ring-primary-100
        outline-none transition-all
      "
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

// ═══════════════════════════════════════════════════════════
// Bulk Assign Modal
// ═══════════════════════════════════════════════════════════
const BulkAssignModal = ({
  mode,  // 'region' | 'owner'
  selectedFarms,
  selectedFarmers,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: regions = [] } = useRegionsQuery({ activeOnly: true });

  const { data: usersData = [] } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      const res = await settingsApi.getUsers();
      return res.data?.items || res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const assignableUsers = useMemo(
    () =>
      usersData.filter(
        (u) =>
          u.role === 'dehyar' ||
          u.role === 'manager' ||
          u.role === 'super_admin',
      ),
    [usersData],
  );

  const bulkRegionMutation = useBulkAssignRegionMutation();
  const bulkOwnerMutation = useBulkAssignOwnerMutation();

  const totalItems = selectedFarms.length + selectedFarmers.length;

  const handleSubmit = async () => {
    if (mode === 'region' && !selectedRegionId) {
      toast.warning('لطفاً منطقه را انتخاب کنید', 'توجه');
      return;
    }
    if (mode === 'owner' && !selectedUserId) {
      toast.warning('لطفاً کاربر را انتخاب کنید', 'توجه');
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (mode === 'region') {
        result = await bulkRegionMutation.mutateAsync({
          farmIds: selectedFarms,
          farmerIds: selectedFarmers,
          regionId: Number(selectedRegionId),
        });
      } else {
        result = await bulkOwnerMutation.mutateAsync({
          farmIds: selectedFarms,
          farmerIds: selectedFarmers,
          userId: Number(selectedUserId),
        });
      }
      toast.success(result.message, 'موفق');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در اختصاص';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRegionMode = mode === 'region';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isRegionMode
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              {isRegionMode ? <Layers size={16} /> : <UserPlus size={16} />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                {isRegionMode ? 'اختصاص منطقه' : 'اختصاص مالک'}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {totalItems.toLocaleString('fa-IR')} آیتم انتخاب شده
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* خلاصه انتخاب */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
            {selectedFarms.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Wheat size={12} className="text-primary-600" />
                <span className="text-gray-700">
                  {selectedFarms.length.toLocaleString('fa-IR')} مزرعه
                </span>
              </div>
            )}
            {selectedFarmers.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Users size={12} className="text-blue-600" />
                <span className="text-gray-700">
                  {selectedFarmers.length.toLocaleString('fa-IR')} کشاورز
                </span>
              </div>
            )}
          </div>

          {/* Selector */}
          {isRegionMode ? (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                منطقه
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                disabled={isSubmitting}
                className="
                  w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                  text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                  outline-none transition-all cursor-pointer
                "
              >
                <option value="">— انتخاب کنید —</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                کاربر (مالک)
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={isSubmitting}
                className="
                  w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                  text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                  outline-none transition-all cursor-pointer
                "
              >
                <option value="">— انتخاب کنید —</option>
                {assignableUsers.map((u) => {
                  const name =
                    `${u.fname || ''} ${u.lname || ''}`.trim() ||
                    u.username;
                  return (
                    <option key={u.id} value={u.id}>
                      {name} ({u.role})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (isRegionMode ? !selectedRegionId : !selectedUserId)
            }
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isRegionMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            اعمال
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
const OrphansManagement = () => {
  const toast = useToast();
  const confirm = useConfirm();

  // State
  const [activeType, setActiveType] = useState('farms'); // 'farms' | 'farmers'
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [missingFilter, setMissingFilter] = useState('either');
  const [page, setPage] = useState(1);

  const [selectedFarmIds, setSelectedFarmIds] = useState(new Set());
  const [selectedFarmerIds, setSelectedFarmerIds] = useState(new Set());

  const [assignModal, setAssignModal] = useState(null); // 'region' | 'owner' | null

  // Debounce
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page on filter change
  useMemo(() => {
    setPage(1);
  }, [missingFilter, activeType]);

  // Queries
  const { data: summary } = useOrphansSummaryQuery();

  const farmsQuery = useOrphanFarmsQuery({
    page,
    pageSize: 20,
    search: debouncedSearch || null,
    missing: missingFilter,
    enabled: activeType === 'farms',
  });

  const farmersQuery = useOrphanFarmersQuery({
    page,
    pageSize: 20,
    search: debouncedSearch || null,
    missing: missingFilter,
    enabled: activeType === 'farmers',
  });

  const isLoading =
    activeType === 'farms' ? farmsQuery.isLoading : farmersQuery.isLoading;
  const items =
    activeType === 'farms'
      ? farmsQuery.data?.items || []
      : farmersQuery.data?.items || [];
  const total =
    activeType === 'farms'
      ? farmsQuery.data?.total || 0
      : farmersQuery.data?.total || 0;

  // Selection helpers
  const allSelected =
    items.length > 0 && items.every((item) =>
      activeType === 'farms'
        ? selectedFarmIds.has(item.id)
        : selectedFarmerIds.has(item.id),
    );

  const toggleAll = () => {
    if (allSelected) {
      if (activeType === 'farms') setSelectedFarmIds(new Set());
      else setSelectedFarmerIds(new Set());
    } else {
      const newSet = new Set(items.map((i) => i.id));
      if (activeType === 'farms') setSelectedFarmIds(newSet);
      else setSelectedFarmerIds(newSet);
    }
  };

  const toggleItem = (id) => {
    if (activeType === 'farms') {
      setSelectedFarmIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setSelectedFarmerIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedFarmIds(new Set());
    setSelectedFarmerIds(new Set());
  };

  // Handle tab change
  const handleTypeChange = (type) => {
    setActiveType(type);
    clearSelection();
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
  };

  // Total selection count
  const totalSelected =
    selectedFarmIds.size + selectedFarmerIds.size;

  // Modal handlers
  const handleOpenAssign = (mode) => {
    if (totalSelected === 0) {
      toast.warning('لطفاً ابتدا مواردی را انتخاب کنید', 'توجه');
      return;
    }
    setAssignModal(mode);
  };

  const handleAssignSuccess = () => {
    clearSelection();
    farmsQuery.refetch?.();
    farmersQuery.refetch?.();
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <KpiCard
            icon={Wheat}
            label="مزارع بدون منطقه"
            value={summary.farms_missing_region.toLocaleString('fa-IR')}
            color="text-amber-700 bg-amber-50"
          />
          <KpiCard
            icon={Wheat}
            label="مزارع بدون مالک"
            value={summary.farms_missing_owner.toLocaleString('fa-IR')}
            color="text-rose-700 bg-rose-50"
          />
          <KpiCard
            icon={Users}
            label="کشاورزان بدون منطقه"
            value={summary.farmers_missing_region.toLocaleString('fa-IR')}
            color="text-amber-700 bg-amber-50"
          />
          <KpiCard
            icon={Users}
            label="کشاورزان بدون مالک"
            value={summary.farmers_missing_owner.toLocaleString('fa-IR')}
            color="text-rose-700 bg-rose-50"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertCircle
          size={14}
          className="text-amber-600 flex-shrink-0 mt-0.5"
        />
        <div className="text-xs text-amber-800 leading-relaxed">
          <strong>داده‌های بدون منطقه یا مالک</strong> معمولاً از قبل
          از migration یا حذف کاربران ایجاد می‌شوند. از این صفحه
          می‌توانید به‌صورت گروهی به آن‌ها منطقه یا مالک اختصاص دهید.
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Type Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => handleTypeChange('farms')}
            className={`
              flex items-center gap-2 px-5 py-3 text-xs font-bold
              border-b-2 transition-all
              ${
                activeType === 'farms'
                  ? 'border-primary-600 text-primary-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Wheat size={14} />
            مزارع
            {summary?.total_farms > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
                {summary.total_farms.toLocaleString('fa-IR')}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('farmers')}
            className={`
              flex items-center gap-2 px-5 py-3 text-xs font-bold
              border-b-2 transition-all
              ${
                activeType === 'farmers'
                  ? 'border-primary-600 text-primary-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Users size={14} />
            کشاورزان
            {summary?.total_farmers > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
                {summary.total_farmers.toLocaleString('fa-IR')}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 p-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pr-9 pl-8 py-2 rounded-lg
                border border-gray-200 text-sm bg-white
                focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all
              "
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:bg-gray-100"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <MissingFilter value={missingFilter} onChange={setMissingFilter} />

          <button
            type="button"
            onClick={() => {
              farmsQuery.refetch?.();
              farmersQuery.refetch?.();
            }}
            disabled={isLoading}
            className="
              p-2 rounded-lg bg-white border border-gray-200
              text-gray-500 hover:bg-gray-50 hover:text-gray-700
              transition-colors disabled:opacity-50
            "
            title="بروزرسانی"
          >
            <RefreshCw
              size={16}
              className={isLoading ? 'animate-spin' : ''}
            />
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {totalSelected > 0 && (
          <div
            className="
              flex items-center justify-between gap-3
              px-4 py-2.5
              bg-gradient-to-l from-purple-500/15 via-white to-blue-500/10
              border-b border-purple-200
            "
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <CheckSquare size={13} className="text-purple-700" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {totalSelected.toLocaleString('fa-IR')} مورد انتخاب شده
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenAssign('region')}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  bg-purple-500/15 hover:bg-purple-500/25
                  text-purple-800 text-[11px] font-bold
                  border border-purple-400/40
                  transition-colors cursor-pointer
                "
              >
                <Layers size={12} />
                اختصاص منطقه
              </button>

              <button
                type="button"
                onClick={() => handleOpenAssign('owner')}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  bg-blue-500/15 hover:bg-blue-500/25
                  text-blue-800 text-[11px] font-bold
                  border border-blue-400/40
                  transition-colors cursor-pointer
                "
              >
                <UserPlus size={12} />
                اختصاص مالک
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="
                  flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                  text-slate-600 hover:text-slate-800 hover:bg-white/60
                  text-[11px] font-medium
                  transition-colors cursor-pointer
                "
              >
                <X size={12} />
                لغو
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-primary-600 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={20} />
              </div>
              {debouncedSearch
                ? 'موردی با این مشخصات یافت نشد'
                : 'هیچ داده‌ای بدون منطقه یا مالک نیست ✅'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="w-10 px-3 py-2.5">
                    <button
                      type="button"
                      onClick={toggleAll}
                      className="w-5 h-5 rounded flex items-center justify-center border-2 transition-colors"
                      style={{
                        backgroundColor: allSelected ? '#2e7d32' : '#fff',
                        borderColor: allSelected ? '#2e7d32' : '#cbd5e1',
                      }}
                    >
                      {allSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase">
                    #
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase">
                    {activeType === 'farms' ? 'کشاورز / کد' : 'نام'}
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase">
                    موقعیت
                  </th>
                  <th className="text-center px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase">
                    منطقه
                  </th>
                  <th className="text-center px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase">
                    مالک
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const isSelected =
                    activeType === 'farms'
                      ? selectedFarmIds.has(item.id)
                      : selectedFarmerIds.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`
                        cursor-pointer transition-colors
                        ${
                          isSelected
                            ? 'bg-primary-50/60'
                            : 'hover:bg-gray-50/80'
                        }
                      `}
                    >
                      <td className="px-3 py-2.5">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center border-2 transition-colors"
                          style={{
                            backgroundColor: isSelected
                              ? '#2e7d32'
                              : '#fff',
                            borderColor: isSelected
                              ? '#2e7d32'
                              : '#cbd5e1',
                          }}
                        >
                          {isSelected && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-400 text-xs">
                        {index + 1 + (page - 1) * 20}
                      </td>
                      <td className="px-3 py-2.5">
                        {activeType === 'farms' ? (
                          <div>
                            <div className="text-xs font-semibold text-gray-800">
                              {item.farmer_name || 'بدون نام'}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              {item.farm_id?.slice(0, 12)}…
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs font-semibold text-gray-800">
                              {`${item.fname || ''} ${item.lname || ''}`.trim() ||
                                'بدون نام'}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              {item.national_id}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {activeType === 'farms' ? (
                          <div className="flex items-center gap-1 text-[11px] text-gray-600">
                            <MapPin size={10} className="text-gray-400" />
                            <span>
                              {item.province || '—'}
                              {item.county ? ` / ${item.county}` : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-gray-600">
                            <Wheat size={10} className="text-gray-400" />
                            <span>
                              {item.farm_count.toLocaleString('fa-IR')}{' '}
                              مزرعه
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {item.has_region ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            ✓ دارد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">
                            ✗ ندارد
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {item.has_owner ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            ✓ دارد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold">
                            ✗ ندارد
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer + Pagination */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <span className="text-[11px] text-gray-500">
            مجموع:{' '}
            <strong className="text-gray-700">
              {total.toLocaleString('fa-IR')}
            </strong>
          </span>

          {total > 20 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md text-gray-600 hover:bg-white disabled:opacity-40"
              >
                ›
              </button>
              <span className="text-xs text-gray-600 tabular-nums px-2">
                {page.toLocaleString('fa-IR')} /{' '}
                {Math.ceil(total / 20).toLocaleString('fa-IR')}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((p) =>
                    Math.min(Math.ceil(total / 20), p + 1),
                  )
                }
                disabled={page >= Math.ceil(total / 20)}
                className="p-1.5 rounded-md text-gray-600 hover:bg-white disabled:opacity-40"
              >
                ‹
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {assignModal && (
        <BulkAssignModal
          mode={assignModal}
          selectedFarms={Array.from(selectedFarmIds)}
          selectedFarmers={Array.from(selectedFarmerIds)}
          onClose={() => setAssignModal(null)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
};

export default OrphansManagement;