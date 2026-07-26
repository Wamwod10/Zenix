const mojibakeMap = [
  ["вЂ”", "-"],
  ["вЂ“", "-"],
  ["вЂ", "'"],
  ["вЂ™", "'"],
  ["вЂњ", '"'],
  ["вЂќ", '"'],
  ["вЂ¦", "..."],
  ["В·", "-"],
];

const exactTranslations = new Map(
  Object.entries({
    "AI": "Sun'iy intellekt",
    "AI Analytics": "Sun'iy intellekt tahlili",
    "AI Business OS": "Sun'iy intellektli biznes tizimi",
    "AI Status": "Sun'iy intellekt holati",
    "API access": "API ruxsati",
    "Account": "Akkaunt",
    "Accounts Payable": "To'lanadigan hisoblar",
    "Accounts Receivable": "Olinadigan hisoblar",
    "Advanced": "Kengaytirilgan",
    "All modules": "Barcha modullar",
    "Amount": "Summa",
    "Approval": "Tasdiqlash",
    "Approve": "Tasdiqlash",
    "Approved": "Tasdiqlangan",
    "Archived": "Arxivlangan",
    "Area": "Hudud",
    "At risk": "Xavf ostida",
    "Attendance": "Davomat",
    "Audit": "Audit",
    "Audit Logs": "Audit jurnali",
    "Automatic": "Avtomatik",
    "Balance Sheet": "Balans hisoboti",
    "Bank": "Bank",
    "Bar": "Ustunli",
    "Basic": "Boshlang'ich",
    "Beverages": "Ichimliklar",
    "Board-ready summary": "Rahbariyat uchun tayyor xulosa",
    "Branch": "Filial",
    "Branch Manager": "Filial menejeri",
    "Branch performance": "Filial samaradorligi",
    "Budget": "Byudjet",
    "Business": "Biznes",
    "Business Health": "Biznes salomatligi",
    "Business Health Score": "Biznes salomatligi bahosi",
    "CEO": "Direktor",
    "COGS": "Tannarx",
    "CRM": "Mijozlar",
    "CRM Dialog": "Mijozlar oynasi",
    "CRM Reports": "Mijozlar hisobotlari",
    "Calculated": "Hisoblangan",
    "Cancelled": "Bekor qilingan",
    "Cash": "Naqd",
    "Cash Flow": "Naqd oqim",
    "Cash Flow Statement": "Naqd oqim hisoboti",
    "Cash in/out": "Naqd kirim/chiqim",
    "Cashier": "Kassir",
    "Cashier 01": "Kassir 01",
    "Cashier 02": "Kassir 02",
    "Churn": "Mijoz yo'qotish",
    "Click": "Click",
    "Code sent to": "Kod yuborildi:",
    "Cold Storage": "Sovuq ombor",
    "Commerce": "Savdo",
    "Communication tarixi": "Aloqa tarixi",
    "Comparison": "Taqqoslash",
    "Completed": "Yakunlangan",
    "Control": "Nazorat",
    "Core": "Asosiy",
    "Counterparty": "Kontragent",
    "Create": "Yaratish",
    "Created": "Yaratilgan",
    "Critical stock": "Jiddiy qoldiq",
    "Current": "Joriy",
    "Currency": "Valyuta",
    "Customer Analytics": "Mijozlar tahlili",
    "Customer Mobile List": "Mijozlar mobil ro'yxati",
    "Customer intelligence": "Mijozlar tahlili",
    "Customers": "Mijozlar",
    "Customers & Team": "Mijozlar va jamoa",
    "Daily CEO pulse": "Direktor uchun kunlik xulosa",
    "Dashboard": "Boshqaruv paneli",
    "Debt": "Qarz",
    "Description": "Tavsif",
    "Draft": "Qoralama",
    "Email": "Email",
    "Email verification": "Emailni tasdiqlash",
    "Employee": "Xodim",
    "Employee Count": "Xodimlar soni",
    "Employees": "Xodimlar",
    "Enter": "Kiritish",
    "Equity": "Kapital",
    "Escape": "Chiqish",
    "Executive": "Rahbariyat",
    "Executive Report": "Rahbariyat hisoboti",
    "Executive Reports": "Rahbariyat hisobotlari",
    "Executive Summary": "Rahbariyat xulosasi",
    "Expired": "Muddati o'tgan",
    "Export": "Eksport",
    "Export Center": "Eksport markazi",
    "Expenses": "Xarajatlar",
    "Fast food": "Tez tayyor taom",
    "Favorite Reports": "Sevimli hisobotlar",
    "Favorites": "Sevimlilar",
    "Finance": "Moliya",
    "Finance Manager": "Moliya menejeri",
    "Finance Overview": "Moliya ko'rinishi",
    "Finance Reports": "Moliya hisobotlari",
    "Financial intelligence": "Moliyaviy tahlil",
    "Forecast": "Prognoz",
    "Fresh Market": "Yangi bozor",
    "Global Import": "Xalqaro import",
    "Global filter": "Umumiy filtr",
    "Go back": "Orqaga qaytish",
    "Goal progress": "Maqsad bajarilishi",
    "HR": "Xodimlar",
    "HR Manager": "Xodimlar menejeri",
    "HR Overview": "Xodimlar ko'rinishi",
    "HR Reports": "Xodimlar hisobotlari",
    "Heat Map": "Issiqlik xaritasi",
    "Home": "Bosh sahifa",
    "Import Partner LLC": "Import hamkori MChJ",
    "In Progress": "Jarayonda",
    "Intelligence": "Tahlil",
    "Inventory": "Ombor",
    "Inventory Reports": "Ombor hisobotlari",
    "Inventory Value": "Ombor qiymati",
    "Inventory status": "Ombor holati",
    "JSON": "Ma'lumot",
    "KPI Center": "KPI markazi",
    "Line": "Chiziqli",
    "Login": "Kirish",
    "Main Warehouse": "Asosiy ombor",
    "Management": "Boshqaruv",
    "Manual": "Qo'lda",
    "Marketing": "Marketing",
    "Marketing Budget": "Marketing byudjeti",
    "Monthly": "Oylik",
    "New": "Yangi",
    "Not selected": "Tanlanmagan",
    "Operations": "Operatsiyalar",
    "Organic Juice": "Organik sharbat",
    "Overview": "Umumiy ko'rinish",
    "Owner": "Egasi",
    "PDF": "Hujjat",
    "POS": "Savdo kassasi",
    "POS Module": "Savdo kassasi moduli",
    "POS reports": "Savdo kassasi hisobotlari",
    "POS sozlamalari": "Savdo kassasi sozlamalari",
    "Paid": "To'langan",
    "Payme": "Payme",
    "Payroll": "Ish haqi",
    "Payroll Control": "Ish haqi nazorati",
    "Pending": "Kutilmoqda",
    "People": "Jamoa",
    "Permissions": "Ruxsatlar",
    "Posted": "O'tkazilgan",
    "Posted to ledger": "Bosh kitobga o'tkazildi",
    "Previous": "Oldingi",
    "Preview": "Ko'rib chiqish",
    "Print": "Chop etish",
    "Profit": "Foyda",
    "Profit & Loss": "Foyda va zarar",
    "Products": "Mahsulotlar",
    "Purchase Reports": "Xarid hisobotlari",
    "Purchases": "Xaridlar",
    "Ready": "Tayyor",
    "Reason": "Sabab",
    "Receipt": "Chek",
    "Recent": "So'nggi",
    "Recruitment": "Ishga olish",
    "Reject": "Rad etish",
    "Rejected": "Rad etilgan",
    "Retail": "Chakana savdo",
    "Retail Floor": "Savdo zali",
    "Return": "Qaytarish",
    "Revenue": "Daromad",
    "Reversed": "Qaytarilgan",
    "Role": "Rol",
    "Sales": "Savdo",
    "Sales Reports": "Savdo hisobotlari",
    "Settings": "Sozlamalar",
    "Share": "Ulashish",
    "Sharing": "Ulashish",
    "Shift close": "Smenani yopish",
    "Shift open": "Smenani ochish",
    "Signed": "Imzolangan",
    "Smart Terminal": "Aqlli terminal",
    "Source": "Manba",
    "Standard": "Standart",
    "Submitted": "Yuborilgan",
    "Supplier": "Yetkazib beruvchi",
    "Supplier delay": "Yetkazib beruvchi kechikishi",
    "Supplier performance": "Yetkazib beruvchi samaradorligi",
    "Support": "Yordam",
    "System": "Tizim",
    "Tab": "Tab tugmasi",
    "Tax Reports": "Soliq hisobotlari",
    "Tax payable": "To'lanadigan soliq",
    "Tax rate": "Soliq stavkasi",
    "Templates": "Shablonlar",
    "Timeline": "Vaqt chizig'i",
    "Transit": "Yo'ldagi ombor",
    "Transfer": "Ko'chirish",
    "Type": "Tur",
    "Uploaded": "Yuklangan",
    "Validation": "Tekshiruv",
    "Viewer": "Kuzatuvchi",
    "VIP Retail Segment": "VIP chakana segment",
    "Warehouse": "Ombor",
    "Warehouse Analysis": "Ombor tahlili",
    "Warehouse Manager": "Ombor menejeri",
    "Warehouse Reports": "Ombor hisobotlari",
    "Warehouse intelligence": "Ombor tahlili",
    "Waterfall": "Pog'onali",
    "Weekly warehouse risk": "Haftalik ombor xavfi",
    "Weighted Average": "O'rtacha tortilgan",
    "Workspace Preview": "Ish maydoni ko'rinishi",
    "Workspace setup": "Ish maydonini sozlash",
    "Wrong email?": "Email noto'g'rimi?",
    "X / Z report": "X / Z hisoboti",
    "approved": "tasdiqlangan",
    "archived": "arxivlangan",
    "critical": "jiddiy",
    "daily": "kunlik",
    "filter changed": "filtr o'zgardi",
    "healthy": "sog'lom",
    "high": "yuqori",
    "low": "past",
    "medium": "o'rta",
    "open approval": "tasdiqni ochish",
    "orders": "buyurtma",
    "paused": "to'xtatilgan",
    "pending": "kutilmoqda",
    "permission denied": "ruxsat yo'q",
    "resolved": "hal qilingan",
    "review transaction": "operatsiyani ko'rib chiqish",
    "scheduled report created": "rejalashtirilgan hisobot yaratildi",
    "setup required": "sozlash kerak",
    "urgent": "shoshilinch",
    "warning": "ogohlantirish",
    "weekly": "haftalik",
    "widget changed": "vidjet o'zgardi",
  })
);

