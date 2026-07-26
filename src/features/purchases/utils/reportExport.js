// PDF 77, 92 (Enterprise Reports & Analytics — Export): FRONTEND-ready eksport.
// Backend hali yo'q (bu modulda hech qanday API yo'q — purchasePrint.js dagi
// exportOrdersToCsv bilan bir xil pattern), shu sabab faqat brauzer ichida
// bajarilishi mumkin bo'lgan formatlar taqdim etiladi: CSV (real fayl),
// Excel (HTML-jadval trikini .xls sifatida — Excel to'g'ridan-to'g'ri ochadi),
// Print/PDF (brauzer chop etish oynasi — "PDF sifatida saqlash" shu orqali).
// Barcha funksiyalar bir xil kontrakt qabul qiladi: { title, columns, rows,
// filename } — kelajakda haqiqiy backend eksportga o'tishda shu bitta
// kontraktni saqlab qolish yetarli.

const escapeCsvValue = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);

  return /[;"\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
};

const buildRowsFromColumns = (columns, rows) =>
  rows.map((row) => columns.map((column) => column.value(row)));

// CSV — real fayl, hech qanday bog'liqlik shart emas.
export const exportReportToCsv = ({ columns, rows, filename }) => {
  if (typeof window === "undefined" || !rows.length) return;

  const header = columns.map((column) => escapeCsvValue(column.label)).join(";");
  const body = buildRowsFromColumns(columns, rows)
    .map((cells) => cells.map(escapeCsvValue).join(";"))
    .join("\n");

  const blob = new Blob([`﻿${header}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, `${filename}.csv`);
};

// Excel — haqiqiy .xlsx kutubxonasi ulanmagan, lekin Excel/LibreOffice HTML
// jadvalni ".xls" kengaytmasi bilan ochilganda avtomatik tanib oladi —
// kutubxonasiz, faqat brauzerda ishlaydigan haqiqiy "Excel'ga eksport".
export const exportReportToExcel = ({ title, columns, rows, filename }) => {
  if (typeof window === "undefined" || !rows.length) return;

  const headerCells = columns.map((column) => `<th>${column.label}</th>`).join("");
  const bodyRows = buildRowsFromColumns(columns, rows)
    .map((cells) => `<tr>${cells.map((cell) => `<td>${cell ?? ""}</td>`).join("")}</tr>`)
    .join("");

  const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>${title}</title></head>
<body>
<table border="1">
<thead><tr>${headerCells}</tr></thead>
<tbody>${bodyRows}</tbody>
</table>
</body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });

  downloadBlob(blob, `${filename}.xls`);
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Print / PDF — brauzer chop etish oynasi orqali. "PDF sifatida saqlash"
// tizim print dialogining o'zida mavjud (Ctrl+P -> Save as PDF), shu sabab
// alohida PDF kutubxonasi kerak emas.
export const printReport = ({ title, subtitle, columns, rows, summary = [] }) => {
  if (typeof window === "undefined" || !rows.length) return;

  const headerCells = columns.map((column) => `<th>${column.label}</th>`).join("");
  const bodyRows = buildRowsFromColumns(columns, rows)
    .map((cells) => `<tr>${cells.map((cell) => `<td>${cell ?? ""}</td>`).join("")}</tr>`)
    .join("");

  const summaryHtml = summary.length
    ? `<div class="summary">${summary
        .map((entry) => `<span><b>${entry.label}:</b> ${entry.value}</span>`)
        .join("")}</div>`
    : "";

  const html = `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 32px; color: #0f172a; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #475569; font-size: 13px; margin-bottom: 18px; }
  .summary { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 18px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th, td { padding: 7px 9px; border: 1px solid #cbd5e1; text-align: left; }
  th { background: #f1f5f9; }
</style>
</head>
<body>
  <h1>${title}</h1>
  ${subtitle ? `<div class="meta">${subtitle}</div>` : ""}
  ${summaryHtml}
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <script>window.print();</script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=1000");

  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
};
