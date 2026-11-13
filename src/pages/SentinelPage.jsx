// src/pages/SentinelPage.jsx
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Satellite, Search, Image, CheckCircle2 } from "lucide-react";

import SentinelSearchForm from "../features/sentinel/components/SentinelSearchForm";
import SentinelResults from "../features/sentinel/components/SentinelResults";
import SentinelJobStatus from "../features/sentinel/components/SentinelJobStatus";
import SentinelAnalysisPicker from "../features/sentinel/components/SentinelAnalysisPicker";
import SentinelLibrary from "../features/sentinel/components/SentinelLibrary";

import { useSentinelSearch } from "../features/sentinel/hooks/useSentinelSearch";
import {
  createSentinelJob,
} from "../features/sentinel/services/sentinelApi";

// ═══════════════════════════════════════════════════════════
// SentinelPage
//
// جریان:
//   ۱. جستجو (bbox + sensor + date + cloud)
//   ۲. انتخاب محصول از نتایج
//   ۳. انتخاب شاخص/نوع خروجی
//   ۴. درخواست پردازش → jobId
//   ۵. SentinelJobStatus polling تا succeeded
//   ۶. کتابخانه محلی: انتخاب preview → navigate به /map
// ═══════════════════════════════════════════════════════════
const SentinelPage = () => {
  const navigate = useNavigate();

  // ── جستجو ──
  const [results, setResults] = useState([]);
  const [lastSearchPayload, setLastSearchPayload] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ── پردازش ──
  const [analysis, setAnalysis] = useState("TRUE_COLOR");
  const [jobId, setJobId] = useState(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [createError, setCreateError] = useState(null);

  // ── TanStack Query ──
  const searchMut = useSentinelSearch();

  // ═══════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════
  const handleSearch = useCallback(
    async (payload) => {
      setSelectedProduct(null);
      setJobId(null);
      setCreateError(null);
      setResults([]);

      try {
        const res = await searchMut.mutateAsync(payload);
        setLastSearchPayload(payload);
        setResults(res?.items || []);
      } catch {
        // خطا در searchMut.error نمایش داده می‌شود
        setLastSearchPayload(payload);
      }
    },
    [searchMut],
  );

  const handleSelectProduct = useCallback((item) => {
    setSelectedProduct(item);
    setJobId(null);
    setCreateError(null);
  }, []);

  const handleRequestProcessing = useCallback(async () => {
    if (!selectedProduct || !lastSearchPayload) return;

    setCreateError(null);
    setIsCreatingJob(true);

    try {
      const res = await createSentinelJob({
        bbox: lastSearchPayload.bbox,
        label: null,
        sensor: lastSearchPayload.sensor,
        analysis,
        provider_product_id: selectedProduct.provider_product_id,
        // idempotency key: یکتا در هر درخواست — تکراری‌ها merge می‌شوند
        idempotency_key: [
          "user",
          selectedProduct.provider_product_id,
          analysis,
          lastSearchPayload.bbox.join("-"),
        ].join(":"),
      });
      setJobId(res?.job?.id ?? null);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "خطا در ایجاد job";
      setCreateError(
        typeof detail === "string" ? detail : JSON.stringify(detail),
      );
    } finally {
      setIsCreatingJob(false);
    }
  }, [selectedProduct, lastSearchPayload, analysis]);

  const handleSelectFromLibrary = useCallback(
    ({ assetId, bounds, analysis: a }) => {
      if (!assetId) return;
      navigate("/map", {
        state: {
          sentinelAssetId: assetId,
          sentinelBounds: bounds || null,
          sentinelAnalysis: a || "TRUE_COLOR",
        },
      });
    },
    [navigate],
  );

  // ═══════════════════════════════════════════════════════════
  // Derived
  // ═══════════════════════════════════════════════════════════
  const searchError = useMemo(() => {
    const err = searchMut.error;
    if (!err) return null;
    const detail =
      err?.response?.data?.detail || err?.message || "خطا در جستجو";
    return typeof detail === "string" ? detail : JSON.stringify(detail);
  }, [searchMut.error]);

  const hasResults = results.length > 0;
  const canRequest = !!selectedProduct && !!lastSearchPayload;

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      className="p-4 max-w-5xl mx-auto space-y-5"
      dir="rtl"
    >
      {/* ─── Header ─── */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Satellite size={18} strokeWidth={2.4} />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800">
            تصاویر ماهواره‌ای
          </h1>
          <p className="text-[11px] text-gray-500">
            جستجو، دریافت و نمایش Sentinel-2 / Sentinel-1
          </p>
        </div>
      </div>

      {/* ─── Search Form ─── */}
      <SentinelSearchForm
        onSubmit={handleSearch}
        loading={searchMut.isPending}
      />

      {/* ─── Search Error ─── */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs">
          {searchError}
        </div>
      )}

      {/* ─── Results + Selection ─── */}
      {hasResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ستون نتایج */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search size={14} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-700">
                {results.length.toLocaleString("fa-IR")} نتیجه
              </span>
            </div>
            <SentinelResults
              items={results}
              selectedId={selectedProduct?.provider_product_id}
              onSelect={handleSelectProduct}
            />
          </div>

          {/* ستون انتخاب + درخواست */}
          <div>
            {selectedProduct ? (
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 sticky top-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-600"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    محصول انتخاب‌شده
                  </span>
                </div>

                <div className="text-[10px] text-gray-500 font-mono break-all" dir="ltr">
                  {selectedProduct.provider_product_id}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
                  <div>
                    <div className="text-gray-400">تاریخ</div>
                    <div dir="ltr" className="font-mono">
                      {selectedProduct.acquisition_at?.slice(0, 10) || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">سنسور</div>
                    <div>{selectedProduct.sensor || "—"}</div>
                  </div>
                  {selectedProduct.cloud_cover != null && (
                    <div>
                      <div className="text-gray-400">ابری</div>
                      <div>
                        {Number(selectedProduct.cloud_cover).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <SentinelAnalysisPicker
                    value={analysis}
                    onChange={setAnalysis}
                    disabled={isCreatingJob || !!jobId}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRequestProcessing}
                  disabled={!canRequest || isCreatingJob || !!jobId}
                  className="
                    w-full flex items-center justify-center gap-1.5
                    px-4 py-2 rounded-lg
                    bg-emerald-600 text-white text-sm font-bold
                    hover:bg-emerald-700 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isCreatingJob ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      در حال ارسال...
                    </>
                  ) : jobId ? (
                    "درخواست ثبت شد"
                  ) : (
                    "درخواست دریافت و پردازش"
                  )}
                </button>

                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-2 text-[11px]">
                    {createError}
                  </div>
                )}

                {jobId && <SentinelJobStatus jobId={jobId} />}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-xs text-gray-500">
                یک محصول را از ستون نتایج انتخاب کنید.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Library ─── */}
      <div>
        <div className="flex items-center gap-2 mb-2 mt-6">
          <Image size={14} className="text-gray-500" />
          <span className="text-xs font-bold text-gray-700">
            کتابخانه محلی
          </span>
        </div>
        <SentinelLibrary onSelectScene={handleSelectFromLibrary} />
      </div>
    </div>
  );
};

export default SentinelPage;