import { ModuleHub, hydrateHubConfig } from "../../../../shared/moduleHub";
import { createCrmHubConfig } from "../../config/crmHubConfig";
import "./CRMHub.scss";

const crmHubPermissions = {
  "crm.analytics.view": "approvalRequired",
};

const CRMHub = () => (
  <section className="crm-hub-reference">
    <ModuleHub config={hydrateHubConfig(createCrmHubConfig())} permissions={crmHubPermissions} />
  </section>
);

export default CRMHub;
