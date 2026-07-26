// Enterprise: "Faoliyat" bo'limi — Supplier Activity Timeline / Audit Log
// (PDF §86-87). Har bir mutatsiya (yaratish, tahrirlash, holat, izoh,
// hujjat, mahsulot bog'lash, arxivlash, da'vo) suppliersApi.js tomonidan
// append-only `supplier.timeline` massiviga yoziladi — bu yerda faqat
// ko'rsatiladi. Mavjud PurchaseTimeline komponenti (Purchases moduli) AYNAN
// bir xil hodisa shakli ({id,type,label,actor,at}) bilan qayta ishlatiladi —
// yangi vizual komponent yaratilmaydi.

import { Card } from "../../../../../components/ui/Card/Card";
import PurchaseTimeline from "../../../../purchases/components/PurchaseTimeline/PurchaseTimeline";

const SupplierActivityTab = ({ supplier }) => (
  <Card
    className="supplier-profile__card"
    role="tabpanel"
    id="supplier-tabpanel-activity"
    aria-labelledby="supplier-tab-activity"
  >
    <h3>Faoliyat va audit</h3>
    <p className="supplier-profile__field-hint">
      Ushbu yetkazib beruvchiga tegishli barcha o'zgarishlar — kim, nima, qachon.
    </p>

    <PurchaseTimeline events={supplier.timeline || []} />
  </Card>
);

export default SupplierActivityTab;
