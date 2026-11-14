// src/features/sentinel/components/SentinelJobStatus.jsx
import { useSentinelJob } from '../hooks/useSentinelJobs';

const SentinelJobStatus = ({ jobId }) => {
  const { data, isLoading } = useSentinelJob(jobId);

  if (!jobId) return null;
  if (isLoading) {
    return (
      <div className="text-xs text-gray-500">در حال دریافت وضعیت...</div>
    );
  }
  if (!data) return null;

  const map = {
    pending: { label: 'در صف', cls: 'bg-gray-100 text-gray-700' },
    running: { label: 'در حال پردازش', cls: 'bg-blue-100 text-blue-800' },
    succeeded: { label: 'آماده', cls: 'bg-emerald-100 text-emerald-800' },
    failed: { label: 'خطا', cls: 'bg-red-100 text-red-800' },
    cancelled: { label: 'لغو شده', cls: 'bg-gray-100 text-gray-500' },
  };
  const meta = map[data.status] || map.pending;

  return (
    <div className={`rounded-lg px-3 py-2 text-xs ${meta.cls}`}>
      <span className="font-bold">job #{data.id}</span> — {meta.label}
      {data.error_message && (
        <div className="mt-1 text-[10px] opacity-80">
          {data.error_message}
        </div>
      )}
    </div>
  );
};

export default SentinelJobStatus;