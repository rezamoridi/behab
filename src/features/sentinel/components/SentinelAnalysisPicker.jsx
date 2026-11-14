// src/features/sentinel/components/SentinelAnalysisPicker.jsx
import { getAnalysesForSensor } from '../constants';

const SentinelAnalysisPicker = ({ value, onChange, disabled, sensor = 'SENTINEL-2' }) => {
  const analyses = getAnalysesForSensor(sensor);
  const current = analyses.find((a) => a.id === value);

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-700 mb-1">شاخص / نوع خروجی</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none disabled:opacity-50"
      >
        {analyses.map((a) => (
          <option key={a.id} value={a.id}>{a.label} ({a.resolution}m)</option>
        ))}
      </select>
      {current?.description && (
        <div className="mt-1.5 text-[10px] leading-relaxed text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2">
          {current.description}
        </div>
      )}
    </div>
  );
};

export default SentinelAnalysisPicker;