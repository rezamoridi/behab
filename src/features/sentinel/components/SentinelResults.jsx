// src/features/sentinel/components/SentinelResults.jsx
const SentinelResults = ({ items = [], onSelect }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-xs text-gray-500">
        نتیجه‌ای برای این محدوده/تاریخ یافت نشد.
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100" dir="rtl">
      {items.map((item) => (
        <button
          key={item.provider_product_id}
          type="button"
          onClick={() => onSelect(item)}
          className="w-full text-right px-4 py-3 hover:bg-emerald-50 transition-colors"
        >
          <div className="text-xs font-bold text-gray-800">
            {item.acquisition_at?.slice(0, 10) || '—'}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-mono" dir="ltr">
            {item.provider_product_id}
          </div>
          {item.cloud_cover != null && (
            <div className="text-[10px] text-gray-500 mt-0.5">
              ابری: {item.cloud_cover.toFixed(1)}%
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default SentinelResults;