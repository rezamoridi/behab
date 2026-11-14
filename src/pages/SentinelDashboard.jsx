// src/pages/SentinelDashboard.jsx
import { useState, useMemo } from 'react';
import {
  Satellite, Map as MapIcon, Target, FolderOpen,
  Settings2, Search, Calendar, ChevronDown, ChevronUp,
  Loader2, ImageIcon, Download, Eye, Trash2, AlertCircle,
  RefreshCw, Filter, Mail, Lock,
} from 'lucide-react';

import SentinelFilesPage from '../features/sentinel/pages/SentinelFilesPage';

// ═══════════════════════════════════════════════════════════
// داده‌های نمونه
// ═══════════════════════════════════════════════════════════
const MOCK_SEARCH_RESULTS = [
  { id: 'S2C_MSIL2A_20261112', sensor: 'SENTINEL-2', date: '2026-11-12', cloud: 5, thumbnail: null },
  { id: 'S2C_MSIL2A_20261108', sensor: 'SENTINEL-2', date: '2026-11-08', cloud: 12, thumbnail: null },
  { id: 'S2C_MSIL2A_20261104', sensor: 'SENTINEL-2', date: '2026-11-04', cloud: 25, thumbnail: null },
];

// ═══════════════════════════════════════════════════════════
// توابع کمکی
// ═══════════════════════════════════════════════════════════
const calculateArea = (w, s, e, n) => {
  const lat = ((s + n) / 2) * (Math.PI / 180);
  const mPerDegLat = 111132.0;
  const mPerDegLon = 111320.0 * Math.cos(lat);
  const widthM = (e - w) * mPerDegLon;
  const heightM = (n - s) * mPerDegLat;
  return Math.abs(widthM * heightM) / 1_000_000;
};

// ═══════════════════════════════════════════════════════════
// TabButton
// ═══════════════════════════════════════════════════════════
const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    type="button"
    role="tab"
    aria-selected={isActive}
    onClick={onClick}
    className={`
      group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl
      text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap
      ${isActive
        ? 'bg-primary-600 text-white shadow-[0_4px_14px_rgba(46,125,50,0.35)]'
        : 'bg-white/60 text-slate-700 hover:bg-white/90 hover:shadow-sm'}
    `}
  >
    {Icon && (
      <Icon
        size={16}
        strokeWidth={isActive ? 2.6 : 2.2}
        className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}
      />
    )}
    <span>{label}</span>
    {isActive && (
      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80" aria-hidden="true" />
    )}
  </button>
);

