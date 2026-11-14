// src/features/sentinel/components/CdseCredentialsForm.jsx
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getCdseCredentialStatus, setCdseCredential, clearCdseCredential } from '../services/sentinelApi';

const CdseCredentialsForm = () => {
  const [status, setStatus] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getCdseCredentialStatus()
      .then((s) => { setStatus(s); setEmail(s.email || ''); })
      .catch((e) => setError(e?.response?.data?.detail || e.message));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null); setSuccess(null);
    try {
      const s = await setCdseCredential({ email, password });
      setStatus(s); setPassword('');
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
      await clearCdseCredential();
      setStatus({ configured: false }); setEmail(''); setPassword('');
      setSuccess('اعتبارنامه حذف شد.');
    } catch (err) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all';

  return (
    <form onSubmit={handleSave} className="space-y-3" dir="rtl">
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
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} dir="ltr" autoComplete="username" />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">پسورد CDSE</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputCls} dir="ltr" autoComplete="current-password" />
        <div className="text-[9px] text-slate-500 mt-1">پسورد با SECRET_KEY رمزنگاری می‌شود.</div>
      </div>

      {error && <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>}
      {success && <div className="text-[11px] text-primary-700 bg-primary-50 border border-primary-200 rounded-lg p-2">{success}</div>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="flex-1 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {busy ? <Loader2 size={14} className="animate-spin" /> : null}
          {busy ? 'در حال بررسی...' : 'ذخیره و تأیید'}
        </button>
        {status?.configured && (
          <button type="button" onClick={handleClear} disabled={busy} className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 disabled:opacity-50">
            حذف
          </button>
        )}
      </div>
    </form>
  );
};

export default CdseCredentialsForm;