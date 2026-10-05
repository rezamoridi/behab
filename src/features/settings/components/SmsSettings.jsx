// src/features/settings/components/SmsSettings.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  Eye,
  Braces,
  ToggleLeft,
  ToggleRight,
  Info,
  Wand2,
} from 'lucide-react';
import { smsApi } from '../../../services/api/smsApi';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import useSmsTemplate from '../hooks/useSmsTemplate';

// ============================================
// متغیرهای قابل استفاده
// ============================================
const AVAILABLE_VARIABLES = [
  { name: 'name', label: 'نام کامل کشاورز', sample: 'علی رضایی' },
  { name: 'fname', label: 'نام', sample: 'علی' },
  { name: 'lname', label: 'نام خانوادگی', sample: 'رضایی' },
  { name: 'phone', label: 'شماره تلفن (نام کاربری)', sample: '09123456789' },
  { name: 'password', label: 'رمز اولیه', sample: '1234567890' },
  { name: 'link', label: 'لینک ورود', sample: 'http://localhost:5173/login' },
];

// ============================================
// Variable Chip
// ============================================
const VariableChip = ({ variable, onInsert }) => (
  <button
    type="button"
    onClick={() => onInsert(variable.name)}
    className="
      group inline-flex items-center gap-1
      px-2 py-1 rounded-md
      bg-primary-500/10 hover:bg-primary-500/20
      text-primary-700 text-[10px] font-mono font-bold
      border border-primary-300/40 hover:border-primary-400/60
      transition-colors cursor-pointer
    "
    title={`افزودن: ${variable.label}`}
  >
    <Braces size={9} strokeWidth={2.4} />
    <span>{`{{${variable.name}}}`}</span>
  </button>
);

