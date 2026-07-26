import { Archive, CheckCircle2, RotateCcw, X } from "lucide-react";

const BulkActionBar = ({ selectedCount, onArchive, onRestore, onPending, onClear }) => {
  if (!selectedCount) return null;

  return (
    <aside className="products-bulk-bar" aria-live="polite">
      <strong>{selectedCount} tanlandi</strong>
      <button type="button" onClick={onPending}><CheckCircle2 size={15} /> Tasdiqqa</button>
      <button type="button" onClick={onArchive}><Archive size={15} /> Arxivlash</button>
      <button type="button" onClick={onRestore}><RotateCcw size={15} /> Tiklash</button>
      <button type="button" aria-label="Tanlovni tozalash" onClick={onClear}><X size={15} /></button>
    </aside>
  );
};

export default BulkActionBar;
