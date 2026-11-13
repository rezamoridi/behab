// src/features/sentinel/components/SentinelLibrary.jsx
//
// کتابخانه محلی تصاویر آماده. فقط نمایش است، بدون ایجاد job.
// برای انتخاب asset به parent از طریق onSelectScene خبر می‌دهد.
import { useSentinelAreas, useSentinelScenes } from '../hooks/useSentinelLibrary';
import { useSentinelPreview } from '../hooks/useSentinelPreview';
import { getAnalysisMeta } from '../constants';

const PreviewThumb = ({ assetId }) => {
  const { url, loading } = useSentinelPreview(assetId);

  if (loading) {
    return (
      <div className="w-16 h-16 bg-gray-100 rounded animate-pulse shrink-0" />
    );
  }
  if (!url) {
    return <div className="w-16 h-16 bg-gray-100 rounded shrink-0" />;
  }
  return (
    <img
      src={url}
      alt="preview"
      className="w-16 h-16 rounded object-cover shrink-0"
    />
  );
};

const AreaBlock = ({ area, onSelectScene }) => {
  const { data: scenes = [], isLoading } = useSentinelScenes(area.id);
  const previewScenes = scenes.filter((s) => s.kind === 'preview_png');

  const handleClick = (scene) => {
    // ⚠️ بدون bounds، overlay روی نقشه نمایش داده نمی‌شود
    if (!Array.isArray(scene.bounds) || scene.bounds.length !== 4) {
      // eslint-disable-next-line no-console
      console.warn(
        '[SentinelLibrary] scene has no valid bounds:',
        scene.id,
      );
      return;
    }
    if (!onSelectScene) return;

    onSelectScene({
      assetId: scene.id,
      bounds: scene.bounds,
      analysis: scene.analysis,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <div className="text-xs font-bold text-gray-800">
        محدوده #{area.id}
        {area.label ? ` — ${area.label}` : ''}
      </div>
      <div className="text-[10px] text-gray-500 mt-0.5" dir="ltr">
        {area.area_km2?.toFixed(2)} km²
      </div>

      {isLoading ? (
        <div className="text-[10px] text-gray-400 mt-2">
          در حال بارگذاری تصاویر...
        </div>
      ) : previewScenes.length === 0 ? (
        <div className="text-[10px] text-gray-400 mt-2">
          تصویری آماده نیست
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-1">
          {previewScenes.map((scene) => {
            const meta = getAnalysisMeta(scene.analysis);
            const hasBounds =
              Array.isArray(scene.bounds) && scene.bounds.length === 4;

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleClick(scene)}
                disabled={!hasBounds}
                title={
                  hasBounds
                    ? 'نمایش روی نقشه'
                    : 'این تصویر bounds معتبر ندارد'
                }
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-emerald-50 text-right disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PreviewThumb assetId={scene.id} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-gray-800 truncate">
                    {meta?.label || scene.analysis}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {scene.acquisition_at?.slice(0, 10) || '—'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SentinelLibrary = ({ onSelectScene }) => {
  const { data: areas = [], isLoading } = useSentinelAreas();

  if (isLoading) {
    return (
      <div className="text-xs text-gray-500">
        در حال بارگذاری کتابخانه...
      </div>
    );
  }
  if (areas.length === 0) {
    return (
      <div className="text-xs text-gray-500 bg-white border border-gray-200 rounded-xl p-6 text-center">
        هنوز تصویری در کتابخانه نیست.
      </div>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      {areas.map((area) => (
        <AreaBlock
          key={area.id}
          area={area}
          onSelectScene={onSelectScene}
        />
      ))}
    </div>
  );
};

export default SentinelLibrary;