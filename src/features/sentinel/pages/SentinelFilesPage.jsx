// src/features/sentinel/pages/SentinelFilesPage.jsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen, FolderPlus, ImageIcon, Download, Trash2, Eye, Loader2,
  ChevronDown, ChevronUp, RefreshCw, Tag, X,
  MoreVertical, FileImage, GripVertical, CheckSquare,
  Square, Search,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSentinelFiles, useSentinelAreaScenes, sentinelFilesKeys,
} from "../hooks/useSentinelFiles";
import {
  downloadGeotiffAsFile, deleteAsset, listFolders, createFolder,
  deleteFolder, moveAssetToFolder, updateAssetTags,
} from "../services/sentinelApi";
import { useSentinelPreview } from "../hooks/useSentinelPreview";

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

// ═══════════════════════════════════════════════════════════
// FolderSidebar
// ═══════════════════════════════════════════════════════════
const FolderSidebar = ({
  folders, selectedFolderId, onSelect, onAdd, onDelete,
  counts, dragOverFolderId, onDragOver, onDragLeave, onDrop,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#64748b");
  const colors = ["#64748b", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await onAdd({ name: newName.trim(), color: newColor });
    setNewName(""); setShowAdd(false);
  };

  return (
    <div className="w-64 shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">پوشه‌ها</span>
        <button onClick={() => setShowAdd(!showAdd)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg" title="پوشه جدید">
          <FolderPlus size={16} />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-xl p-2 space-y-2">
          <input
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="نام پوشه..."
            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-primary-500"
            autoFocus
          />
          <div className="flex items-center gap-1">
            {colors.map((c) => (
              <button key={c} type="button" onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full border-2 ${newColor === c ? "border-slate-800" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <button type="submit" className="flex-1 px-2 py-1 rounded-lg bg-primary-600 text-white text-[10px] font-bold">ذخیره</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px]">لغو</button>
          </div>
        </form>
      )}

      <div className="space-y-1">
        <button
          onClick={() => onSelect(null)}
          onDragOver={(e) => { e.preventDefault(); onDragOver(null); }}
          onDragLeave={() => onDragLeave(null)}
          onDrop={(e) => { e.preventDefault(); onDrop(null, e); }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
            selectedFolderId === null
              ? "bg-primary-50 text-primary-700 border border-primary-200"
              : dragOverFolderId === null
                ? "bg-primary-100 text-primary-700 border-2 border-dashed border-primary-400"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FolderOpen size={14} />
          <span className="flex-1 text-right">همه فایل‌ها</span>
          <span className="text-[10px] text-slate-500">{counts.all}</span>
        </button>

        {folders.map((folder) => {
          const isDragOver = dragOverFolderId === folder.id;
          return (
            <div key={folder.id} className="group relative">
              <button
                onClick={() => onSelect(folder.id)}
                onDragOver={(e) => { e.preventDefault(); onDragOver(folder.id); }}
                onDragLeave={() => onDragLeave(folder.id)}
                onDrop={(e) => { e.preventDefault(); onDrop(folder.id, e); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedFolderId === folder.id
                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                    : isDragOver
                      ? "bg-primary-100 text-primary-700 border-2 border-dashed border-primary-400 scale-105"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
                <span className="flex-1 text-right truncate">{folder.name}</span>
                <span className="text-[10px] text-slate-500">{counts[folder.id] || 0}</span>
              </button>
              <button onClick={() => onDelete(folder.id)} className="absolute left-1 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100" title="حذف پوشه">
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FileCard
// ═══════════════════════════════════════════════════════════
const FileCard = ({
  file, folders, onMoveToFolder, onUpdateTags, onDownload, onDelete, onShow,
  selectionMode, isSelected, onToggleSelect,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try { await onDownload?.(file); } finally { setIsDownloading(false); }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    const newTags = [...(file.tags || []), tagInput.trim()];
    await onUpdateTags?.(file, newTags);
    setTagInput("");
  };

  const handleRemoveTag = async (tag) => {
    const newTags = (file.tags || []).filter((t) => t !== tag);
    await onUpdateTags?.(file, newTags);
  };

  const handleDragStart = (e) => {
    const ids = isSelected && selectionMode ? Array.from(selectionMode) : [file.id];
    e.dataTransfer.setData("application/json", JSON.stringify({ assetIds: ids }));
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      className={`
        relative flex items-center gap-3 p-3 rounded-xl bg-white border transition-all
        ${isDragging ? "opacity-50 scale-95" : ""}
        ${isSelected ? "border-primary-400 bg-primary-50 ring-1 ring-primary-300" : "border-slate-200 hover:border-primary-300"}
        cursor-grab active:cursor-grabbing
      `}
    >
      {selectionMode && (
        <button onClick={() => onToggleSelect?.(file)} className="p-1 text-slate-600 hover:bg-slate-100 rounded">
          {isSelected ? <CheckSquare size={16} className="text-primary-600" /> : <Square size={16} />}
        </button>
      )}

      <div className="text-slate-400 cursor-grab"><GripVertical size={16} /></div>

      <PreviewThumb assetId={file.id} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-bold text-slate-800">{file.analysis || "—"}</span>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{file.width_px}×{file.height_px}</span>
          <span className="text-[10px] text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-200">{formatBytes(file.size_bytes)}</span>
          {file.folder_id && (
            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
              <FolderOpen size={10} /> {folders.find((f) => f.id === file.folder_id)?.name || "—"}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500">تاریخ: <span dir="ltr">{file.acquisition_at?.slice(0, 10) || "—"}</span></div>
        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {file.tags.map((tag) => (
              <span key={tag} className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 inline-flex items-center gap-1">
                <Tag size={9} /> {tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-600"><X size={8} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onShow?.(file)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="نمایش">
          <Eye size={16} />
        </button>
        <button onClick={handleDownload} disabled={isDownloading} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" title="دانلود">
          {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        </button>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="گزینه‌ها">
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-44 overflow-hidden">
              <button onClick={() => { setShowTags(!showTags); setShowMenu(false); }} className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-right flex items-center gap-2">
                <Tag size={12} /> برچسب‌گذاری
              </button>
              <div className="border-t border-slate-100">
                <div className="px-3 py-1.5 text-[10px] text-slate-500 bg-slate-50">انتقال به پوشه:</div>
                <button onClick={() => { onMoveToFolder?.(file, null); setShowMenu(false); }} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-right">بدون پوشه</button>
                {folders.map((f) => (
                  <button key={f.id} onClick={() => { onMoveToFolder?.(file, f.id); setShowMenu(false); }} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-right flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} /> {f.name}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100">
                <button onClick={() => { onDelete?.(file); setShowMenu(false); }} className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-right flex items-center gap-2">
                  <Trash2 size={12} /> حذف فایل
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTags && (
        <form onSubmit={handleAddTag} className="absolute left-0 mt-2 bg-white border border-slate-200 rounded-lg p-2 shadow-lg z-20 w-64" style={{ top: "100%" }}>
          <div className="flex gap-1">
            <input
              type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              placeholder="برچسب جدید..."
              className="flex-1 px-2 py-1 rounded border border-slate-300 text-xs outline-none focus:border-primary-500"
              autoFocus
            />
            <button type="submit" className="px-2 py-1 rounded bg-primary-600 text-white text-[10px] font-bold">افزودن</button>
          </div>
        </form>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// AreaGroup (باگ ۷: onRefresh پاس داده می‌شود)
// ═══════════════════════════════════════════════════════════
const AreaGroup = ({
  area, folders, filter, onMoveToFolder, onUpdateTags, onDownload, onDelete, onShow,
  selection, onToggleSelect, onRefresh,
}) => {
  const [expanded, setExpanded] = useState(true);
  const { data: scenes = [] } = useSentinelAreaScenes(area.id);

  const previews = scenes.filter((s) => s.kind === "preview_png");
  const geotiffs = scenes.filter((s) => s.kind === "geotiff");
  const geotiffByAnalysis = {};
  for (const g of geotiffs) if (g.analysis) geotiffByAnalysis[g.analysis] = g;

  const filteredPreviews = previews.filter((s) => {
    if (filter.analysis && s.analysis !== filter.analysis) return false;
    if (filter.folderId !== null) {
      const gt = geotiffByAnalysis[s.analysis];
      if (!gt || gt.folder_id !== filter.folderId) return false;
    }
    return true;
  });

  if (filteredPreviews.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-primary-600" />
          <span className="text-sm font-bold text-slate-800">محدوده #{area.id}</span>
          <span className="text-[10px] text-slate-500" dir="ltr">{area.area_km2?.toFixed(2)} km²</span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{filteredPreviews.length} فایل</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {expanded && (
        <div className="p-3 pt-0 space-y-2 border-t border-slate-100">
          {filteredPreviews.map((scene) => {
            const gt = geotiffByAnalysis[scene.analysis];
            const file = { ...scene, ...(gt || {}), id: scene.id };
            return (
              <FileCard
                key={scene.id}
                file={file}
                folders={folders}
                onMoveToFolder={onMoveToFolder}
                onUpdateTags={onUpdateTags}
                onDownload={onDownload}
                onDelete={onDelete}
                onShow={onShow}
                selectionMode={selection}
                isSelected={selection?.has(scene.id)}
                onToggleSelect={onToggleSelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SentinelFilesPage
// ═══════════════════════════════════════════════════════════
export default function SentinelFilesPage({ onShowOnMap, onDownload, onDelete, onRefresh }) {
  const { data: areas = [], isLoading, refetch } = useSentinelFiles();
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [filterAnalysis, setFilterAnalysis] = useState("");
  const [filterText, setFilterText] = useState("");
  const [selection, setSelection] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    listFolders().then(setFolders).catch(() => {});
  }, []);

  const counts = useMemo(() => {
    const c = { all: 0 };
    for (const area of areas) c.all += 1;
    for (const f of folders) c[f.id] = c[f.id] || 0;
    return c;
  }, [areas, folders]);

  const handleAddFolder = async (data) => {
    const folder = await createFolder(data);
    setFolders((prev) => [...prev, folder]);
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm("پوشه حذف شود؟ فایل‌ها حفظ می‌شوند.")) return;
    await deleteFolder(folderId);
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (selectedFolderId === folderId) setSelectedFolderId(null);
  };

  const handleMoveToFolder = async (file, folderId) => {
    await moveAssetToFolder(file.id, folderId);
    queryClient.invalidateQueries({ queryKey: sentinelFilesKeys.all });
  };

  const handleUpdateTags = async (file, tags) => {
    await updateAssetTags(file.id, tags);
    queryClient.invalidateQueries({ queryKey: sentinelFilesKeys.all });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: sentinelFilesKeys.all });
    refetch();
    onRefresh?.();
  };

  const handleDragOver = (folderId) => setDragOverFolderId(folderId);
  const handleDragLeave = (folderId) => {
    if (dragOverFolderId === folderId) setDragOverFolderId(null);
  };

  const handleDrop = async (folderId, e) => {
    setDragOverFolderId(null);
    try {
      const data = e?.dataTransfer?.getData("application/json");
      let assetIds = [];
      if (data) {
        const parsed = JSON.parse(data);
        assetIds = parsed.assetIds || [parsed.assetId];
      } else if (selection && selection.size > 0) {
        assetIds = Array.from(selection);
      }
      for (const id of assetIds) {
        await moveAssetToFolder(id, folderId);
      }
      queryClient.invalidateQueries({ queryKey: sentinelFilesKeys.all });
      setSelection(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSelect = (file) => {
    setSelection((prev) => {
      const next = new Set(prev || []);
      if (next.has(file.id)) next.delete(file.id);
      else next.add(file.id);
      return next.size === 0 ? null : next;
    });
  };

  const filteredAreas = useMemo(() => {
    if (!filterText) return areas;
    return areas.filter((a) => String(a.id).includes(filterText));
  }, [areas, filterText]);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-slate-700">{areas.length.toLocaleString("fa-IR")} محدوده ذخیره‌شده</div>
        <div className="flex items-center gap-2">
          {selection && selection.size > 0 && (
            <span className="text-xs text-primary-700 bg-primary-50 px-2 py-1 rounded-lg">
              {selection.size} فایل انتخاب شده
            </span>
          )}
          <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold hover:bg-primary-700">
            <RefreshCw size={14} /> بازخوانی
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={filterText} onChange={(e) => setFilterText(e.target.value)}
            placeholder="جستجو در محدوده‌ها..."
            className="w-full pr-9 pl-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-primary-500 outline-none"
          />
        </div>
        <select value={filterAnalysis} onChange={(e) => setFilterAnalysis(e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-primary-500">
          <option value="">همه شاخص‌ها</option>
          <option value="TRUE_COLOR">TRUE_COLOR</option>
          <option value="NDVI">NDVI</option>
          <option value="NDWI">NDWI</option>
          <option value="GNDVI">GNDVI</option>
          <option value="NDRE">NDRE</option>
          <option value="VV">VV</option>
          <option value="VH">VH</option>
        </select>
      </div>

      <div className="flex gap-4">
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          onAdd={handleAddFolder}
          onDelete={handleDeleteFolder}
          counts={counts}
          dragOverFolderId={dragOverFolderId}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        <div className="flex-1 min-w-0 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary-600" />
            </div>
          ) : filteredAreas.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <FileImage size={32} className="text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-600">فایلی یافت نشد</div>
            </div>
          ) : (
            filteredAreas.map((area) => (
              <AreaGroup
                key={area.id}
                area={area}
                folders={folders}
                filter={{ folderId: selectedFolderId, analysis: filterAnalysis }}
                onMoveToFolder={handleMoveToFolder}
                onUpdateTags={handleUpdateTags}
                onDownload={onDownload}
                onDelete={onDelete}
                onShow={onShowOnMap}
                selection={selection}
                onToggleSelect={handleToggleSelect}
                onRefresh={handleRefresh}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}