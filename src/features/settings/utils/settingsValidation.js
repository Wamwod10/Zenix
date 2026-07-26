export const validateSettingPatch = (pageId, patch) => {
  const errors = {};

  Object.entries(patch).forEach(([key, value]) => {
    if (key.toLowerCase().includes("email") && value && !String(value).includes("@")) {
      errors[key] = "Email format noto'g'ri.";
    }

    if (key.toLowerCase().includes("rate") && Number(value) < 0) {
      errors[key] = "Qiymat manfiy bo'lmasin.";
    }

    if (["companyName", "name", "code"].includes(key) && !String(value || "").trim()) {
      errors[key] = "Majburiy maydon.";
    }
  });

  if (pageId === "security" && patch.minPasswordLength && Number(patch.minPasswordLength) < 8) {
    errors.minPasswordLength = "Kamida 8 belgi kerak.";
  }

  return errors;
};
