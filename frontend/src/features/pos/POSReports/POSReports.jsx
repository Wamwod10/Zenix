import { BarChart3, X } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./POSReports.scss";

const POSReports = ({ open = false, sales = [], returns = [], shift, onClose }) => {
  if (!open) {
    return null;
  }

  const grossSales = sales.reduce(
    (total, sale) => total + Number(sale.summary?.total || 0),
    0,
  );
  const refunds = returns.reduce(
    (total, item) => total + Number(item.refundTotal || 0),
    0,
  );

  return (
    <div className="pos-reports" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section
        className="pos-reports__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pos-reports-title"
      >
        <div className="pos-reports__header">
          <div>
            <span>
              <BarChart3 size={14} />
              POS reports
            </span>
            <h2 id="pos-reports-title">POS hisobotlari</h2>
            <p>Shift, sales, return va net sales ko'rsatkichlari.</p>
          </div>
          <button type="button" aria-label="Reports oynasini yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="pos-reports__grid">
          <article><span>Gross sales</span><strong>{formatMoney(grossSales)}</strong></article>
          <article><span>Refunds</span><strong>{formatMoney(refunds)}</strong></article>
          <article><span>Net sales</span><strong>{formatMoney(grossSales - refunds)}</strong></article>
          <article><span>Shift</span><strong>{shift?.status || "closed"}</strong></article>
        </div>

        <div className="pos-reports__history">
          {(shift?.reports || []).map((report) => (
            <article key={report.id}>
              <span>{report.type}</span>
              <strong>{formatMoney(report.grossSales)}</strong>
              <small>{report.saleCount} sales</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default POSReports;
