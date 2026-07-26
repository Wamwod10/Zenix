import { useEffect, useMemo, useState } from "react";

import { formatInitials } from "../../utils/crmFormatters";

import "./CustomerAvatar.scss";

const avatarTones = ["plum", "forest", "cobalt", "rust", "slate", "gold"];

const getAutomaticTone = (value) => {
  if (!value) {
    return avatarTones[0];
  }

  const characterTotal = Array.from(value).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return avatarTones[characterTotal % avatarTones.length];
};

const CustomerAvatar = ({
  fullName,
  initials,
  imageUrl,
  size = "md",
  tone,
  status,
  className = "",
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  const resolvedInitials = useMemo(
    () => initials || formatInitials(fullName),
    [fullName, initials],
  );

  const resolvedTone = useMemo(
    () => tone || getAutomaticTone(fullName || resolvedInitials),
    [fullName, resolvedInitials, tone],
  );

  const shouldShowImage = Boolean(imageUrl) && !hasImageError;

  const classes = [
    "crm-customer-avatar",
    `crm-customer-avatar--${size}`,
    `crm-customer-avatar--${resolvedTone}`,
    status ? `crm-customer-avatar--status-${status}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <span className="crm-customer-avatar__surface">
        {shouldShowImage ? (
          <img
            src={imageUrl}
            alt={fullName ? `${fullName} rasmi` : "Mijoz rasmi"}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <span
            className="crm-customer-avatar__initials"
            role="img"
            aria-label={
              fullName ? `${fullName} profil rasmi` : "Mijoz profil rasmi"
            }
          >
            {resolvedInitials}
          </span>
        )}
      </span>

      {status && (
        <>
          <span className="crm-customer-avatar__status" aria-hidden="true" />

          <span className="crm-customer-avatar__sr-only">
            Holati: {status === "active" ? "faol" : "nofaol"}
          </span>
        </>
      )}
    </span>
  );
};

export default CustomerAvatar;
