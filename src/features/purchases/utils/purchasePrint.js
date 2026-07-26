// PDF 2: Quick Actions — PO ni PDF/chop etish (print oynasi orqali).

import { PURCHASE_STATUS_LABELS } from "../constants/purchaseStatuses";
import { calculateOrderTotals } from "./purchaseCalculations";
import {
  formatCurrencyMoney,
  formatMoney,
  formatPurchaseDate,
} from "./purchaseMoney";

export const printPurchaseOrder = (order, supplier) => {
  if (typeof window === "undefined" || !order) return;

  const totals = calculateOrderTotals(order);
  const currency = order.currency || "UZS";
  const money = (value) => formatCurrencyMoney(value, currency);

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.name} <small>(${item.sku})</small></td>
          <td>${item.quantity} ${item.unitLabel || ""}</td>
          <td>${money(item.price)}</td>
          <td>${item.discountPercent || 0}%</td>
          <td>${item.taxRate}%</td>
        </tr>`,
    )
    .join("");

  const supplierNotes = (order.notes || [])
    .filter((note) => note.type === "supplier")
    .map((note) => `<p><em>${note.text}</em></p>`)
    .join("");

  const html = `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<title>${order.number}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 32px; color: #0f172a; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #475569; font-size: 13px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 8px 10px; border: 1px solid #cbd5e1; text-align: left; }
  th { background: #f1f5f9; }
  .totals { margin-top: 16px; font-size: 14px; text-align: right; }
  .totals strong { font-size: 16px; }
</style>
</head>
<body>
  <h1>Xarid buyurtmasi ${order.number}</h1>
  <div class="meta">
    Supplier: <b>${supplier?.name || "—"}</b> · Holat: ${
      PURCHASE_STATUS_LABELS[order.status] || order.status
    } · Sana: ${formatPurchaseDate(order.createdAt)} ·
    Yetkazish: ${formatPurchaseDate(order.expectedDate)}
  </div>
  <table>
    <thead>
      <tr><th>Tovar</th><th>Miqdor</th><th>Narx</th><th>Chegirma</th><th>QQS</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    Oraliq: ${money(totals.linesSubtotal)}<br/>
    Chegirma: -${money(totals.orderDiscount)}<br/>
    QQS: ${money(totals.taxAmount)}<br/>
    <strong>JAMI: ${money(totals.total)}</strong>
    ${
      currency !== "UZS"
        ? `<br/><small>UZS ekvivalenti (kurs ${order.exchangeRate || 1}): ${formatMoney(
            Math.round(totals.total * (order.exchangeRate || 1)),
          )}</small>`
        : ""
    }
  </div>
  ${supplierNotes}
  <script>window.print();</script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=800,height=900");

  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
};

// PDF 2, 92: bulk eksport — CSV
export const exportOrdersToCsv = (orders, getSupplier) => {
  if (typeof window === "undefined" || !orders.length) return;

  const header = "PO;Supplier;Sana;Holat;Yetkazish;Valyuta;Jami;Jami (UZS)\n";

  const body = orders
    .map((order) => {
      const totals = calculateOrderTotals(order);

      return [
        order.number,
        getSupplier?.(order.supplierId)?.name || "",
        order.createdAt?.slice(0, 10) || "",
        PURCHASE_STATUS_LABELS[order.status] || order.status,
        order.expectedDate || "",
        order.currency || "UZS",
        totals.total,
        Math.round(totals.total * (order.exchangeRate || 1)),
      ].join(";");
    })
    .join("\n");

  const blob = new Blob([`﻿${header}${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `xaridlar-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
