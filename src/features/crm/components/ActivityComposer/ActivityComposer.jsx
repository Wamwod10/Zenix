import { GlassSelect } from "@/components/ui";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  Mail,
  MessageSquare,
  NotebookPen,
  Phone,
  Users,
  X,
} from "lucide-react";

import "./ActivityComposer.scss";

const activityOptions = [
  {
    value: "call",
    label: "Qo‘ng‘iroq",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "message",
    label: "Xabar",
  },
  {
    value: "meeting",
    label: "Uchrashuv",
  },
  {
    value: "note",
    label: "Ichki izoh",
  },
  {
    value: "task",
    label: "Vazifa",
  },
  {
    value: "reminder",
    label: "Eslatma",
  },
];

const statusOptions = [
  {
    value: "completed",
    label: "Yakunlangan",
  },
  {
    value: "pending",
    label: "Kutilmoqda",
  },
];

const getLocalDateTime = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(now.getTime() - timezoneOffset);
  const isoValue = localDate.toISOString();

  return {
    date: isoValue.slice(0, 10),
    time: isoValue.slice(11, 16),
  };
};

const createInitialValues = () => {
  const dateTime = getLocalDateTime();

  return {
    type: "call",
    title: "",
    description: "",
    date: dateTime.date,
    time: dateTime.time,
    status: "completed",
  };
};

const validateValues = (values) => {
  const errors = {};

  if (!values.type) {
    errors.type = "Faoliyat turini tanlang.";
  }

  if (!values.title.trim()) {
    errors.title = "Faoliyat sarlavhasini kiriting.";
  } else if (values.title.trim().length < 3) {
    errors.title = "Sarlavha kamida 3 ta belgidan iborat bo‘lsin.";
  } else if (values.title.trim().length > 120) {
    errors.title = "Sarlavha 120 ta belgidan oshmasligi kerak.";
  }

  if (!values.description.trim()) {
    errors.description = "Faoliyat tafsilotini kiriting.";
  } else if (values.description.trim().length < 5) {
    errors.description = "Tafsilot kamida 5 ta belgidan iborat bo‘lsin.";
  } else if (values.description.trim().length > 700) {
    errors.description = "Tafsilot 700 ta belgidan oshmasligi kerak.";
  }

  if (!values.date) {
    errors.date = "Faoliyat sanasini tanlang.";
  }

  if (!values.time) {
    errors.time = "Faoliyat vaqtini tanlang.";
  }

  return errors;
};

const getActivityIcon = (type) => {
  const icons = {
    call: Phone,
    email: Mail,
    message: MessageSquare,
    meeting: Users,
    note: NotebookPen,
    task: Check,
    reminder: Clock3,
  };

  return icons[type] ?? Activity;
};

