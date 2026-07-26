// Enterprise Damaged Goods & Quality Inspection — hisoblash/validatsiya
// dvigateli. QualityInspectionModal (oldindan ko'rish) VA usePurchasesStore
// (yakuniy, ishonchli qayta hisoblash) SHU BIR XIL funksiyalardan
// foydalanadi — mantiq ikki joyda yozilmaydi (landedCostAllocation.js bilan
// bir xil naqsh).

import { normalizeNumber } from "./purchaseMoney";
import {
  INSPECTION_ACTIONS,
  INSPECTION_STATUSES,
} from "../constants/qualityInspection";

// Miqdorlarni xavfsiz normallashtiradi — manfiy/noraqam qiymatlarga
// ishonilmaydi, qabul+rad damagedQty dan oshib ketmaydi (qabul ustuvor).
export const normalizeInspectionItem = (item, damagedQty) => {
  const safeDamaged = Math.max(normalizeNumber(damagedQty), 0);
  let accepted = Math.max(normalizeNumber(item.acceptedQty), 0);
  let rejected = Math.max(normalizeNumber(item.rejectedQty), 0);

  if (accepted > safeDamaged) accepted = safeDamaged;
  if (accepted + rejected > safeDamaged) {
    rejected = Math.max(safeDamaged - accepted, 0);
  }

  return { ...item, acceptedQty: accepted, rejectedQty: rejected };
};

const EPSILON = 1e-6;

// Validatsiya: manfiy miqdor, Accepted+Rejected > Received (damagedQty),
// to'liq hisobga olinmagan miqdor, shikast turi/amal tanlanmaganligi.
export const validateInspectionItem = (item, damagedQty) => {
  const errors = [];
  const safeDamaged = Math.max(normalizeNumber(damagedQty), 0);
  const accepted = normalizeNumber(item.acceptedQty);
  const rejected = normalizeNumber(item.rejectedQty);
  const label = item.name || "Tovar";

  if (accepted < 0 || rejected < 0) {
    errors.push(`${label}: miqdor manfiy bo'lishi mumkin emas.`);
  }

  if (accepted + rejected - safeDamaged > EPSILON) {
    errors.push(
      `${label}: qabul + rad miqdori tekshiruvdagi miqdordan (${safeDamaged}) oshib ketdi.`,
    );
  } else if (safeDamaged - (accepted + rejected) > EPSILON) {
    errors.push(
      `${label}: butun miqdor (${safeDamaged}) hisobga olinishi kerak — qabul yoki rad qilingan qism to'liq emas.`,
    );
  }

  if (!item.damageType) {
    errors.push(`${label}: shikast turi tanlanmagan.`);
  }

  if (!item.action) {
    errors.push(`${label}: amal tanlanmagan.`);
  }

  return errors;
};

// Qator natijasi — miqdor + tanlangan amal asosida haqiqiy hisoblanadi
// (foydalanuvchi tomonidan qo'lda tanlanmaydi).
export const computeItemInspectionStatus = (item, damagedQty) => {
  const safeDamaged = Math.max(normalizeNumber(damagedQty), 0);
  const accepted = normalizeNumber(item.acceptedQty);
  const rejected = normalizeNumber(item.rejectedQty);

  if (accepted <= 0 && rejected <= 0) return INSPECTION_STATUSES.pending;

  if (safeDamaged > 0 && accepted >= safeDamaged - EPSILON) {
    return INSPECTION_STATUSES.passed;
  }

  if (safeDamaged > 0 && rejected >= safeDamaged - EPSILON) {
    return item.action === INSPECTION_ACTIONS.reject
      ? INSPECTION_STATUSES.rejected
      : INSPECTION_STATUSES.failed;
  }

  return INSPECTION_STATUSES.partial;
};

// Butun tekshiruv hujjati holati — barcha qator natijalaridan hisoblanadi.
export const computeInspectionStatus = (itemStatuses = []) => {
  if (!itemStatuses.length) return INSPECTION_STATUSES.pending;

  if (itemStatuses.some((status) => status === INSPECTION_STATUSES.pending)) {
    return INSPECTION_STATUSES.pending;
  }

  if (itemStatuses.every((status) => status === INSPECTION_STATUSES.passed)) {
    return INSPECTION_STATUSES.passed;
  }

  if (itemStatuses.every((status) => status === INSPECTION_STATUSES.rejected)) {
    return INSPECTION_STATUSES.rejected;
  }

  const allFailedLike = itemStatuses.every(
    (status) =>
      status === INSPECTION_STATUSES.rejected || status === INSPECTION_STATUSES.failed,
  );
  if (allFailedLike) return INSPECTION_STATUSES.failed;

  return INSPECTION_STATUSES.partial;
};

// Reporting: Inspection summary / Damage summary — hujjat(lar) bo'yicha
// yig'ma miqdorlar (Accepted/Rejected/Replacement/Return va h.k.).
export const summarizeInspectionItems = (items = []) =>
  items.reduce(
    (summary, item) => {
      const accepted = normalizeNumber(item.acceptedQty);
      const rejected = normalizeNumber(item.rejectedQty);

      summary.damagedQty += normalizeNumber(item.damagedQty);
      summary.acceptedQty += accepted;
      summary.rejectedQty += rejected;

      if (item.action === INSPECTION_ACTIONS.returnSupplier) {
        summary.returnQty += rejected;
      }
      if (item.action === INSPECTION_ACTIONS.replacement) {
        summary.replacementQty += rejected;
      }
      if (item.action === INSPECTION_ACTIONS.dispose) {
        summary.disposedQty += rejected;
      }
      if (item.action === INSPECTION_ACTIONS.repair) {
        summary.repairQty += rejected;
      }
      if (item.action === INSPECTION_ACTIONS.quarantine) {
        summary.quarantineQty += rejected;
      }

      return summary;
    },
    {
      damagedQty: 0,
      acceptedQty: 0,
      rejectedQty: 0,
      returnQty: 0,
      replacementQty: 0,
      disposedQty: 0,
      repairQty: 0,
      quarantineQty: 0,
    },
  );
