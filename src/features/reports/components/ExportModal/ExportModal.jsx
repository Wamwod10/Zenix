import { useState } from "react";
import { Download, Printer, X } from "lucide-react";

import { useReportsOverlay } from "../../hooks/useReportsOverlay";
import { getReportTitle } from "../../utils/reportsFormatters";
import ReportsField from "../ReportsField/ReportsField";
import "./ExportModal.scss";

const formats = [
  { id: "PDF", enabled: true },
  { id: "XLSX", enabled: true },
  { id: "CSV", enabled: true },
  { id: "DOCX", enabled: false },
  { id: "XML", enabled: false },
  { id: "Print", enabled: false },
];

const ExportModal = ({ open, reportName, filters, pending, onClose, onExport }) => {
  const [format, setFormat] = useState("PDF");
  const [orientation, setOrientation] = useState("portrait");
  const [result, setResult] = useState(null);
  const panelRef = useReportsOverlay(open, onClose);

  if (!open) return null;

  const selectedFormat = formats.find((item) => item.id === format);

  return (
    <div className="reports-modal" role="dialog" aria-modal="true" aria-label="Hisobot eksporti">
      <button className="reports-modal__backdrop" type="button" aria-label="Eksport oynasini yopish" onClick={onClose} />
      <section className="reports-modal__panel" ref={panelRef}>
        <div className="reports-modal__head">
          <div>
            <span>Eksport markazi</span>
            <h2>{getReportTitle(reportName)}</h2>
          </div>
          <button type="button" aria-label="Eksport oynasini yopish" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="reports-modal__grid">
          {formats.map((item) => (
            <button
              key={item.id}
              type="button"
              className={format === item.id ? "is-active" : ""}
              onClick={() => setFormat(item.id)}
              disabled={!item.enabled}
              title={item.enabled ? `${item.id} formatini tanlash` : `${item.id} adapteri hali ulanmagan`}
            >
              {item.id === "Print" ? <Printer size={16} /> : <Download size={16} />}
              {item.id}
            </button>
          ))}
        </div>

        <div className="reports-modal__form">
          <ReportsField
            label="Sahifa yo'nalishi"
            type="select"
            value={orientation}
            options={[
              { value: "portrait", label: "Portret" },
              { value: "landscape", label: "Landshaft" },
            ]}
            onChange={setOrientation}
          />
          <ReportsField
            label="Davr"
            value={`${filters.startDate} - ${filters.endDate}`}
            onChange={() => {}}
            readOnly
          />
        </div>

        <div className="reports-modal__options">
          {["Logo", "Kompaniya ma'lumoti", "Muallif", "Imzo", "Grafiklar", "KPI kartalar", "Watermark"].map((item) => (
            <label key={item}>
              <input type="checkbox" defaultChecked />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {result && (
          <p className="reports-modal__result">
            {result.format} tayyor: {result.rowsCount.toLocaleString("uz-UZ")} qator, {result.executionTime}.
          </p>
        )}
        <div className="reports-modal__footer">
          <button type="button" onClick={onClose}>Bekor qilish</button>
          <button
            type="button"
            className="is-primary"
            disabled={pending || !selectedFormat?.enabled}
            onClick={() => setResult(onExport(format, { orientation }))}
          >
            {pending ? "Tayyorlanmoqda..." : "Eksport qilish"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ExportModal;
