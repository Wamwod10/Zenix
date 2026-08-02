import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  Building2,
  Check,
  CircleDollarSign,
  ContactRound,
  Crown,
  Gift,
  LoaderCircle,
  NotebookPen,
  Phone,
  ShieldAlert,
  Tags,
  UserRoundCog,
  WalletCards,
  X,
} from "lucide-react";

import * as crmCustomerData from "../../data/crmCustomers";
import {
  createCustomerFormValues,
  hasCustomerFormChanges,
  prepareCustomerPayload,
  validateCustomerForm,
} from "../../utils/crmValidation";

import "./CustomerForm.scss";

const customerGroups =
  crmCustomerData.crmCustomerGroups ?? crmCustomerData.customerGroups ?? [];

const customerStatuses =
  crmCustomerData.crmCustomerStatuses ?? crmCustomerData.customerStatuses ?? [];

const customerTags =
  crmCustomerData.crmCustomerTags ?? crmCustomerData.customerTags ?? [];

const customerManagers =
  crmCustomerData.crmManagers ?? crmCustomerData.customerManagers ?? [];

const crmCustomers =
  crmCustomerData.crmCustomers ?? crmCustomerData.customers ?? [];

const loyaltyOptions = [
  {
    value: "bronze",
    label: "Bronza",
  },
  {
    value: "silver",
    label: "Kumush",
  },
  {
    value: "gold",
    label: "Oltin",
  },
  {
    value: "platinum",
    label: "Platina",
  },
];

const sourceOptions = [
  "POS",
  "Veb-sayt",
  "Telegram",
  "Instagram",
  "Tavsiya",
  "Reklama",
  "Telefon qo‘ng‘irog‘i",
  "Qo‘lda kiritilgan",
];

const normalizeOptions = (options = []) =>
  options.map((option) => {
    if (typeof option === "string") {
      return {
        value: option,
        label: option,
      };
    }

    return {
      value: option.value ?? option.id ?? option.status ?? option.name ?? "",
      label: option.label ?? option.title ?? option.name ?? option.value ?? "",
    };
  });

const normalizeGroupOptions = (options = []) =>
  options.map((option) => {
    if (typeof option === "string") {
      return {
        value: option,
        label: option,
      };
    }

    const label =
      option.label ??
      option.name ??
      option.title ??
      option.value ??
      option.id ??
      "";

    return {
      value: label,
      label,
    };
  });

const normalizeTags = (options = []) =>
  options.map((option) => {
    if (typeof option === "string") {
      return option;
    }

    return (
      option.label ??
      option.name ??
      option.title ??
      option.value ??
      option.id ??
      ""
    );
  });

const FormSection = ({ icon: Icon, title, description, children }) => (
  <section className="crm-customer-form__section">
    <header className="crm-customer-form__section-header">
      <span className="crm-customer-form__section-icon">
        <Icon aria-hidden="true" />
      </span>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>

    <div className="crm-customer-form__section-body">{children}</div>
  </section>
);

const FormField = ({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
  wide = false,
}) => (
  <div
    className={`crm-customer-form__field ${
      wide ? "crm-customer-form__field--wide" : ""
    }`}
  >
    <label htmlFor={htmlFor}>
      {label}
      {required ? <span aria-hidden="true">*</span> : null}
    </label>

    {children}

    {error ? (
      <small className="crm-customer-form__error" id={`${htmlFor}-error`}>
        {error}
      </small>
    ) : hint ? (
      <small id={`${htmlFor}-hint`}>{hint}</small>
    ) : null}
  </div>
);