const phraseTranslations = [
  ["AI Customer Advisor", "Sun'iy intellekt mijozlar maslahatchisi"],
  ["AI Finance Advisor", "Sun'iy intellekt moliya maslahatchisi"],
  ["AI HR Insights", "Sun'iy intellekt xodimlar tahlili"],
  ["AI Inventory Advisor", "Sun'iy intellekt ombor maslahatchisi"],
  ["AI Purchase Advisor", "Sun'iy intellekt xarid maslahatchisi"],
  ["AI Sales Advisor", "Sun'iy intellekt savdo maslahatchisi"],
  ["AI tavsiyalar", "Sun'iy intellekt tavsiyalari"],
  ["ABC/XYZ matrix", "ABC/XYZ matritsasi"],
  ["All ZENIX modules", "Barcha ZENIX modullari"],
  ["Bank kartasi", "Bank kartasi"],
  ["Branch ranking", "Filiallar reytingi"],
  ["Budget variance", "Byudjet farqi"],
  ["Business health", "Biznes salomatligi"],
  ["Campaign ROI", "Kampaniya samarasi"],
  ["Cash In", "Naqd kirim"],
  ["Cash Out", "Naqd chiqim"],
  ["Cash reserve", "Naqd zaxira"],
  ["CategoryTabs", "Kategoriyalar"],
  ["Confirmed Orders", "Tasdiqlangan buyurtmalar"],
  ["Current discount", "Joriy chegirma"],
  ["Customer growth", "Mijozlar o'sishi"],
  ["Customer segments", "Mijoz segmentlari"],
  ["Dead Stock", "Aylanmayotgan qoldiq"],
  ["Expense distribution", "Xarajatlar taqsimoti"],
  ["Expense spike", "Xarajat keskin oshishi"],
  ["Financial control ledger", "Moliyaviy nazorat jurnali"],
  ["Follow-up", "Qayta aloqa"],
  ["Forecast panel", "Prognoz paneli"],
  ["Inventory Value", "Ombor qiymati"],
  ["Movement timeline", "Harakatlar vaqti"],
  ["Operating", "Operatsion"],
  ["Payment analytics", "To'lovlar tahlili"],
  ["Payroll analytics", "Ish haqi tahlili"],
  ["Product performance", "Mahsulot samaradorligi"],
  ["Profit analysis", "Foyda tahlili"],
  ["Purchase Value", "Xarid qiymati"],
  ["Purchase forecast", "Xarid prognozi"],
  ["Purchases Module", "Xaridlar moduli"],
  ["Received Orders", "Qabul qilingan buyurtmalar"],
  ["Report Builder", "Hisobot tuzuvchi"],
  ["Reportni ochish", "Hisobotni ochish"],
  ["Reports Dashboard", "Hisobotlar paneli"],
  ["Revenue trend", "Daromad dinamikasi"],
  ["Risk radar", "Xavf radari"],
  ["Sales Amount", "Savdo summasi"],
  ["Sales Module", "Savdo moduli"],
  ["Sales forecast", "Savdo prognozi"],
  ["Scheduled Reports", "Rejalashtirilgan hisobotlar"],
  ["Service Plan", "Xizmat rejasi"],
  ["Stock forecast", "Qoldiq prognozi"],
  ["Stock risk watchlist", "Qoldiq xavfi ro'yxati"],
  ["Supplier score", "Yetkazib beruvchi bahosi"],
  ["Team performance", "Jamoa samaradorligi"],
  ["Top product performance", "Eng yaxshi mahsulotlar samaradorligi"],
  ["Warehouse Module", "Ombor moduli"],
  ["branch manager", "filial menejeri"],
  ["cash flow", "naqd oqim"],
  ["dead stock", "aylanmayotgan qoldiq"],
  ["delivery bizneslari", "yetkazib berish bizneslari"],
  ["email manzilingizga", "email manzilingizga"],
  ["fast food", "tez tayyor taom"],
  ["premium loyalty", "premium sodiqlik"],
  ["reorder", "qayta buyurtma"],
  ["supplier payment", "yetkazib beruvchi to'lovi"],
  ["supplier to'lovlari", "yetkazib beruvchi to'lovlari"],
  ["workload", "ish yuklamasi"],
];

