// src/features/sentinel/components/SentinelFilesPage.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, ImageIcon, Download, Trash2, Eye, Loader2,
  ChevronDown, ChevronUp, Filter, RefreshCw, AlertCircle,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useSentinelFiles, useSentinelAreaScenes, sentinelFilesKeys } from '../hooks/useSentinelFiles';
import { downloadGeotiffAsFile, deleteAsset } from '../services/sentinelApi';
import { useSentinelPreview } from '../hooks/useSentinelPreview';

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const PreviewThumb = ({ assetId }) => {
  const { url, loading } = useSentinelPreview(assetId);
  if (loading || !url) {
    return (
      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
        <Loader2 size={14} className="animate-spin text-slate-400" />
      </div>
    );
  }
  return <img src={url} alt="preview" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200" />;
};

const SceneFileRow = ({ scene, geotiffAsset, onRefresh }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleShow = () => {
    if (!scene.bounds) return;
    navigate('/map', {
      state: { sentinelAssetId: scene.id, sentinelBounds: scene.bounds, sentinelAnalysis: scene.analysis },
    });
  };

  const handleDownload = async () => {
    if (!geotiffAsset || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadGeotiffAsFile(geotiffAsset.id, `sentinel_${geotiffAsset.analysis}_${geotiffAsset.id}.tif`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('این فایل حذف شود؟')) return;
    setIsDeleting(true);
    try {
      await deleteAsset(scene.id);
      if (geotiffAsset) await deleteAsset(geotiffAsset.id);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-primary-300 transition-colors">
      <PreviewThumb assetId={scene.id} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-slate-800">{scene.analysis || '—'}</span>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {scene.width_px}×{scene.height_px}
          </span>
          {geotiffAsset && (
            <span className="text-[10px] text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-200">
              {formatBytes(geotiffAsset.size_bytes)}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500">
          تاریخ: <span dir="ltr">{scene.acquisition_at?.slice(0, 10) || '—'}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={handleShow} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="نمایش">
          <Eye size={16} strokeWidth={2.2} />
        </button>
        {geotiffAsset && (
          <button onClick={handleDownload} disabled={isDownloading} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" title="دانلود">
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={2.2} />}
          </button>
        )}
        <button onClick={handleDelete} disabled={isDeleting} className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" title="حذف">
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={2.2} />}
        </button>
      </div>
    </div>
  );
};

const AreaGroup = ({ area, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const { data: scenes = [] } = useSentinelAreaScenes(expanded ? area.id : null);

  const previews = scenes.filter((s) => s.kind === 'preview_png');
  const geotiffs = scenes.filter((s) => s.kind === 'geotiff');
  const geotiffByAnalysis = {};
  for (const g of geotiffs) if (g.analysis) geotiffByAnalysis[g.analysis] = g;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-primary-600" />
          <span className="text-sm font-bold text-slate-800">محدوده #{area.id}</span>
          <span className="text-[10px] text-slate-500" dir="ltr">{area.area_km2?.toFixed(2)} km²</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {expanded && (
        <div className="p-3 pt-0 space-y-2 border-t border-slate-100">
          {previews.length === 0 ? (
            <div className="text-xs text-slate-400 text-center p-4">فایلی ذخیره نشده است.</div>
          ) : (
            previews.map((scene) => (
              <SceneFileRow key={scene.id} scene={scene} geotiffAsset={geotiffByAnalysis[scene.analysis]} onRefresh={onRefresh} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function SentinelFilesPage() {
  const { data: areas = [], isLoading, refetch } = useSentinelFiles();
  const [filterText, setFilterText] = useState('');
  const queryClient = useQueryClient();

  const filteredAreas = useMemo(() => {
    if (!filterText) return areas;
    return areas.filter((a) => String(a.id).includes(filterText));
  }, [areas, filterText]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: sentinelFilesKeys.all });
    refetch();
  };

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-slate-700">{areas.length.toLocaleString('fa-IR')} محدوده ذخیره‌شده</div>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold hover:bg-primary-700">
          <RefreshCw size={14} /> بازخوانی
        </button>
      </div>

      <div className="relative">
        <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text" value={filterText} onChange={(e) => setFilterText(e.target.value)}
          placeholder="فیلتر بر اساس شناسه..."
          className="w-full pr-9 pl-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-primary-500 outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary-600" />
        </div>
      ) : filteredAreas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <ImageIcon size={32} className="text-slate-300 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-600">فایلی یافت نشد</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAreas.map((area) => (
            <AreaGroup key={area.id} area={area} onRefresh={handleRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}