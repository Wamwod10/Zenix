import { Download } from "lucide-react";

import "./ExportCenter.scss";

const formats = [
  ["PDF", true],
  ["XLSX", true],
  ["CSV", true],
  ["DOCX", false],
  ["XML", false],
  ["Print", false],
];

const ExportCenter = ({ controller }) => (
  <section className="export-center">
    <div className="reports-simple-view__head">
      <span className="reports-eyebrow">Eksport markazi</span>
      <h2>Hisobotlarni eksport qilish</h2>
      <p>Kerakli formatni tanlang. Ulanmagan adapterlar hozircha nofaol ko'rsatiladi.</p>
    </div>
    <div className="export-center__formats">
      {formats.map(([format, enabled]) => (
        <button
          key={format}
          type="button"
          disabled={!enabled || controller.state.pendingAction === "export"}
          title={enabled ? `${format} eksport qilish` : `${format} adapteri ulanmagan`}
          onClick={() => controller.actions.exportReport(format, controller.state.selectedReport)}
        >
          <Download size={16} />
          {format}
          {!enabled && <small>Tez orada</small>}
        </button>
      ))}
    </div>
    <div className="export-center__history">
      {controller.state.exportHistory.slice(0, 5).map((item) => (
        <article key={item.id}>
          <strong>{item.reportName}</strong>
          <span>{item.format} / {item.generatedAt}</span>
        </article>
      ))}
    </div>
  </section>
);

export default ExportCenter;
