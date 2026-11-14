// src/pages/SentinelPage.jsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import SentinelDashboard from './SentinelDashboard';
import { useSentinelSearch } from '../features/sentinel/hooks/useSentinelSearch';
import { useSentinelAreas } from '../features/sentinel/hooks/useSentinelLibrary';
import { useSentinelJob } from '../features/sentinel/hooks/useSentinelJobs';
import {
  downloadGeotiffAsFile,
  downloadGeotiffByJob,
  deleteAsset,
  createSentinelJob,
  getCdseCredentialStatus,
  setCdseCredential,
  clearCdseCredential,
} from '../features/sentinel/services/sentinelApi';

export default function SentinelPage() {
  const navigate = useNavigate();
  const searchMut = useSentinelSearch();
  const { data: areas = [], refetch: refetchAreas } = useSentinelAreas();

  const [credentialsStatus, setCredentialsStatus] = useState(null);
  const [lastSearchPayload, setLastSearchPayload] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [createError, setCreateError] = useState(null);

  const { data: job } = useSentinelJob(jobId);

  useEffect(() => {
    getCdseCredentialStatus()
      .then(setCredentialsStatus)
      .catch(() => setCredentialsStatus({ configured: false }));
  }, []);

  const handleSearch = async (payload) => {
    setJobId(null);
    setCreateError(null);
    setLastSearchPayload(payload);
    try {
      const res = await searchMut.mutateAsync(payload);
      return res?.items || [];
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message);
    }
  };

  const handleShowOnMap = ({ assetId, bounds, analysis }) => {
    navigate('/map', {
      state: {
        sentinelAssetId: assetId,
        sentinelBounds: bounds,
        sentinelAnalysis: analysis,
      },
    });
  };

  const handleDownload = async (file) => {
    try {
      if (file?.id) {
        await downloadGeotiffAsFile(file.id, `sentinel_${file.analysis || 'data'}_${file.id}.tif`);
      } else if (jobId) {
        await downloadGeotiffByJob(jobId);
      }
    } catch (err) {
      alert('خطا در دانلود فایل.');
    }
  };

  const handleDelete = async (file) => {
    try {
      await deleteAsset(file.id);
      refetchAreas();
    } catch (err) {
      alert('خطا در حذف فایل.');
    }
  };

  const handleDrawOnMap = () => {
    navigate('/map', { state: { drawSentinelBbox: true } });
  };

  const handleSaveCredentials = useCallback(async ({ email, password }) => {
    const status = await setCdseCredential({ email, password });
    setCredentialsStatus(status);
  }, []);

  const handleClearCredentials = useCallback(async () => {
    await clearCdseCredential();
    setCredentialsStatus({ configured: false });
  }, []);

  const handleRequestProcessing = async ({ product, analysis, sensor }) => {
    if (!lastSearchPayload) {
      setCreateError('ابتدا یک جستجو انجام دهید.');
      return;
    }
    setCreateError(null);
    setIsCreatingJob(true);
    try {
      const res = await createSentinelJob({
        bbox: lastSearchPayload.bbox,
        label: null,
        sensor,
        analysis,
        provider_product_id: product.provider_product_id,
        idempotency_key: [
          'user',
          product.provider_product_id,
          analysis,
          lastSearchPayload.bbox.join('-'),
        ].join(':'),
      });
      setJobId(res?.job?.id ?? null);
    } catch (err) {
      setCreateError(err?.response?.data?.detail || err.message);
    } finally {
      setIsCreatingJob(false);
    }
  };

  return (
    <SentinelDashboard
      searchResults={searchMut.data?.items || []}
      loading={searchMut.isPending}
      error={searchMut.error?.message || null}
      credentialsStatus={credentialsStatus}
      onSearch={handleSearch}
      onShowOnMap={handleShowOnMap}
      onDownload={handleDownload}
      onDelete={handleDelete}
      onDrawOnMap={handleDrawOnMap}
      onRefresh={refetchAreas}
      onSaveCredentials={handleSaveCredentials}
      onClearCredentials={handleClearCredentials}
      onRequestProcessing={handleRequestProcessing}
      job={job}
      isCreatingJob={isCreatingJob}
      createError={createError}
    />
  );
}