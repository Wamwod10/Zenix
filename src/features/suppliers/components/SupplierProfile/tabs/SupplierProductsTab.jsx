// Extracted from SupplierProfile.jsx: "Mahsulotlar" bo'limi. ERP
// arxitektura: ikkita ANIQ AJRATILGAN amal — "Yangi mahsulot yaratish"
// (Product Master, hech qanday mavjud mahsulot tanlanmaydi) va "Mavjud
// mahsulotni bog'lash" (Vendor/Supplier Price List, katalogdan tanlash +
// faqat shu supplierга xos shartlar). Ular bitta tugma/formaga
// ARALASHTIRILMAYDI — SAP, Odoo, Dynamics, MoySklad'da ham shu ikkalasi
// alohida.
//
// Bu bo'limga XOS bo'lgan modal/so'rov holati (link/create modal ochiq-yopiq,
// bog'lanishni bekor qilish so'rovi) ilgari SupplierProfile.jsx'ning umumiy
// state'ida edi — endi shu yerda, faqat shu bo'lim ishlatadigan joyda.

import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "../../../../../components/ui/Button/Button";
import { useNotification } from "../../../../../components/ui/Notification/NotificationContext";
import SupplierConfirmDialog from "../../SupplierConfirmDialog/SupplierConfirmDialog";
import SupplierProductCreateModal from "../../SupplierProductCreateModal/SupplierProductCreateModal";
import SupplierProductLinkModal from "../../SupplierProductLinkModal/SupplierProductLinkModal";
import SupplierProducts from "../../SupplierProducts/SupplierProducts";

