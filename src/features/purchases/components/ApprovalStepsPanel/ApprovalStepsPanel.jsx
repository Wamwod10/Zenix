// PDF 5, 17: Approval Workflow va Approval History — bosqichlar paneli.

import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";

import { APPROVAL_STEP_STATUSES } from "../../constants/approvalMatrix";
import { formatPurchaseDate } from "../../utils/purchaseMoney";

import "./ApprovalStepsPanel.scss";

const STEP_ICONS = {
  [APPROVAL_STEP_STATUSES.pending]: CircleDashed,
  [APPROVAL_STEP_STATUSES.approved]: CheckCircle2,
  [APPROVAL_STEP_STATUSES.rejected]: XCircle,
};

const ApprovalStepsPanel = ({
  steps = [],
  canAct = false,
  onApprove,
  onReject,
}) => {
  if (!steps.length) {
    return (
      <p className="approval-steps__empty">
        Tasdiq shart emas — summa 1 mln so'mgacha (avtomatik).
      </p>
    );
  }

  const activeIndex = steps.findIndex(
    (step) => step.status === APPROVAL_STEP_STATUSES.pending,
  );

  return (
    <div className="approval-steps">
      <ol className="approval-steps__list">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.status] || CircleDashed;
          const isActive = index === activeIndex;

          return (
            <li
              className={[
                "approval-steps__item",
                `approval-steps__item--${step.status}`,
                isActive ? "approval-steps__item--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={`${step.role}-${index}`}
            >
              <Icon size={17} />

              <div className="approval-steps__meta">
                <strong>
                  {index + 1}-bosqich · {step.label}
                </strong>

                {step.status === APPROVAL_STEP_STATUSES.pending ? (
                  <small>Kutilmoqda</small>
                ) : (
                  <small>
                    {step.actor} ·{" "}
                    {formatPurchaseDate(step.actedAt, { withTime: true })}
                    {step.reason ? ` · Sabab: ${step.reason}` : ""}
                  </small>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {canAct && activeIndex !== -1 && (
        <div className="approval-steps__actions">
          <button
            className="approval-steps__approve"
            type="button"
            onClick={onApprove}
          >
            <CheckCircle2 size={16} />
            Tasdiqlash
          </button>

          <button
            className="approval-steps__reject"
            type="button"
            onClick={onReject}
          >
            <XCircle size={16} />
            Rad etish
          </button>
        </div>
      )}
    </div>
  );
};

export default ApprovalStepsPanel;
