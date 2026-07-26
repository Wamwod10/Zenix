// PDF 56 — Landed Cost Allocation Engine (Enterprise). Tanlangan usul
// (miqdor/qiymat/og'irlik/hajm/teng/qo'lda) bo'yicha qo'shimcha xarajatni
// qabul qilinayotgan qatorlarga taqsimlaydi va har bir qatorning taqsimlangan
// summasi, ulushi (%) va birlik tannarxga qo'shilgan qismini qaytaradi.
//
// Frontend HAM, kelajakdagi backend HAM shu bitta formuladan foydalanishi
// mumkin bo'lishi uchun sof funksiya sifatida yozilgan (side-effect yo'q).

import { getLandedCostTypeLabel } from "../constants/landedCosts";
import { formatMoney, normalizeNumber } from "./purchaseMoney";

export const LANDED_COST_ALLOCATION_TOLERANCE = 1;

// Har bir qator uchun "baza" qiymati — usulga qarab nimaga mutanosib
// taqsimlanishini belgilaydi.
const getLineBasis = (line, method) => {
  const quantity = normalizeNumber(line.quantity);

  switch (method) {
    case "value":
      return quantity * normalizeNumber(line.unitPrice);
    case "weight":
      return quantity * normalizeNumber(line.weightPerUnit);
    case "volume":
      return quantity * normalizeNumber(line.volumePerUnit);
    case "equal":
      return 1;
    case "quantity":
    default:
      return quantity;
  }
};

// Manfiy xarajat qiymatlarini aniqlaydi — UI ham, store ham shu bitta
// tekshiruvdan foydalanadi.
export const validateLandedCostEntries = (entries = []) => {
  const errors = [];

  entries.forEach((entry) => {
    if (normalizeNumber(entry.amount) < 0) {
      errors.push(
        `"${getLandedCostTypeLabel(entry.type)}" summasi manfiy bo'lishi mumkin emas.`,
      );
    }
  });

  return errors;
};

export const sumLandedCostEntries = (entries = []) =>
  entries.reduce((sum, entry) => sum + normalizeNumber(entry.amount), 0);

/**
 * @param {Object} params
 * @param {number} params.totalCost           Taqsimlanadigan jami landed cost
 * @param {string} params.method              LANDED_COST_ALLOCATION_METHODS id
 * @param {Array<{itemId:string, name:string, quantity:number, unitPrice?:number, weightPerUnit?:number, volumePerUnit?:number}>} params.lines
 *        Faqat shu qabulda haqiqatan miqdori bor (quantity > 0) qatorlar hisobga olinadi.
 * @param {Object<string, number>} params.manualAllocations  itemId -> summa (faqat manual usulda)
 * @returns {{allocations: Array, totalAllocated: number, mismatch: number, errors: string[], warnings: string[]}}
 */
export const computeLandedCostAllocation = ({
  totalCost = 0,
  method = "quantity",
  lines = [],
  manualAllocations = {},
} = {}) => {
  const safeTotal = normalizeNumber(totalCost);
  const errors = [];
  const warnings = [];

  if (safeTotal <= 0) {
    return { allocations: [], totalAllocated: 0, mismatch: 0, errors, warnings };
  }

  const eligibleLines = lines.filter((line) => normalizeNumber(line.quantity) > 0);

  if (!eligibleLines.length) {
    errors.push(
      "Taqsimlash uchun mos qator topilmadi — landed cost qo'shish uchun kamida bitta tovar qabul qilinishi kerak.",
    );
    return { allocations: [], totalAllocated: 0, mismatch: safeTotal, errors, warnings };
  }

  // Qo'lda taqsimlash — foydalanuvchi har bir qator uchun aniq summa kiritadi,
  // yig'indi jami xarajatga (yaxlitlash chegarasida) teng bo'lishi shart.
  if (method === "manual") {
    const allocations = eligibleLines.map((line) => {
      const amount = normalizeNumber(manualAllocations[line.itemId]);
      const quantity = normalizeNumber(line.quantity);

      return {
        itemId: line.itemId,
        name: line.name,
        basis: null,
        sharePercent: safeTotal ? (amount / safeTotal) * 100 : 0,
        allocatedAmount: amount,
        unitCostAdded: quantity ? amount / quantity : 0,
      };
    });

    const totalAllocated = allocations.reduce(
      (sum, entry) => sum + entry.allocatedAmount,
      0,
    );
    const mismatch = Math.round((safeTotal - totalAllocated) * 100) / 100;

    if (allocations.some((entry) => entry.allocatedAmount < 0)) {
      errors.push("Qo'lda taqsimlangan summa manfiy bo'lishi mumkin emas.");
    }

    if (Math.abs(mismatch) > LANDED_COST_ALLOCATION_TOLERANCE) {
      errors.push(
        mismatch > 0
          ? `Taqsimlangan summa jami xarajatdan ${formatMoney(mismatch)} kam — farqni to'ldiring.`
          : `Taqsimlangan summa jami xarajatdan ${formatMoney(Math.abs(mismatch))} ortiq — qiymatlarni tekshiring.`,
      );
    }

    return { allocations, totalAllocated, mismatch, errors, warnings };
  }

  // Avtomatik (proporsional) usullar — quantity/value/weight/volume/equal.
  const basisTotal = eligibleLines.reduce(
    (sum, line) => sum + getLineBasis(line, method),
    0,
  );

  if (basisTotal <= 0) {
    const basisLabel =
      method === "weight" ? "Og'irlik" : method === "volume" ? "Hajm" : "Baza";

    errors.push(
      `${basisLabel} qiymati kiritilmagan — "${basisLabel.toLowerCase()} bo'yicha" usul bilan taqsimlash imkonsiz.`,
    );

    return { allocations: [], totalAllocated: 0, mismatch: safeTotal, errors, warnings };
  }

  // Yaxlitlash: har qatorga proporsional summa 2 xonagacha yaxlitlanadi, farq
  // OXIRGI qatorga qo'shiladi — natijada yig'indi har doim aynan totalCost'ga
  // teng bo'ladi (generateInstallmentSchedule'dagi bilan bir xil g'oya).
  let allocatedSoFar = 0;

  const allocations = eligibleLines.map((line, index) => {
    const basis = getLineBasis(line, method);
    const sharePercent = (basis / basisTotal) * 100;
    const quantity = normalizeNumber(line.quantity);
    const isLast = index === eligibleLines.length - 1;
    const rawAmount = (safeTotal * basis) / basisTotal;
    const amount = isLast
      ? Math.round((safeTotal - allocatedSoFar) * 100) / 100
      : Math.round(rawAmount * 100) / 100;

    allocatedSoFar += amount;

    return {
      itemId: line.itemId,
      name: line.name,
      basis,
      sharePercent,
      allocatedAmount: amount,
      unitCostAdded: quantity ? amount / quantity : 0,
    };
  });

  return { allocations, totalAllocated: allocatedSoFar, mismatch: 0, errors, warnings };
};
