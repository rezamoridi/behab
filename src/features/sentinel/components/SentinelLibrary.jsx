// src/features/sentinel/components/SentinelLibrary.jsx
import { useState } from 'react';
import { Download, Eye, Loader2, HardDrive, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useSentinelAreas, useSentinelScenes } from '../hooks/useSentinelLibrary';
import { useSentinelPreview } from '../hooks/useSentinelPreview';
import { downloadGeotiffAsFile } from '../services/sentinelApi';

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
      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
        <Loader2 size={14} className="animate-spin text-slate-400" />
      </div>
    );
  }
  return <img src={url} alt="preview" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200" />;
};

const SceneRow = ({ scene, geotiffAsset, onSelectScene }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShow = () => onSelectScene?.({ assetId: scene.id, bounds: scene.bounds, analysis: scene.analysis });

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

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 hover:border-primary-200 transition-colors">
      <PreviewThumb assetId={scene.id} />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-slate-800 truncate">{scene.analysis || '—'}</div>
        <div className="text-[10px] text-slate-500" dir="ltr">{scene.acquisition_at?.slice(0, 10) || '—'}</div>
        {geotiffAsset && (
          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-500">
            <HardDrive size={10} /> <span>{formatBytes(geotiffAsset.size_bytes)}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={handleShow} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg" title="نمایش">
          <Eye size={14} strokeWidth={2.2} />
        </button>
        {geotiffAsset && (
          <button onClick={handleDownload} disabled={isDownloading} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" title="دانلود">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} strokeWidth={2.2} />}
          </button>
        )}
      </div>
    </div>
  );
};

const AreaBlock = ({ area, onSelectScene }) => {
  const [expanded, setExpanded] = useState(false);
  const { data: scenes = [] } = useSentinelScenes(expanded ? area.id : null);

  const previews = scenes.filter((s) => s.kind === 'preview_png');
  const geotiffs = scenes.filter((s) => s.kind === 'geotiff');
  const geotiffByAnalysis = {};
  for (const g of geotiffs) if (g.analysis) geotiffByAnalysis[g.analysis] = g;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-primary-600" />
          <span className="text-sm font-bold text-slate-800">محدوده #{area.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500" dir="ltr">{area.area_km2?.toFixed(2)} km²</span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>
      {expanded && (
        <div className="p-2 space-y-2 border-t border-slate-100">
          {previews.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-4">تصویری آماده نیست.</div>
          ) : (
            previews.map((scene) => (
              <SceneRow key={scene.id} scene={scene} geotiffAsset={geotiffByAnalysis[scene.analysis]} onSelectScene={onSelectScene} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const SentinelLibrary = ({ onSelectScene }) => {
  const { data: areas = [], isLoading } = useSentinelAreas();

  if (isLoading) return <div className="text-xs text-slate-500 p-4 text-center">در حال بارگذاری...</div>;
  if (areas.length === 0) return <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">هنوز فایلی در کتابخانه نیست.</div>;

  return (
    <div className="space-y-2" dir="rtl">
      {areas.map((area) => (
        <AreaBlock key={area.id} area={area} onSelectScene={onSelectScene} />
      ))}
    </div>
  );
};

export default SentinelLibrary;