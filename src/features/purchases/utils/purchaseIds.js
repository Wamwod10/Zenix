// Hujjat raqamlari: PO-2026-0001, GR-..., INV-..., RET-...

let counter = 0;

export const createEntityId = (prefix = "ent") => {
  counter += 1;
  const cryptoPart = globalThis.crypto?.randomUUID?.();

  if (cryptoPart) {
    return `${prefix}-${cryptoPart}`;
  }

  const monotonicPart =
    typeof performance !== "undefined"
      ? performance.now().toString(36).replace(".", "")
      : String(counter).padStart(6, "0");

  return `${prefix}-${monotonicPart}-${String(counter).padStart(4, "0")}`;
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
