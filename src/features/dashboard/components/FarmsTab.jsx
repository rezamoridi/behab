// اضافه کردن import
import FarmImportExportBar from '../../farm-registration/components/FarmImportExportBar';
import FarmImportModal from '../../farm-registration/components/FarmImportModal';

// ...

const FarmsTab = () => {
  const [importModalOpen, setImportModalOpen] = useState(false);

  // ...

  return (
    <div className="h-full flex flex-col p-4 gap-3" dir="rtl">
      {/* Row 1 */}
      <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        {/* Stats */}
        <FarmsStatsBar farms={farms} />

        {/* Search + Import/Export + Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            {/* ... موجود */}
          </div>

          {/* ✅ جدید: Import/Export */}
          <FarmImportExportBar
            onImportClick={() => setImportModalOpen(true)}
            filters={{
              search: searchTerm.trim() || null,
            }}
            compact
          />

          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="..."
          >
            <RefreshCw
              size={16}
              className={isFetching ? 'animate-spin' : ''}
            />
          </button>
        </div>
      </div>

      {/* ... */}

      {/* ✅ Modal */}
      {importModalOpen && (
        <FarmImportModal
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            refetch();
            setImportModalOpen(false);
          }}
        />
      )}
    </div>
  );
};