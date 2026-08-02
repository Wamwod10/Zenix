// Hujjat raqamlari: PO-2026-0001, GR-..., INV-..., RET-...

let counter = 0;

export const createEntityId = (prefix = "ent") => {
  counter += 1;
  const cryptoPart = globalThis.crypto?.randomUUID?.();

  if (cryptoPart) {
    return `${prefix}-${cryptoPart}`;
  }

  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);

  return `${prefix}-${timePart}-${counter}-${randomPart}`;
};

export const createDocumentNumber = (prefix, sequence) => {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, "0");

  return `${prefix}-${year}-${padded}`;
};

export const DOCUMENT_PREFIXES = {
  order: "PO",
  receipt: "GR",
  invoice: "INV",
  return: "RET",
  payment: "PAY",
  inspection: "QI",
};