const SupplierProductsTab = ({ supplier, products, orders, onUpdateSupplier, onCreateProduct }) => {
  const notify = useNotification();
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [unlinkRequest, setUnlinkRequest] = useState(null);

  // Step 3/5/6: mahsulot bog'lanishi — SupplierProductLinkModal orqali
  // MAVJUD Product katalogidan bitta mahsulot tanlanib shu supplierga
  // bog'lanadi (yangi mahsulot BU YERDA yaratilmaydi — buning uchun
  // butunlay alohida SupplierProductCreateModal bor). Bog'lanish o'zi
  // mavjud arxitekturadan foydalanadi (`supplier.productIds` —
  // PurchaseOrderWizard ham xuddi shu massivni o'qiydi), shu supplierga
  // XOS tijorat shartlari (supplier SKU, narx, muddat, MOQ, izoh) esa
  // `supplier.productOverrides` (productId -> shart) ichida saqlanadi —
  // bu mahsulot katalogini DUBLIKATSIYA qilmaydi, faqat shu bog'lanishga
  // xos kichik metama'lumot.
  const handleLinkProduct = ({ productId, ...overrides }) => {
    const currentIds = supplier.productIds || [];

    if (!currentIds.includes(productId)) {
      onUpdateSupplier?.({
        productIds: [...currentIds, productId],
        productOverrides: {
          ...(supplier.productOverrides || {}),
          [productId]: overrides,
        },
      });
      notify.success("Mahsulot muvaffaqiyatli bog'landi.");
    } else {
      notify.info("Bu mahsulot allaqachon bog'langan.");
    }

    setLinkModalOpen(false);
  };

  // ERP arxitektura: "Yangi mahsulot yaratish" — "Mavjud mahsulotni
  // bog'lash"dan BUTUNLAY ALOHIDA oqim (SupplierProductCreateModal hech
  // qanday mavjud mahsulot tanlamaydi, faqat yangi mahsulot ma'lumotini
  // yig'adi). Mahsulotning o'zi Product katalogida (`usePurchasesStore`
  // -> `actions.createProduct`, Purchases moduli — YAGONA manba) yaratiladi,
  // so'ng QAYTARILGAN mahsulot id'si shu supplierга DARHOL bog'lanadi (bir
  // harakat, ikkinchi qadam yo'q) — xuddi mavjud mahsulot bog'lashda
  // ishlatiladigan bir xil `productIds`/`productOverrides` mexanizmi orqali.
  const handleCreateProduct = (payload) => {
    const { leadTimeDays, notes, ...productFields } = payload;

    // productFields (name, sku, barcode, category, purchaseUnit, saleUnit,
    // price, currency, moq) belgilaydi mahsulotning KATALOGDAGI boshlang'ich
    // standartini; xuddi shu narx/MOQ shu birinchi supplier uchun ANIQ
    // shart sifatida override'da ham saqlanadi (leadTimeDays/notes esa
    // faqat supplier darajasida mavjud, product master'da yo'q).
    const product = onCreateProduct?.(productFields);

    if (product?.id) {
      const currentIds = supplier.productIds || [];

      onUpdateSupplier?.({
        productIds: currentIds.includes(product.id)
          ? currentIds
          : [...currentIds, product.id],
        productOverrides: {
          ...(supplier.productOverrides || {}),
          [product.id]: {
            price: payload.price,
            currency: payload.currency,
            moq: payload.moq,
            leadTimeDays,
            notes,
          },
        },
      });
      notify.success(`"${product.name}" mahsuloti yaratildi va bog'landi.`);
    } else {
      // Edge case (auditda ko'rsatilmagan): agar mahsulot yaratilmasa
      // (masalan ota komponent `onCreateProduct` bermagan), modal ilgari
      // hech qanday xabarsiz yopilib qolardi — foydalanuvchi mahsulot
      // yaratilmaganini bilmasdi.
      notify.error("Mahsulot yaratilmadi. Qaytadan urinib ko'ring.");
    }

    setCreateModalOpen(false);
  };

  // Bog'lanishni bekor qilish — Mahsulotlar jadvalidagi "Amallar" ustunidan
  // chaqiriladi. `productIds` VA unga tegishli override ikkalasi ham
  // tozalanadi. Confirmation Dialog (audit "Unlink Product"): haqiqiy
  // o'zgarish faqat foydalanuvchi tasdiqlaganda (confirmUnlinkProduct) yuz
  // beradi — jadvaldagi tugma esa faqat so'rov ochadi (requestUnlinkProduct).
  const requestUnlinkProduct = (productId) => setUnlinkRequest(productId);

  const confirmUnlinkProduct = () => {
    if (!unlinkRequest) return;

    const productId = unlinkRequest;
    const productName =
      products.find((product) => product.id === productId)?.name || "Mahsulot";
    const nextIds = (supplier.productIds || []).filter((id) => id !== productId);
    const nextOverrides = { ...(supplier.productOverrides || {}) };

    delete nextOverrides[productId];

    onUpdateSupplier?.({ productIds: nextIds, productOverrides: nextOverrides });
    notify.success(`"${productName}" bog'lanishi bekor qilindi.`);
    setUnlinkRequest(null);
  };

  return (
    <div
      className="supplier-profile__products-tab"
      role="tabpanel"
      id="supplier-tabpanel-products"
      aria-labelledby="supplier-tab-products"
    >
      {/* ERP arxitektura: ikkita ANIQ AJRATILGAN amal — "Yangi mahsulot
          yaratish" (Product Master, hech qanday mavjud mahsulot
          tanlanmaydi) va "Mavjud mahsulotni bog'lash" (Vendor/Supplier
          Price List, katalogdan tanlash + faqat shu supplierга xos
          shartlar). Ular bitta tugma/formaga ARALASHTIRILMAYDI — SAP,
          Odoo, Dynamics, MoySklad'da ham shu ikkalasi alohida. */}
      <div className="supplier-profile__products-head">
        <div>
          <h3>Bog'langan mahsulotlar</h3>
          <p className="supplier-profile__field-hint">
            Faqat aniq bog'langan mahsulotlar ko'rsatiladi.
          </p>
        </div>

        <div className="supplier-profile__products-actions">
          <Button
            variant="secondary"
            leftIcon={<Search size={15} />}
            onClick={() => setLinkModalOpen(true)}
          >
            Mavjud mahsulotni bog'lash
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus size={15} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Yangi mahsulot yaratish
          </Button>
        </div>
      </div>

      <SupplierProducts
        supplier={supplier}
        products={products}
        orders={orders}
        onUnlink={requestUnlinkProduct}
      />

      <SupplierProductLinkModal
        open={linkModalOpen}
        products={products}
        linkedProductIds={supplier.productIds || []}
        onClose={() => setLinkModalOpen(false)}
        onLink={handleLinkProduct}
      />

      <SupplierProductCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateProduct}
      />

      <SupplierConfirmDialog
        open={!!unlinkRequest}
        tone="warning"
        title="Bog'lanishni bekor qilish"
        description={`"${
          products.find((product) => product.id === unlinkRequest)?.name || "Mahsulot"
        }" mahsulotining ushbu yetkazib beruvchi bilan bog'lanishi bekor qilinadi. Bu amalni keyin qaytarib bo'lmaydi.`}
        confirmLabel="Ha, bekor qilish"
        onConfirm={confirmUnlinkProduct}
        onClose={() => setUnlinkRequest(null)}
      />
    </div>
  );
};

export default SupplierProductsTab;