const CustomerForm = ({
  customer = null,
  groups = customerGroups,
  statuses = customerStatuses,
  tags = customerTags,
  managers = customerManagers,
  customers = crmCustomers,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const initialValues = useMemo(
    () => createCustomerFormValues(customer ?? {}),
    [customer],
  );

  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [discardConfirmation, setDiscardConfirmation] = useState(false);

  useEffect(() => {
    setValues(initialValues);
    setTouched({});
    setSubmitAttempted(false);
    setSubmitting(false);
    setFormError("");
    setDiscardConfirmation(false);
  }, [initialValues]);

  const validationErrors = useMemo(
    () =>
      validateCustomerForm(values, {
        customers,
        excludeCustomerId: customer?.id,
      }),
    [customer?.id, customers, values],
  );

  const dirty = useMemo(
    () => hasCustomerFormChanges(initialValues, values),
    [initialValues, values],
  );

  const valid = Object.keys(validationErrors).length === 0;

  const normalizedGroups = useMemo(
    () => normalizeGroupOptions(groups),
    [groups],
  );

  const normalizedStatuses = useMemo(
    () => normalizeOptions(statuses),
    [statuses],
  );

  const normalizedManagers = useMemo(
    () => normalizeOptions(managers).filter((manager) => manager.value && manager.label),
    [managers],
  );

  const normalizedTags = useMemo(
    () => normalizeTags(tags).filter(Boolean),
    [tags],
  );

  const maxBirthday = new Date().toISOString().slice(0, 10);

  const shouldShowError = (field) =>
    Boolean(validationErrors[field] && (touched[field] || submitAttempted));

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setFormError("");
  };

  const handleBlur = (event) => {
    const { name } = event.target;

    setTouched((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
  };

  const handleTagToggle = (tag) => {
    setValues((currentValues) => {
      const selected = currentValues.tags.includes(tag);

      return {
        ...currentValues,
        tags: selected
          ? currentValues.tags.filter((currentTag) => currentTag !== tag)
          : [...currentValues.tags, tag],
      };
    });

    setTouched((currentTouched) => ({
      ...currentTouched,
      tags: true,
    }));
  };

  const handleCancel = () => {
    if (submitting) {
      return;
    }

    if (dirty) {
      setDiscardConfirmation(true);
      return;
    }

    onCancel();
  };

  const handleDiscard = () => {
    setValues(initialValues);
    setTouched({});
    setDiscardConfirmation(false);
    onCancel();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setFormError("");

    if (!valid) {
      const firstErrorField = Object.keys(validationErrors)[0];

      document.querySelector(`[name="${firstErrorField}"]`)?.focus();

      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(prepareCustomerPayload(values));
    } catch {
      setFormError(
        "Mijoz ma’lumotlarini saqlab bo‘lmadi. Qayta urinib ko‘ring.",
      );
      setSubmitting(false);
    }
  };

  return (
    <form className="crm-customer-form" noValidate onSubmit={handleSubmit}>
      {formError ? (
        <div className="crm-customer-form__form-error" role="alert">
          <ShieldAlert aria-hidden="true" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="crm-customer-form__layout">
        <div className="crm-customer-form__main">
          <FormSection
            icon={ContactRound}
            title="Asosiy ma’lumotlar"
            description="Mijozni aniqlash va aloqa qilish uchun zarur ma’lumotlar"
          >
            <div className="crm-customer-form__grid">
              <FormField
                label="To‘liq ism"
                htmlFor="crm-customer-full-name"
                required
                error={
                  shouldShowError("fullName") ? validationErrors.fullName : null
                }
              >
                <input
                  id="crm-customer-full-name"
                  name="fullName"
                  type="text"
                  value={values.fullName}
                  maxLength={100}
                  disabled={submitting}
                  placeholder="Masalan: Dilshod Karimov"
                  autoComplete="name"
                  aria-invalid={shouldShowError("fullName")}
                  aria-describedby={
                    shouldShowError("fullName")
                      ? "crm-customer-full-name-error"
                      : undefined
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormField>

              <FormField
                label="Telefon"
                htmlFor="crm-customer-phone"
                required
                hint="+998 90 123 45 67 formatida"
                error={shouldShowError("phone") ? validationErrors.phone : null}
              >
                <div className="crm-customer-form__input-icon">
                  <Phone aria-hidden="true" />

                  <input
                    id="crm-customer-phone"
                    name="phone"
                    type="tel"
                    value={values.phone}
                    disabled={submitting}
                    placeholder="+998 90 123 45 67"
                    autoComplete="tel"
                    inputMode="tel"
                    aria-invalid={shouldShowError("phone")}
                    aria-describedby={
                      shouldShowError("phone")
                        ? "crm-customer-phone-error"
                        : "crm-customer-phone-hint"
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </FormField>

              <FormField
                label="Email"
                htmlFor="crm-customer-email"
                error={shouldShowError("email") ? validationErrors.email : null}
              >
                <input
                  id="crm-customer-email"
                  name="email"
                  type="email"
                  value={values.email}
                  disabled={submitting}
                  placeholder="mijoz@example.uz"
                  autoComplete="email"
                  aria-invalid={shouldShowError("email")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormField>

              <FormField
                label="Tug‘ilgan sana"
                htmlFor="crm-customer-birthday"
                error={
                  shouldShowError("birthday") ? validationErrors.birthday : null
                }
              >
                <input
                  id="crm-customer-birthday"
                  name="birthday"
                  type="date"
                  value={values.birthday}
                  max={maxBirthday}
                  disabled={submitting}
                  aria-invalid={shouldShowError("birthday")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormField>

              <FormField
                label="Kompaniya"
                htmlFor="crm-customer-company"
                error={
                  shouldShowError("company") ? validationErrors.company : null
                }
                wide
              >
                <div className="crm-customer-form__input-icon">
                  <Building2 aria-hidden="true" />

                  <input
                    id="crm-customer-company"
                    name="company"
                    type="text"
                    value={values.company}
                    maxLength={120}
                    disabled={submitting}
                    placeholder="Kompaniya yoki tashkilot nomi"
                    autoComplete="organization"
                    aria-invalid={shouldShowError("company")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={UserRoundCog}
            title="CRM boshqaruvi"
            description="Mijoz holati, guruhi, manbasi va mas’ul menejer"
          >
            <div className="crm-customer-form__grid">
              <FormField
                label="Mijoz holati"
                htmlFor="crm-customer-status"
                required
                error={
                  shouldShowError("status") ? validationErrors.status : null
                }
              >
                <select
                  id="crm-customer-status"
                  name="status"
                  value={values.status}
                  disabled={submitting}
                  aria-invalid={shouldShowError("status")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  {normalizedStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Mijoz guruhi" htmlFor="crm-customer-group">
                <select
                  id="crm-customer-group"
                  name="group"
                  value={values.group}
                  disabled={submitting}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Guruhsiz</option>

                  {normalizedGroups.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Mas’ul menejer" htmlFor="crm-customer-manager">
                <select
                  id="crm-customer-manager"
                  name="assignedManager"
                  value={values.assignedManager}
                  disabled={submitting}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Menejer biriktirilmagan</option>

                  {normalizedManagers.map((manager) => (
                    <option key={manager.value} value={manager.value}>
                      {manager.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Mijoz manbasi" htmlFor="crm-customer-source">
                <select
                  id="crm-customer-source"
                  name="source"
                  value={values.source}
                  disabled={submitting}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Manbani tanlang</option>

                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="crm-customer-form__tags">
              <div className="crm-customer-form__tags-heading">
                <div>
                  <Tags aria-hidden="true" />
                  <span>Mijoz teglari</span>
                </div>

                <small>{values.tags.length}/10 ta tanlandi</small>
              </div>

              <div
                className="crm-customer-form__tag-list"
                aria-label="Mijoz teglarini tanlash"
              >
                {normalizedTags.map((tag) => {
                  const selected = values.tags.includes(tag);

                  return (
                    <button
                      key={tag}
                      className={
                        selected
                          ? "crm-customer-form__tag crm-customer-form__tag--selected"
                          : "crm-customer-form__tag"
                      }
                      type="button"
                      disabled={
                        submitting || (!selected && values.tags.length >= 10)
                      }
                      aria-pressed={selected}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {selected ? <Check aria-hidden="true" /> : null}

                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>

              {shouldShowError("tags") ? (
                <small className="crm-customer-form__error">
                  {validationErrors.tags}
                </small>
              ) : null}
            </div>
          </FormSection>

          <FormSection
            icon={WalletCards}
            title="Moliyaviy sozlamalar"
            description="Bonus, cashback, qarzdorlik va chegirma limitlari"
          >
            <div className="crm-customer-form__grid crm-customer-form__grid--finance">
              <FormField
                label="Boshlang‘ich balans"
                htmlFor="crm-customer-balance"
                error={
                  shouldShowError("balance") ? validationErrors.balance : null
                }
              >
                <input
                  id="crm-customer-balance"
                  name="balance"
                  type="number"
                  value={values.balance}
                  disabled={submitting}
                  step="1000"
                  inputMode="decimal"
                  aria-invalid={shouldShowError("balance")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormField>

              <FormField
                label="Bonus"
                htmlFor="crm-customer-bonus"
                error={shouldShowError("bonus") ? validationErrors.bonus : null}
              >
                <div className="crm-customer-form__input-icon">
                  <Gift aria-hidden="true" />

                  <input
                    id="crm-customer-bonus"
                    name="bonus"
                    type="number"
                    value={values.bonus}
                    min="0"
                    step="1000"
                    disabled={submitting}
                    inputMode="decimal"
                    aria-invalid={shouldShowError("bonus")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </FormField>

              <FormField
                label="Cashback"
                htmlFor="crm-customer-cashback"
                error={
                  shouldShowError("cashback") ? validationErrors.cashback : null
                }
              >
                <div className="crm-customer-form__input-icon">
                  <CircleDollarSign aria-hidden="true" />

                  <input
                    id="crm-customer-cashback"
                    name="cashback"
                    type="number"
                    value={values.cashback}
                    min="0"
                    step="1000"
                    disabled={submitting}
                    inputMode="decimal"
                    aria-invalid={shouldShowError("cashback")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </FormField>

              <FormField
                label="Qarzdorlik"
                htmlFor="crm-customer-debt"
                error={shouldShowError("debt") ? validationErrors.debt : null}
              >
                <input
                  id="crm-customer-debt"
                  name="debt"
                  type="number"
                  value={values.debt}
                  min="0"
                  step="1000"
                  disabled={submitting}
                  inputMode="decimal"
                  aria-invalid={shouldShowError("debt")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormField>

              <FormField
                label="Qarz limiti"
                htmlFor="crm-customer-debt-limit"
                error={
                  shouldShowError("debtLimit")
                    ? validationErrors.debtLimit
                    : null
                }
              >
                <input
                  id="crm-customer-debt-limit"
                  name="debtLimit"
                  type="number"
                  value={values.debtLimit}
                  min="0"
                  step="1000"
                  disabled={submitting}
                  inputMode="decimal"
                  aria-invalid={shouldShowError("debtLimit")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormField>

              <FormField
                label="Shaxsiy chegirma"
                htmlFor="crm-customer-discount"
                hint="0 dan 100 foizgacha"
                error={
                  shouldShowError("discount") ? validationErrors.discount : null
                }
              >
                <div className="crm-customer-form__input-icon">
                  <BadgePercent aria-hidden="true" />

                  <input
                    id="crm-customer-discount"
                    name="discount"
                    type="number"
                    value={values.discount}
                    min="0"
                    max="100"
                    step="1"
                    disabled={submitting}
                    inputMode="decimal"
                    aria-invalid={shouldShowError("discount")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={NotebookPen}
            title="Ichki izoh"
            description="Faqat CRM foydalanuvchilariga ko‘rinadigan ma’lumot"
          >
            <FormField
              label="Mijoz haqida izoh"
              htmlFor="crm-customer-notes"
              hint={`${values.notes.length}/1000 ta belgi`}
              error={shouldShowError("notes") ? validationErrors.notes : null}
              wide
            >
              <textarea
                id="crm-customer-notes"
                name="notes"
                value={values.notes}
                maxLength={1000}
                rows={5}
                disabled={submitting}
                placeholder="Mijozning afzalliklari, aloqa uslubi yoki muhim kelishuvlarni yozing..."
                aria-invalid={shouldShowError("notes")}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormField>
          </FormSection>
        </div>

        <aside className="crm-customer-form__sidebar">
          <div className="crm-customer-form__summary">
            <span className="crm-customer-form__summary-icon">
              <Crown aria-hidden="true" />
            </span>

            <div>
              <span>Sodiqlik darajasi</span>

              <select
                name="loyaltyLevel"
                value={values.loyaltyLevel}
                disabled={submitting}
                aria-label="Sodiqlik darajasi"
                onChange={handleChange}
                onBlur={handleBlur}
              >
                {loyaltyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="crm-customer-form__status">
            <strong>
              {customer ? "Mijoz tahrirlanmoqda" : "Yangi mijoz yaratilmoqda"}
            </strong>

            <span>
              {dirty
                ? "Saqlanmagan o‘zgarishlar mavjud"
                : "Hozircha o‘zgarish kiritilmagan"}
            </span>
          </div>

          <div className="crm-customer-form__sidebar-actions">
            <button
              className="crm-customer-form__cancel"
              type="button"
              disabled={submitting}
              onClick={handleCancel}
            >
              <X aria-hidden="true" />
              <span>Bekor qilish</span>
            </button>

            <button
              className="crm-customer-form__submit"
              type="submit"
              disabled={!dirty || !valid || submitting}
            >
              {submitting ? (
                <LoaderCircle
                  className="crm-customer-form__spinner"
                  aria-hidden="true"
                />
              ) : (
                <Check aria-hidden="true" />
              )}

              <span>
                {submitting
                  ? "Saqlanmoqda"
                  : (submitLabel ??
                    (customer ? "O‘zgarishlarni saqlash" : "Mijozni yaratish"))}
              </span>
            </button>
          </div>
        </aside>
      </div>

      {discardConfirmation ? (
        <div
          className="crm-customer-form__confirmation"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="crm-customer-discard-title"
          aria-describedby="crm-customer-discard-description"
        >
          <div className="crm-customer-form__confirmation-card">
            <span>
              <ShieldAlert aria-hidden="true" />
            </span>

            <h3 id="crm-customer-discard-title">
              O‘zgarishlar bekor qilinsinmi?
            </h3>

            <p id="crm-customer-discard-description">
              Saqlanmagan mijoz ma’lumotlari qayta tiklanmaydi.
            </p>

            <div>
              <button
                type="button"
                onClick={() => setDiscardConfirmation(false)}
              >
                Formaga qaytish
              </button>

              <button type="button" onClick={handleDiscard}>
                O‘zgarishlarni bekor qilish
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
};

export default CustomerForm;
