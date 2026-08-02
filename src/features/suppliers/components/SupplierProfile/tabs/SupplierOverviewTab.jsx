// Step 3/5/7 (extracted from SupplierProfile.jsx): "Umumiy" bo'limi —
// kompaniya/kontakt, moliya (qarz/kredit), sozlamalar (holat, yetkazish
// muddati, kredit limiti, kategoriya), statistika, samaradorlik. Har
// o'zgarish darhol saqlanadi (onUpdateSupplier -> useSuppliers().actions.
// updateSupplier — yagona manba).
//
// Bu bo'limga XOS bo'lgan draft/holat (yetkazish muddati va kredit limiti
// qoralamasi, "Boshqa" kategoriya qo'shish formasi, holat o'zgartirish
// so'rovi) ilgari SupplierProfile.jsx'ning umumiy state'ida edi — endi shu
// yerda, faqat shu bo'lim ishlatadigan joyda saqlanadi (Performance: boshqa
// tab'lar bu state o'zgarishidan qayta render bo'lmaydi; Architecture:
// state ishlatilgan joyga yaqin).

import { useState } from "react";
import {
  Check,
  Gauge,
  Mail,
  MapPin,
  Phone,
  Plus,
  ReceiptText,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";

import { Button } from "../../../../../components/ui/Button/Button";
import { Card } from "../../../../../components/ui/Card/Card";
import { Dropdown } from "../../../../../components/ui/Dropdown/Dropdown";
import { useNotification } from "../../../../../components/ui/Notification/NotificationContext";
import {
  formatCompactMoney,
  formatMoney,
  formatPurchaseDate,
} from "../../../../purchases/utils/purchaseMoney";
import {
  clampCreditLimit,
  clampLeadTimeDays,
  CREDIT_STATUSES,
  getCategoryLabel,
  getSupplierCreditStatus,
  SUPPLIER_CATEGORIES,
  SUPPLIER_STATUS_FLOW,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_STATUSES,
} from "../../../suppliersApi";
import SupplierConfirmDialog from "../../SupplierConfirmDialog/SupplierConfirmDialog";

// Confirmation Dialog (audit): holatni "pasaytiruvchi" o'tishlar (bloklash,
// nofaollashtirish) boshqa modullarga (masalan PurchaseOrderWizard) ta'sir
// qiladi — shu sabab tasdiqlash talab qilinadi. Faollashtirish (yuqoriga
// o'tish) esa to'g'ridan-to'g'ri qo'llaniladi (keraksiz click yo'q).
const STATUS_CHANGE_CONFIRM_REQUIRED = new Set([
  SUPPLIER_STATUSES.blocked,
  SUPPLIER_STATUSES.inactive,
]);

const SupplierOverviewTab = ({
  supplier,
  debt,
  stats,
  onUpdateSupplier,
  onChangeStatus,
  canEdit = true,
  canChangeStatus = true,
}) => {
  const notify = useNotification();
  const [leadTimeDraft, setLeadTimeDraft] = useState(supplier?.leadTimeDays ?? 3);
  const [creditLimitDraft, setCreditLimitDraft] = useState(supplier?.creditLimit ?? 0);
  // "Boshqa" chipi endi tugma emas — bosilganda shu ikkita state orqali
  // inline "yangi kategoriya qo'shish" formasi ochiladi (modal yo'q,
  // navigatsiya yo'q). Mavjud `onUpdateSupplier` / `categories` mexanizmi
  // qayta ishlatiladi — backend ulanganda ham shu bir joyni o'zgartirish
  // yetarli bo'ladi.
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  // Confirmation Dialog (audit): riskli amallar tasdiqlanmaguncha
  // qo'llanilmaydi — faqat "so'ralgan" holat saqlanadi, haqiqiy o'zgarish
  // faqat foydalanuvchi tasdiqlaganda yuz beradi.
  const [statusChangeRequest, setStatusChangeRequest] = useState(null);

  const creditStatus = getSupplierCreditStatus(supplier.creditLimit, debt);
  const creditUsedPercent = Math.min(creditStatus.usedPercent, 100);

  // Step 3/5/7: kategoriya — profilda darhol tahrirlanadi va saqlanadi
  // (yagona manba), Purchases faqat o'qiydi.
  const toggleCategory = (categoryId) => {
    const current = supplier.categories || [];
    const next = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];

    onUpdateSupplier?.({ categories: next });
  };

  // "Boshqa" — foydalanuvchi kiritgan nom to'g'ridan-to'g'ri (mavjud
  // SUPPLIER_CATEGORIES ro'yxatidagi qattiq-kodlangan id'lar kabi emas) yangi
  // kategoriya ID/label sifatida ishlatiladi. `getCategoryLabel` mos yozuv
  // topilmasa id'ning o'zini qaytaradi — shu sabab alohida "custom category
  // label" xaritasi kerak emas, mavjud chip/badge komponentlari o'zgarishsiz
  // ishlaydi.
  //
  // Bug fix: ilgari yangi kategoriya FAQAT `categories` (tanlangan to'plam)
  // ichiga qo'shilardi — chiplar ro'yxati ham xuddi shu massivdan chizilardi.
  // Foydalanuvchi keyin uni bosib "o'chirsa" (deselect), id `categories`dan
  // butunlay chiqib ketardi — demak kategoriyaning O'ZI yo'qolib qolardi,
  // xuddi u hech qachon yaratilmagandek. Endi yaratilgan har bir custom
  // kategoriya alohida, tanlov holatidan MUSTAQIL `customCategories`
  // ro'yxatida (yagona manba, boshqa saqlanadigan supplier maydonlari kabi)
  // doimiy saqlanadi — xuddi qattiq-kodlangan SUPPLIER_CATEGORIES kabi u
  // har doim chip sifatida ko'rinadi, faqat "tanlangan/tanlanmagan" holati
  // o'zgaradi.
  const commitNewCategory = () => {
    const name = newCategoryName.trim();

    if (!name) {
      setAddingCategory(false);
      return;
    }

    const currentSelected = supplier.categories || [];
    const currentCustom = supplier.customCategories || [];

    onUpdateSupplier?.({
      categories: currentSelected.includes(name)
        ? currentSelected
        : [...currentSelected, name],
      customCategories: currentCustom.includes(name)
        ? currentCustom
        : [...currentCustom, name],
    });
    notify.success(`"${name}" kategoriyasi qo'shildi.`);

    setNewCategoryName("");
    setAddingCategory(false);
  };

  const cancelNewCategory = () => {
    setNewCategoryName("");
    setAddingCategory(false);
  };

  // Business Validation feedback (audit): ilgari noto'g'ri qiymat (masalan
  // manfiy son) hech qanday tushuntirishsiz jimgina oldingi holatga
  // qaytardi — foydalanuvchi nima uchun o'zgarish saqlanmaganini bilmasdi.
  const commitLeadTime = () => {
    const numeric = Number(leadTimeDraft);
    const wasInvalid = !Number.isFinite(numeric) || numeric < 1;
    const value = clampLeadTimeDays(leadTimeDraft, supplier.leadTimeDays);

    setLeadTimeDraft(value);

    if (value === supplier.leadTimeDays) {
      if (wasInvalid) {
        notify.warning(
          "Yetkazish muddati kamida 1 kun bo'lishi kerak — oldingi qiymat saqlandi.",
        );
      }
      return;
    }

    const result = onUpdateSupplier?.({ leadTimeDays: value });

    if (result?.ok === false) return;

    notify.success("Yetkazish muddati yangilandi.");
  };

  const commitCreditLimit = () => {
    const numeric = Number(creditLimitDraft);
    const wasInvalid = !Number.isFinite(numeric) || numeric < 0;
    const value = clampCreditLimit(creditLimitDraft, supplier.creditLimit);

    setCreditLimitDraft(value);

    if (value === supplier.creditLimit) {
      if (wasInvalid) {
        notify.warning(
          "Kredit limiti manfiy bo'lishi mumkin emas — oldingi qiymat saqlandi.",
        );
      }
      return;
    }

    const result = onUpdateSupplier?.({ creditLimit: value });

    if (result?.ok === false) return;

    notify.success("Kredit limiti yangilandi.");
  };

  // Confirmation Dialog (audit "Supplier Block" / "Status Change"): holatni
  // pasaytiruvchi o'tishlar (bloklash, nofaollashtirish) tasdiqlashni talab
  // qiladi, chunki boshqa modullar (PO Wizard) shu holatga tayanadi.
  // Faollashtirish to'g'ridan-to'g'ri qo'llaniladi — foydalanuvchini keraksiz
  // qadam bilan to'xtatmaslik uchun.
  const requestStatusChange = (nextStatus) => {
    if (!nextStatus || nextStatus === supplier.status) return;

    if (STATUS_CHANGE_CONFIRM_REQUIRED.has(nextStatus)) {
      setStatusChangeRequest(nextStatus);
      return;
    }

    applyStatusChange(nextStatus);
  };

  const applyStatusChange = (nextStatus) => {
    const result = onChangeStatus?.(nextStatus);

    if (result?.ok === false) return;

    notify.success(
      `Holat "${SUPPLIER_STATUS_LABELS[nextStatus] || nextStatus}"ga o'zgartirildi.`,
    );
  };

  const confirmStatusChange = () => {
    if (statusChangeRequest) applyStatusChange(statusChangeRequest);
    setStatusChangeRequest(null);
  };

  return (
    <div
      className="supplier-profile__overview"
      role="tabpanel"
      id="supplier-tabpanel-overview"
      aria-labelledby="supplier-tab-overview"
    >
      <Card className="supplier-profile__card supplier-profile__card--contact">
        <h3>Kompaniya va kontakt</h3>
        <div className="supplier-profile__rows">
          <div>
            <User size={14} />
            <span>{supplier.contactPerson || "Kontakt shaxs kiritilmagan"}</span>
          </div>
          <div>
            <Phone size={14} />
            <span>{supplier.phone || "Telefon kiritilmagan"}</span>
          </div>
          <div>
            <Mail size={14} />
            <span>{supplier.email || "Email kiritilmagan"}</span>
          </div>
          <div>
            <MapPin size={14} />
            <span>{supplier.address || "Manzil kiritilmagan"}</span>
          </div>
          <div>
            <ReceiptText size={14} />
            <span>STIR: {supplier.stir || "kiritilmagan"}</span>
          </div>
        </div>
      </Card>

      <Card className="supplier-profile__card">
        <h3>Moliya</h3>
        <div className="supplier-profile__credit">
          <div className="supplier-profile__credit-head">
            <span>Qarz / kredit limit</span>
            <strong>
              {formatCompactMoney(debt)} / {formatCompactMoney(supplier.creditLimit)}
            </strong>
          </div>

          <div className="supplier-profile__credit-bar">
            <span
              style={{ width: `${creditUsedPercent}%` }}
              className={
                creditStatus.status === CREDIT_STATUSES.warning ||
                creditStatus.status === CREDIT_STATUSES.exceeded
                  ? "supplier-profile__credit-fill supplier-profile__credit-fill--danger"
                  : "supplier-profile__credit-fill"
              }
            />
          </div>

          <small>
            {creditStatus.usedPercent}% ishlatilgan · joriy qarz {formatMoney(debt)}
            {creditStatus.status === CREDIT_STATUSES.exceeded &&
              " · kredit limiti oshib ketgan"}
          </small>
        </div>

        <div className="supplier-profile__meta-grid">
          <div>
            <span>Qo'shilgan sana</span>
            <strong>{formatPurchaseDate(supplier.createdAt)}</strong>
          </div>
        </div>
      </Card>

      {/* Step 3/5/7: barcha ilg'or sozlash shu yerda — holat, yetkazish
          muddati, kredit limiti, kategoriya. Har o'zgarish darhol
          saqlanadi, alohida "Saqlash" tugmasi shart emas. */}
      <Card className="supplier-profile__card supplier-profile__card--wide">
        <h3>
          <Settings size={15} />
          Sozlamalar
        </h3>

        <div className="supplier-profile__settings-grid">
          <label className="supplier-profile__field">
            <span>Holat</span>
            {canChangeStatus && !supplier.archived ? (
              <Dropdown
                value={supplier.status}
                // Business rule: faqat joriy holat + shu holatdan ruxsat
                // etilgan keyingi holatlar ko'rsatiladi (SUPPLIER_STATUS_FLOW)
                // — "Invalid transition bo'lmasin": foydalanuvchi hech
                // qachon taqiqlangan o'tishni tanlay olmaydi (masalan
                // bloklangandan to'g'ridan-to'g'ri "yangi"ga).
                options={[
                  supplier.status,
                  ...(SUPPLIER_STATUS_FLOW[supplier.status] || []),
                ].map((status) => ({
                  value: status,
                  label: SUPPLIER_STATUS_LABELS[status],
                }))}
                onChange={requestStatusChange}
              />
            ) : (
              <span className="supplier-profile__field-hint">
                {SUPPLIER_STATUS_LABELS[supplier.status]}
                {supplier.archived
                  ? " (arxivlangan — avval tiklang)"
                  : " (o'zgartirish uchun ruxsat yo'q)"}
              </span>
            )}
          </label>

          <label className="supplier-profile__field">
            <span>Yetkazish muddati (kun)</span>
            <input
              type="number"
              min="1"
              value={leadTimeDraft}
              disabled={!canEdit}
              onChange={(event) => setLeadTimeDraft(event.target.value)}
              onBlur={commitLeadTime}
              onKeyDown={(event) => event.key === "Enter" && commitLeadTime()}
            />
          </label>

          <label className="supplier-profile__field">
            <span>Kredit limiti (so'm)</span>
            <input
              type="number"
              min="0"
              step="100000"
              value={creditLimitDraft}
              disabled={!canEdit}
              onChange={(event) => setCreditLimitDraft(event.target.value)}
              onBlur={commitCreditLimit}
              onKeyDown={(event) => event.key === "Enter" && commitCreditLimit()}
            />
          </label>
        </div>

        <div className="supplier-profile__settings-categories">
          <span className="supplier-profile__field-label">Kategoriyalar</span>
          <div className="supplier-profile__chip-row">
            {/* Oldindan belgilangan kategoriyalar ("Boshqa" bundan mustasno —
                u endi tanlov emas, inline "qo'shish" amali). Foydalanuvchi
                ilgari "Boshqa" orqali qo'shgan ixtiyoriy nomlar (SUPPLIER_
                CATEGORIES ro'yxatida yo'q id'lar) ham xuddi shu chip
                ko'rinishida qayta ishlatiladi — alohida komponent/uslub
                yaratilmaydi. */}
            {SUPPLIER_CATEGORIES.filter((category) => category.id !== "other").map(
              (category) => {
                const active = (supplier.categories || []).includes(category.id);

                return (
                  <button
                    type="button"
                    key={category.id}
                    disabled={!canEdit}
                    className={
                      active
                        ? "supplier-profile__chip supplier-profile__chip--active"
                        : "supplier-profile__chip"
                    }
                    onClick={() => toggleCategory(category.id)}
                  >
                    {active && <Check size={12} />}
                    {category.label}
                  </button>
                );
              },
            )}

            {/* Doimiy saqlanadigan custom kategoriyalar — tanlov holatidan
                mustaqil, har doim ko'rinadi (pastdagi eski ma'lumot bilan
                moslik uchun `categories`dagi hali `customCategories`ga
                yozilmagan id'lar ham qo'shiladi, so'ng unikal qilinadi). */}
            {Array.from(
              new Set([
                ...(supplier.customCategories || []),
                ...(supplier.categories || []).filter(
                  (id) => !SUPPLIER_CATEGORIES.some((entry) => entry.id === id),
                ),
              ]),
            ).map((id) => {
              const active = (supplier.categories || []).includes(id);

              return (
                <button
                  type="button"
                  key={id}
                  disabled={!canEdit}
                  className={
                    active
                      ? "supplier-profile__chip supplier-profile__chip--active"
                      : "supplier-profile__chip"
                  }
                  onClick={() => toggleCategory(id)}
                >
                  {active && <Check size={12} />}
                  {getCategoryLabel(id)}
                </button>
              );
            })}

            {canEdit && addingCategory ? (
              <span className="supplier-profile__chip-form">
                <input
                  type="text"
                  autoFocus
                  placeholder="Kategoriya nomi..."
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitNewCategory();
                    }

                    if (event.key === "Escape") {
                      event.preventDefault();
                      cancelNewCategory();
                    }
                  }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="supplier-profile__chip-action"
                  onClick={commitNewCategory}
                >
                  Saqlash
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="supplier-profile__chip-action"
                  onClick={cancelNewCategory}
                >
                  Bekor qilish
                </Button>
              </span>
            ) : (
              canEdit && (
                <button
                  type="button"
                  className="supplier-profile__chip"
                  onClick={() => setAddingCategory(true)}
                >
                  <Plus size={12} />
                  Boshqa
                </button>
              )
            )}
          </div>
        </div>
      </Card>

      <Card className="supplier-profile__card">
        <h3>
          <ShoppingBag size={15} />
          Statistika
        </h3>
        <div className="supplier-profile__meta-grid supplier-profile__meta-grid--stats">
          <div>
            <span>Jami buyurtma</span>
            <strong>{stats.totalOrders} ta</strong>
          </div>
          <div>
            <span>Jami xarid summasi</span>
            <strong>{formatCompactMoney(stats.totalSpend)} so'm</strong>
          </div>
          <div>
            <span>O'rtacha buyurtma</span>
            <strong>{formatCompactMoney(stats.avgOrderValue)} so'm</strong>
          </div>
        </div>
      </Card>

      <Card className="supplier-profile__card">
        <h3>
          <Gauge size={15} />
          Samaradorlik
        </h3>
        {stats.onTimePercent === null ? (
          <p className="supplier-profile__empty-hint">
            Hali yetkazib berilgan buyurtma yo'q — samaradorlik hisoblanmadi.
          </p>
        ) : (
          <div className="supplier-profile__meta-grid supplier-profile__meta-grid--stats">
            <div>
              <span>O'z vaqtida yetkazish</span>
              <strong
                className={
                  stats.onTimePercent >= 80
                    ? "supplier-profile__stat-good"
                    : "supplier-profile__stat-bad"
                }
              >
                {stats.onTimePercent}%
              </strong>
            </div>
            <div>
              <span>Yetkazilgan buyurtma</span>
              <strong>{stats.deliveredCount} ta</strong>
            </div>
          </div>
        )}
      </Card>

      <SupplierConfirmDialog
        open={!!statusChangeRequest}
        tone={statusChangeRequest === SUPPLIER_STATUSES.blocked ? "danger" : "warning"}
        title={
          statusChangeRequest === SUPPLIER_STATUSES.blocked
            ? "Yetkazib beruvchini bloklash"
            : "Yetkazib beruvchini nofaol qilish"
        }
        description={
          statusChangeRequest === SUPPLIER_STATUSES.blocked
            ? `"${supplier.name}" bloklansa, u yangi xarid buyurtmalarida tanlab bo'lmaydi. Davom etasizmi?`
            : `"${supplier.name}" nofaol qilinsa, u faol yetkazib beruvchilar ro'yxatida ko'rinmay qoladi. Davom etasizmi?`
        }
        confirmLabel={
          statusChangeRequest === SUPPLIER_STATUSES.blocked ? "Ha, bloklash" : "Ha, nofaol qilish"
        }
        onConfirm={confirmStatusChange}
        onClose={() => setStatusChangeRequest(null)}
      />
    </div>
  );
};

export default SupplierOverviewTab;
