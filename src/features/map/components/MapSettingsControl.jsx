// src/features/map/components/MapSettingsControl.jsx
import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import useLocalStorageState from '../../../shared/hooks/useLocalStorageState';
import { usePermissions } from '../../auth/hooks/usePermissions';   // ✅ جدید

// ============================================================
// ✅ آیکون‌های SVG
// ============================================================
const SVG_ICONS = {
  hospital: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>`,
  pharmacy: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/><path d="M12 12v4M10 14h4"/></svg>`,
  clinic: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V7l8-4 8 4v14"/><path d="M12 11v6M9 14h6"/></svg>`,
  police: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>`,
  fire_station: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3"/><path d="M12 14a3 3 0 0 0 3 3c0 2-2 4-3 5-1-1-3-3-3-5a3 3 0 0 0 3-3z"/></svg>`,
  fuel: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M3 12h10"/><path d="M13 8h4a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9l-3-3"/></svg>`,
  school: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 4 2 10l10 6 10-6z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>`,
  bank: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/></svg>`,
  mosque: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-2 2-4 4-4 7a4 4 0 0 0 8 0c0-3-2-5-4-7z"/><path d="M4 21V14a8 8 0 0 1 16 0v7"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>`,
  // ✅ جدید
  regions: (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
};

// ============================================================
// ✅ آیکون‌های نقشه پایه
// ============================================================
const BASE_ICONS = {
  satellite: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`,
  hybrid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`,
  streets: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4M20 22V4M12 4v4M12 12v4M12 20v2"/></svg>`,
  terrain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20l6-9 4 5 3-4 5 8z"/><circle cx="17" cy="6" r="2"/></svg>`,
  osm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2z"/><path d="M9 3v16M15 5v16"/></svg>`,
};

// ============================================================
// تنظیمات پایه نقشه
// ============================================================
export const BASE_MAPS = [
  {
    id: 'satellite',
    label: 'ماهواره‌ای',
    url: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 22,
    attribution: '&copy; Google',
  },
  {
    id: 'hybrid',
    label: 'ماهواره‌ای + برچسب',
    url: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 22,
    attribution: '&copy; Google',
  },
  {
    id: 'streets',
    label: 'خیابانی',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 22,
    attribution: '&copy; Google',
  },
  {
    id: 'terrain',
    label: 'توپوگرافی',
    url: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 22,
    attribution: '&copy; Google',
  },
  {
    id: 'osm',
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  },
];

// ============================================================
// لایه‌های POI
// ============================================================
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export const POI_LAYERS = [
  { id: 'hospital', label: 'بیمارستان', color: '#dc2626', tags: '["amenity"="hospital"]' },
  { id: 'pharmacy', label: 'داروخانه', color: '#16a34a', tags: '["amenity"="pharmacy"]' },
  { id: 'clinic', label: 'درمانگاه', color: '#0891b2', tags: '["amenity"="clinic"]' },
  { id: 'police', label: 'پلیس', color: '#1e40af', tags: '["amenity"="police"]' },
  { id: 'fire_station', label: 'آتش‌نشانی', color: '#dc2626', tags: '["amenity"="fire_station"]' },
  { id: 'fuel', label: 'پمپ بنزین', color: '#ea580c', tags: '["amenity"="fuel"]' },
  { id: 'school', label: 'مدرسه', color: '#7c3aed', tags: '["amenity"="school"]' },
  { id: 'bank', label: 'بانک', color: '#0d9488', tags: '["amenity"="bank"]' },
  { id: 'mosque', label: 'مسجد', color: '#059669', tags: '["amenity"="place_of_worship"]["religion"="muslim"]' },
];

// ============================================================
// Overpass helpers
// ============================================================
const buildOverpassQuery = ({ bbox, tagsList }) => {
  const [south, west, north, east] = bbox;
  const bboxStr = `${south},${west},${north},${east}`;
  const parts = tagsList.map(
    (tags) => `  node${tags}(${bboxStr});\n  way${tags}(${bboxStr});`
  );
  return `[out:json][timeout:25];
(
${parts.join('\n')}
);
out center tags;`;
};

const fetchPOIs = async (bbox, layerIds, signal) => {
  const activeLayers = POI_LAYERS.filter((l) => layerIds.includes(l.id));
  if (activeLayers.length === 0) return [];

  const query = buildOverpassQuery({
    bbox,
    tagsList: activeLayers.map((l) => l.tags),
  });

  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal,
  });

  if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);
  const data = await response.json();
  return data.elements || [];
};

