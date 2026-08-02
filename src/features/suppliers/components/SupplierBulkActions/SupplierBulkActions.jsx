import { Archive, Download, X } from "lucide-react";

import { Button } from "../../../../components/ui/Button/Button";

import "./SupplierBulkActions.scss";

const SupplierBulkActions = ({
  selectedCount,
  filteredCount,
  busy,
  canExport,
  canArchive,
  onExport,
  onArchive,
  onClear,
  onSelectAllFiltered,
}) => {
  if (!selectedCount) return null;

  return (
    <div className="supplier-bulk-actions">
      <span>{selectedCount} ta tanlandi</span>
      {selectedCount < filteredCount && (
        <button type="button" onClick={onSelectAllFiltered}>
          Barcha filtrlangan {filteredCount} ta yozuvni tanlash
        </button>
      )}
      {canExport && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download size={14} />}
          onClick={onExport}
          disabled={busy}
        >
          CSV eksport
        </Button>
      )}
      {canArchive && (
        <Button
          variant="danger"
          size="sm"
          leftIcon={<Archive size={14} />}
          onClick={onArchive}
          disabled={busy}
        >
          Arxivlash
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<X size={14} />}
        onClick={onClear}
      >
        Bekor qilish
      </Button>
    </div>
  );
};

export default SupplierBulkActions;

