// ERP arxitektura tuzatishi: "Yangi mahsulot yaratish" (Product Master)
// "Mavjud mahsulotni bog'lash" (Vendor/Supplier link) dan BUTUNLAY ALOHIDA
// oqim. Bu yerda foydalanuvchi HECH QANDAY mavjud mahsulotni tanlamaydi —
// mahsulot ma'lumotini to'g'ridan-to'g'ri kiritadi va yangi Product Master
// yozuvi yaratiladi (SAP/Odoo/Dynamics/MoySklad'dagi kabi). Saqlashda
// mahsulot Product katalogiga (usePurchasesStore -> actions.createProduct)
// qo'shiladi va BIR HARAKATDA (ikkinchi qadamsiz) joriy supplierga
// bog'lanadi — bog'lash mantig'i SupplierProfile.jsx'da (handleCreateProduct)
// amalga oshiriladi, bu komponent faqat forma ma'lumotini yig'adi.

import { useEffect, useState } from "react";

import { Button } from "../../../../components/ui/Button/Button";
import { Dropdown } from "../../../../components/ui/Dropdown/Dropdown";
import { Input } from "../../../../components/ui/Input/Input";
import { Modal } from "../../../../components/ui/Modal/Modal";
import { PURCHASE_CURRENCIES } from "../../../purchases/constants/currencies";

import "./SupplierProductCreateModal.scss";

const buildEmptyForm = () => ({
  name: "",
  sku: "",
  barcode: "",
  category: "",
  purchaseUnit: "",
  saleUnit: "",
  price: "",
  currency: "UZS",
  leadTimeDays: "",
  moq: "",
  notes: "",
});

const SupplierProductCreateModal = ({ open, onClose, onCreate }) => {
  const [form, setForm] = useState(buildEmptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(buildEmptyForm());
      setError("");
    }
  }, [open]);

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Mahsulot nomini kiriting");
      return;
    }

    if (!form.sku.trim()) {
      setError("SKU kodini kiriting");
      return;
    }

    if (!form.purchaseUnit.trim()) {
      setError("Xarid birligini kiriting");
      return;
    }

    const price = Number(form.price);

    if (!price || price <= 0) {
      setError("Xarid narxini kiriting");
      return;
    }

    onCreate?.({
      name: form.name.trim(),
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      category: form.category.trim(),
      purchaseUnit: form.purchaseUnit.trim(),
      saleUnit: form.saleUnit.trim(),
      price,
      currency: form.currency,
      leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : undefined,
      moq: Number(form.moq) || 1,
      notes: form.notes.trim(),
    });
  };

  return (
    <Modal
      open={open}
      title="Yangi mahsulot yaratish"
      description="Product katalogida yangi mahsulot yaratiladi va darhol shu yetkazib beruvchiga bog'lanadi."
      onClose={onClose}
    >
      <form className="supplier-product-create" onSubmit={handleSubmit}>
        <div className="supplier-product-create__grid">
          <Input
            className="supplier-product-create__wide"
            label="Mahsulot nomi"
            placeholder="masalan Coca-Cola 1.5L"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
          />

          <Input
            label="SKU"
            placeholder="SKU kodi"
            value={form.sku}
            onChange={(event) => setField("sku", event.target.value)}
          />

          <Input
            label="Shtrix-kod (ixtiyoriy)"
            placeholder="478..."
            value={form.barcode}
            onChange={(event) => setField("barcode", event.target.value)}
          />

          <Input
            label="Kategoriya"
            placeholder="masalan Ichimlik"
            value={form.category}
            onChange={(event) => setField("category", event.target.value)}
          />

          <Input
            label="Xarid birligi"
            placeholder="masalan Quti 12x"
            value={form.purchaseUnit}
            onChange={(event) => setField("purchaseUnit", event.target.value)}
          />

          <Input
            label="Sotuv birligi (ixtiyoriy)"
            placeholder="masalan Dona"
            value={form.saleUnit}
            onChange={(event) => setField("saleUnit", event.target.value)}
          />

          <Input
            label="Xarid narxi"
            type="number"
            min="0"
            placeholder="0"
            value={form.price}
            onChange={(event) => setField("price", event.target.value)}
          />

          <Dropdown
            label="Valyuta"
            value={form.currency}
            options={PURCHASE_CURRENCIES.map((currency) => ({
              value: currency.code,
              label: currency.label,
            }))}
            onChange={(value) => setField("currency", value)}
          />

          <Input
            label="Yetkazish muddati (kun, ixtiyoriy)"
            type="number"
            min="0"
            placeholder="masalan 3"
            value={form.leadTimeDays}
            onChange={(event) => setField("leadTimeDays", event.target.value)}
          />

          <Input
            label="Minimal buyurtma miqdori"
            type="number"
            min="1"
            placeholder="1"
            value={form.moq}
            onChange={(event) => setField("moq", event.target.value)}
          />
        </div>

        <Input
          className="supplier-product-create__wide"
          label="Izoh (ixtiyoriy)"
          placeholder="Qo'shimcha eslatma..."
          value={form.notes}
          onChange={(event) => setField("notes", event.target.value)}
        />

        {error && <p className="supplier-product-create__error">{error}</p>}

        <div className="supplier-product-create__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary">
            Mahsulotni yaratish
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierProductCreateModal;
