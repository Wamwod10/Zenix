import { BarChart3, FileText, ReceiptText } from "lucide-react";

const reports = [
  { id: "pnl", title: "Profit & Loss", icon: BarChart3 },
  { id: "balance", title: "Balance Sheet", icon: FileText },
  { id: "cash", title: "Cash Flow Statement", icon: ReceiptText },
  { id: "tax", title: "Tax Reports", icon: FileText },
];

const FinanceReports = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Financial reports</span>
          <h2>Hisobotlar</h2>
        </div>
      </div>
      <div className="finance-card-grid">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <button type="button" className="finance-report-card" key={report.id} onClick={() => controller.actions.addNotification(`${report.title} export simulyatsiya qilindi.`)}>
              <Icon size={18} />
              <strong>{report.title}</strong>
              <span>Preview, validation, export adapter ready</span>
            </button>
          );
        })}
      </div>
    </section>
  </section>
);

export default FinanceReports;
