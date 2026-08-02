export const optionSets = {
  businessType: ["Chakana savdo", "Ombor + savdo", "Xizmat ko'rsatish", "Ishlab chiqarish"],
  legalType: ["MChJ", "YaTT", "AJ", "XK"],
  status: ["active", "pending", "archived", "blocked"],
  country: ["UZ", "KZ", "KG", "TJ"],
  fiscalCountry: ["O'zbekiston", "Qozog'iston", "Qirg'iziston", "Tojikiston"],
  language: [{ value: "uz", label: "O'zbek" }, { value: "ru", label: "Rus" }, { value: "en", label: "Ingliz" }],
  timezone: ["Asia/Tashkent", "Asia/Samarkand", "UTC"],
  dateFormat: ["DD.MM.YYYY", "YYYY-MM-DD", "DD/MM/YYYY"],
  timeFormat: ["24h", "12h"],
  currencyFormat: ["UZS", "USD", "EUR"],
  theme: [{ value: "system", label: "Tizim bo'yicha" }, { value: "light", label: "Yorug'" }, { value: "dark", label: "Qorong'i" }],
  accentColor: [{ value: "blue", label: "Ko'k" }, { value: "green", label: "Yashil" }, { value: "rose", label: "Qizil" }],
  sidebarSize: [{ value: "compact", label: "Ixcham" }, { value: "comfortable", label: "Qulay" }, { value: "expanded", label: "Keng" }],
  density: [{ value: "compact", label: "Ixcham" }, { value: "regular", label: "Oddiy" }, { value: "comfortable", label: "Qulay" }],
  baseCurrency: ["UZS", "USD", "EUR"],
  paymentType: [{ value: "cash", label: "Naqd" }, { value: "card", label: "Karta" }, { value: "online", label: "Online" }],
  taxType: [{ value: "VAT", label: "QQS" }, { value: "income", label: "Daromad solig'i" }, { value: "excise", label: "Aksiz" }],
  role: ["owner", "admin", "financeManager", "branchManager", "warehouseManager", "cashier", "viewer"],
};

export const statusLabels = {
  active: "Faol",
  pending: "Kutilmoqda",
  invited: "Taklif qilingan",
  archived: "Arxivlangan",
  blocked: "Bloklangan",
  connected: "Ulangan",
  disconnected: "Uzilgan",
  checking: "Tekshirilmoqda",
  error: "Xato",
  completed: "Yakunlangan",
};

export const nextCode = (rows, prefix) => {
  const used = new Set(rows.map((item) => item.code));
  let index = rows.length + 1;
  let code = `${prefix}-${String(index).padStart(3, "0")}`;
  while (used.has(code)) {
    index += 1;
    code = `${prefix}-${String(index).padStart(3, "0")}`;
  }
  return code;
};

export const nextLogin = (rows) => {
  const used = new Set(rows.map((item) => item.login));
  let index = rows.length + 1;
  let login = `user.${String(index).padStart(2, "0")}`;
  while (used.has(login)) {
    index += 1;
    login = `user.${String(index).padStart(2, "0")}`;
  }
  return login;
};
