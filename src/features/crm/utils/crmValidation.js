import * as crmCustomerData from "../data/crmCustomers";

const existingCustomers =
  crmCustomerData.crmCustomers ??
  crmCustomerData.customers ??
  [];

const hasValue = (value) =>
  value !== null &&
  value !== undefined &&
  String(value).trim() !== "";

const toNumber = (value, fallback = 0) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
};

export const normalizeCRMPhone = (phone) => {
  const digits = String(phone ?? "").replace(/\D/g, "");

  if (digits.length === 9) {
    return `+998${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits}`;
  }

  return String(phone ?? "").trim();
};

export const isValidCRMPhone = (phone) =>
  /^\+998\d{9}$/.test(normalizeCRMPhone(phone));

export const isValidCRMEmail = (email) => {
  if (!hasValue(email)) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
    String(email).trim(),
  );
};

export const isDuplicateCRMPhone = (
  phone,
  {
    customers = existingCustomers,
    excludeCustomerId = null,
  } = {},
) => {
  const normalizedPhone = normalizeCRMPhone(phone);

  if (!isValidCRMPhone(normalizedPhone)) {
    return false;
  }

  return customers.some(
    (customer) =>
      String(customer.id) !== String(excludeCustomerId) &&
      normalizeCRMPhone(customer.phone) === normalizedPhone,
  );
};

export const createCustomerFormValues = (customer = {}) => ({
  fullName: customer.fullName ?? "",
  phone: customer.phone ?? "",
  email: customer.email ?? "",
  birthday: customer.birthday
    ? String(customer.birthday).slice(0, 10)
    : "",
  company: customer.company ?? "",
  status: customer.status ?? "active",
  group: customer.group ?? "",
  tags: Array.isArray(customer.tags)
    ? [...customer.tags]
    : [],
  loyaltyLevel: customer.loyaltyLevel ?? "bronze",
  assignedManager:
    typeof customer.assignedManager === "object"
      ? customer.assignedManager?.id ??
      customer.assignedManager?.value ??
      customer.assignedManager?.name ??
      ""
      : customer.assignedManager ?? "",
  source: customer.source ?? "",
  bonus: customer.bonus ?? 0,
  cashback: customer.cashback ?? 0,
  balance: customer.balance ?? 0,
  debt: customer.debt ?? 0,
  debtLimit: customer.debtLimit ?? 0,
  discount: customer.discount ?? 0,
  notes: customer.notes ?? "",
});

export const validateCustomerForm = (
  values,
  {
    customers = existingCustomers,
    excludeCustomerId = null,
  } = {},
) => {
  const errors = {};

  const fullName = String(values.fullName ?? "").trim();
  const company = String(values.company ?? "").trim();
  const notes = String(values.notes ?? "").trim();

  if (!fullName) {
    errors.fullName = "Mijozning to‘liq ismini kiriting.";
  } else if (fullName.length < 2) {
    errors.fullName =
      "Mijoz ismi kamida 2 ta belgidan iborat bo‘lsin.";
  } else if (fullName.length > 100) {
    errors.fullName =
      "Mijoz ismi 100 ta belgidan oshmasligi kerak.";
  }

  if (!hasValue(values.phone)) {
    errors.phone = "Telefon raqamini kiriting.";
  } else if (!isValidCRMPhone(values.phone)) {
    errors.phone =
      "Telefon raqamini +998 90 123 45 67 formatida kiriting.";
  } else if (
    isDuplicateCRMPhone(values.phone, {
      customers,
      excludeCustomerId,
    })
  ) {
    errors.phone =
      "Bu telefon raqami boshqa mijoz profilida mavjud.";
  }

  if (!isValidCRMEmail(values.email)) {
    errors.email =
      "Email manzilini to‘g‘ri formatda kiriting.";
  }

  if (values.birthday) {
    const birthday = new Date(values.birthday);
    const today = new Date();

    birthday.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(birthday.getTime())) {
      errors.birthday = "Tug‘ilgan sanani to‘g‘ri kiriting.";
    } else if (birthday > today) {
      errors.birthday =
        "Tug‘ilgan sana kelajakda bo‘lishi mumkin emas.";
    }
  }

  if (company.length > 120) {
    errors.company =
      "Kompaniya nomi 120 ta belgidan oshmasligi kerak.";
  }

  if (!hasValue(values.status)) {
    errors.status = "Mijoz holatini tanlang.";
  }

  if (
    Array.isArray(values.tags) &&
    values.tags.length > 10
  ) {
    errors.tags =
      "Bitta mijozga ko‘pi bilan 10 ta teg biriktirish mumkin.";
  }

  const numericRules = [
    {
      field: "bonus",
      label: "Bonus",
      min: 0,
      max: 1000000000,
    },
    {
      field: "cashback",
      label: "Cashback",
      min: 0,
      max: 1000000000,
    },
    {
      field: "balance",
      label: "Balans",
      min: -1000000000,
      max: 1000000000,
    },
    {
      field: "debt",
      label: "Qarzdorlik",
      min: 0,
      max: 1000000000,
    },
    {
      field: "debtLimit",
      label: "Qarz limiti",
      min: 0,
      max: 1000000000,
    },
    {
      field: "discount",
      label: "Chegirma",
      min: 0,
      max: 100,
    },
  ];

  numericRules.forEach(({ field, label, min, max }) => {
    const numericValue = Number(values[field]);

    if (!Number.isFinite(numericValue)) {
      errors[field] = `${label} raqam bilan kiritilishi kerak.`;
      return;
    }

    if (numericValue < min) {
      errors[field] = `${label} ${min} dan kam bo‘lishi mumkin emas.`;
      return;
    }

    if (numericValue > max) {
      errors[field] = `${label} ${max} dan oshmasligi kerak.`;
    }
  });

  const debt = toNumber(values.debt);
  const debtLimit = toNumber(values.debtLimit);

  if (debtLimit > 0 && debt > debtLimit) {
    errors.debt =
      "Qarzdorlik tasdiqlangan qarz limitidan oshib ketgan.";
  }

  if (notes.length > 1000) {
    errors.notes =
      "Izoh 1000 ta belgidan oshmasligi kerak.";
  }

  return errors;
};

export const prepareCustomerPayload = (values) => ({
  fullName: String(values.fullName).trim(),
  phone: normalizeCRMPhone(values.phone),
  email: String(values.email ?? "").trim().toLowerCase(),
  birthday: values.birthday || null,
  company: String(values.company ?? "").trim(),
  status: values.status,
  group: values.group || null,
  tags: [...new Set(values.tags ?? [])],
  loyaltyLevel: values.loyaltyLevel || "bronze",
  assignedManager: values.assignedManager || null,
  source: values.source || null,
  bonus: toNumber(values.bonus),
  cashback: toNumber(values.cashback),
  balance: toNumber(values.balance),
  debt: toNumber(values.debt),
  debtLimit: toNumber(values.debtLimit),
  discount: toNumber(values.discount),
  notes: String(values.notes ?? "").trim(),
});

export const hasCustomerFormChanges = (
  initialValues,
  currentValues,
) =>
  JSON.stringify(prepareCustomerPayload(initialValues)) !==
  JSON.stringify(prepareCustomerPayload(currentValues));