import { Settings, X } from "lucide-react";

import { defaultPOSSettings } from "../data/posSettings";

import "./POSSettings.scss";

const POSSettings = ({ open = false, settings, onClose, onChange, onReset }) => {
  const safeSettings = {
    ...defaultPOSSettings,
    ...(settings || {}),
  };

  if (!open) {
    return null;
  }

  return (
    <div className="pos-settings" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section
        className="pos-settings__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pos-settings-title"
      >
        <div className="pos-settings__header">
          <div>
            <span>
              <Settings size={14} />
              POS settings
            </span>
            <h2 id="pos-settings-title">POS sozlamalari</h2>
            <p>Frontend mock settings keyinchalik backend configga ulanadi.</p>
          </div>
          <button type="button" aria-label="Settings oynasini yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="pos-settings__grid">
          <label>
            <span>Tax rate</span>
            <input type="number" min="0" step="0.01" value={safeSettings.taxRate} onChange={(event) => onChange?.({ taxRate: Number(event.target.value) || 0 })} />
          </label>
          <label>
            <span>Manager discount %</span>
            <input type="number" min="0" max="100" value={safeSettings.requireManagerForDiscountPercent} onChange={(event) => onChange?.({ requireManagerForDiscountPercent: Number(event.target.value) || 0 })} />
          </label>
          <label>
            <span>Receipt copies</span>
            <input type="number" min="1" max="3" value={safeSettings.receiptCopies} onChange={(event) => onChange?.({ receiptCopies: Number(event.target.value) || 1 })} />
          </label>
        </div>

        <div className="pos-settings__toggles">
          {[
            ["allowManualPrice", "Manual price"],
            ["allowItemDiscount", "Item discount"],
            ["requireManagerForVoid", "Void approval"],
            ["offlineQueueEnabled", "Offline queue"],
          ].map(([key, label]) => (
            <button
              type="button"
              key={key}
              className={safeSettings[key] ? "is-active" : ""}
              aria-pressed={safeSettings[key]}
              onClick={() => onChange?.({ [key]: !safeSettings[key] })}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pos-settings__footer">
          <button type="button" onClick={onReset}>Default</button>
          <button type="button" onClick={onClose}>Saqlash</button>
        </div>
      </section>
    </div>
  );
};

export default POSSettings;
