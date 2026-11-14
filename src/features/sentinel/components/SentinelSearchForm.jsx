// src/features/sentinel/components/SentinelSearchForm.jsx
import { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, Loader2 } from 'lucide-react';
import { SENTINEL_SENSORS } from '../constants';

const calculateArea = (w, s, e, n) => {
  const lat = ((s + n) / 2) * (Math.PI / 180);
  const mPerDegLat = 111132.0;
  const mPerDegLon = 111320.0 * Math.cos(lat);
  return Math.abs((e - w) * mPerDegLon * (n - s) * mPerDegLat) / 1_000_000;
};

const SentinelSearchForm = ({ onSubmit, loading, initialBbox }) => {
  const [sensor, setSensor] = useState('SENTINEL-2');
  const [bbox, setBbox] = useState({ w: '48.285', s: '33.680', e: '48.300', n: '33.688' });
  const [dateFrom, setDateFrom] = useState('2026-10-13');
  const [dateTo, setDateTo] = useState('2026-11-13');
  const [cloud, setCloud] = useState(30);

  useEffect(() => {
    if (initialBbox && initialBbox.length === 4) {
      setBbox({
        w: initialBbox[0].toFixed(4),
        s: initialBbox[1].toFixed(4),
        e: initialBbox[2].toFixed(4),
        n: initialBbox[3].toFixed(4),
      });
    }
  }, [initialBbox]);

  const areaKm2 = useMemo(() => {
    const w = parseFloat(bbox.w); const s = parseFloat(bbox.s);
    const e = parseFloat(bbox.e); const n = parseFloat(bbox.n);
    if ([w, s, e, n].some(isNaN) || w >= e || s >= n) return null;
    return calculateArea(w, s, e, n);
  }, [bbox]);

  const inputCls = 'w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      bbox: [parseFloat(bbox.w), parseFloat(bbox.s), parseFloat(bbox.e), parseFloat(bbox.n)],
      sensor,
      date_from: `${dateFrom}T00:00:00Z`,
      date_to: `${dateTo}T23:59:59Z`,
      cloud_max: sensor === 'SENTINEL-2' ? cloud : null,
      page: 1,
      page_size: 20,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">سنسور</label>
        <select value={sensor} onChange={(e) => setSensor(e.target.value)} className={inputCls}>
          {SENTINEL_SENSORS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          محدوده (WGS84)
          {areaKm2 !== null && (
            <span className="mr-2 text-primary-600 font-normal">~ {areaKm2.toFixed(4)} km²</span>
          )}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { key: 's', label: 'عرض جنوبی' },
            { key: 'n', label: 'عرض شمالی' },
            { key: 'w', label: 'طول غربی' },
            { key: 'e', label: 'طول شرقی' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-[10px] text-slate-500 mb-0.5">{label}</label>
              <input
                type="number" step="0.0001"
                value={bbox[key]}
                onChange={(e) => setBbox({ ...bbox, [key]: e.target.value })}
                className={inputCls} dir="ltr"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            <Calendar size={12} className="inline ml-1" /> از تاریخ
          </label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            <Calendar size={12} className="inline ml-1" /> تا تاریخ
          </label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} dir="ltr" />
        </div>
      </div>

      {sensor === 'SENTINEL-2' && (
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">حداکثر ابری ({cloud}%)</label>
          <input
            type="range" min="0" max="100" value={cloud}
            onChange={(e) => setCloud(Number(e.target.value))}
            className="w-full accent-primary-600" dir="ltr"
          />
        </div>
      )}

      <button
        type="submit" disabled={loading}
        className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 shadow-[0_4px_14px_rgba(46,125,50,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        {loading ? 'در حال جستجو...' : 'جستجو'}
      </button>
    </form>
  );
};

export default SentinelSearchForm;