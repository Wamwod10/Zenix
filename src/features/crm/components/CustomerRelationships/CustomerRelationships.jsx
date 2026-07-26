import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Crown,
  Edit3,
  ExternalLink,
  Link2,
  Mail,
  Phone,
  Plus,
  Save,
  Star,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  crmRelationshipStatuses,
  crmRelationshipTypes,
  deleteCustomerRelationship,
  getCustomerRelationships,
  saveCustomerRelationship,
  setPrimaryCustomerRelationship,
  toggleCustomerRelationshipStatus,
} from "../../data/crmRelationship";
import { formatDate } from "../../utils/crmFormatters";
import "./CustomerRelationships.scss";

const createEmptyForm = () => ({
  type: "contact",
  name: "",
  position: "",
  phone: "",
  email: "",
  note: "",
  status: "active",
  isPrimary: false,
});

const relationshipIcons = {
  company: Building2,
  employee: UserRound,
  partner: BriefcaseBusiness,
  family: UsersRound,
  referral: Star,
  contact: Link2,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CustomerRelationships = ({
  customerId,
  canManageRelationships = true,
}) => {
  const [relationships, setRelationships] = useState(() =>
    getCustomerRelationships(customerId),
  );
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRelationships(getCustomerRelationships(customerId));
    setForm(createEmptyForm());
    setEditingId(null);
    setDeleteTargetId(null);
    setErrors({});
    setFeedback(null);
  }, [customerId]);

  const metrics = useMemo(() => {
    const activeRelationships = relationships.filter(
      (relationship) => relationship.status === "active",
    );

    return {
      total: relationships.length,
      active: activeRelationships.length,
      companies: relationships.filter(
        (relationship) =>
          relationship.type === "company" || relationship.type === "partner",
      ).length,
    };
  }, [relationships]);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setFeedback(null);
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setErrors({});
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Kontakt yoki tashkilot nomini kiriting.";
    } else if (form.name.trim().length < 2) {
      nextErrors.name = "Nom kamida 2 ta belgidan iborat bo‘lsin.";
    }

    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = "Email manzilini to‘g‘ri formatda kiriting.";
    }

    if (form.phone.trim() && form.phone.replace(/\D/g, "").length < 9) {
      nextErrors.phone = "Telefon raqamida kamida 9 ta raqam bo‘lsin.";
    }

    if (!form.phone.trim() && !form.email.trim()) {
      nextErrors.contact = "Kamida telefon raqami yoki email kiriting.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const currentRelationship = relationships.find(
        (relationship) => relationship.id === editingId,
      );

      saveCustomerRelationship({
        ...currentRelationship,
        id: editingId ?? undefined,
        customerId,
        type: form.type,
        name: form.name,
        position: form.position,
        phone: form.phone,
        email: form.email,
        note: form.note,
        status: form.status,
        isPrimary: form.isPrimary,
      });

      setRelationships(getCustomerRelationships(customerId));

      setFeedback({
        type: "success",
        message: editingId
          ? "Bog‘lanish ma’lumotlari yangilandi."
          : "Yangi bog‘lanish qo‘shildi.",
      });

      resetForm();
    } catch (saveError) {
      setFeedback({
        type: "error",
        message:
          saveError instanceof Error
            ? saveError.message
            : "Bog‘lanishni saqlab bo‘lmadi.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (relationship) => {
    setEditingId(relationship.id);
    setForm({
      type: relationship.type,
      name: relationship.name,
      position: relationship.position ?? "",
      phone: relationship.phone ?? "",
      email: relationship.email ?? "",
      note: relationship.note ?? "",
      status: relationship.status,
      isPrimary: relationship.isPrimary,
    });

    setDeleteTargetId(null);
    setErrors({});
    setFeedback(null);

    requestAnimationFrame(() => {
      document.getElementById("crm-relationship-name")?.focus();
    });
  };

  const handlePrimary = (relationship) => {
    try {
      setPrimaryCustomerRelationship(relationship);
      setRelationships(getCustomerRelationships(customerId));

      setFeedback({
        type: "success",
        message: `${relationship.name} asosiy bog‘lanish sifatida belgilandi.`,
      });
    } catch (primaryError) {
      setFeedback({
        type: "error",
        message:
          primaryError instanceof Error
            ? primaryError.message
            : "Asosiy bog‘lanishni belgilab bo‘lmadi.",
      });
    }
  };

  const handleStatus = (relationship) => {
    try {
      toggleCustomerRelationshipStatus(relationship);
      setRelationships(getCustomerRelationships(customerId));

      setFeedback({
        type: "success",
        message:
          relationship.status === "active"
            ? "Bog‘lanish faol emas holatiga o‘tkazildi."
            : "Bog‘lanish qayta faollashtirildi.",
      });
    } catch (statusError) {
      setFeedback({
        type: "error",
        message:
          statusError instanceof Error
            ? statusError.message
            : "Bog‘lanish holatini yangilab bo‘lmadi.",
      });
    }
  };

  const handleDelete = (relationshipId) => {
    try {
      deleteCustomerRelationship(relationshipId);
      setRelationships(getCustomerRelationships(customerId));

      if (editingId === relationshipId) {
        resetForm();
      }

      setDeleteTargetId(null);
      setFeedback({
        type: "success",
        message: "Bog‘lanish o‘chirildi.",
      });
    } catch (deleteError) {
      setFeedback({
        type: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Bog‘lanishni o‘chirib bo‘lmadi.",
      });
    }
  };

  return (
    <div className="crm-customer-relationships">
      <section className="crm-customer-relationships__summary">
        <div className="crm-customer-relationships__heading">
          <div className="crm-customer-relationships__heading-icon">
            <UsersRound size={20} aria-hidden="true" />
          </div>

          <div>
            <span>Mijoz ekotizimi</span>
            <h2>Bog‘lanishlar</h2>
            <p>
              Kompaniya, hamkor, xodim va bog‘liq kontaktlarni bir joyda
              boshqaring.
            </p>
          </div>
        </div>

        <div className="crm-customer-relationships__metrics">
          <article>
            <Link2 size={18} aria-hidden="true" />
            <span>Jami</span>
            <strong>{metrics.total}</strong>
          </article>

          <article>
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>Faol</span>
            <strong>{metrics.active}</strong>
          </article>

          <article>
            <Building2 size={18} aria-hidden="true" />
            <span>Tashkilot</span>
            <strong>{metrics.companies}</strong>
          </article>
        </div>
      </section>

      {canManageRelationships ? (
        <section className="crm-customer-relationships__composer">
          <div className="crm-customer-relationships__section-heading">
            <div>
              {editingId ? (
                <Edit3 size={18} aria-hidden="true" />
              ) : (
                <Plus size={18} aria-hidden="true" />
              )}
            </div>

            <div>
              <span>
                {editingId ? "Tahrirlash rejimi" : "Yangi bog‘lanish"}
              </span>

              <h3>
                {editingId ? "Ma’lumotlarni yangilash" : "Kontakt qo‘shish"}
              </h3>
            </div>

            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                aria-label="Tahrirlashni bekor qilish"
              >
                <X size={17} />
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="crm-customer-relationships__form-grid">
              <div className="crm-customer-relationships__field">
                <label htmlFor="crm-relationship-type">Bog‘lanish turi</label>

                <select
                  id="crm-relationship-type"
                  value={form.type}
                  disabled={isSaving}
                  onChange={(event) => updateForm("type", event.target.value)}
                >
                  {Object.entries(crmRelationshipTypes).map(
                    ([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="crm-customer-relationships__field">
                <label htmlFor="crm-relationship-name">
                  Kontakt yoki tashkilot nomi
                </label>

                <input
                  id="crm-relationship-name"
                  type="text"
                  value={form.name}
                  maxLength={80}
                  disabled={isSaving}
                  aria-invalid={Boolean(errors.name)}
                  placeholder="Masalan, ZENIX Group"
                  onChange={(event) => updateForm("name", event.target.value)}
                />

                {errors.name ? (
                  <p className="crm-customer-relationships__field-error">
                    <AlertCircle size={14} aria-hidden="true" />
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div className="crm-customer-relationships__field">
                <label htmlFor="crm-relationship-position">
                  Lavozim yoki roli
                </label>

                <input
                  id="crm-relationship-position"
                  type="text"
                  value={form.position}
                  maxLength={80}
                  disabled={isSaving}
                  placeholder="Masalan, xaridlar menejeri"
                  onChange={(event) =>
                    updateForm("position", event.target.value)
                  }
                />
              </div>

              <div className="crm-customer-relationships__field">
                <label htmlFor="crm-relationship-status">Holati</label>

                <select
                  id="crm-relationship-status"
                  value={form.status}
                  disabled={isSaving}
                  onChange={(event) => updateForm("status", event.target.value)}
                >
                  {Object.entries(crmRelationshipStatuses).map(
                    ([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="crm-customer-relationships__field">
                <label htmlFor="crm-relationship-phone">Telefon raqami</label>

                <input
                  id="crm-relationship-phone"
                  type="tel"
                  value={form.phone}
                  maxLength={30}
                  disabled={isSaving}
                  aria-invalid={Boolean(errors.phone || errors.contact)}
                  placeholder="+998 90 123 45 67"
                  onChange={(event) => updateForm("phone", event.target.value)}
                />

                {errors.phone ? (
                  <p className="crm-customer-relationships__field-error">
                    <AlertCircle size={14} aria-hidden="true" />
                    {errors.phone}
                  </p>
                ) : null}
              </div>

              <div className="crm-customer-relationships__field">
                <label htmlFor="crm-relationship-email">Email manzili</label>

                <input
                  id="crm-relationship-email"
                  type="email"
                  value={form.email}
                  maxLength={120}
                  disabled={isSaving}
                  aria-invalid={Boolean(errors.email || errors.contact)}
                  placeholder="contact@company.uz"
                  onChange={(event) => updateForm("email", event.target.value)}
                />

                {errors.email ? (
                  <p className="crm-customer-relationships__field-error">
                    <AlertCircle size={14} aria-hidden="true" />
                    {errors.email}
                  </p>
                ) : null}
              </div>
            </div>

            {errors.contact ? (
              <p className="crm-customer-relationships__contact-error">
                <AlertCircle size={15} aria-hidden="true" />
                {errors.contact}
              </p>
            ) : null}

            <div className="crm-customer-relationships__field">
              <div className="crm-customer-relationships__label-row">
                <label htmlFor="crm-relationship-note">Qo‘shimcha izoh</label>
                <span>{form.note.length}/300</span>
              </div>

              <textarea
                id="crm-relationship-note"
                value={form.note}
                rows={3}
                maxLength={300}
                disabled={isSaving}
                placeholder="Bu bog‘lanish haqida muhim ma’lumot..."
                onChange={(event) => updateForm("note", event.target.value)}
              />
            </div>

            <label className="crm-customer-relationships__primary-option">
              <input
                type="checkbox"
                checked={form.isPrimary}
                disabled={isSaving}
                onChange={(event) =>
                  updateForm("isPrimary", event.target.checked)
                }
              />

              <span>
                <Crown size={17} aria-hidden="true" />
              </span>

              <span>
                <strong>Asosiy bog‘lanish</strong>
                <small>
                  Ushbu kontakt mijoz uchun asosiy aloqa nuqtasi sifatida
                  ko‘rsatiladi.
                </small>
              </span>
            </label>

            <div className="crm-customer-relationships__form-actions">
              {editingId ? (
                <button type="button" onClick={resetForm}>
                  Bekor qilish
                </button>
              ) : null}

              <button type="submit" disabled={isSaving || !form.name.trim()}>
                <Save size={16} aria-hidden="true" />
                {isSaving
                  ? "Saqlanmoqda..."
                  : editingId
                    ? "O‘zgarishni saqlash"
                    : "Bog‘lanishni qo‘shish"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {feedback ? (
        <div
          className={`crm-customer-relationships__feedback crm-customer-relationships__feedback--${feedback.type}`}
          role="status"
          aria-live="polite"
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={17} aria-hidden="true" />
          ) : (
            <AlertCircle size={17} aria-hidden="true" />
          )}

          <span>{feedback.message}</span>

          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Xabarni yopish"
          >
            <X size={15} />
          </button>
        </div>
      ) : null}

      <section className="crm-customer-relationships__list-section">
        <div className="crm-customer-relationships__list-heading">
          <div>
            <UsersRound size={18} aria-hidden="true" />

            <span>
              <strong>Bog‘liq kontaktlar</strong>
              <small>{relationships.length} ta bog‘lanish</small>
            </span>
          </div>
        </div>

        {relationships.length > 0 ? (
          <div className="crm-customer-relationships__list">
            {relationships.map((relationship) => {
              const RelationshipIcon =
                relationshipIcons[relationship.type] ?? Link2;

              return (
                <article
                  className={`crm-customer-relationships__card${
                    relationship.status === "inactive"
                      ? " crm-customer-relationships__card--inactive"
                      : ""
                  }${
                    relationship.isPrimary
                      ? " crm-customer-relationships__card--primary"
                      : ""
                  }`}
                  key={relationship.id}
                >
                  <div className="crm-customer-relationships__card-main">
                    <div className="crm-customer-relationships__avatar">
                      <RelationshipIcon size={19} aria-hidden="true" />
                    </div>

                    <div className="crm-customer-relationships__identity">
                      <div>
                        <h4>{relationship.name}</h4>

                        {relationship.isPrimary ? (
                          <span className="crm-customer-relationships__primary-badge">
                            <Crown size={12} aria-hidden="true" />
                            Asosiy
                          </span>
                        ) : null}
                      </div>

                      <p>
                        {relationship.position ||
                          crmRelationshipTypes[relationship.type]}
                      </p>

                      <div className="crm-customer-relationships__badges">
                        <span>
                          {crmRelationshipTypes[relationship.type] ?? "Kontakt"}
                        </span>

                        <span
                          className={`crm-customer-relationships__status crm-customer-relationships__status--${relationship.status}`}
                        >
                          {crmRelationshipStatuses[relationship.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="crm-customer-relationships__contacts">
                    {relationship.phone ? (
                      <a href={`tel:${relationship.phone}`}>
                        <Phone size={15} aria-hidden="true" />
                        <span>{relationship.phone}</span>
                        <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    ) : null}

                    {relationship.email ? (
                      <a href={`mailto:${relationship.email}`}>
                        <Mail size={15} aria-hidden="true" />
                        <span>{relationship.email}</span>
                        <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>

                  {relationship.note ? (
                    <p className="crm-customer-relationships__note">
                      {relationship.note}
                    </p>
                  ) : null}

                  <footer className="crm-customer-relationships__card-footer">
                    <time dateTime={relationship.updatedAt}>
                      Yangilangan: {formatDate(relationship.updatedAt)}
                    </time>

                    {canManageRelationships ? (
                      <div className="crm-customer-relationships__actions">
                        {!relationship.isPrimary ? (
                          <button
                            type="button"
                            onClick={() => handlePrimary(relationship)}
                            title="Asosiy qilib belgilash"
                            aria-label={`${relationship.name}ni asosiy bog‘lanish qilish`}
                          >
                            <Crown size={15} />
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleStatus(relationship)}
                          title={
                            relationship.status === "active"
                              ? "Faol emas qilish"
                              : "Faollashtirish"
                          }
                          aria-label="Bog‘lanish holatini o‘zgartirish"
                        >
                          <CheckCircle2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(relationship)}
                          title="Tahrirlash"
                          aria-label="Bog‘lanishni tahrirlash"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(relationship.id)}
                          title="O‘chirish"
                          aria-label="Bog‘lanishni o‘chirish"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ) : null}
                  </footer>

                  {deleteTargetId === relationship.id ? (
                    <div
                      className="crm-customer-relationships__delete-confirmation"
                      role="alert"
                    >
                      <AlertCircle size={17} aria-hidden="true" />

                      <p>
                        <strong>{relationship.name}</strong> bog‘lanishini
                        o‘chirasizmi?
                      </p>

                      <div>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(null)}
                        >
                          Bekor qilish
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(relationship.id)}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                          O‘chirish
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="crm-customer-relationships__empty">
            <UsersRound size={25} aria-hidden="true" />
            <strong>Bog‘liq kontaktlar hali yo‘q</strong>
            <p>
              Ushbu mijozning kompaniyasi, hamkori yoki boshqa bog‘liq
              kontaktini qo‘shing.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerRelationships;