// ═══════════════════════════════════════════════════════════
// Thumbnail
// ═══════════════════════════════════════════════════════════
const Thumbnail = ({ src, alt = 'preview' }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
        <ImageIcon size={20} className="text-slate-300" strokeWidth={2.2} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
      onError={() => setError(true)}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// SearchResultRow
// ═══════════════════════════════════════════════════════════
const SearchResultRow = ({ item, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(item)}
    className={`
      w-full flex items-center gap-3 p-2.5 rounded-lg border text-right transition-all
      ${isSelected
        ? 'bg-primary-50 border-primary-400 shadow-sm ring-1 ring-primary-300'
        : 'bg-white border-slate-200 hover:border-primary-300 hover:bg-primary-50/30'}
    `}
  >
    <Thumbnail src={item.thumbnail} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-xs font-bold ${isSelected ? 'text-primary-900' : 'text-slate-800'}`}>
          {item.date || '—'}
        </span>
        {item.cloud != null && (
          <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            ابر: {item.cloud.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-[9px] text-slate-500 font-mono truncate" dir="ltr">{item.id}</div>
    </div>
  </button>
);

// ═══════════════════════════════════════════════════════════
// SearchForm
// ═══════════════════════════════════════════════════════════
const SearchForm = ({ onSubmit, loading }) => {
  const [sensor, setSensor] = useState('SENTINEL-2');
  const [bbox, setBbox] = useState({ w: '48.285', s: '33.680', e: '48.300', n: '33.688' });
  const [dateFrom, setDateFrom] = useState('2026-10-13');
  const [dateTo, setDateTo] = useState('2026-11-13');
  const [cloud, setCloud] = useState(30);

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
      sensor, date_from: `${dateFrom}T00:00:00Z`, date_to: `${dateTo}T23:59:59Z`,
      cloud_max: sensor === 'SENTINEL-2' ? cloud : null, page: 1, page_size: 20,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">سنسور</label>
        <select value={sensor} onChange={(e) => setSensor(e.target.value)} className={inputCls}>
          <option value="SENTINEL-2">Sentinel-2 (نوری)</option>
          <option value="SENTINEL-1">Sentinel-1 (رادار)</option>
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
          <input type="range" min="0" max="100" value={cloud} onChange={(e) => setCloud(Number(e.target.value))} className="w-full accent-primary-600" dir="ltr" />
        </div>
      )}

      <button
        type="submit" disabled={loading}
        className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 shadow-[0_4px_14px_rgba(46,125,50,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        {loading ? 'در حال جستجو...' : 'جستجو'}
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════
// CdseCredentialsForm (inline)
// ═══════════════════════════════════════════════════════════
const CdseCredentialsForm = ({ onSave, onClear, status, loading }) => {
  const [email, setEmail] = useState(status?.email || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null); setSuccess(null);
    try {
      await onSave({ email, password });
      setPassword('');
      setSuccess('اعتبارنامه ذخیره و تأیید شد.');
    } catch (err) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('اعتبارنامه CDSE حذف شود؟')) return;
    setBusy(true); setError(null); setSuccess(null);
    try {
      await onClear();
      setEmail(''); setPassword('');
      setSuccess('اعتبارنامه حذف شد.');
    } catch (err) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full pr-9 pl-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-primary-500 outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {status?.configured ? (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-2.5 text-[11px] text-primary-800">
          متصل — {status.email}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800">
          تنظیم نشده — بدون اعتبارنامه، جستجو و پردازش کار نمی‌کند.
        </div>
      )}

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">ایمیل CDSE</label>
        <div className="relative">
          <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required className={inputCls} dir="ltr" autoComplete="username"
            placeholder="your-email@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">پسورد CDSE</label>
        <div className="relative">
          <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required className={inputCls} dir="ltr" autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>
        <div className="text-[9px] text-slate-500 mt-1">پسورد با SECRET_KEY رمزنگاری می‌شود.</div>
      </div>

      {error && <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>}
      {success && <div className="text-[11px] text-primary-700 bg-primary-50 border border-primary-200 rounded-lg p-2">{success}</div>}

      <div className="flex gap-2">
        <button
          type="submit" disabled={busy || loading}
          className="flex-1 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null}
          {busy ? 'در حال بررسی...' : 'ذخیره و تأیید'}
        </button>
        {status?.configured && (
          <button
            type="button" onClick={handleClear} disabled={busy}
            className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 disabled:opacity-50"
          >
            حذف
          </button>
        )}
      </div>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════
// SentinelDashboard
// ═══════════════════════════════════════════════════════════
export default function SentinelDashboard({
  searchResults = MOCK_SEARCH_RESULTS,
  loading = false,
  error = null,
  credentialsStatus = null,
  onSearch,
  onShowOnMap,
  onDownload,
  onDelete,
  onDrawOnMap,
  onRefresh,
  onSaveCredentials,
  onClearCredentials,
}) {
  const [tab, setTab] = useState('search');
  const [showCredentials, setShowCredentials] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDeleteClick = (file) => setConfirmDelete(file);
  const handleConfirmDelete = () => {
    if (confirmDelete) {
      onDelete?.(confirmDelete);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto pt-20 md:pt-24 pb-28 px-4 md:px-5 bg-[#F8FAFC]" dir="rtl">
      <div className="max-w-[1600px] mx-auto space-y-4">

        {/* هدر */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <Satellite size={18} strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-800 truncate">تصاویر ماهواره‌ای</h1>
              <p className="text-[11px] text-slate-500 truncate">
                جستجو، دریافت و مدیریت فایل‌ها — Sentinel-1 / Sentinel-2
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDrawOnMap}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors self-start sm:self-auto shrink-0"
          >
            <MapIcon size={16} strokeWidth={2.2} />
            رسم محدوده روی نقشه
          </button>
        </div>

        {/* نوار تب */}
        <div className="flex items-center gap-2 flex-wrap p-1.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_4px_20px_rgba(31,38,135,0.06)] w-full sm:w-fit overflow-x-auto" role="tablist">
          <TabButton label="جستجو و دریافت" icon={Target} isActive={tab === 'search'} onClick={() => setTab('search')} />
          <TabButton label="مدیریت فایل‌ها" icon={FolderOpen} isActive={tab === 'files'} onClick={() => setTab('files')} />
        </div>

        {/* محتوا */}
        <div className="animate-fadeInUp space-y-4">
          {tab === 'search' && (
            <>
              {/* تنظیمات CDSE */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(31,38,135,0.04)]">
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Settings2 size={14} strokeWidth={2.2} /> تنظیمات اتصال به CDSE
                  </div>
                  <span className="text-[10px] text-slate-500">{showCredentials ? 'بستن' : 'باز کردن'}</span>
                </button>
                {showCredentials && (
                  <div className="p-3 border-t border-slate-100">
                    <CdseCredentialsForm
                      status={credentialsStatus}
                      onSave={onSaveCredentials}
                      onClear={onClearCredentials}
                      loading={loading}
                    />
                  </div>
                )}
              </div>

              {/* فرم جستجو */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-[0_4px_20px_rgba(31,38,135,0.04)]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
                  <Search size={14} strokeWidth={2.2} /> جستجوی تصویر جدید
                </div>
                <SearchForm onSubmit={onSearch} loading={loading} />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-center gap-2">
                  <AlertCircle size={14} strokeWidth={2.2} /> {error}
                </div>
              )}

              {/* نتایج جستجو */}
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-slate-500" strokeWidth={2.2} />
                  <span className="text-sm font-bold text-slate-700">نتیجه جستجو</span>
                  {searchResults.length > 0 && (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{searchResults.length} مورد</span>
                  )}
                </div>
                {searchResults.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <ImageIcon size={32} className="text-slate-300 mx-auto mb-2" strokeWidth={2.2} />
                    <div className="text-sm font-bold text-slate-600">نتیجه‌ای یافت نشد</div>
                    <div className="text-xs text-slate-400 mt-1">محدوده و تاریخ را تغییر دهید.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((item) => (
                      <SearchResultRow
                        key={item.id}
                        item={item}
                        isSelected={selectedProduct?.id === item.id}
                        onSelect={setSelectedProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'files' && (
            <SentinelFilesPage
              onShowOnMap={onShowOnMap}
              onDownload={onDownload}
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          )}
        </div>
      </div>

      {/* تأیید حذف */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertCircle size={20} strokeWidth={2.2} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">حذف فایل</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              آیا از حذف فایل «{confirmDelete.analysis}» مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex gap-2">
              <button
                type="button" onClick={() => setConfirmDelete(null)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button" onClick={handleConfirmDelete}
                className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}