import { createProductEntityId, generateBarcode } from "../utils/productCalculations";
import { safeStorageRead, safeStorageWrite } from "../utils/productStorage";

const SKU_SEQUENCE_KEY = "zenix.products.skuSequence.v1";
const BARCODE_SEQUENCE_KEY = "zenix.products.barcodeSequence.v1";
const SKU_PREFIX = "SKU";
const SKU_WIDTH = 6;

const normalizeCode = (value) => String(value || "").trim();

const formatSku = (sequence) =>
  `${SKU_PREFIX}${String(Math.max(Number(sequence) || 1, 1)).padStart(SKU_WIDTH, "0")}`;

const readSequence = (key = SKU_SEQUENCE_KEY) => Number(safeStorageRead(key, 1)) || 1;

const writeSequence = (sequence, key = SKU_SEQUENCE_KEY) => {
  safeStorageWrite(key, Math.max(Number(sequence) || 1, 1));
};

export const productIdentityAdapter = {
  generateProductSku({ products = [] } = {}) {
    const used = new Set(
      products.map((product) => normalizeCode(product.sku).toLowerCase()).filter(Boolean),
    );
    let sequence = readSequence(SKU_SEQUENCE_KEY);
    let sku = formatSku(sequence);

    while (used.has(sku.toLowerCase())) {
      sequence += 1;
      sku = formatSku(sequence);
    }

    writeSequence(sequence + 1, SKU_SEQUENCE_KEY);
    return sku;
  },

  generateProductBarcode({ products = [] } = {}) {
    const used = new Set(
      products
        .flatMap((product) => [product.barcode, ...(product.barcodes || [])])
        .map((barcode) => normalizeCode(barcode))
        .filter(Boolean),
    );
    let seed = readSequence(BARCODE_SEQUENCE_KEY);
    let barcode = generateBarcode(seed);

    while (used.has(barcode)) {
      seed += 1;
      barcode = generateBarcode(seed);
    }

    writeSequence(seed + 1, BARCODE_SEQUENCE_KEY);
    return barcode;
  },

  generateProductQrCode(product) {
    const productId = product?.id || createProductEntityId("prd");
    return `zenix:product:${productId}`;
  },
};

export const generateProductSku = (params) =>
  productIdentityAdapter.generateProductSku(params);

export const validateUniqueSku = (sku, products = [], currentProductId = "") => {
  const normalized = normalizeCode(sku).toLowerCase();
  if (!normalized) return true;

  return !products.some(
    (product) =>
      product.id !== currentProductId &&
      normalizeCode(product.sku).toLowerCase() === normalized,
  );
};

export const validateUniqueBarcode = (barcode, products = [], currentProductId = "") => {
  const normalized = normalizeCode(barcode);
  if (!normalized) return true;

  return !products.some(
    (product) =>
      product.id !== currentProductId &&
      [product.barcode, ...(product.barcodes || [])]
        .map((entry) => normalizeCode(entry))
        .includes(normalized),
  );
};

export const ensureProductIdentity = (product = {}, products = []) => {
  const id = product.id || createProductEntityId("prd");
  const sku = normalizeCode(product.sku) || generateProductSku({ products });
  const barcodes = (product.barcodes || []).map(normalizeCode).filter(Boolean);
  const barcode = normalizeCode(product.barcode) || barcodes[0] || "";
  const qrCode = normalizeCode(product.qrCode) || productIdentityAdapter.generateProductQrCode({ ...product, id });

  return {
    ...product,
    id,
    sku,
    barcode,
    barcodes: barcode ? [barcode, ...barcodes.filter((entry) => entry !== barcode)] : barcodes,
    qrCode,
  };
};
