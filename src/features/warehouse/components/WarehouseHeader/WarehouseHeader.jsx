import { GlassSelect } from "@/components/ui";
import { Boxes, Download, Search, Sparkles, Upload } from "lucide-react";

import { warehouseRoles } from "../../utils/warehousePermissions";

import "./WarehouseHeader.scss";

const roleLabels = {
  owner: "Egasi",
  admin: "Administrator",
  manager: "Menejer",
  employee: "Ombor xodimi",
  cashier: "Kassir / sotuvchi",
};

const WarehouseHeader = ({
  searchRef,
  search,
  onSearch,
  role,
  onRoleChange,
  onOpenReceipt,
  onOpenImport,
  onExport,
  unreadCount = 0,
}) => (
  <section className="warehouse-header">
    <div className="warehouse-header__copy">
      <span className="warehouse-header__eyebrow">
        <Sparkles size={14} />
        ZENIX AI Ombor
      </span>
      <h1>Ombor boshqaruv tizimi</h1>
      <p>
        Zaxira, kirim-chiqim, transfer, inventarizatsiya, kuzatuv, audit va AI
        tavsiyalar bitta sokin premium ish maydonida jamlangan.
      </p>
    </div>

    <div className="warehouse-header__tools">
      <label className="warehouse-header__search">
        <Search size={17} />
        <input
          ref={searchRef}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="SKU, shtrix-kod, IMEI yoki hujjat..."
          aria-label="Ombor bo'yicha qidiruv"
        />
        <kbd>F1</kbd>
      </label>

      <div className="warehouse-header__actions">
        <GlassSelect
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
          aria-label="Ombor roli"
        >
          {warehouseRoles.map((item) => (
            <option key={item.id} value={item.id}>
              {roleLabels[item.id] || item.label}
            </option>
          ))}
        </GlassSelect>

        <button type="button" onClick={onOpenReceipt}>
          <Boxes size={16} />
          Kirim
        </button>
        <button type="button" onClick={onOpenImport}>
          <Upload size={16} />
          Import qilish
        </button>
        <button type="button" onClick={onExport}>
          <Download size={16} />
          Eksport
        </button>
      </div>

      <div className="warehouse-header__live">
        <span>AI kuzatuvi faol</span>
        <span>{unreadCount} o'qilmagan signal</span>
        <span>F2 kirim / F3 chiqim / F4 transfer</span>
      </div>
    </div>
  </section>
);

export default WarehouseHeader;
