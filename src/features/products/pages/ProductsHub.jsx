import { ModuleHub, hydrateHubConfig } from "../../../shared/moduleHub";
import { productsHubConfig } from "../config/productsHubConfig";

const ProductsHub = ({ controller }) => (
  <ModuleHub config={hydrateHubConfig(productsHubConfig)} permissions={controller.permissions} />
);

export default ProductsHub;
