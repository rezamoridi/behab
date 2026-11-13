// src/features/sentinel/components/SentinelSearchForm.jsx
import { useState } from 'react';
import {
  SENTINEL_S2_ANALYSES,
  SENTINEL_SENSORS,
} from '../constants';

const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
};

const SentinelSearchForm = ({ onSubmit, loading }) => {
  const [sensor, setSensor] = useState('SENTINEL-2');
  const [bbox, setBbox] = useState({
    w: '51.00',
    s: '35.00',
    e: '51.01',
    n: '35.01',
  });
  const [dateFrom, setDateFrom] = useState(monthAgo());
  const [dateTo, setDateTo] = useState(today());
  const [cloudMax, setCloudMax] = useState(30);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      bbox: [
        Number(bbox.w),
        Number(bbox.s),
        Number(bbox.e),
        Number(bbox.n),
      ],
      sensor,
      date_from: `${dateFrom}T00:00:00Z`,
      date_to: `${dateTo}T23:59:59Z`,
      cloud_max: sensor === 'SENTINEL-2' ? Number(cloudMax) : null,
      page: 1,
      page_size: 20,
    };
    onSubmit(payload);
  };

  const inputCls =
    'w-full px-2.5 py-1.5 rounded-md border border-gray-300 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
      dir="rtl"
    >
      <div>
        <label className="block text-[11px] font-bold text-gray-700 mb-1">
          سنسور
        </label>
        <select
          value={sensor}
          onChange={(e) => setSensor(e.target.value)}
          className={inputCls}
        >
          {SENTINEL_SENSORS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-700 mb-1">
          محدوده (WGS84)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.0001"
            value={bbox.w}
            onChange={(e) => setBbox({ ...bbox, w: e.target.value })}
            placeholder="West"
            className={inputCls}
            dir="ltr"
          />
          <input
            type="number"
            step="0.0001"
            value={bbox.s}
            onChange={(e) => setBbox({ ...bbox, s: e.target.value })}
            placeholder="South"
            className={inputCls}
            dir="ltr"
          />
          <input
            type="number"
            step="0.0001"
            value={bbox.e}
            onChange={(e) => setBbox({ ...bbox, e: e.target.value })}
            placeholder="East"
            className={inputCls}
            dir="ltr"
          />
          <input
            type="number"
            step="0.0001"
            value={bbox.n}
            onChange={(e) => setBbox({ ...bbox, n: e.target.value })}
            placeholder="North"
            className={inputCls}
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            از تاریخ
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={inputCls}
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            تا تاریخ
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputCls}
            dir="ltr"
          />
        </div>
      </div>

      {sensor === 'SENTINEL-2' && (
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            حداکثر ابری ({cloudMax}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cloudMax}
            onChange={(e) => setCloudMax(e.target.value)}
            className="w-full accent-emerald-600"
            dir="ltr"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? 'در حال جستجو...' : 'جستجو'}
      </button>
    </form>
  );
};

export default SentinelSearchForm;