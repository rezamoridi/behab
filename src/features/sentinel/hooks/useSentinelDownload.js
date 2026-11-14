// src/features/sentinel/hooks/useSentinelDownload.js
//
// دانلود محافظت‌شده GeoTIFF به‌صورت Blob و ذخیره با نام فایل امن.
// از object URL استفاده می‌کند و بلافاصله پس از دانلود revoke می‌کند.
import { useCallback, useState } from 'react';
import { fetchGeotiffBlob } from '../services/sentinelApi';

const safeFilename = (assetId, analysis) => {
  const safeAnalysis = String(analysis || 'unknown').replace(
    /[^a-zA-Z0-9_-]/g,
    '_',
  );
  const ts = new Date()
    .toISOString()
    .replace(/[-T]|:/g, '')
    .slice(0, 14);
  return `sentinel_${assetId}_${safeAnalysis}_${ts}.tif`;
};

export const useSentinelDownload = () => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);

  const download = useCallback(async (assetId, analysis) => {
    if (!assetId) return;
    setDownloadingId(assetId);
    setError(null);

    let objectUrl = null;
    try {
      const blob = await fetchGeotiffBlob(assetId);
      objectUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = safeFilename(assetId, analysis);
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در دانلود GeoTIFF';
      setError(typeof msg === 'string' ? msg : 'خطا در دانلود');
      // eslint-disable-next-line no-console
      console.error('[useSentinelDownload] failed:', err);
    } finally {
      // revoke بعد از یک تیک — مرورگر هنوز دارد دانلود می‌کند
      if (objectUrl) {
        setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      }
      setDownloadingId(null);
    }
  }, []);

  return {
    download,
    downloadingId,
    error,
    isDownloading: (id) => downloadingId === id,
  };
};
