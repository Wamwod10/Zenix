import { ModuleHub, hydrateHubConfig } from "../../../shared/moduleHub";
import { posHubConfig } from "../config/posHubConfig";

const POSHub = () => <ModuleHub config={hydrateHubConfig(posHubConfig)} />;

export default POSHub;
