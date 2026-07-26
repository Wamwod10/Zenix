// Step 1: Supplier yaratish/asosiy rekvizitni tahrirlash formasi — FAQAT
// kompaniya ma'lumotlari (nom, kontakt, telefon, email, manzil, STIR).
// Kategoriya, mahsulot, kredit limiti, yetkazish muddati, holat, izoh —
// булар Supplier Management (Supplier Detail sahifasi) ga tegishli, bu
// yerda YO'Q (Step 3/6/7). Yagona manba: useSuppliers().actions —
// createSupplier (yaratish) va updateSupplier (asosiy rekvizit tahriri)
// ikkalasi ham shu bir xil forma orqali chaqiriladi.

import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "../../../../components/ui/Button/Button";
import { Input } from "../../../../components/ui/Input/Input";

import "./SupplierForm.scss";

const buildInitialForm = (supplier) => ({
  name: supplier?.name || "",
  phone: supplier?.phone || "",
  email: supplier?.email || "",
  address: supplier?.address || "",
  contactPerson: supplier?.contactPerson || "",
  stir: supplier?.stir || "",
});

const SupplierForm = ({ supplier = null, suppliers = [], onSubmit, onCancel }) => {
  const [form, setForm] = useState(() => buildInitialForm(supplier));
  const [error, setError] = useState("");

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Yetkazib beruvchi nomi majburiy");

      return;
    }

    const trimmedStir = form.stir.trim();

    if (trimmedStir && !/^\d{9}$/.test(trimmedStir)) {
      setError("STIR 9 ta raqamdan iborat bo'lishi kerak");

      return;
    }

    // Business rule: bitta STIR - bitta supplier. Aniq, professional xato
    // xabari — silent fail (forma hech nima demay yopilib qolishi) o'rniga
    // (bug fix: ilgari duplicate STIR createSupplier ichida jimgina rad
    // etilardi, foydalanuvchi hech qanday xabar ko'rmasdi).
    if (trimmedStir) {
      const duplicate = suppliers.find(
        (entry) => entry.stir === trimmedStir && entry.id !== supplier?.id,
      );

      if (duplicate) {
        setError(
          `Bu STIR bilan yetkazib beruvchi allaqachon ro'yxatda mavjud: "${duplicate.name}"`,
        );

        return;
      }
    }

    setError("");
    onSubmit?.(form);
  };

  return (
    <form className="supplier-form" onSubmit={handleSubmit}>
      <div className="supplier-form__grid">
        <Input
          label="Kompaniya nomi"
          value={form.name}
          onChange={(event) => setField("name", event.target.value)}
        />
        <Input
          label="Aloqa shaxsi"
          value={form.contactPerson}
          onChange={(event) => setField("contactPerson", event.target.value)}
        />
        <Input
          label="Telefon"
          value={form.phone}
          onChange={(event) => setField("phone", event.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => setField("email", event.target.value)}
        />
        <Input
          className="supplier-form__wide"
          label="Manzil"
          value={form.address}
          onChange={(event) => setField("address", event.target.value)}
        />
        <Input
          label="STIR / INN (ixtiyoriy)"
          value={form.stir}
          maxLength={9}
          onChange={(event) => setField("stir", event.target.value)}
        />
      </div>

      {error && <p className="supplier-form__error">{error}</p>}

      <div className="supplier-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="primary" leftIcon={<Check size={15} />}>
          Saqlash
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;
