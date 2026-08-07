import { GlassSelect } from "@/components/ui";
import { SlidersHorizontal, X } from "lucide-react";

import "./EmployeeFilters.scss";

const probationLabels = {
  active: "Faol sinov muddati",
  "ending-soon": "Yaqinda tugaydi",
  "decision-pending": "Qaror kutilmoqda",
};

const EmployeeFilters = ({ filters, normalizedFilters, activeFilters, onChange, onRemove, onReset, departments, positions, branches }) => (
  <section className="employee-filters" aria-label="Xodim filterlari">
    <div className="employee-filters__title">
      <SlidersHorizontal size={15} />
      <span>Kengaytirilgan filtrlar</span>
    </div>

    <label>
      Bo'lim
      <GlassSelect value={filters.department} onChange={(event) => onChange("department", event.target.value)}>
        <option value="all">Barcha bo'limlar</option>
        {departments.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </GlassSelect>
    </label>
    <label>
      Lavozim
      <GlassSelect value={filters.position} onChange={(event) => onChange("position", event.target.value)}>
        <option value="all">Barcha lavozimlar</option>
        {positions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </GlassSelect>
    </label>
    <label>
      Filial
      <GlassSelect value={filters.branch} onChange={(event) => onChange("branch", event.target.value)}>
        <option value="all">Barcha filiallar</option>
        {branches.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </GlassSelect>
    </label>
    <label>
      Status
      <GlassSelect value={filters.status} onChange={(event) => onChange("status", event.target.value)}>
        <option value="all">Barcha statuslar</option>
        <option value="active">Ishda</option>
        <option value="late">Kechikkan</option>
        <option value="leave">Ta'tilda</option>
        <option value="sick">Kasal</option>
        <option value="terminated">Bo'shagan</option>
      </GlassSelect>
    </label>
    <label>
      Sinov muddati
      <GlassSelect value={filters.probation} onChange={(event) => onChange("probation", event.target.value)}>
        <option value="all">Barchasi</option>
        <option value="active">{probationLabels.active}</option>
        <option value="ending-soon">{probationLabels["ending-soon"]}</option>
        <option value="decision-pending">{probationLabels["decision-pending"]}</option>
      </GlassSelect>
    </label>
    <label>
      Hujjat muddati
      <GlassSelect value={filters.document} onChange={(event) => onChange("document", event.target.value)}>
        <option value="all">Barchasi</option>
        <option value="risk">Xavf bor</option>
      </GlassSelect>
    </label>
    <label>
      Davomat
      <GlassSelect value={filters.attendance} onChange={(event) => onChange("attendance", event.target.value)}>
        <option value="all">Barchasi</option>
        <option value="low">85% dan past</option>
        <option value="high">90% va yuqori</option>
      </GlassSelect>
    </label>
    <label className={normalizedFilters?.salaryRangeInvalid ? "is-invalid" : ""}>
      Min oylik
      <input type="number" min="0" value={filters.salaryMin} onChange={(event) => onChange("salaryMin", event.target.value)} />
    </label>
    <label className={normalizedFilters?.salaryRangeInvalid ? "is-invalid" : ""}>
      Max oylik
      <input type="number" min="0" value={filters.salaryMax} onChange={(event) => onChange("salaryMax", event.target.value)} />
    </label>
    <button type="button" onClick={onReset}>
      Tozalash
    </button>

    {(activeFilters?.length > 0 || normalizedFilters?.salaryRangeInvalid) && (
      <div className="employee-filters__chips">
        {activeFilters.map((item) => (
          <button key={item.key} type="button" onClick={() => onRemove(item.key)}>
            {item.key}: {probationLabels[item.value] || item.value}
            <X size={12} />
          </button>
        ))}
        {normalizedFilters?.salaryRangeInvalid && <span className="is-invalid">Min oylik max oylikdan katta.</span>}
      </div>
    )}
  </section>
);

export default EmployeeFilters;
