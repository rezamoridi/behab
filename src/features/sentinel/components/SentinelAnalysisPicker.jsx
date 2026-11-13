// src/features/sentinel/components/SentinelAnalysisPicker.jsx
import { SENTINEL_S2_ANALYSES } from '../constants';

const SentinelAnalysisPicker = ({ value, onChange, disabled }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-700 mb-1">
      شاخص / نوع خروجی
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-2.5 py-1.5 rounded-md border border-gray-300 text-xs focus:border-emerald-500 outline-none"
    >
      {SENTINEL_S2_ANALYSES.map((a) => (
        <option key={a.id} value={a.id}>
          {a.label} ({a.resolution}m)
        </option>
      ))}
    </select>
  </div>
);

export default SentinelAnalysisPicker;