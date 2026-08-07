import { GlassSelect } from "@/components/ui";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Pin,
  PinOff,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  crmNoteCategories,
  crmNotePriorities,
  deleteCustomerNote,
  getCustomerNotes,
  saveCustomerNote,
  toggleCustomerNotePin,
} from "../../data/crmNotes";
import { formatDate, formatRelativeDate } from "../../utils/crmFormatters";
import "./CustomerNotes.scss";

const createEmptyForm = () => ({
  category: "general",
  priority: "normal",
  content: "",
});

const CustomerNotes = ({
  customerId,
  canManageNotes = true,
  canViewFinancialNotes = true,
}) => {
  const [notes, setNotes] = useState(() => getCustomerNotes(customerId));
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(getCustomerNotes(customerId));
    setForm(createEmptyForm());
    setEditingId(null);
    setDeleteTargetId(null);
    setError("");
    setFeedback(null);
  }, [customerId]);

  const visibleNotes = useMemo(
    () =>
      canViewFinancialNotes
        ? notes
        : notes.filter((note) => note.category !== "finance"),
    [canViewFinancialNotes, notes],
  );

  const pinnedCount = visibleNotes.filter((note) => note.isPinned).length;
  const importantCount = visibleNotes.filter((note) =>
    ["important", "critical"].includes(note.priority),
  ).length;

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
    setFeedback(null);
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedContent = form.content.trim();

    if (!trimmedContent) {
      setError("Eslatma matnini kiriting.");
      return;
    }

    if (trimmedContent.length < 3) {
      setError("Eslatma matni kamida 3 ta belgidan iborat bo‘lsin.");
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const currentNote = notes.find((note) => note.id === editingId);

      const savedNote = saveCustomerNote({
        ...currentNote,
        id: editingId ?? undefined,
        customerId,
        category: form.category,
        priority: form.priority,
        content: trimmedContent,
        author: currentNote?.author ?? "Joriy foydalanuvchi",
      });

      setNotes(getCustomerNotes(customerId));
      setFeedback({
        type: "success",
        message: editingId
          ? "Eslatma muvaffaqiyatli yangilandi."
          : "Yangi eslatma saqlandi.",
      });
      resetForm();
    } catch (saveError) {
      setFeedback({
        type: "error",
        message:
          saveError instanceof Error
            ? saveError.message
            : "Eslatmani saqlab bo‘lmadi.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setForm({
      category: note.category,
      priority: note.priority,
      content: note.content,
    });
    setDeleteTargetId(null);
    setFeedback(null);
    setError("");

    document.getElementById("crm-customer-note-content")?.focus();
  };

  const handlePin = (note) => {
    try {
      toggleCustomerNotePin(note);
      setNotes(getCustomerNotes(customerId));
      setFeedback({
        type: "success",
        message: note.isPinned
          ? "Eslatma pindan olib tashlandi."
          : "Eslatma yuqoriga biriktirildi.",
      });
    } catch (pinError) {
      setFeedback({
        type: "error",
        message:
          pinError instanceof Error
            ? pinError.message
            : "Eslatma holatini yangilab bo‘lmadi.",
      });
    }
  };

  const handleDelete = (noteId) => {
    try {
      deleteCustomerNote(noteId);
      setNotes(getCustomerNotes(customerId));
      setDeleteTargetId(null);

      if (editingId === noteId) {
        resetForm();
      }

      setFeedback({
        type: "success",
        message: "Eslatma o‘chirildi.",
      });
    } catch (deleteError) {
      setFeedback({
        type: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Eslatmani o‘chirib bo‘lmadi.",
      });
    }
  };

  return (
    <div className="crm-customer-notes">
      <section className="crm-customer-notes__summary">
        <div className="crm-customer-notes__heading">
          <div className="crm-customer-notes__heading-icon">
            <FileText size={19} aria-hidden="true" />
          </div>

          <div>
            <span>Mijoz bo‘yicha ichki ma’lumotlar</span>
            <h2>Eslatmalar</h2>
            <p>Menejerlar uchun muhim kelishuvlar, izohlar va kontekst.</p>
          </div>
        </div>

        <div className="crm-customer-notes__metrics">
          <article>
            <FileText size={18} aria-hidden="true" />
            <span>Jami eslatma</span>
            <strong>{visibleNotes.length}</strong>
          </article>

          <article>
            <Pin size={18} aria-hidden="true" />
            <span>Biriktirilgan</span>
            <strong>{pinnedCount}</strong>
          </article>

          <article>
            <ShieldAlert size={18} aria-hidden="true" />
            <span>Muhim</span>
            <strong>{importantCount}</strong>
          </article>
        </div>
      </section>

      {canManageNotes ? (
        <section className="crm-customer-notes__composer">
          <div className="crm-customer-notes__section-heading">
            <div>
              {editingId ? (
                <Edit3 size={18} aria-hidden="true" />
              ) : (
                <Plus size={18} aria-hidden="true" />
              )}
            </div>

            <div>
              <span>{editingId ? "Tahrirlash rejimi" : "Yangi ma’lumot"}</span>
              <h3>{editingId ? "Eslatmani yangilash" : "Eslatma qo‘shish"}</h3>
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
            <div className="crm-customer-notes__form-row">
              <div>
                <label htmlFor="crm-customer-note-category">Kategoriya</label>

                <GlassSelect
                  id="crm-customer-note-category"
                  value={form.category}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateForm("category", event.target.value)
                  }
                >
                  {Object.entries(crmNoteCategories)
                    .filter(
                      ([category]) =>
                        canViewFinancialNotes || category !== "finance",
                    )
                    .map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                </GlassSelect>
              </div>

              <div>
                <label htmlFor="crm-customer-note-priority">
                  Muhimlik darajasi
                </label>

                <GlassSelect
                  id="crm-customer-note-priority"
                  value={form.priority}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateForm("priority", event.target.value)
                  }
                >
                  {Object.entries(crmNotePriorities).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </GlassSelect>
              </div>
            </div>

            <div className="crm-customer-notes__label-row">
              <label htmlFor="crm-customer-note-content">Eslatma matni</label>

              <span>{form.content.length}/600</span>
            </div>

            <textarea
              id="crm-customer-note-content"
              value={form.content}
              rows={4}
              maxLength={600}
              disabled={isSaving}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "crm-customer-note-error" : undefined}
              placeholder="Mijoz haqida jamoa bilishi kerak bo‘lgan ma’lumotni yozing..."
              onChange={(event) => updateForm("content", event.target.value)}
            />

            {error ? (
              <p
                id="crm-customer-note-error"
                className="crm-customer-notes__error"
              >
                <AlertCircle size={15} aria-hidden="true" />
                {error}
              </p>
            ) : null}

            <div className="crm-customer-notes__form-actions">
              {editingId ? (
                <button type="button" onClick={resetForm}>
                  Bekor qilish
                </button>
              ) : null}

              <button type="submit" disabled={isSaving || !form.content.trim()}>
                <Save size={16} aria-hidden="true" />
                {isSaving
                  ? "Saqlanmoqda..."
                  : editingId
                    ? "O‘zgarishni saqlash"
                    : "Eslatmani saqlash"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="crm-customer-notes__permission">
          <ShieldAlert size={19} aria-hidden="true" />
          <p>
            Siz eslatmalarni ko‘rishingiz mumkin, lekin yaratish yoki tahrirlash
            uchun ruxsatingiz yo‘q.
          </p>
        </div>
      )}

      {feedback ? (
        <div
          className={`crm-customer-notes__feedback crm-customer-notes__feedback--${feedback.type}`}
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

      <section className="crm-customer-notes__list-section">
        <div className="crm-customer-notes__list-heading">
          <div>
            <Clock3 size={18} aria-hidden="true" />

            <span>
              <strong>Eslatmalar tarixi</strong>
              <small>{visibleNotes.length} ta yozuv</small>
            </span>
          </div>
        </div>

        {visibleNotes.length > 0 ? (
          <div className="crm-customer-notes__list">
            {visibleNotes.map((note) => (
              <article
                className={`crm-customer-notes__item crm-customer-notes__item--${note.priority}${
                  note.isPinned ? " crm-customer-notes__item--pinned" : ""
                }`}
                key={note.id}
              >
                <div className="crm-customer-notes__item-top">
                  <div className="crm-customer-notes__badges">
                    {note.isPinned ? (
                      <span className="crm-customer-notes__badge crm-customer-notes__badge--pinned">
                        <Pin size={13} aria-hidden="true" />
                        Biriktirilgan
                      </span>
                    ) : null}

                    <span className="crm-customer-notes__badge">
                      {crmNoteCategories[note.category] ?? "Umumiy"}
                    </span>

                    {note.priority !== "normal" ? (
                      <span
                        className={`crm-customer-notes__badge crm-customer-notes__badge--${note.priority}`}
                      >
                        <Sparkles size={13} aria-hidden="true" />
                        {crmNotePriorities[note.priority]}
                      </span>
                    ) : null}
                  </div>

                  {canManageNotes ? (
                    <div className="crm-customer-notes__item-actions">
                      <button
                        type="button"
                        onClick={() => handlePin(note)}
                        aria-label={
                          note.isPinned
                            ? "Eslatmani pindan olish"
                            : "Eslatmani yuqoriga biriktirish"
                        }
                        title={
                          note.isPinned
                            ? "Pindan olish"
                            : "Yuqoriga biriktirish"
                        }
                      >
                        {note.isPinned ? (
                          <PinOff size={16} />
                        ) : (
                          <Pin size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(note)}
                        aria-label="Eslatmani tahrirlash"
                        title="Tahrirlash"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(note.id)}
                        aria-label="Eslatmani o‘chirish"
                        title="O‘chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : null}
                </div>

                <p>{note.content}</p>

                <footer>
                  <span>{note.author}</span>
                  <time dateTime={note.updatedAt}>
                    {formatDate(note.updatedAt)} ·{" "}
                    {formatRelativeDate(note.updatedAt)}
                  </time>
                </footer>

                {deleteTargetId === note.id ? (
                  <div
                    className="crm-customer-notes__delete-confirmation"
                    role="alert"
                  >
                    <AlertCircle size={17} aria-hidden="true" />

                    <p>Bu eslatmani o‘chirishni tasdiqlaysizmi?</p>

                    <div>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(null)}
                      >
                        Bekor qilish
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        O‘chirish
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="crm-customer-notes__empty">
            <FileText size={24} aria-hidden="true" />
            <strong>Eslatmalar hali yo‘q</strong>
            <p>
              Mijoz haqidagi birinchi ichki eslatmani yuqoridagi forma orqali
              yarating.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerNotes;
