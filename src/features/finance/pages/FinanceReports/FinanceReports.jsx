import { BarChart3, FileText, ReceiptText } from "lucide-react";

import { formatMoney } from "../../utils/financeFormatters";

const FinanceReports = ({ controller, onNavigate }) => {
  const reports = [
    {
      id: "pnl",
      title: "Foyda va zarar",
      icon: BarChart3,
      view: "profit-loss",
      rows: [["Ko'rsatkich", "Summa"], ["Daromad", controller.summary.income], ["Xarajat", controller.summary.expenses], ["Sof foyda", controller.summary.netProfit]],
    },
    {
      id: "balance",
      title: "Balans",
      icon: FileText,
      view: "balance-sheet",
      rows: [["Hisob", "Qoldiq"], ...controller.state.accounts.map((account) => [account.name, account.openingBalance])],
    },
    {
      id: "cash",
      title: "Pul oqimi hisoboti",
      icon: ReceiptText,
      view: "cash-flow-statement",
      rows: [["Ko'rsatkich", "Summa"], ["Sof pul oqimi", controller.summary.cashFlow], ["Bank", controller.summary.bank], ["Kassa", controller.summary.cash]],
    },
    {
      id: "tax",
      title: "Soliq hisobotlari",
      icon: FileText,
      view: "tax-reports",
      rows: [["Soliq", "To'lanadi"], ...controller.state.taxReports.map((tax) => [tax.name, tax.payable])],
    },
  ];

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Moliyaviy hisobotlar</span>
            <h2>Hisobotlar</h2>
          </div>
        </div>
        <div className="finance-card-grid">
          {reports.map((report) => {
            const Icon = report.icon;

            return (
              <article className="finance-report-card" key={report.id}>
                <Icon size={18} />
                <strong>{report.title}</strong>
                <span>Davr: {controller.state.settings.currentPeriodId || "Ochiq davr"} | holat: tasdiq kutilmoqda</span>
                <b>{formatMoney(report.rows.slice(1).reduce((total, row) => total + Number(row[1] || 0), 0))}</b>
                <div className="finance-row-actions">
                  <button type="button" onClick={() => onNavigate(report.view)}>Ko'rish</button>
                  <button type="button" onClick={() => controller.actions.exportFinanceCsv(report.id, report.rows)}>CSV eksport</button>
                  <button type="button" onClick={() => controller.actions.exportFinanceCsv(`${report.id}-xlsx`, report.rows)}>XLSX</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Oxirgi hisobotlar</span>
            <h2>Saved va scheduled reports</h2>
          </div>
        </div>
        <div className="finance-table">
          {reports.map((report) => (
            <article key={`saved-${report.id}`}>
              <div>
                <strong>{report.title}</strong>
                <span>Mas'ul: {controller.currentUser} | davr: {controller.state.settings.currentPeriodId || "joriy"}</span>
              </div>
              <b>PDF / XLSX / CSV</b>
              <button type="button" onClick={() => onNavigate(report.view)}>Ko'rish</button>
              <button type="button" onClick={() => controller.actions.exportFinanceCsv(`saved-${report.id}`, report.rows)}>Eksport</button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};

export default FinanceReports;
