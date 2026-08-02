import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatDateTime, formatStatusLabel } from "../../utils/financeFormatters";

const FinanceSettings = ({ controller }) => {
  const fiscal = controller.state.settings.integrations.find((item) => item.id === "fiscal");
  const ehf = controller.state.settings.integrations.find((item) => item.id === "ehf");
  const vcr = controller.state.settings.integrations.find((item) => item.id === "vcr");

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>O'zbekiston lokalizatsiyasi</span>
            <h2>Integratsiya holati</h2>
          </div>
        </div>
        <div className="finance-card-grid">
          {controller.state.settings.integrations.map((item) => (
            <article className="finance-mini-card" key={item.id}>
              <strong>{item.name}</strong>
              <StatusBadge
                status={item.status === "connected" ? "success" : item.status === "error" ? "danger" : "warning"}
                label={formatStatusLabel(item.status)}
              />
              {item.lastCheckedAt && <span>{formatDateTime(item.lastCheckedAt)} | {item.checkedBy}</span>}
              <button type="button" onClick={() => controller.actions.updateIntegrationStatus(item.id)}>
                Holatni tekshirish
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="finance-grid">
        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>Fiskal chek va QR</span>
              <h2>Chek ko'rinishi</h2>
            </div>
            <StatusBadge status={fiscal?.status === "connected" ? "success" : "danger"} label={formatStatusLabel(fiscal?.status)} />
          </div>
          <div className="fiscal-preview">
            <strong>ZENIX FISKAL CHEK</strong>
            <span>Terminal: Humo / Uzcard</span>
            <span>QQS: soliq engine stavkasi</span>
            <span>QR: {fiscal?.status === "connected" ? "tayyor" : "ulanish talab qilinadi"}</span>
          </div>
        </section>

        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>EHF va virtual kassa</span>
              <h2>Elektron hujjatlar</h2>
            </div>
            <StatusBadge status={ehf?.status === "connected" && vcr?.status === "connected" ? "success" : "warning"} label="Tekshiruv kerak" />
          </div>
          <div className="finance-card-grid">
            <article className="finance-mini-card">
              <strong>Elektron hisob-faktura</strong>
              <StatusBadge status={ehf?.status === "connected" ? "success" : "warning"} label={formatStatusLabel(ehf?.status)} />
              <button type="button" onClick={() => controller.actions.updateIntegrationStatus("ehf")}>EHF ulanishini tekshirish</button>
            </article>
            <article className="finance-mini-card">
              <strong>Virtual kassa</strong>
              <StatusBadge status={vcr?.status === "connected" ? "success" : "warning"} label={formatStatusLabel(vcr?.status)} />
              <button type="button" onClick={() => controller.actions.updateIntegrationStatus("vcr")}>Virtual kassani tekshirish</button>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
};

export default FinanceSettings;
