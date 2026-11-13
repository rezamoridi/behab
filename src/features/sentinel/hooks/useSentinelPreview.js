// src/features/sentinel/hooks/useSentinelPreview.js
import { useEffect, useState } from 'react';
import { fetchPreviewBlob } from '../services/sentinelApi';

/**
 * Fetches a preview as a Blob URL. Auto-revokes on unmount or
 * assetId change — no leak on rapid switching.
 *
 * @returns {{ url: string|null, loading: boolean, error: Error|null }}
 */
export const useSentinelPreview = (assetId) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assetId) {
      setUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl = null;

    setLoading(true);
    setError(null);

    fetchPreviewBlob(assetId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetId]);

  return { url, loading, error };
};