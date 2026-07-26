import { useEffect, useState } from "react";
import { Download, Printer, X } from "lucide-react";

import "./ExportModal.scss";

const formats = ["PDF", "XLSX", "CSV", "DOCX", "JSON", "XML", "Print"];

const ExportModal = ({ open, reportName, onClose, onExport }) => {
  const [format, setFormat] = useState("PDF");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("reports-scroll-lock");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("reports-scroll-lock");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="reports-modal" role="dialog" aria-modal="true" aria-label="Export report">
      <button className="reports-modal__backdrop" type="button" aria-label="Close export" onClick={onClose} />
      <section className="reports-modal__panel">
        <div className="reports-modal__head">
          <div>
            <span>Export Center</span>
            <h2>{reportName}</h2>
          </div>
          <button type="button" aria-label="Close export modal" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="reports-modal__grid">
          {formats.map((item) => (
            <button key={item} type="button" className={format === item ? "is-active" : ""} onClick={() => setFormat(item)}>
              {item === "Print" ? <Printer size={16} /> : <Download size={16} />}
              {item}
            </button>
          ))}
        </div>
        <div className="reports-modal__options">
          {["Logo", "Company info", "Author", "Signature", "Charts", "KPI cards", "Watermark"].map((item) => (
            <label key={item}>
              <input type="checkbox" defaultChecked />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {result && (
          <p className="reports-modal__result">
            {result.format} ready, {result.rowsCount.toLocaleString("uz-UZ")} rows, {result.executionTime}.
          </p>
        )}
        <div className="reports-modal__footer">
          <button type="button" onClick={onClose}>Bekor qilish</button>
          <button type="button" className="is-primary" onClick={() => setResult(onExport(format))}>Export</button>
        </div>
      </section>
    </div>
  );
};

export default ExportModal;
