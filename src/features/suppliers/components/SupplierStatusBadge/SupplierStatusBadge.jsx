import { Badge } from "../../../../components/ui/Badge/Badge";
import {
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_STATUS_TONES,
} from "../../suppliersApi";

const SupplierStatusBadge = ({ status }) => (
  <Badge tone={SUPPLIER_STATUS_TONES[status] || "neutral"}>
    {SUPPLIER_STATUS_LABELS[status] || status}
  </Badge>
);

export default SupplierStatusBadge;