const detectLayerId = (element) => {
  const tags = element.tags || {};
  for (const layer of POI_LAYERS) {
    const matches = layer.tags.match(/\["([^"]+)"="([^"]+)"\]/g);
    if (!matches) continue;
    let isMatch = true;
    for (const m of matches) {
      const parsed = m.match(/\["([^"]+)"="([^"]+)"\]/);
      if (!parsed) continue;
      const [, key, value] = parsed;
      if (tags[key] !== value) { isMatch = false; break; }
    }
    if (isMatch) return layer.id;
  }
  return null;
};

const createPoiMarker = (element, layer) => {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const name = element.tags?.name || element.tags?.['name:fa'] || layer.label;
  const svgIcon = SVG_ICONS[layer.id]?.(layer.color) || '';

  const icon = L.divIcon({
    className: 'poi-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: white;
        border: 2px solid ${layer.color};
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      ">
        <span style="width: 16px; height: 16px; display: block;">${svgIcon}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const marker = L.marker([lat, lon], { icon });

  marker.bindPopup(
    `<div style="font-family: Vazirmatn, sans-serif; direction: rtl; min-width: 140px;">
      <div style="display: flex; align-items: center; gap: 6px; font-weight: bold; font-size: 13px; margin-bottom: 4px;">
        <span style="width: 16px; height: 16px; display: inline-block; color: ${layer.color};">${svgIcon}</span>
        <span>${name}</span>
      </div>
      <div style="font-size: 11px; color: #64748b;">
        ${layer.label}
      </div>
    </div>`,
    { closeButton: true }
  );

  return marker;
};

// ============================================================
// SvgIcon
// ============================================================
const SvgIcon = ({ svg, size = 16, className = '' }) => (
  <span
    className={className}
    style={{ width: size, height: size, display: 'inline-block' }}
    dangerouslySetInnerHTML={{
      __html: svg.replace(/stroke-width/g, 'strokeWidth'),
    }}
  />
);

// ============================================================
// MapSettingsControl
// ============================================================
const MapSettingsControl = ({ hidden = false }) => {
  const map = useMap();
  const { isSuperAdmin } = usePermissions();   // ✅
  const controlRef = useRef(null);
  const containerRef = useRef(null);
  const rootRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelLayerRef = useRef(null);
  const layerGroupRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [baseMapId, setBaseMapId] = useLocalStorageState('map_base_layer_v1', 'hybrid');
  const [baseOpacity, setBaseOpacity] = useLocalStorageState('map_base_opacity_v1', 1);
  const [showLabels, setShowLabels] = useLocalStorageState('map_show_labels_v1', true);
  const [labelLang, setLabelLang] = useLocalStorageState('map_label_lang_v1', 'fa');
  const [activeLayers, setActiveLayers] = useLocalStorageState('map_active_poi_layers_v1', []);

  // ✅ جدید: نمایش مرز مناطق
  const [showRegions, setShowRegions] = useLocalStorageState(
    'map_show_regions_v1',
    false,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('base');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [poiCount, setPoiCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // ساخت کنترل Leaflet
  useEffect(() => {
    if (!map) return;

    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    container.style.display = hidden ? 'none' : '';

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const control = new L.Control({ position: 'topleft' });
    control.onAdd = () => container;
    control.addTo(map);

    controlRef.current = control;
    containerRef.current = container;
    rootRef.current = createRoot(container);

    layerGroupRef.current = L.layerGroup().addTo(map);
    setIsReady(true);

    return () => {
      const root = rootRef.current;
      queueMicrotask(() => {
        try { root?.unmount(); } catch { /* ignore */ }
      });
      rootRef.current = null;

      try {
        layerGroupRef.current?.clearLayers();
        if (map.hasLayer(layerGroupRef.current)) map.removeLayer(layerGroupRef.current);
      } catch { /* ignore */ }

      try { control.remove(); } catch { /* ignore */ }

      controlRef.current = null;
      containerRef.current = null;
      setIsReady(false);
    };
  }, [map, hidden]);

  // Tile layer پایه
  useEffect(() => {
    if (!map || !isReady) return;

    const baseMap = BASE_MAPS.find((b) => b.id === baseMapId) || BASE_MAPS[1];

    if (tileLayerRef.current) {
      try { map.removeLayer(tileLayerRef.current); } catch { /* ignore */ }
      tileLayerRef.current = null;
    }

    const tileLayer = L.tileLayer(baseMap.url, {
      subdomains: baseMap.subdomains,
      maxZoom: baseMap.maxZoom,
      attribution: baseMap.attribution,
      opacity: baseOpacity,
      zIndex: 0,
    });

    tileLayer.addTo(map);
    tileLayer.bringToBack();
    tileLayerRef.current = tileLayer;
  }, [map, baseMapId, isReady]);

  useEffect(() => {
    if (tileLayerRef.current) {
      try { tileLayerRef.current.setOpacity(baseOpacity); } catch { /* ignore */ }
    }
  }, [baseOpacity]);

  // Label layer
  useEffect(() => {
    if (!map || !isReady) return;

    if (labelLayerRef.current) {
      try { map.removeLayer(labelLayerRef.current); } catch { /* ignore */ }
      labelLayerRef.current = null;
    }

    if (!showLabels || baseMapId !== 'satellite') return;

    const labelUrl = labelLang === 'fa'
      ? 'https://{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}&hl=fa'
      : 'https://{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}&hl=en';

    const labelLayer = L.tileLayer(labelUrl, {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 22,
      opacity: 1,
      zIndex: 5,
    });

    labelLayer.addTo(map);
    labelLayerRef.current = labelLayer;

    return () => {
      if (labelLayerRef.current) {
        try { map.removeLayer(labelLayerRef.current); } catch { /* ignore */ }
        labelLayerRef.current = null;
      }
    };
  }, [map, showLabels, baseMapId, labelLang, isReady]);

  // POI layers
  useEffect(() => {
    if (!map || !layerGroupRef.current || !isReady) return;

    layerGroupRef.current.clearLayers();
    setPoiCount(0);
    setError(null);

    if (!Array.isArray(activeLayers) || activeLayers.length === 0) {
      setIsLoading(false);
      abortControllerRef.current?.abort();
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    const loadPOIs = async () => {
      try {
        const bounds = map.getBounds();
        const bbox = [
          bounds.getSouth(),
          bounds.getWest(),
          bounds.getNorth(),
          bounds.getEast(),
        ];

        const elements = await fetchPOIs(bbox, activeLayers, controller.signal);
        if (controller.signal.aborted) return;

        let count = 0;
        for (const element of elements) {
          const layerId = detectLayerId(element);
          if (!layerId || !activeLayers.includes(layerId)) continue;

          const layer = POI_LAYERS.find((l) => l.id === layerId);
          const marker = createPoiMarker(element, layer);
          if (marker) {
            layerGroupRef.current.addLayer(marker);
            count++;
          }
        }

        setPoiCount(count);
        setIsLoading(false);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('POI fetch error:', err);
        setError('خطا در دریافت اطلاعات');
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadPOIs, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isReady, JSON.stringify(activeLayers)]);

  // reload روی pan/zoom
  useEffect(() => {
    if (!map || !isReady || activeLayers.length === 0) return;

    let moveTimer = null;

    const handleMoveEnd = () => {
      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        setActiveLayers((prev) => [...prev]);
      }, 800);
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
      if (moveTimer) clearTimeout(moveTimer);
    };
  }, [map, isReady, activeLayers, setActiveLayers]);

  const toggleLayer = (layerId) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
    );
  };

  const hasActiveLayers = activeLayers.length > 0;

  // رندر
  useEffect(() => {
    const root = rootRef.current;
    const container = containerRef.current;
    if (!root || !container) return;

    container.style.display = hidden ? 'none' : '';
    container.style.position = 'relative';

    const layersTabSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;

    root.render(
      <div className="relative" dir="rtl">
        {/* دکمه اصلی */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsOpen((v) => !v);
          }}
          title="تنظیمات نمایش نقشه"
          aria-label="تنظیمات نمایش نقشه"
          aria-expanded={isOpen}
          className={[
            'relative w-[30px] h-[30px] flex items-center justify-center',
            'border-0 p-0 cursor-pointer',
            'transition-colors duration-150',
            'focus:outline-none',
            isOpen
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-white text-gray-700 hover:bg-gray-100',
          ].join(' ')}
        >
          <SvgIcon svg={layersTabSvg} size={18} />

          {(hasActiveLayers || showRegions) && (
            <span className="absolute top-[3px] right-[3px] w-1.5 h-1.5 rounded-full bg-blue-500 ring-1 ring-white" aria-hidden="true" />
          )}

          {isLoading && (
            <span className="absolute -top-1 -right-1 w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin bg-white" aria-hidden="true" />
          )}
        </button>

        {/* پنل */}
        {isOpen && (
          <div
            className="
              absolute top-0 left-full ml-2 z-[1000]
              w-[290px] max-h-[75vh] overflow-hidden
              rounded-xl
              bg-white
              border border-gray-300
              shadow-[0_10px_40px_rgba(0,0,0,0.25)]
              flex flex-col
            "
            style={{ backgroundColor: '#ffffff' }}
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* هدر */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-2 py-2 flex-shrink-0">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('base')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'base' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  نمایش
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('poi')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors relative ${activeTab === 'poi' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  لایه‌ها
                  {(hasActiveLayers || showRegions) && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold ring-2 ring-white">
                      {activeLayers.length + (showRegions ? 1 : 0)}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('labels')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'labels' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  برچسب
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                aria-label="بستن"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* محتوا */}
            <div className="overflow-y-auto flex-1 bg-white">
              {/* ─── تب نمایش ─── */}
              {activeTab === 'base' && (
                <div className="p-2.5 space-y-1">
                  <div className="text-[10px] font-bold text-gray-500 uppercase px-1.5 pt-1 pb-1">
                    نوع نقشه پایه
                  </div>
                  {BASE_MAPS.map((b) => {
                    const isActive = baseMapId === b.id;
                    const iconSvg = BASE_ICONS[b.id] || '';
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBaseMapId(b.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-right transition-colors border ${
                          isActive
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className={isActive ? 'text-emerald-700' : 'text-gray-700'}
                          style={{ width: 18, height: 18, display: 'inline-block', flexShrink: 0 }}
                          dangerouslySetInnerHTML={{
                            __html: iconSvg.replace(/stroke-width/g, 'strokeWidth'),
                          }}
                        />
                        <span className={`text-[13px] font-semibold flex-1 ${isActive ? 'text-emerald-800' : 'text-gray-800'}`}>
                          {b.label}
                        </span>
                        {isActive && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}

                  <div className="border-t border-gray-200 pt-3 mt-2 px-1.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700">شفافیت نقشه پایه</span>
                      <span className="text-[11px] font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200" dir="ltr">
                        {Math.round(baseOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1"
                      step="0.05"
                      value={baseOpacity}
                      onChange={(e) => setBaseOpacity(Number(e.target.value))}
                      className="w-full accent-primary-600 cursor-pointer"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {/* ─── تب POI ─── */}
              {activeTab === 'poi' && (
                <div>
                  {error && (
                    <div className="px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 border-b border-red-200">
                      {error}
                    </div>
                  )}

                  {hasActiveLayers && poiCount > 0 && (
                    <div className="px-3 py-2 text-xs font-semibold text-blue-800 bg-blue-50 border-b border-blue-200">
                      {poiCount} مورد در این محدوده
                    </div>
                  )}

                  {isLoading && (
                    <div className="px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 border-2 border-amber-300 border-t-amber-700 rounded-full animate-spin" />
                      <span>در حال بارگذاری...</span>
                    </div>
                  )}

                  {/* ✅ بخش مناطق — فقط super_admin */}
                  {isSuperAdmin && (
                    <div className="border-b border-gray-200 bg-purple-50/30">
                      <div className="text-[10px] font-bold text-purple-700 uppercase px-3 pt-2 pb-1">
                        مناطق
                      </div>

                      <div className="p-1.5">
                        <button
                          type="button"
                          onClick={() => setShowRegions((v) => !v)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-right transition-colors border ${
                            showRegions
                              ? 'bg-purple-50 border-purple-300'
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          {/* checkbox */}
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                              showRegions
                                ? 'bg-purple-600 border-purple-600'
                                : 'bg-white border-gray-400'
                            }`}
                          >
                            {showRegions && (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>

                          {/* آیکون */}
                          <span
                            className="flex-shrink-0"
                            style={{
                              color: '#7C3AED',
                              width: 18,
                              height: 18,
                              display: 'inline-block',
                            }}
                            dangerouslySetInnerHTML={{
                              __html: (SVG_ICONS.regions('#7C3AED') || '').replace(
                                /stroke-width/g,
                                'strokeWidth',
                              ),
                            }}
                          />

                          <span
                            className={`text-[13px] font-semibold flex-1 ${
                              showRegions ? 'text-purple-900' : 'text-gray-800'
                            }`}
                          >
                            مرز مناطق
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* POI Layers */}
                  <div className="p-1.5 space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase px-1.5 pt-1.5 pb-1">
                      اماکن و خدمات
                    </div>

                    {POI_LAYERS.map((layer) => {
                      const isActive = activeLayers.includes(layer.id);
                      return (
                        <button
                          key={layer.id}
                          type="button"
                          onClick={() => toggleLayer(layer.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-right transition-colors border ${
                            isActive
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                            isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'
                          }`}>
                            {isActive && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>

                          <span
                            className="flex-shrink-0"
                            style={{ color: layer.color, width: 18, height: 18, display: 'inline-block' }}
                            dangerouslySetInnerHTML={{
                              __html: (SVG_ICONS[layer.id]?.(layer.color) || '').replace(/stroke-width/g, 'strokeWidth'),
                            }}
                          />

                          <span className={`text-[13px] font-semibold flex-1 ${isActive ? 'text-blue-900' : 'text-gray-800'}`}>
                            {layer.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── تب برچسب ─── */}
              {activeTab === 'labels' && (
                <div className="p-3 space-y-4">
                  {baseMapId !== 'satellite' ? (
                    <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded-lg p-3 leading-relaxed">
                      تنظیمات برچسب فقط وقتی نوع نقشه = «ماهواره‌ای» باشد کار می‌کند.
                    </div>
                  ) : (
                    <>
                      <label className="flex items-center justify-between gap-2 cursor-pointer px-1 py-1">
                        <span className="text-[13px] font-bold text-gray-800">نمایش برچسب‌ها</span>
                        <input
                          type="checkbox"
                          checked={showLabels}
                          onChange={(e) => setShowLabels(e.target.checked)}
                          className="w-5 h-5 accent-primary-600 cursor-pointer"
                        />
                      </label>

                      {showLabels && (
                        <div className="border-t border-gray-200 pt-3">
                          <div className="text-[13px] font-bold text-gray-800 mb-2 px-1">زبان برچسب‌ها</div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setLabelLang('fa')}
                              className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-colors border ${
                                labelLang === 'fa'
                                  ? 'bg-primary-600 text-white border-primary-700'
                                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              فارسی
                            </button>
                            <button
                              type="button"
                              onClick={() => setLabelLang('en')}
                              className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-colors border ${
                                labelLang === 'en'
                                  ? 'bg-primary-600 text-white border-primary-700'
                                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              English
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [
    isOpen,
    activeTab,
    baseMapId,
    baseOpacity,
    showLabels,
    labelLang,
    activeLayers,
    isLoading,
    error,
    poiCount,
    hidden,
    isSuperAdmin,      // ✅ جدید
    showRegions,       // ✅ جدید
    setBaseMapId,
    setBaseOpacity,
    setShowLabels,
    setLabelLang,
    setShowRegions,    // ✅ جدید
  ]);

  return null;
};

export default MapSettingsControl;