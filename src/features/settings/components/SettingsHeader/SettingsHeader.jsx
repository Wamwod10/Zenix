import { CheckCircle2, Clock3, History, Menu, RotateCcw, Save, Star, Undo2 } from "lucide-react";

import SettingsSearch from "../SettingsSearch/SettingsSearch";
import "./SettingsHeader.scss";

const statusCopy = {
  saving: "Saving",
  saved: "Saved",
  error: "Retry needed",
};

const SettingsHeader = ({
  meta,
  role,
  roles,
  autosaveStatus,
  isFavorite,
  search,
  canUndo,
  canRedo,
  onRoleChange,
  onMenu,
  onFavorite,
  onUndo,
  onRedo,
  onSave,
  onImport,
  onShare,
}) => (
  <header className="settings-header">
    <div className="settings-header__copy">
      <span>{meta.eyebrow}</span>
      <h1>{meta.title}</h1>
      <p>{meta.description}</p>
    </div>

    <div className="settings-header__tools">
      <button type="button" className="settings-header__menu" aria-label="Settings navigatsiyasi" onClick={onMenu}>
        <Menu size={18} />
      </button>
      <SettingsSearch search={search} compact />
      <div className="settings-header__actions">
        <select aria-label="Settings role preview" value={role} onChange={(event) => onRoleChange(event.target.value)}>
          {roles.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <button type="button" aria-label="Favorite" aria-pressed={isFavorite} onClick={onFavorite}>
          <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <button type="button" aria-label="Undo" disabled={!canUndo} onClick={onUndo}>
          <Undo2 size={16} />
        </button>
        <button type="button" aria-label="Redo" disabled={!canRedo} onClick={onRedo}>
          <RotateCcw size={16} />
        </button>
        <button type="button" onClick={onImport}>Import</button>
        <button type="button" onClick={onShare}>Share</button>
        <button type="button" className="is-primary" onClick={onSave}>
          <Save size={15} />
          Save
        </button>
      </div>
      <div className={`settings-header__status is-${autosaveStatus}`} role="status">
        {autosaveStatus === "saved" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
        {statusCopy[autosaveStatus] || "Saved"}
        <History size={14} />
      </div>
    </div>
  </header>
);

export default SettingsHeader;
