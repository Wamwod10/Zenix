import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "../../../../components/ui/Button/Button";
import { Input } from "../../../../components/ui/Input/Input";

import "./SupplierForm.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const UZ_PHONE_RE = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

const buildInitialForm = (supplier) => ({
  name: supplier?.name || "",
  phone: supplier?.phone || "",
  email: supplier?.email || "",
  address: supplier?.address || "",
  contactPerson: supplier?.contactPerson || "",
  stir: supplier?.stir || "",
});

const normalizeUzPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return "";
  const normalized = digits.startsWith("998") ? digits : `998${digits.replace(/^0/, "")}`;

  if (normalized.length !== 12) return value.trim();

  return `+${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8, 10)} ${normalized.slice(10, 12)}`;
};

const validateSupplierForm = (form, suppliers, currentId) => {
  const errors = {};
  const name = form.name.trim();
  const phone = normalizeUzPhone(form.phone);
  const email = form.email.trim();
  const stir = form.stir.trim();

  if (!name) errors.name = "Kompaniya nomi majburiy.";
  else if (name.length < 2) errors.name = "Nom kamida 2 ta belgidan iborat bo'lishi kerak.";

  if (phone && !UZ_PHONE_RE.test(phone)) {
    errors.phone = "Telefon formati: +998 90 123 45 67.";
  }

  if (email && !EMAIL_RE.test(email)) {
    errors.email = "Email manzilni to'g'ri kiriting.";
  }

  if (stir && !/^\d{9}$/.test(stir)) {
    errors.stir = "STIR 9 ta raqamdan iborat bo'lishi kerak.";
  }

  const duplicatePhone =
    phone &&
    suppliers.find(
      (entry) =>
        entry.id !== currentId && normalizeUzPhone(entry.phone) === phone,
    );

  if (duplicatePhone) {
    errors.phone = `Bu telefon "${duplicatePhone.name}" profilida mavjud.`;
  }

  const duplicateEmail =
    email &&
    suppliers.find(
      (entry) =>
        entry.id !== currentId &&
        entry.email?.trim().toLowerCase() === email.toLowerCase(),
    );

  if (duplicateEmail) {
    errors.email = `Bu email "${duplicateEmail.name}" profilida mavjud.`;
  }

  const duplicateStir =
    stir &&
    suppliers.find((entry) => entry.id !== currentId && entry.stir === stir);

  if (duplicateStir) {
    errors.stir = `Bu STIR "${duplicateStir.name}" profilida mavjud.`;
  }

  return errors;
};

const SupplierForm = ({
  supplier = null,
  suppliers = [],
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const initialForm = useMemo(() => buildInitialForm(supplier), [supplier]);
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const normalizedForm = useMemo(
    () => ({
      ...form,
      name: form.name.trim(),
      phone: normalizeUzPhone(form.phone),
      email: form.email.trim(),
      address: form.address.trim(),
      contactPerson: form.contactPerson.trim(),
      stir: form.stir.trim(),
    }),
    [form],
  );
  const errors = useMemo(
    () => validateSupplierForm(form, suppliers, supplier?.id),
    [form, suppliers, supplier?.id],
  );
  const dirty = JSON.stringify(normalizedForm) !== JSON.stringify({
    ...initialForm,
    name: initialForm.name.trim(),
    phone: normalizeUzPhone(initialForm.phone),
    email: initialForm.email.trim(),
    address: initialForm.address.trim(),
    contactPerson: initialForm.contactPerson.trim(),
    stir: initialForm.stir.trim(),
  });
  const hasErrors = Object.keys(errors).length > 0;
  const pending = submitting || localSubmitting;

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const showError = (field) => touched[field] || touched.submit ? errors[field] : "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched((current) => ({ ...current, submit: true }));

    if (hasErrors || pending) return;

    setLocalSubmitting(true);
    await Promise.resolve(onSubmit?.(normalizedForm));
    setLocalSubmitting(false);
  };

  return (
    <form className="supplier-form" onSubmit={handleSubmit} noValidate>
      <div className="supplier-form__grid">
        <Input
          label="Kompaniya nomi *"
          hint="Majburiy maydon"
          error={showError("name")}
          value={form.name}
          required
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          onChange={(event) => setField("name", event.target.value)}
        />
        <Input
          label="Aloqa shaxsi"
          hint="Ixtiyoriy"
          value={form.contactPerson}
          onChange={(event) => setField("contactPerson", event.target.value)}
        />
        <Input
          label="Telefon"
          hint="+998 90 123 45 67"
          error={showError("phone")}
          value={form.phone}
          inputMode="tel"
          onBlur={() => {
            setField("phone", normalizeUzPhone(form.phone));
            setTouched((current) => ({ ...current, phone: true }));
          }}
          onChange={(event) => setField("phone", event.target.value)}
        />
        <Input
          label="Email"
          hint="Ixtiyoriy, lekin kiritilsa tekshiriladi"
          error={showError("email")}
          type="email"
          value={form.email}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          onChange={(event) => setField("email", event.target.value)}
        />
        <Input
          className="supplier-form__wide"
          label="Manzil"
          hint="Ixtiyoriy"
          value={form.address}
          onChange={(event) => setField("address", event.target.value)}
        />
        <Input
          label="STIR / INN"
          hint="9 ta raqam, ixtiyoriy"
          error={showError("stir")}
          value={form.stir}
          inputMode="numeric"
          maxLength={9}
          onBlur={() => setTouched((current) => ({ ...current, stir: true }))}
          onChange={(event) => setField("stir", event.target.value.replace(/\D/g, ""))}
        />
      </div>

      <div className="supplier-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Bekor qilish
        </Button>
        <Button
          type="submit"
          variant="primary"
          leftIcon={<Check size={15} />}
          disabled={!dirty || hasErrors || pending}
        >
          {pending ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;