const wordTranslations = new Map(
  Object.entries({
    Accessories: "Aksessuarlar",
    Account: "Akkaunt",
    Active: "Faol",
    Admin: "Administrator",
    Analytics: "Tahlil",
    Apple: "Olma",
    Archived: "Arxivlangan",
    Atlas: "Atlas",
    Audit: "Audit",
    Automatic: "Avtomatik",
    Bar: "Ustunli",
    Basic: "Boshlang'ich",
    Batch: "Partiya",
    Branch: "Filial",
    Budget: "Byudjet",
    Business: "Biznes",
    Card: "Karta",
    Cash: "Naqd",
    Cashier: "Kassir",
    Category: "Kategoriya",
    Coffee: "Qahva",
    Compare: "Taqqoslash",
    Comparison: "Taqqoslash",
    Completed: "Yakunlangan",
    Control: "Nazorat",
    Create: "Yaratish",
    Current: "Joriy",
    Customer: "Mijoz",
    Customers: "Mijozlar",
    Dashboard: "Boshqaruv paneli",
    Debt: "Qarz",
    Description: "Tavsif",
    Draft: "Qoralama",
    Email: "Email",
    Employee: "Xodim",
    Employees: "Xodimlar",
    Export: "Eksport",
    Finance: "Moliya",
    Filter: "Filtr",
    Forecast: "Prognoz",
    Global: "Umumiy",
    Gold: "Oltin",
    Health: "Salomatlik",
    Import: "Import",
    Insights: "Tahlillar",
    Inventory: "Ombor",
    Login: "Kirish",
    Manager: "Menejer",
    Manual: "Qo'lda",
    Marketing: "Marketing",
    Module: "Modul",
    Modules: "Modullar",
    Monthly: "Oylik",
    New: "Yangi",
    Operations: "Operatsiyalar",
    Owner: "Egasi",
    Payroll: "Ish haqi",
    Pending: "Kutilmoqda",
    Permissions: "Ruxsatlar",
    Platinum: "Platina",
    Preview: "Ko'rib chiqish",
    Product: "Mahsulot",
    Products: "Mahsulotlar",
    Profit: "Foyda",
    Purchase: "Xarid",
    Purchases: "Xaridlar",
    Ready: "Tayyor",
    Receipt: "Chek",
    Recent: "So'nggi",
    Recruitment: "Ishga olish",
    Rejected: "Rad etilgan",
    Report: "Hisobot",
    Reports: "Hisobotlar",
    Resolve: "Hal qilish",
    Revenue: "Daromad",
    Sales: "Savdo",
    Save: "Saqlash",
    Settings: "Sozlamalar",
    Share: "Ulashish",
    Silver: "Kumush",
    Source: "Manba",
    Standard: "Standart",
    Stock: "Qoldiq",
    Supplier: "Yetkazib beruvchi",
    Suppliers: "Yetkazib beruvchilar",
    Support: "Yordam",
    Terminal: "Terminal",
    Timeline: "Vaqt chizig'i",
    Transfer: "Ko'chirish",
    Validation: "Tekshiruv",
    Viewer: "Kuzatuvchi",
    Warehouse: "Ombor",
    active: "faol",
    approved: "tasdiqlangan",
    archived: "arxivlangan",
    critical: "jiddiy",
    high: "yuqori",
    low: "past",
    medium: "o'rta",
    open: "ochiq",
    pending: "kutilmoqda",
    resolved: "hal qilingan",
    urgent: "shoshilinch",
    warning: "ogohlantirish",
  })
);

