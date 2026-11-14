// src/features/sentinel/hooks/useSentinelPreview.js
import { useEffect, useState } from 'react';
import { fetchPreviewBlob } from '../services/sentinelApi';

export const useSentinelPreview = (assetId) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assetId) { setUrl(null); setError(null); setLoading(false); return; }
    let cancelled = false; let objectUrl = null;
    setLoading(true); setError(null);
    fetchPreviewBlob(assetId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetId]);

  return { url, loading, error };
};