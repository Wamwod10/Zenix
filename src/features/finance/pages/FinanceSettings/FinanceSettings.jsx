import StatusBadge from "../../components/StatusBadge/StatusBadge";

const FinanceSettings = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Uzbekistan localization</span>
          <h2>Integratsiya holati</h2>
        </div>
      </div>
      <div className="finance-card-grid">
        {controller.state.settings.integrations.map((item) => (
          <article className="finance-mini-card" key={item.id}>
            <strong>{item.name}</strong>
            <StatusBadge
              status={item.status === "connected" ? "success" : item.status === "error" ? "danger" : "warning"}
              label={item.status}
            />
            <button type="button" onClick={() => controller.actions.addNotification(`${item.name} status tekshiruvi simulyatsiya qilindi.`)}>
              Check
            </button>
          </article>
        ))}
      </div>
    </section>

    <div className="finance-grid">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Fiscal receipt</span>
            <h2>Chek preview</h2>
          </div>
          <StatusBadge status="danger" label="Fiscal error" />
        </div>
        <div className="fiscal-preview">
          <strong>ZENIX DEMO RECEIPT</strong>
          <span>Terminal: Humo / Uzcard</span>
          <span>QQS: dynamic config</span>
          <span>Fiscal QR placeholder</span>
        </div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>EHF</span>
            <h2>Elektron hisob-faktura status</h2>
          </div>
          <StatusBadge status="warning" label="setup required" />
        </div>
        <div className="finance-warning">
          Real fiskal/EHF integratsiya backend va qonunchilik ekspertizasi bilan ulanadi.
        </div>
      </section>
    </div>
  </section>
);

export default FinanceSettings;