// ============================================
// Template Editor
// ============================================
const TemplateEditor = ({ templates, onSave, isSaving }) => {
  const toast = useToast();
  const textareaRef = useRef(null);

  const [selectedId, setSelectedId] = useState(templates[0]?.id || null);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [previewText, setPreviewText] = useState('');
  const [unresolvedVars, setUnresolvedVars] = useState([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedId),
    [templates, selectedId]
  );

  // ✅ بارگذاری قالب انتخاب‌شده
  useEffect(() => {
    if (selectedTemplate) {
      setBody(selectedTemplate.body || '');
      setTitle(selectedTemplate.title || '');
      setIsActive(selectedTemplate.is_active ?? true);
    }
  }, [selectedTemplate]);

  // ✅ پیش‌نمایش زنده (debounced)
  useEffect(() => {
    if (!body) {
      setPreviewText('');
      setUnresolvedVars([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsPreviewLoading(true);
      try {
        const sampleData = {};
        AVAILABLE_VARIABLES.forEach((v) => {
          sampleData[v.name] = v.sample;
        });

        const result = await smsApi.previewTemplate({
          body,
          sampleData,
        });

        setPreviewText(result.rendered || '');
        setUnresolvedVars(result.unresolved_vars || []);
      } catch {
        setPreviewText('خطا در پیش‌نمایش');
      } finally {
        setIsPreviewLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [body]);

  // ✅ درج متغیر در موقعیت cursor
  const handleInsertVariable = (varName) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText =
      body.slice(0, start) +
      `{{${varName}}}` +
      body.slice(end);

    setBody(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + varName.length + 4;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // ✅ ذخیره
  const handleSave = async () => {
    if (!selectedId) return;

    try {
      await onSave(selectedId, {
        title,
        body,
        is_active: isActive,
      });
      toast.success('قالب ذخیره شد', 'ذخیره موفق');
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ذخیره قالب';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    }
  };

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle size={24} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">هیچ قالبی تعریف نشده</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Template Selector */}
      {templates.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold
                transition-colors border
                ${
                  selectedId === t.id
                    ? 'bg-primary-600 text-white border-primary-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}

      {/* Active toggle */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-2">
          <Info size={13} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-700">
            فعال بودن این قالب
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          className={`
            flex items-center gap-1.5 text-xs font-semibold
            ${isActive ? 'text-emerald-700' : 'text-gray-400'}
            transition-colors
          `}
        >
          {isActive ? (
            <ToggleRight size={20} />
          ) : (
            <ToggleLeft size={20} />
          )}
          <span>{isActive ? 'فعال' : 'غیرفعال'}</span>
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          عنوان قالب
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
        />
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-700">
            متن پیامک
          </label>
          <span className="text-[10px] text-gray-400">
            {body.length} / 2000
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          maxLength={2000}
          placeholder="متن پیامک دعوت..."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none font-mono leading-relaxed"
          dir="rtl"
        />
      </div>

      {/* Variables */}
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex items-center gap-1.5 mb-2">
          <Wand2 size={12} className="text-amber-600" />
          <span className="text-[11px] font-bold text-amber-800">
            متغیرهای قابل استفاده (کلیک برای درج)
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_VARIABLES.map((v) => (
            <VariableChip
              key={v.name}
              variable={v}
              onInsert={handleInsertVariable}
            />
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
        <div className="flex items-center gap-1.5 mb-2">
          <Eye size={12} className="text-sky-600" />
          <span className="text-[11px] font-bold text-sky-800">
            پیش‌نمایش زنده
          </span>
          {isPreviewLoading && (
            <Loader2 size={10} className="text-sky-500 animate-spin" />
          )}
          {unresolvedVars.length > 0 && (
            <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
              {unresolvedVars.length} متغیر ناشناخته
            </span>
          )}
        </div>
        <div
          className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed p-2 rounded bg-white/70 border border-sky-100 max-h-48 overflow-y-auto"
          dir="rtl"
        >
          {previewText || (
            <span className="text-gray-400">شروع به تایپ کنید...</span>
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !body || !title}
          className="
            inline-flex items-center gap-2 px-5 py-2.5
            bg-primary-600 text-white rounded-lg
            text-sm font-semibold
            hover:bg-primary-700 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            <>
              <Save size={14} />
              ذخیره قالب
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ============================================
// Test Sender
// ============================================
const TestSender = () => {
  const toast = useToast();
  const [mobile, setMobile] = useState('');
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!mobile || !text) return;

    setIsSending(true);
    setLastResult(null);

    try {
      const result = await smsApi.sendTest({ mobile, text });
      setLastResult({ success: true, ...result });
      toast.success(
        `پیامک ارسال شد${result.message_id ? ` (ID: ${result.message_id})` : ''}`,
        'ارسال موفق'
      );
    } catch (err) {
      const msg =
        err?.response?.data?.detail?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ارسال';
      setLastResult({ success: false, error: msg });
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <p className="text-xs text-gray-500 leading-relaxed">
        این ابزار برای تست تنظیمات پیامک SMS.ir استفاده می‌شود.
      </p>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            شماره موبایل
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="09123456789"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            style={{ direction: 'ltr', textAlign: 'right' }}
            disabled={isSending}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            متن پیامک
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="متن پیامک..."
            rows={5}
            maxLength={500}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
            disabled={isSending}
          />
          <div className="text-[10px] text-gray-400 mt-1">
            {text.length} / 500 کاراکتر
          </div>
        </div>

        {/* Result */}
        {lastResult && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg text-xs ${
              lastResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {lastResult.success ? (
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              {lastResult.success ? (
                <>
                  پیامک با موفقیت ارسال شد.
                  {lastResult.message_id && (
                    <span className="block mt-0.5 text-[10px] font-mono" dir="ltr">
                      Message ID: {lastResult.message_id}
                    </span>
                  )}
                </>
              ) : (
                lastResult.error
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSending || !mobile || !text}
          className="
            inline-flex items-center gap-2 px-5 py-2.5
            bg-primary-600 text-white rounded-lg
            text-sm font-semibold
            hover:bg-primary-700 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              در حال ارسال...
            </>
          ) : (
            <>
              <Send size={14} />
              ارسال پیامک
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// ============================================
// Main Component
// ============================================
const TABS = [
  { id: 'template', label: 'قالب دعوت', icon: MessageSquare },
  { id: 'test', label: 'تست ارسال', icon: Send },
];

const SmsSettings = () => {
  const [activeTab, setActiveTab] = useState('template');
  const { templates, isLoading, updateTemplate } = useSmsTemplate();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (id, data) => {
    setIsSaving(true);
    try {
      await updateTemplate(id, data);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
          <MessageSquare size={16} strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            تنظیمات پیامک
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            مدیریت قالب دعوت و تست ارسال
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-3 text-xs font-bold
                border-b-2 transition-all
                ${
                  isActive
                    ? 'border-primary-600 text-primary-700 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon size={14} strokeWidth={2.4} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="p-5">
        {activeTab === 'template' && (
          <TemplateEditor
            templates={templates}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
        {activeTab === 'test' && <TestSender />}
      </div>
    </div>
  );
};

export default SmsSettings;