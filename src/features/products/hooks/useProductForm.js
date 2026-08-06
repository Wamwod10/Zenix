import { useEffect, useState } from "react";

import { validateProduct } from "../utils/productCalculations";
import { productStorageKeys, safeStorageWrite } from "../utils/productStorage";

const emptyProduct = {
  name: "",
  description: "",
  sku: "",
  internalCode: "",
  barcodes: [],
  qrCode: "",
  categoryId: "",
  brandId: "",
  unitId: "",
  type: "simple",
  lifecycle: "draft",
  status: "draft",
  approvalStatus: "draft",
  price: 0,
  minPrice: 0,
  cost: 0,
  taxRate: 0,
  tags: [],
  attributes: {},
  variants: [],
  bundleItems: [],
  relations: [],
  media: [],
  documents: [],
  integrations: { pos: true, warehouse: true, crm: true, finance: true },
  stockSummary: [],
  priceHistory: [],
  sales30d: 0,
  views30d: 0,
};

const useProductForm = ({ product, products, onSubmit }) => {
  const [form, setForm] = useState(() => ({ ...emptyProduct, ...product }));
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const update = (key, value) => {
    setDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateNested = (group, key, value) => {
    setDirty(true);
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [key]: value,
      },
    }));
  };

  const saveDraft = () => {
    safeStorageWrite(productStorageKeys.drafts, { product: form, savedAt: new Date().toISOString() });
    setDirty(false);
  };

  const submit = (overrides = {}) => {
    if (isSubmitting) return { ok: false, errors: { submit: "Saqlash jarayoni davom etmoqda." } };
    setIsSubmitting(true);
    const payload = { ...form, ...overrides };
    const nextErrors = validateProduct(payload, products);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setIsSubmitting(false);
      return { ok: false, errors: nextErrors };
    }

    try {
      const result = onSubmit(payload);
      if (result?.ok) setDirty(false);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    step,
    dirty,
    errors,
    isSubmitting,
    actions: {
      setStep,
      update,
      updateNested,
      setForm: (updater) => {
        setDirty(true);
        setForm(updater);
      },
      setErrors,
      saveDraft,
      submit,
    },
  };
};

export default useProductForm;
