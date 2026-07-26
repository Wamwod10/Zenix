// Enterprise: "Hisob-varaq" (Supplier Statement) — invoys/to'lov asosida
// hisoblangan JONLI (saqlanmaydigan, har render'da qayta hisoblanadigan)
// harakat tarixi va yuguruvchi balans, xuddi qarz (getSupplierOutstandingDebt)
// kabi. Eksport/Chop etish Purchases'dagi MAVJUD reportExport.js (CSV/Excel/
// Print) orqali — yangi eksport mantig'i yozilmaydi.

import { FileSpreadsheet } from "lucide-react";

import { Card } from "../../../../../components/ui/Card/Card";
import { EmptyState } from "../../../../../components/ui/EmptyState/EmptyState";
import {
  exportReportToCsv,
  exportReportToExcel,
  printReport,
} from "../../../../purchases/utils/reportExport";
import {
  formatCurrencyMoney,
  formatMoney,
  formatPurchaseDate,
  normalizeNumber,
} from "../../../../purchases/utils/purchaseMoney";

// Har bir invoys/to'lov o'z valyutasida ko'rsatiladi, lekin yuguruvchi
// balans YAGONA baza valyutada (UZS) hisoblanadi — getSupplierOutstandingDebt
// bilan bir xil konvertatsiya (`amount * exchangeRate`), aks holda turli
// valyutadagi summalar to'g'ridan-to'g'ri qo'shilib, balans ma'nosiz bo'lib
// qolardi.
const buildLedgerRows = (invoices) => {
  const events = [];

  invoices.forEach((invoice) => {
    const rate = normalizeNumber(invoice.exchangeRate) || 1;

    events.push({
      at: invoice.createdAt,
      type: "invoice",
      reference: invoice.number,
      amountLabel: formatCurrencyMoney(invoice.amount, invoice.currency),
      baseDelta: Math.round(normalizeNumber(invoice.amount) * rate),
    });

    (invoice.payments || []).forEach((payment) => {
      events.push({
        at: payment.paidAt || payment.paymentDate,
        type: "payment",
        reference: `${invoice.number} — to'lov`,
        amountLabel: formatCurrencyMoney(payment.amount, payment.currency || invoice.currency),
        baseDelta: -Math.round(
          payment.baseCurrencyAmount ?? normalizeNumber(payment.amount) * rate,
        ),
      });
    });
  });

  events.sort((a, b) => new Date(a.at) - new Date(b.at));

  let balance = 0;

  return events.map((event) => {
    balance += event.baseDelta;

    return {
      ...event,
      balance,
      debit: event.baseDelta > 0 ? event.amountLabel : "",
      credit: event.baseDelta < 0 ? event.amountLabel : "",
    };
  });
};

const STATEMENT_COLUMNS = [
  { key: "date", label: "Sana", value: (row) => formatPurchaseDate(row.at) },
  { key: "reference", label: "Hujjat", value: (row) => row.reference },
  {
    key: "type",
    label: "Turi",
    value: (row) => (row.type === "invoice" ? "Invoys" : "To'lov"),
  },
  { key: "debit", label: "Debet", value: (row) => row.debit },
  { key: "credit", label: "Kredit", value: (row) => row.credit },
  { key: "balance", label: "Balans (so'm)", value: (row) => formatMoney(row.balance) },
];

const SupplierStatementTab = ({ supplier, invoices = [] }) => {
  const rows = buildLedgerRows(invoices);

  const getExportPayload = () => ({
    title: `Yetkazib beruvchi hisob-varag'i — ${supplier.name}`,
    subtitle: `Shakllantirilgan sana: ${formatPurchaseDate(new Date().toISOString())}`,
    columns: STATEMENT_COLUMNS,
    rows,
    filename: `supplier-statement-${supplier.id}`,
    summary: rows.length
      ? [{ label: "Joriy balans", value: formatMoney(rows[rows.length - 1].balance) }]
      : [],
  });

  return (
    <Card
      className="supplier-profile__card"
      role="tabpanel"
      id="supplier-tabpanel-statement"
      aria-labelledby="supplier-tab-statement"
    >
      <div className="supplier-profile__products-head">
        <div>
          <h3>Hisob-varaq</h3>
          <p className="supplier-profile__field-hint">
            Barcha invoys va to'lovlar asosida yuguruvchi balans.
          </p>
        </div>

        {rows.length > 0 && (
          <div className="supplier-profile__products-actions">
            <button
              type="button"
              className="purchase-btn purchase-btn--ghost"
              onClick={() => exportReportToCsv(getExportPayload())}
            >
              CSV
            </button>
            <button
              type="button"
              className="purchase-btn purchase-btn--ghost"
              onClick={() => exportReportToExcel(getExportPayload())}
            >
              Excel
            </button>
            <button
              type="button"
              className="purchase-btn purchase-btn--ghost"
              onClick={() => printReport(getExportPayload())}
            >
              Chop etish / PDF
            </button>
          </div>
        )}
      </div>

      {rows.length ? (
        <div className="supplier-profile__history">
          {rows.map((row, index) => (
            <div className="supplier-profile__history-row" key={`${row.reference}-${index}`}>
              <span className="supplier-profile__history-primary">
                <strong>{row.reference}</strong>
                <small>{formatPurchaseDate(row.at)}</small>
              </span>
              <span className="supplier-profile__history-money">
                {row.debit && <span>+{row.debit}</span>}
                {row.credit && <span>-{row.credit}</span>}
              </span>
              <span className="supplier-profile__history-money">
                <strong>{formatMoney(row.balance)}</strong>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileSpreadsheet}
          title="Hisob-varaq bo'sh"
          description="Bu yetkazib beruvchi uchun hali invoys yoki to'lov yo'q."
        />
      )}
    </Card>
  );
};

export default SupplierStatementTab;