const attributeNames = ["aria-label", "alt", "placeholder", "title"];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeEncoding = (value) =>
  mojibakeMap.reduce((text, [bad, good]) => text.split(bad).join(good), value);

const translateText = (value) => {
  if (typeof value !== "string" || (!/[A-Za-z]/.test(value) && !/вЂ|В·/.test(value))) {
    return value;
  }

  const fixed = normalizeEncoding(value);
  const leading = fixed.match(/^\s*/)?.[0] || "";
  const trailing = fixed.match(/\s*$/)?.[0] || "";
  const body = fixed.trim();

  if (!body) return fixed;

  const compactBody = body.replace(/\s+/g, " ");
  const exact = exactTranslations.get(compactBody);
  if (exact) {
    return `${leading}${exact}${trailing}`;
  }

  let translated = body;
  for (const [source, target] of phraseTranslations) {
    translated = translated.replace(new RegExp(escapeRegExp(source), "g"), target);
  }

  translated = translated.replace(/\b[A-Za-z][A-Za-z0-9&/-]*\b/g, (word) => {
    if (/^[A-Z]{2,}$/.test(word) && !wordTranslations.has(word)) {
      return word;
    }
    return wordTranslations.get(word) || word;
  });

  return `${leading}${translated}${trailing}`;
};

