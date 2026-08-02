import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";

const ProductImportExport = ({ importPreview, asyncStatus, canImport, onValidateImport, onConfirmImport, onExport }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      onValidateImport(file);
    }
  };

  return (
  <div className="products-view">
    <section className="products-dashboard-grid">
      <section className="products-panel">
        <div className="products-panel__head">
          <div>
            <span><Upload size={13} /> Ma'lumot kiritish</span>
            <h2>Kiritish ustasi namunasi</h2>
          </div>
        </div>
        <div className="products-import-box">
          <strong>{selectedFile?.name || "mahsulotlar-kiritish-namuna.csv"}</strong>
          <span>Jadval ustunlarini moslash, tekshirish va takror shtrix-kod nazorati.</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="products-file-input"
            onChange={handleFileChange}
          />
          <button type="button" className="products-button is-primary" disabled={!canImport} onClick={() => fileInputRef.current?.click()}>
            Fayl tanlash va tekshirish
          </button>
        </div>
        {importPreview && (
          <div className="products-mini-grid">
            <article><strong>{importPreview.totalRows}</strong><span>Jami qator</span></article>
            <article><strong>{importPreview.validRows}</strong><span>Yaroqli</span></article>
            <article><strong>{importPreview.errors.length}</strong><span>Xatolar</span></article>
            <button type="button" className="products-button is-primary" onClick={onConfirmImport}>Kiritishni tasdiqlash</button>
          </div>
        )}
      </section>

      <section className="products-panel">
        <div className="products-panel__head">
          <div>
            <span><Download size={13} /> Ma'lumot chiqarish</span>
            <h2>Chiqarish markazi</h2>
          </div>
        </div>
        <div className="products-import-box">
          <strong>JSON / CSV / narx ro'yxati</strong>
          <span>Filtrlangan katalog fayli, audit yozuvi va holat xabari.</span>
          <button type="button" className="products-button is-primary" onClick={onExport}>Chiqarish faylini tayyorlash</button>
        </div>
        {asyncStatus && <div className={`products-status-message is-${asyncStatus.type}`}>{asyncStatus.message}</div>}
      </section>
    </section>
  </div>
  );
};

export default ProductImportExport;
