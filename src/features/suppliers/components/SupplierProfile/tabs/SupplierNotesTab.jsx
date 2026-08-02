// Extracted from SupplierProfile.jsx: "Izohlar" bo'limi — ichki eslatma
// (izoh) ro'yxati va qo'shish formasi. Forma holati (matn, "Muammo"
// belgisi) ilgari SupplierProfile.jsx'ning umumiy state'ida edi — endi shu
// yerda, faqat shu bo'lim ishlatadigan joyda.

import { useState } from "react";
import { AlertTriangle, MessageSquarePlus } from "lucide-react";

import { Card } from "../../../../../components/ui/Card/Card";
import { Dropdown } from "../../../../../components/ui/Dropdown/Dropdown";
import { EmptyState } from "../../../../../components/ui/EmptyState/EmptyState";
import { useNotification } from "../../../../../components/ui/Notification/NotificationContext";
import { formatPurchaseDate } from "../../../../purchases/utils/purchaseMoney";
import {
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_TONES,
  CLAIM_STATUSES,
} from "../../../suppliersApi";

// Claim (da'vo) holati faqat CLAIM_STATUS_FLOW ruxsat bergan yo'nalishda
// o'zgaradi (open -> reviewing -> resolved/rejected) — Dropdown har doim
// FAQAT joriy + ruxsat etilgan keyingi holatlarni ko'rsatadi, xuddi
// SupplierOverviewTab'dagi holat almashtirish naqshi bilan bir xil.
const CLAIM_NEXT_STATUSES = {
  [CLAIM_STATUSES.open]: [CLAIM_STATUSES.open, CLAIM_STATUSES.reviewing, CLAIM_STATUSES.rejected],
  [CLAIM_STATUSES.reviewing]: [
    CLAIM_STATUSES.reviewing,
    CLAIM_STATUSES.resolved,
    CLAIM_STATUSES.rejected,
  ],
  [CLAIM_STATUSES.resolved]: [CLAIM_STATUSES.resolved],
  [CLAIM_STATUSES.rejected]: [CLAIM_STATUSES.rejected],
};

const SupplierNotesTab = ({
  supplier,
  onAddNote,
  onUpdateClaimStatus,
  canManageClaims = true,
}) => {
  const notify = useNotification();
  const [noteText, setNoteText] = useState("");
  const [isIssueNote, setIsIssueNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  const handleAddNote = () => {
    const text = noteText.trim();

    if (text.length < 3) {
      setNoteError("Izoh kamida 3 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    if (text.length > 500) {
      setNoteError("Izoh 500 ta belgidan oshmasligi kerak.");
      return;
    }

    onAddNote?.(text, isIssueNote);
    notify.success(isIssueNote ? "Muammo sifatida izoh qo'shildi." : "Izoh qo'shildi.");
    setNoteText("");
    setIsIssueNote(false);
    setNoteError("");
  };

  const handleClaimStatusChange = (note, nextStatus) => {
    const currentStatus = note.status || CLAIM_STATUSES.open;

    if (nextStatus === currentStatus) return;

    onUpdateClaimStatus?.(note.id, nextStatus);
    notify.success(
      `Da'vo holati "${CLAIM_STATUS_LABELS[nextStatus] || nextStatus}"ga o'zgartirildi.`,
    );
  };

  return (
    <Card
      className="supplier-profile__card"
      role="tabpanel"
      id="supplier-tabpanel-notes"
      aria-labelledby="supplier-tab-notes"
    >
      <h3>Izohlar va da'volar</h3>

      {supplier.notes?.length ? (
        <div className="supplier-profile__notes">
          {supplier.notes.map((note) => (
            <div className="supplier-profile__note" key={note.id}>
              {note.type === "issue" && (
                <span
                  className={`supplier-profile__note-issue supplier-profile__note-issue--${
                    CLAIM_STATUS_TONES[note.status] || "danger"
                  }`}
                >
                  <AlertTriangle size={12} />
                  Muammo (da'vo)
                </span>
              )}
              <p>{note.text}</p>
              <small>
                {note.author} · {formatPurchaseDate(note.createdAt, { withTime: true })}
              </small>

              {note.type === "issue" && (
                <div className="supplier-profile__claim">
                  {canManageClaims ? (
                    <label className="supplier-profile__field supplier-profile__claim-status">
                      <span>Da'vo holati</span>
                      <Dropdown
                        value={note.status || CLAIM_STATUSES.open}
                        // Eski (bu funksiya qo'shilishidan oldingi) "muammo"
                        // izohlarida `status` maydoni umuman yo'q — Dropdown
                        // qiymati kabi options ro'yxati ham xuddi shu
                        // normalizatsiyadan (fallback: "open") foydalanadi,
                        // aks holda CLAIM_NEXT_STATUSES[undefined] bo'sh
                        // qaytib, o'tish imkoni bo'lmagan yagona variant
                        // qolib ketardi.
                        options={(
                          CLAIM_NEXT_STATUSES[note.status || CLAIM_STATUSES.open] || [
                            CLAIM_STATUSES.open,
                          ]
                        ).map((status) => ({
                          value: status,
                          label: CLAIM_STATUS_LABELS[status],
                        }))}
                        onChange={(value) => handleClaimStatusChange(note, value)}
                      />
                    </label>
                  ) : (
                    <span className="supplier-profile__field-hint">
                      Da'vo holati: {CLAIM_STATUS_LABELS[note.status] || "Ochiq"} (o'zgartirish
                      uchun ruxsat yo'q)
                    </span>
                  )}

                  {(note.status === CLAIM_STATUSES.resolved ||
                    note.status === CLAIM_STATUSES.rejected) &&
                    note.resolution && (
                      <p className="supplier-profile__claim-resolution">
                        <strong>Yechim:</strong> {note.resolution} — {note.resolvedBy}
                      </p>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquarePlus}
          title="Izoh yo'q"
          description="Ichki eslatma qoldiring."
        />
      )}

      <div className="supplier-profile__note-form">
        <input
          type="text"
          placeholder="Izoh yozing..."
          value={noteText}
          maxLength={500}
          aria-invalid={!!noteError}
          onChange={(event) => {
            setNoteText(event.target.value);
            if (noteError) setNoteError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddNote();
            }
          }}
        />
        <label className="supplier-profile__note-issue-toggle">
          <input
            type="checkbox"
            checked={isIssueNote}
            onChange={(event) => setIsIssueNote(event.target.checked)}
          />
          Muammo sifatida belgilash
        </label>
        <button
          type="button"
          title="Izohni qo'shish"
          aria-label="Izohni qo'shish"
          disabled={noteText.trim().length < 3}
          onClick={handleAddNote}
        >
          <MessageSquarePlus size={15} />
        </button>
      </div>
      {noteError && <p className="supplier-profile__field-error">{noteError}</p>}
    </Card>
  );
};

export default SupplierNotesTab;
