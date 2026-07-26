import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Smartphone,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  crmCommunicationChannels,
  crmCommunicationStatuses,
  formatCommunicationDuration,
  getCustomerCommunications,
  saveCustomerCommunication,
} from "../../data/crmCommunications";
import {
  formatDate,
  formatPhoneNumber,
  formatRelativeDate,
} from "../../utils/crmFormatters";
import "./CustomerCommunication.scss";

const composerChannels = ["email", "sms", "telegram", "whatsapp"];

const channelConfig = {
  call: {
    icon: Phone,
    tone: "primary",
  },
  email: {
    icon: Mail,
    tone: "success",
  },
  sms: {
    icon: Smartphone,
    tone: "neutral",
  },
  telegram: {
    icon: Send,
    tone: "primary",
  },
  whatsapp: {
    icon: MessageCircle,
    tone: "success",
  },
};

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    tone: "success",
  },
  delivered: {
    icon: CheckCircle2,
    tone: "success",
  },
  opened: {
    icon: CheckCircle2,
    tone: "success",
  },
  missed: {
    icon: Clock3,
    tone: "warning",
  },
  failed: {
    icon: XCircle,
    tone: "danger",
  },
  scheduled: {
    icon: Clock3,
    tone: "primary",
  },
};

const getInitialForm = () => ({
  channel: "email",
  subject: "",
  message: "",
});

const getRecipient = (customer, channel) => {
  if (channel === "email") {
    return customer.email ?? "";
  }

  return customer.phone ?? "";
};

