import { Download } from "lucide-react";

import "./ExportCenter.scss";

const ExportCenter = ({ controller }) => (
  <section className="export-center">
    <div className="reports-simple-view__head">
      <span className="reports-eyebrow">Export Center</span>
      <h2>Professional export simulation</h2>
    </div>
    <div className="export-center__formats">
      {["PDF", "XLSX", "CSV", "DOCX", "JSON", "XML", "Print"].map((format) => (
        <button key={format} type="button" onClick={() => controller.actions.exportReport(format, controller.state.selectedReport)}>
          <Download size={16} />
          {format}
        </button>
      ))}
    </div>
    <pre>{JSON.stringify(controller.state.backendPayload, null, 2)}</pre>
  </section>
);

export default ExportCenter;
