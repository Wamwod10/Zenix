import { SlidersHorizontal } from "lucide-react";

import "./EmployeeFilters.scss";

const EmployeeFilters = ({ filters, onChange, onReset, departments, positions, branches }) => (
  <section className="employee-filters" aria-label="Xodim filterlari">
    <span>
      <SlidersHorizontal size={15} />
      Advanced filters
    </span>
    <select value={filters.department} onChange={(event) => onChange("department", event.target.value)} aria-label="Bo'lim">
      <option value="all">Barcha bo'limlar</option>
      {departments.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
    <select value={filters.position} onChange={(event) => onChange("position", event.target.value)} aria-label="Lavozim">
      <option value="all">Barcha lavozimlar</option>
      {positions.map((item) => (
        <option key={item.id} value={item.id}>
          {item.title}
        </option>
      ))}
    </select>
    <select value={filters.branch} onChange={(event) => onChange("branch", event.target.value)} aria-label="Filial">
      <option value="all">Barcha filiallar</option>
      {branches.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
    <select value={filters.status} onChange={(event) => onChange("status", event.target.value)} aria-label="Status">
      <option value="all">Barcha statuslar</option>
      <option value="active">Ishda</option>
      <option value="late">Kechikkan</option>
      <option value="leave">Ta'tilda</option>
      <option value="sick">Kasal</option>
      <option value="terminated">Bo'shagan</option>
    </select>
    <select value={filters.probation} onChange={(event) => onChange("probation", event.target.value)} aria-label="Probation">
      <option value="all">Probation hammasi</option>
      <option value="active">Active</option>
      <option value="ending-soon">Ending soon</option>
      <option value="decision-pending">Decision pending</option>
    </select>
    <select value={filters.document} onChange={(event) => onChange("document", event.target.value)} aria-label="Document expiry">
      <option value="all">Hujjat hammasi</option>
      <option value="risk">Risk bor</option>
    </select>
    <select value={filters.attendance} onChange={(event) => onChange("attendance", event.target.value)} aria-label="Attendance">
      <option value="all">Davomat hammasi</option>
      <option value="low">85% dan past</option>
      <option value="high">90%+</option>
    </select>
    <input value={filters.salaryMin} onChange={(event) => onChange("salaryMin", event.target.value)} inputMode="numeric" placeholder="Min oylik" aria-label="Min oylik" />
    <input value={filters.salaryMax} onChange={(event) => onChange("salaryMax", event.target.value)} inputMode="numeric" placeholder="Max oylik" aria-label="Max oylik" />
    <button type="button" onClick={onReset}>
      Tozalash
    </button>
  </section>
);

export default EmployeeFilters;
