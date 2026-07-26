// PDF 77/92 (Export — frontend tayyorgarlik): CSV / Excel / Chop etish / PDF.
// Backend hali yo'q (bu modulda umuman yo'q) — shu sabab barcha to'rttasi
// brauzer ichida bajariladigan haqiqiy amallar (reportExport.js), stub emas.

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";

import { exportReportToCsv, exportReportToExcel, printReport } from "../../utils/reportExport";

import "./ReportExportMenu.scss";

const ReportExportMenu = ({ getExportPayload, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleExport = (format) => {
    const payload = getExportPayload();

    if (!payload || !payload.rows?.length) {
      setOpen(false);
      return;
    }

    if (format === "csv") exportReportToCsv(payload);
    if (format === "excel") exportReportToExcel(payload);
    if (format === "print") printReport(payload);
    if (format === "pdf") printReport(payload);

    setOpen(false);
  };

  return (
    <div className="report-export-menu" ref={ref}>
      <button
        type="button"
        className="report-export-menu__trigger"
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
      >
        <Download size={15} />
        Eksport
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="report-export-menu__panel">
          <button type="button" onClick={() => handleExport("csv")}>
            <FileText size={15} />
            CSV
          </button>
          <button type="button" onClick={() => handleExport("excel")}>
            <FileSpreadsheet size={15} />
            Excel
          </button>
          <button type="button" onClick={() => handleExport("pdf")}>
            <FileText size={15} />
            PDF
          </button>
          <button type="button" onClick={() => handleExport("print")}>
            <Printer size={15} />
            Chop etish
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportExportMenu;