const ActivityComposer = ({ open, customerName, onClose, onSubmit }) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const titleInputRef = useRef(null);

  const [values, setValues] = useState(createInitialValues);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discardConfirmation, setDiscardConfirmation] = useState(false);

  const resetForm = useCallback(() => {
    setValues(createInitialValues());
    setErrors({});
    setDirty(false);
    setSubmitting(false);
    setDiscardConfirmation(false);
  }, []);

  const closeImmediately = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const requestClose = useCallback(() => {
    if (submitting) {
      return;
    }

    if (dirty) {
      setDiscardConfirmation(true);
      return;
    }

    closeImmediately();
  }, [closeImmediately, dirty, submitting]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    resetForm();

    const focusTimer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();

        if (discardConfirmation) {
          setDiscardConfirmation(false);
        } else {
          requestClose();
        }

        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = [
        ...dialogRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ];

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [discardConfirmation, open, requestClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setDirty(true);

    if (errors[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: undefined,
      }));
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      const firstErrorField = Object.keys(nextErrors)[0];

      dialogRef.current?.querySelector(`[name="${firstErrorField}"]`)?.focus();

      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        type: values.type,
        title: values.title.trim(),
        description: values.description.trim(),
        createdAt: new Date(`${values.date}T${values.time}:00`).toISOString(),
        status: values.status,
      });

      closeImmediately();
    } catch {
      setErrors({
        form: "Faoliyatni saqlab bo‘lmadi. Qayta urinib ko‘ring.",
      });
      setSubmitting(false);
    }
  };

  const ActivityIcon = getActivityIcon(values.type);

  return createPortal(
    <div
      className="crm-activity-composer"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        ref={dialogRef}
        className="crm-activity-composer__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="crm-activity-composer__header">
          <div className="crm-activity-composer__heading">
            <span>
              <ActivityIcon aria-hidden="true" />
            </span>

            <div>
              <h2 id={titleId}>Faoliyat qo‘shish</h2>

              <p id={descriptionId}>
                {customerName} profiliga yangi hodisa kiriting.
              </p>
            </div>
          </div>

          <button
            className="crm-activity-composer__close"
            type="button"
            disabled={submitting}
            aria-label="Faoliyat oynasini yopish"
            onClick={requestClose}
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <form
          className="crm-activity-composer__form"
          noValidate
          onSubmit={handleSubmit}
        >
          {errors.form ? (
            <div className="crm-activity-composer__form-error" role="alert">
              {errors.form}
            </div>
          ) : null}

          <div className="crm-activity-composer__body">
            <div className="crm-activity-composer__field">
              <label htmlFor="crm-activity-type">
                Faoliyat turi
                <span aria-hidden="true">*</span>
              </label>

              <GlassSelect
                id="crm-activity-type"
                name="type"
                value={values.type}
                disabled={submitting}
                aria-invalid={Boolean(errors.type)}
                aria-describedby={
                  errors.type ? "crm-activity-type-error" : undefined
                }
                onChange={handleFieldChange}
              >
                {activityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </GlassSelect>

              {errors.type ? (
                <small
                  id="crm-activity-type-error"
                  className="crm-activity-composer__error"
                >
                  {errors.type}
                </small>
              ) : null}
            </div>

            <div className="crm-activity-composer__field">
              <label htmlFor="crm-activity-title">
                Sarlavha
                <span aria-hidden="true">*</span>
              </label>

              <input
                ref={titleInputRef}
                id="crm-activity-title"
                name="title"
                type="text"
                value={values.title}
                disabled={submitting}
                maxLength={120}
                placeholder="Masalan: Mijoz bilan bog‘lanildi"
                autoComplete="off"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title
                    ? "crm-activity-title-error"
                    : "crm-activity-title-hint"
                }
                onChange={handleFieldChange}
              />

              <div className="crm-activity-composer__field-meta">
                {errors.title ? (
                  <small
                    id="crm-activity-title-error"
                    className="crm-activity-composer__error"
                  >
                    {errors.title}
                  </small>
                ) : (
                  <small id="crm-activity-title-hint">
                    Faoliyat mazmunini qisqa yozing
                  </small>
                )}

                <small>{values.title.length}/120</small>
              </div>
            </div>

            <div className="crm-activity-composer__field">
              <label htmlFor="crm-activity-description">
                Tafsilot
                <span aria-hidden="true">*</span>
              </label>

              <textarea
                id="crm-activity-description"
                name="description"
                value={values.description}
                disabled={submitting}
                rows={5}
                maxLength={700}
                placeholder="Suhbat natijasi, kelishuv yoki keyingi qadamni yozing..."
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description
                    ? "crm-activity-description-error"
                    : "crm-activity-description-hint"
                }
                onChange={handleFieldChange}
              />

              <div className="crm-activity-composer__field-meta">
                {errors.description ? (
                  <small
                    id="crm-activity-description-error"
                    className="crm-activity-composer__error"
                  >
                    {errors.description}
                  </small>
                ) : (
                  <small id="crm-activity-description-hint">
                    Muhim natija va keyingi qadamni kiriting
                  </small>
                )}

                <small>{values.description.length}/700</small>
              </div>
            </div>

            <div className="crm-activity-composer__row">
              <div className="crm-activity-composer__field">
                <label htmlFor="crm-activity-date">
                  Sana
                  <span aria-hidden="true">*</span>
                </label>

                <div className="crm-activity-composer__input-icon">
                  <CalendarDays aria-hidden="true" />

                  <input
                    id="crm-activity-date"
                    name="date"
                    type="date"
                    value={values.date}
                    disabled={submitting}
                    aria-invalid={Boolean(errors.date)}
                    onChange={handleFieldChange}
                  />
                </div>

                {errors.date ? (
                  <small className="crm-activity-composer__error">
                    {errors.date}
                  </small>
                ) : null}
              </div>

              <div className="crm-activity-composer__field">
                <label htmlFor="crm-activity-time">
                  Vaqt
                  <span aria-hidden="true">*</span>
                </label>

                <div className="crm-activity-composer__input-icon">
                  <Clock3 aria-hidden="true" />

                  <input
                    id="crm-activity-time"
                    name="time"
                    type="time"
                    value={values.time}
                    disabled={submitting}
                    aria-invalid={Boolean(errors.time)}
                    onChange={handleFieldChange}
                  />
                </div>

                {errors.time ? (
                  <small className="crm-activity-composer__error">
                    {errors.time}
                  </small>
                ) : null}
              </div>
            </div>

            <div className="crm-activity-composer__field">
              <label htmlFor="crm-activity-status">Natija holati</label>

              <GlassSelect
                id="crm-activity-status"
                name="status"
                value={values.status}
                disabled={submitting}
                onChange={handleFieldChange}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </GlassSelect>
            </div>
          </div>

          <footer className="crm-activity-composer__footer">
            <button
              className="crm-activity-composer__cancel"
              type="button"
              disabled={submitting}
              onClick={requestClose}
            >
              Bekor qilish
            </button>

            <button
              className="crm-activity-composer__submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <LoaderCircle
                  className="crm-activity-composer__spinner"
                  aria-hidden="true"
                />
              ) : (
                <Check aria-hidden="true" />
              )}

              <span>{submitting ? "Saqlanmoqda" : "Faoliyatni saqlash"}</span>
            </button>
          </footer>
        </form>

        {discardConfirmation ? (
          <div
            className="crm-activity-composer__confirmation"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="crm-discard-title"
            aria-describedby="crm-discard-description"
          >
            <div className="crm-activity-composer__confirmation-card">
              <span>
                <NotebookPen aria-hidden="true" />
              </span>

              <h3 id="crm-discard-title">
                Kiritilgan ma’lumot bekor qilinsinmi?
              </h3>

              <p id="crm-discard-description">
                Saqlanmagan o‘zgarishlar qayta tiklanmaydi.
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => setDiscardConfirmation(false)}
                >
                  Davom ettirish
                </button>

                <button type="button" onClick={closeImmediately}>
                  O‘zgarishlarni bekor qilish
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>,
    document.body,
  );
};

export default ActivityComposer;
