import { GlassSelect } from "@/components/ui";
import { CheckCircle2, Clock3, History, Menu, MoreHorizontal, RotateCcw, Save, Star, Undo2, Upload, Users } from "lucide-react";

import SettingsSearch from "../SettingsSearch/SettingsSearch";
import "./SettingsHeader.scss";

const statusCopy = {
  saving: "Saqlanmoqda",
  saved: "Saqlandi",
  error: "Qayta urinish kerak",
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
  showPageActions = true,
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
        <GlassSelect aria-label="Ruxsat preview roli" title="Ruxsat preview roli" value={role} onChange={(event) => onRoleChange(event.target.value)}>
          {roles.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </GlassSelect>
        {showPageActions ? (
          <>
            <button type="button" aria-label="Sevimliga qo'shish" title="Sevimliga qo'shish" aria-pressed={isFavorite} onClick={onFavorite}>
              <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button type="button" aria-label="Ortga qaytarish" title="Ortga qaytarish" disabled={!canUndo} onClick={onUndo}>
              <Undo2 size={16} />
            </button>
            <button type="button" aria-label="Qayta bajarish" title="Qayta bajarish" disabled={!canRedo} onClick={onRedo}>
              <RotateCcw size={16} />
            </button>
            <button type="button" onClick={onImport}>
              <Upload size={15} />
              Import
            </button>
            <button type="button" onClick={onShare}>
              <Users size={15} />
              Ulashish
            </button>
            <button type="button" className="settings-header__overflow" aria-label="Qo'shimcha amallar" title="Qo'shimcha amallar">
              <MoreHorizontal size={16} />
            </button>
            <button type="button" className="is-primary" onClick={onSave}>
              <Save size={15} />
              Saqlash
            </button>
          </>
        ) : null}
      </div>
      {showPageActions ? (
        <div className={`settings-header__status is-${autosaveStatus}`} role="status">
          {autosaveStatus === "saved" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {statusCopy[autosaveStatus] || "Saqlandi"}
          <History size={14} />
        </div>
      ) : null}
    </div>
  </header>
);

export default SettingsHeader;
