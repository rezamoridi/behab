// src/features/conversations/components/SmsTab.jsx
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

import SmsStatsBar from './SmsStatsBar';
import SmsLogFilters from './SmsLogFilters';
import SmsLogTable from './SmsLogTable';
import SmsLogDetail from './SmsLogDetail';

import {
  useSmsLogsQuery,
  useSmsStatsQuery,
  useDeleteSmsLogMutation,
  useResendSmsLogMutation,
} from '../hooks/useSmsLogs';

import { smsLogApi } from '../../../services/api/smsLogApi';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { PAGE_SIZE } from '../constants';

const SmsTab = () => {
  const toast = useToast();

  // ─── Filters ───
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ─── Selection ───
  const [selectedLog, setSelectedLog] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // ─── Debounce search ───
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Reset page on filter change ───
  useEffect(() => {
    setPage(1);
  }, [kind, status]);

  // ─── Queries ───
  const {
    data,
    isLoading,
    isFetching,
  } = useSmsLogsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || null,
    kind: kind || null,
    status: status || null,
  });

  const { data: stats, isLoading: statsLoading } = useSmsStatsQuery({});

  // ─── Mutations ───
  const deleteMutation = useDeleteSmsLogMutation();
  const resendMutation = useResendSmsLogMutation();

  // ─── Handlers ───
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await smsLogApi.export({
        search: debouncedSearch || null,
        kind: kind || null,
        status: status || null,
      });

      // Blob download
      const blob = new Blob([response.data], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sms-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('خروجی با موفقیت دانلود شد', 'موفق');
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || 'خطا در خروجی',
        'خطا',
      );
    } finally {
      setIsExporting(false);
    }
  }, [debouncedSearch, kind, status, toast]);

  const handleDelete = useCallback(
    async (log) => {
      try {
        await deleteMutation.mutateAsync(log.id);
        toast.success('پیامک حذف شد', 'موفق');
        setSelectedLog(null);
      } catch (err) {
        toast.error(
          err?.response?.data?.detail || 'خطا در حذف',
          'خطا',
        );
      }
    },
    [deleteMutation, toast],
  );

  const handleResend = useCallback(
    async (log) => {
      try {
        const result = await resendMutation.mutateAsync(log.id);
        if (result.success) {
          toast.success('پیامک مجدداً ارسال شد', 'موفق');
        } else {
          toast.error(result.message || 'ارسال ناموفق', 'خطا');
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.detail || 'خطا در ارسال مجدد',
          'خطا',
        );
      }
    },
    [resendMutation, toast],
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setKind('');
    setStatus('');
  }, []);

  const hasActiveFilters = !!(debouncedSearch || kind || status);

  const logs = data?.items || [];
  const totalPages = data?.total_pages || 1;
  const total = data?.total || 0;

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      {/* Stats */}
      <SmsStatsBar stats={stats} isLoading={statsLoading} />

      {/* Filters */}
      <SmsLogFilters
        search={search}
        onSearchChange={setSearch}
        kind={kind}
        onKindChange={setKind}
        status={status}
        onStatusChange={setStatus}
        onExport={handleExport}
        isExporting={isExporting}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Main: List + Detail */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3 min-h-0">
        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-auto">
            <SmsLogTable
              logs={logs}
              selectedId={selectedLog?.id}
              onRowClick={setSelectedLog}
              isLoading={isLoading}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
              <span className="text-[11px] text-gray-500">
                مجموع:{' '}
                <strong className="text-gray-700">
                  {total.toLocaleString('fa-IR')}
                </strong>{' '}
                پیامک
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="
                    p-1.5 rounded-md text-gray-600
                    hover:bg-white hover:shadow-sm
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                >
                  <ChevronRight size={14} />
                </button>

                <span className="text-xs text-gray-600 tabular-nums px-2">
                  {page.toLocaleString('fa-IR')} از{' '}
                  {totalPages.toLocaleString('fa-IR')}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages || isFetching}
                  className="
                    p-1.5 rounded-md text-gray-600
                    hover:bg-white hover:shadow-sm
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail — Desktop */}
        <div className="hidden lg:flex flex-col min-h-0">
          {selectedLog ? (
            <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <SmsLogDetail
                log={selectedLog}
                onClose={() => setSelectedLog(null)}
                onDelete={handleDelete}
                onResend={handleResend}
                isDeleting={deleteMutation.isPending}
                isResending={resendMutation.isPending}
              />
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
                  <X size={20} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  برای دیدن جزئیات،
                  <br />
                  یک پیامک را انتخاب کنید
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail — Mobile Modal */}
      {selectedLog && (
        <div className="lg:hidden fixed inset-0 z-[10000] flex items-end md:items-center justify-center bg-black/40">
          <div className="w-full md:w-[500px] max-h-[85vh] md:max-h-[80vh] bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <SmsLogDetail
              log={selectedLog}
              onClose={() => setSelectedLog(null)}
              onDelete={handleDelete}
              onResend={handleResend}
              isDeleting={deleteMutation.isPending}
              isResending={resendMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsTab;