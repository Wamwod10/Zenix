import { Download, Upload } from "lucide-react";

const ProductImportExport = ({ importPreview, asyncStatus, canImport, onValidateImport, onConfirmImport, onExport }) => (
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
          <strong>mahsulotlar-kiritish-namuna.csv</strong>
          <span>Jadval ustunlarini moslash, tekshirish va takror shtrix-kod nazorati.</span>
          <button type="button" className="products-button is-primary" disabled={!canImport} onClick={onValidateImport}>
            Namunani tekshirish
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

export default ProductImportExport;
