export const optionSets = {
  businessType: ["Chakana savdo", "Ombor + savdo", "Xizmat ko'rsatish", "Ishlab chiqarish"],
  legalType: ["MChJ", "YaTT", "AJ", "XK"],
  status: ["active", "pending", "archived", "blocked"],
  country: ["UZ", "KZ", "KG", "TJ", "TR", "CN", "AE"],
  fiscalCountry: ["O'zbekiston", "Qozog'iston", "Qirg'iziston", "Tojikiston"],
  language: [{ value: "uz", label: "O'zbek" }, { value: "ru", label: "Rus" }, { value: "en", label: "Ingliz" }, { value: "ar", label: "Arabcha" }],
  timezone: ["Asia/Tashkent", "Asia/Samarkand", "Asia/Almaty", "Europe/Istanbul", "UTC"],
  dateFormat: ["DD.MM.YYYY", "YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"],
  timeFormat: ["24h", "12h"],
  currencyFormat: ["UZS", "USD", "EUR", "RUB", "KZT", "TRY", "CNY"],
  weekStart: [{ value: "monday", label: "Dushanba" }, { value: "sunday", label: "Yakshanba" }],
  measurementUnits: ["metric", "imperial"],
  weightUnits: ["kg", "g", "lb"],
  lengthUnits: ["mm", "cm", "m", "inch"],
  thousandsSeparator: ["space", "comma", "dot"],
  theme: [{ value: "system", label: "Tizim bo'yicha" }, { value: "light", label: "Yorug'" }, { value: "dark", label: "Qorong'i" }],
  accentColor: [{ value: "blue", label: "Ko'k" }, { value: "green", label: "Yashil" }, { value: "rose", label: "Qizil" }],
  sidebarSize: [{ value: "compact", label: "Ixcham" }, { value: "comfortable", label: "Qulay" }, { value: "expanded", label: "Keng" }],
  density: [{ value: "compact", label: "Ixcham" }, { value: "regular", label: "Oddiy" }, { value: "comfortable", label: "Qulay" }],
  baseCurrency: ["UZS", "USD", "EUR", "RUB", "KZT", "TRY", "CNY"],
  paymentType: [{ value: "cash", label: "Naqd" }, { value: "card", label: "Karta" }, { value: "online", label: "Online" }, { value: "bank", label: "Bank" }, { value: "credit", label: "Kredit" }],
  taxType: [{ value: "VAT", label: "QQS" }, { value: "income", label: "Daromad solig'i" }, { value: "excise", label: "Aksiz" }, { value: "regional", label: "Hududiy" }],
  role: ["owner", "admin", "financeManager", "branchManager", "warehouseManager", "cashier", "viewer"],
  provider: ["Google Drive", "Dropbox", "AWS S3", "Azure", "FTP", "NAS"],
  backupType: ["Database Only", "Files Only", "Full Backup"],
  aiProvider: ["OpenAI", "Claude", "Gemini", "DeepSeek", "OpenRouter", "Ollama", "Grok"],
  aiModel: ["gpt-5-mini", "claude-sonnet", "gemini-pro", "deepseek-chat", "openrouter-auto", "ollama-local", "grok-fast"],
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
  paused: "Pauza",
  syncing: "Sync",
  ready: "Tayyor",
  printing: "Chop etilmoqda",
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