const CustomerCommunication = ({ customer }) => {
  const submitTimerRef = useRef(null);
  const [communications, setCommunications] = useState(() =>
    getCustomerCommunications(customer.id),
  );
  const [activeChannel, setActiveChannel] = useState("all");
  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setCommunications(getCustomerCommunications(customer.id));
    setForm(getInitialForm());
    setErrors({});
    setFeedback(null);
    setActiveChannel("all");
  }, [customer.id]);

  useEffect(
    () => () => {
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
      }
    },
    [],
  );

  const filteredCommunications = useMemo(() => {
    if (activeChannel === "all") {
      return communications;
    }

    return communications.filter(
      (communication) => communication.channel === activeChannel,
    );
  }, [activeChannel, communications]);

  const channelCounts = useMemo(
    () =>
      communications.reduce(
        (counts, communication) => ({
          ...counts,
          [communication.channel]: (counts[communication.channel] ?? 0) + 1,
        }),
        {},
      ),
    [communications],
  );

  const latestCommunication = communications[0] ?? null;
  const successfulCount = communications.filter((communication) =>
    ["completed", "delivered", "opened"].includes(communication.status),
  ).length;
  const missedCount = communications.filter(
    (communication) => communication.status === "missed",
  ).length;
  const recipient = getRecipient(customer, form.channel);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }

    setFeedback(null);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!recipient) {
      nextErrors.channel =
        form.channel === "email"
          ? "Mijoz profilida email manzil mavjud emas."
          : "Mijoz profilida telefon raqami mavjud emas.";
    }

    if (!form.subject.trim()) {
      nextErrors.subject = "Xabar mavzusini kiriting.";
    } else if (form.subject.trim().length < 3) {
      nextErrors.subject = "Xabar mavzusi kamida 3 ta belgidan iborat bo‘lsin.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Xabar matnini kiriting.";
    } else if (form.message.trim().length < 10) {
      nextErrors.message = "Xabar matni kamida 10 ta belgidan iborat bo‘lsin.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm() || isSending) {
      return;
    }

    setIsSending(true);
    setFeedback(null);

    submitTimerRef.current = window.setTimeout(() => {
      try {
        const newCommunication = saveCustomerCommunication({
          customerId: customer.id,
          channel: form.channel,
          direction: "outbound",
          status: "delivered",
          subject: form.subject,
          summary: form.message,
          participant: recipient,
          manager: "Joriy foydalanuvchi",
        });

        setCommunications((current) => [newCommunication, ...current]);
        setForm(getInitialForm());
        setErrors({});
        setFeedback({
          type: "success",
          message: `${
            crmCommunicationChannels[newCommunication.channel].label
          } xabari muvaffaqiyatli yuborildi.`,
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Xabarni yuborib bo‘lmadi.",
        });
      } finally {
        setIsSending(false);
        submitTimerRef.current = null;
      }
    }, 650);
  };

  return (
    <div className="crm-customer-communication">
      <section className="crm-customer-communication__quick-actions">
        <div className="crm-customer-communication__section-heading">
          <div className="crm-customer-communication__section-icon">
            <MessageSquare size={19} aria-hidden="true" />
          </div>

          <div>
            <span>Aloqa kanallari</span>
            <h2>Mijoz bilan bog‘lanish</h2>
          </div>
        </div>

        <div className="crm-customer-communication__contact-grid">
          <a href={`tel:${customer.phone}`}>
            <Phone size={19} aria-hidden="true" />

            <span>
              <strong>Qo‘ng‘iroq qilish</strong>
              <small>{formatPhoneNumber(customer.phone)}</small>
            </span>

            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          {customer.email ? (
            <a href={`mailto:${customer.email}`}>
              <Mail size={19} aria-hidden="true" />

              <span>
                <strong>Email yuborish</strong>
                <small>{customer.email}</small>
              </span>

              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : (
            <div aria-disabled="true">
              <Mail size={19} aria-hidden="true" />

              <span>
                <strong>Email mavjud emas</strong>
                <small>Profilga email kiriting</small>
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="crm-customer-communication__metrics">
        <article>
          <div aria-hidden="true">
            <MessageSquare size={18} />
          </div>
          <span>Jami aloqalar</span>
          <strong>{communications.length}</strong>
          <small>Barcha kanallar</small>
        </article>

        <article className="crm-customer-communication__metric--success">
          <div aria-hidden="true">
            <CheckCircle2 size={18} />
          </div>
          <span>Muvaffaqiyatli</span>
          <strong>{successfulCount}</strong>
          <small>Yetkazilgan va o‘qilgan</small>
        </article>

        <article className="crm-customer-communication__metric--warning">
          <div aria-hidden="true">
            <Clock3 size={18} />
          </div>
          <span>Javobsiz</span>
          <strong>{missedCount}</strong>
          <small>Follow-up talab qilishi mumkin</small>
        </article>

        <article className="crm-customer-communication__metric--neutral">
          <div aria-hidden="true">
            <UserRound size={18} />
          </div>
          <span>Oxirgi aloqa</span>
          <strong>
            {latestCommunication
              ? formatRelativeDate(latestCommunication.createdAt)
              : "Aloqa yo‘q"}
          </strong>
          <small>
            {latestCommunication?.manager ?? "Menejer ko‘rsatilmagan"}
          </small>
        </article>
      </div>

      <div className="crm-customer-communication__workspace">
        <section className="crm-customer-communication__history">
          <div className="crm-customer-communication__section-heading">
            <div className="crm-customer-communication__section-icon">
              <Clock3 size={19} aria-hidden="true" />
            </div>

            <div>
              <span>Communication tarixi</span>
              <h2>Mijoz bilan aloqalar</h2>
            </div>
          </div>

          <div
            className="crm-customer-communication__filters"
            aria-label="Aloqa kanalini filtrlash"
          >
            <button
              type="button"
              aria-pressed={activeChannel === "all"}
              onClick={() => setActiveChannel("all")}
            >
              Barchasi
              <span>{communications.length}</span>
            </button>

            {Object.entries(crmCommunicationChannels).map(
              ([channelId, channel]) => {
                const ChannelIcon =
                  channelConfig[channelId]?.icon ?? MessageSquare;

                return (
                  <button
                    type="button"
                    key={channelId}
                    aria-pressed={activeChannel === channelId}
                    onClick={() => setActiveChannel(channelId)}
                  >
                    <ChannelIcon size={15} aria-hidden="true" />
                    {channel.label}
                    <span>{channelCounts[channelId] ?? 0}</span>
                  </button>
                );
              },
            )}
          </div>

          {filteredCommunications.length > 0 ? (
            <div className="crm-customer-communication__timeline">
              {filteredCommunications.map((communication) => {
                const channel =
                  channelConfig[communication.channel] ?? channelConfig.sms;
                const status =
                  statusConfig[communication.status] ?? statusConfig.scheduled;
                const ChannelIcon = channel.icon;
                const StatusIcon = status.icon;
                const DirectionIcon =
                  communication.direction === "inbound"
                    ? ArrowDownLeft
                    : ArrowUpRight;
                const channelLabel =
                  crmCommunicationChannels[communication.channel]?.label ??
                  "Aloqa";
                const statusLabel =
                  crmCommunicationStatuses[communication.status] ??
                  communication.status;

                return (
                  <article
                    className="crm-customer-communication__timeline-item"
                    key={communication.id}
                  >
                    <div
                      className={`crm-customer-communication__timeline-icon crm-customer-communication__timeline-icon--${channel.tone}`}
                      aria-hidden="true"
                    >
                      <ChannelIcon size={17} />
                    </div>

                    <div className="crm-customer-communication__timeline-copy">
                      <div>
                        <strong>{communication.subject}</strong>

                        <span>
                          {channelLabel} ·{" "}
                          {communication.direction === "inbound"
                            ? "Kiruvchi"
                            : "Chiquvchi"}
                        </span>
                      </div>

                      <p>{communication.summary}</p>

                      <time dateTime={communication.createdAt}>
                        {formatDate(communication.createdAt)} ·{" "}
                        {formatRelativeDate(communication.createdAt)}
                      </time>

                      <div className="crm-customer-communication__timeline-meta">
                        <span>
                          <DirectionIcon size={14} aria-hidden="true" />
                          {communication.participant}
                        </span>

                        <span>
                          {communication.manager === "ZENIX Automation" ? (
                            <Bot size={14} aria-hidden="true" />
                          ) : (
                            <UserRound size={14} aria-hidden="true" />
                          )}
                          {communication.manager}
                        </span>

                        {communication.channel === "call" &&
                        communication.status === "completed" ? (
                          <span>
                            <Clock3 size={14} aria-hidden="true" />
                            {formatCommunicationDuration(
                              communication.durationSeconds,
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <span
                      className={`crm-customer-communication__status crm-customer-communication__status--${status.tone}`}
                    >
                      <StatusIcon size={14} aria-hidden="true" />
                      {statusLabel}
                    </span>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="crm-customer-communication__empty">
              <MessageSquare size={23} aria-hidden="true" />
              <strong>Bu kanalda aloqa tarixi yo‘q</strong>
              <p>Boshqa kanalni tanlang yoki yangi xabar yuboring.</p>
            </div>
          )}
        </section>

        <section className="crm-customer-communication__composer">
          <div className="crm-customer-communication__section-heading">
            <div className="crm-customer-communication__section-icon">
              <Send size={19} aria-hidden="true" />
            </div>

            <div>
              <span>Yangi aloqa</span>
              <h2>Xabar yuborish</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <fieldset disabled={isSending}>
              <legend>Aloqa kanalini tanlang</legend>

              <div className="crm-customer-communication__channel-options">
                {composerChannels.map((channelId) => {
                  const channel = crmCommunicationChannels[channelId];
                  const ChannelIcon = channelConfig[channelId].icon;

                  return (
                    <button
                      type="button"
                      key={channelId}
                      aria-pressed={form.channel === channelId}
                      onClick={() => updateForm("channel", channelId)}
                    >
                      <ChannelIcon size={17} aria-hidden="true" />
                      {channel.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="crm-customer-communication__recipient">
              <span>Qabul qiluvchi</span>
              <strong>{recipient || "Kontakt mavjud emas"}</strong>
            </div>

            {errors.channel ? (
              <p className="crm-customer-communication__field-error">
                <XCircle size={15} aria-hidden="true" />
                {errors.channel}
              </p>
            ) : null}

            <label htmlFor="crm-communication-subject">Xabar mavzusi</label>
            <input
              id="crm-communication-subject"
              type="text"
              value={form.subject}
              maxLength={100}
              disabled={isSending}
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={
                errors.subject ? "crm-communication-subject-error" : undefined
              }
              placeholder="Masalan: Yangi taklif haqida"
              onChange={(event) => updateForm("subject", event.target.value)}
            />

            {errors.subject ? (
              <p
                id="crm-communication-subject-error"
                className="crm-customer-communication__field-error"
              >
                <XCircle size={15} aria-hidden="true" />
                {errors.subject}
              </p>
            ) : null}

            <div className="crm-customer-communication__label-row">
              <label htmlFor="crm-communication-message">Xabar matni</label>

              <span>{form.message.length}/500</span>
            </div>

            <textarea
              id="crm-communication-message"
              value={form.message}
              maxLength={500}
              rows={6}
              disabled={isSending}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? "crm-communication-message-error" : undefined
              }
              placeholder="Mijozga yuboriladigan xabarni kiriting..."
              onChange={(event) => updateForm("message", event.target.value)}
            />

            {errors.message ? (
              <p
                id="crm-communication-message-error"
                className="crm-customer-communication__field-error"
              >
                <XCircle size={15} aria-hidden="true" />
                {errors.message}
              </p>
            ) : null}

            {feedback ? (
              <div
                className={`crm-customer-communication__feedback crm-customer-communication__feedback--${feedback.type}`}
                role="status"
                aria-live="polite"
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 size={17} aria-hidden="true" />
                ) : (
                  <XCircle size={17} aria-hidden="true" />
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

            <button
              className="crm-customer-communication__submit"
              type="submit"
              disabled={
                isSending ||
                !form.subject.trim() ||
                !form.message.trim() ||
                !recipient
              }
            >
              <Send size={17} aria-hidden="true" />
              {isSending ? "Yuborilmoqda..." : "Xabar yuborish"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default CustomerCommunication;
