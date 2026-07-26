export const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const calculateProfit = (sellingPrice, costPrice) =>
  toNumber(sellingPrice) - toNumber(costPrice);

export const calculateMargin = (sellingPrice, costPrice) => {
  const price = toNumber(sellingPrice);
  if (price <= 0) return 0;
  return (calculateProfit(price, costPrice) / price) * 100;
};

export const calculateMarkup = (sellingPrice, costPrice) => {
  const cost = toNumber(costPrice);
  if (cost <= 0) return 0;
  return (calculateProfit(sellingPrice, cost) / cost) * 100;
};

export const calculateAvailableStock = (onHand, reserved) =>
  Math.max(0, toNumber(onHand) - toNumber(reserved));

export const calculateProjectedStock = (available, incoming) =>
  toNumber(available) + toNumber(incoming);

export const summarizeStock = (stockSummary = []) =>
  stockSummary.reduce(
    (summary, row) => {
      const available = calculateAvailableStock(row.onHand, row.reserved);

      return {
        onHand: summary.onHand + toNumber(row.onHand),
        reserved: summary.reserved + toNumber(row.reserved),
        available: summary.available + available,
        incoming: summary.incoming + toNumber(row.incoming),
        damaged: summary.damaged + toNumber(row.damaged),
      };
    },
    { onHand: 0, reserved: 0, available: 0, incoming: 0, damaged: 0 },
  );

export const getStockStatus = (product) => {
  const stock = summarizeStock(product.stockSummary);
  const reorderPoint = toNumber(product.reorderPoint);

  if (stock.onHand <= 0) return "out";
  if (stock.available <= reorderPoint) return "low";
  if (stock.available > reorderPoint * 4) return "healthy";
  return "watch";
};

export const generateSKU = ({ name = "", category, brand, sequence = 1, prefix = "ZNX" }) => {
  const clean = (value, size) =>
    String(value || "")
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, size)
      .toUpperCase()
      .padEnd(size, "X");
  const categoryCode = category?.code || clean(category?.name || name, 3);
  const brandCode = brand?.code || clean(brand?.name || name, 3);
  return `${clean(prefix, 4)}-${categoryCode}-${brandCode}-${String(sequence).padStart(4, "0")}`;
};

export const generateBarcode = (seed = Date.now()) => {
  const base = String(Math.abs(Number(seed) || Date.now())).padStart(12, "0").slice(-12);
  const sum = base.split("").reduce((total, digit, index) => {
    const weight = index % 2 === 0 ? 1 : 3;
    return total + Number(digit) * weight;
  }, 0);
  const check = (10 - (sum % 10)) % 10;
  return `${base}${check}`;
};

export const detectDuplicateProduct = (product, products = []) => {
  const sku = String(product.sku || "").trim().toLowerCase();
  const barcodes = new Set((product.barcodes || []).map((item) => String(item).trim()));
  const name = String(product.name || "").trim().toLowerCase();

  return products.filter((item) => {
    if (item.id === product.id) return false;
    const skuMatch = sku && String(item.sku || "").toLowerCase() === sku;
    const barcodeMatch = (item.barcodes || []).some((barcode) => barcodes.has(String(barcode)));
    const nameMatch = name && String(item.name || "").toLowerCase() === name;
    return skuMatch || barcodeMatch || nameMatch;
  });
};

export const validateProduct = (product, products = []) => {
  const errors = {};
  const price = toNumber(product.price);
  const cost = toNumber(product.cost);
  const minPrice = toNumber(product.minPrice);
  const duplicates = detectDuplicateProduct(product, products);

  if (!String(product.name || "").trim()) errors.name = "Mahsulot nomi majburiy.";
  if (!String(product.sku || "").trim()) errors.sku = "Artikul majburiy.";
  if (!product.categoryId) errors.categoryId = "Kategoriya tanlang.";
  if (!product.unitId) errors.unitId = "O'lchov birligi tanlang.";
  if (price < 0 || cost < 0 || minPrice < 0) errors.price = "Narxlar manfiy bo'lmasin.";
  if (price < minPrice) errors.minPrice = "Sotuv narxi eng past narxdan past bo'lmasin.";
  if (duplicates.some((item) => item.sku === product.sku)) errors.sku = "Artikul noyob bo'lishi kerak.";
  if (duplicates.some((item) => (item.barcodes || []).some((barcode) => (product.barcodes || []).includes(barcode)))) {
    errors.barcodes = "Shtrix-kod noyob bo'lishi kerak.";
  }

  const variantKeys = new Set();
  (product.variants || []).forEach((variant) => {
    const key = String(variant.combination || variant.name || "").toLowerCase();
    if (variantKeys.has(key)) errors.variants = "Variant takrorlanmasin.";
    variantKeys.add(key);
  });

  (product.media || []).forEach((file) => {
    const typeOk = ["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.type);
    if (!typeOk || toNumber(file.size) > 8 * 1024 * 1024) {
      errors.media = "Media turi yoki hajmi noto'g'ri.";
    }
  });

  return errors;
};

export const formatMoney = (value, currency = "UZS") =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(toNumber(value));

export const formatQuantity = (value, unit = "dona") =>
  `${new Intl.NumberFormat("uz-UZ").format(toNumber(value))} ${unit}`;

export const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const productStatusLabels = {
  active: "Faol",
  draft: "Qoralama",
  archived: "Arxivlangan",
  pending: "Kutilmoqda",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
  healthy: "Sog'lom",
  watch: "Kuzatuvda",
  low: "Kam qolgan",
  out: "Tugagan",
  success: "Muvaffaqiyatli",
  error: "Xato",
  important: "Muhim",
  critical: "Jiddiy",
  normal: "Oddiy",
};

export const labelProductStatus = (value) => productStatusLabels[value] || value || "-";
