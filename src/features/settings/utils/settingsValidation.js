export const validateSettingPatch = (pageId, patch) => {
  const errors = {};

  Object.entries(patch).forEach(([key, value]) => {
    if (key.toLowerCase().includes("email") && value && !String(value).includes("@")) {
      errors[key] = "Email format noto'g'ri.";
    }

    if (key.toLowerCase().includes("phone") && value && !/^\+?[0-9\s()-]{7,}$/.test(String(value))) {
      errors[key] = "Telefon raqamini to'g'ri kiriting.";
    }

    if (key.toLowerCase().includes("rate") && Number(value) < 0) {
      errors[key] = "Qiymat manfiy bo'lmasin.";
    }

    if (["minStock", "maxStock", "fee", "retentionDays", "sessionMinutes", "loginLimit"].includes(key) && Number(value) < 0) {
      errors[key] = "Qiymat 0 dan kichik bo'lmasligi kerak.";
    }

    if (key === "rate" && Number(value) > 100) {
      errors[key] = "Foiz 100 dan oshmasligi kerak.";
    }

    if (["companyName", "name", "code"].includes(key) && !String(value || "").trim()) {
      errors[key] = "Majburiy maydon.";
    }
  });

  if (pageId === "security" && patch.minPasswordLength && Number(patch.minPasswordLength) < 8) {
    errors.minPasswordLength = "Kamida 8 belgi kerak.";
  }

  if (pageId === "warehouses" && "maxStock" in patch && Number(patch.maxStock) < 1) {
    errors.maxStock = "Maksimal zaxira kamida 1 bo'lishi kerak.";
  }

  return errors;
};

export const validateCollectionPatch = (collection, patch, rows = [], itemId) => {
  const errors = validateSettingPatch(collection, patch);

  if (patch.code) {
    const nextCode = String(patch.code).trim().toLowerCase();
    const duplicate = rows.some((item) => item.id !== itemId && String(item.code || "").trim().toLowerCase() === nextCode);
    if (duplicate) errors.code = "Bu kod allaqachon ishlatilgan.";
  }

  if (patch.login) {
    const nextLogin = String(patch.login).trim().toLowerCase();
    const duplicate = rows.some((item) => item.id !== itemId && String(item.login || "").trim().toLowerCase() === nextLogin);
    if (duplicate) errors.login = "Bu login allaqachon band.";
  }

  if (collection === "roles" && patch.name) {
    const nextName = String(patch.name).trim().toLowerCase();
    const duplicate = rows.some((item) => item.id !== itemId && String(item.name || "").trim().toLowerCase() === nextName);
    if (duplicate) errors.name = "Bu rol nomi allaqachon ishlatilgan.";
  }

  if (collection === "taxes" && "rate" in patch && (Number(patch.rate) < 0 || Number(patch.rate) > 100)) {
    errors.rate = "Soliq foizi 0 va 100 oralig'ida bo'lishi kerak.";
  }

  if (collection === "payments" && "fee" in patch && (Number(patch.fee) < 0 || Number(patch.fee) > 15)) {
    errors.fee = "Komissiya 0 va 15 foiz oralig'ida bo'lishi kerak.";
  }

  return errors;
};
