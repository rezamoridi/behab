// src/pages/SentinelPage.jsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import SentinelDashboard from './SentinelDashboard';
import { useSentinelSearch } from '../features/sentinel/hooks/useSentinelSearch';
import { useSentinelAreas } from '../features/sentinel/hooks/useSentinelLibrary';
import {
  createSentinelJob,
  downloadGeotiffAsFile,
  deleteAsset,
  getCdseCredentialStatus,
  setCdseCredential,
  clearCdseCredential,
} from '../features/sentinel/services/sentinelApi';

export default function SentinelPage() {
  const navigate = useNavigate();
  const searchMut = useSentinelSearch();
  const { data: areas = [], refetch: refetchAreas } = useSentinelAreas();

  const [credentialsStatus, setCredentialsStatus] = useState(null);

  // ✅ بارگذاری وضعیت اعتبارنامه در mount
  useEffect(() => {
    getCdseCredentialStatus()
      .then(setCredentialsStatus)
      .catch(() => setCredentialsStatus({ configured: false }));
  }, []);

  const handleSearch = async (payload) => {
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
      await downloadGeotiffAsFile(file.id, `sentinel_${file.analysis}_${file.id}.tif`);
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

  // ✅ ذخیره اعتبارنامه
  const handleSaveCredentials = useCallback(async ({ email, password }) => {
    const status = await setCdseCredential({ email, password });
    setCredentialsStatus(status);
  }, []);

  // ✅ حذف اعتبارنامه
  const handleClearCredentials = useCallback(async () => {
    await clearCdseCredential();
    setCredentialsStatus({ configured: false });
  }, []);

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
    />
  );
}