const translateAttributes = (element) => {
  if (!element?.getAttribute) return;
  for (const name of attributeNames) {
    const value = element.getAttribute(name);
    if (!value) continue;
    const translated = translateText(value);
    if (translated !== value) {
      element.setAttribute(name, translated);
    }
  }
};

const shouldSkipNode = (node) => {
  const parent = node.parentElement;
  if (!parent) return false;
  return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE"].includes(parent.tagName);
};

const translateNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    if (shouldSkipNode(node)) return;
    const translated = translateText(node.nodeValue);
    if (translated !== node.nodeValue) {
      node.nodeValue = translated;
    }
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  translateAttributes(node);

  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(currentNode) {
        if (
          currentNode.nodeType === Node.ELEMENT_NODE &&
          ["SCRIPT", "STYLE", "NOSCRIPT", "CODE"].includes(currentNode.tagName)
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let current = walker.currentNode;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      const translated = translateText(current.nodeValue);
      if (translated !== current.nodeValue) {
        current.nodeValue = translated;
      }
    } else {
      translateAttributes(current);
    }
    current = walker.nextNode();
  }
};

export const installUzbekDomTranslator = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__zenixUzbekDomTranslatorInstalled) return;

  window.__zenixUzbekDomTranslatorInstalled = true;
  document.documentElement.lang = "uz";
  document.title = translateText(document.title);

  const run = () => translateNode(document.body);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        translateNode(mutation.target);
      }
      if (mutation.type === "attributes") {
        translateAttributes(mutation.target);
      }
      for (const node of mutation.addedNodes) {
        translateNode(node);
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: attributeNames,
    childList: true,
    characterData: true,
    subtree: true,
  });
};
