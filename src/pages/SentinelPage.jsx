// src/pages/SentinelPage.jsx
import { useNavigate } from 'react-router-dom';
import SentinelDashboard from './SentinelDashboard';
import {
  useSentinelSearch,
} from '../features/sentinel/hooks/useSentinelSearch';
import {
  useSentinelAreas,
} from '../features/sentinel/hooks/useSentinelLibrary';
import {
  useSentinelJob,
} from '../features/sentinel/hooks/useSentinelJobs';
import {
  createSentinelJob,
  downloadGeotiffAsFile,
  downloadGeotiffByJob,
  deleteAsset,
} from '../features/sentinel/services/sentinelApi';

export default function SentinelPage() {
  const navigate = useNavigate();
  const searchMut = useSentinelSearch();
  const { data: areas = [], refetch: refetchAreas } = useSentinelAreas();

  // آماده‌سازی داده‌های کتابخانه برای Dashboard
  const libraryData = (areas || []).map((area) => ({
    id: area.id,
    area_km2: area.area_km2,
    files: [], // اینجا باید از useSentinelScenes استفاده کنید
  }));

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

  return (
    <SentinelDashboard
      library={libraryData}
      searchResults={searchMut.data?.items || []}
      loading={searchMut.isPending}
      error={searchMut.error?.message || null}
      onSearch={handleSearch}
      onShowOnMap={handleShowOnMap}
      onDownload={handleDownload}
      onDelete={handleDelete}
      onDrawOnMap={handleDrawOnMap}
      onRefresh={refetchAreas}
    />
  );
}