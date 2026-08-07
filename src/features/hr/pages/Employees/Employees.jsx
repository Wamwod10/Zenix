import { GlassSelect } from "@/components/ui";
import { useEffect, useMemo, useState } from "react";
import { Download, Grid2X2, List, MessageSquare, UserPlus } from "lucide-react";

import EmployeeFilters from "../../components/EmployeeFilters/EmployeeFilters";
import EmployeeTable from "../../components/EmployeeTable/EmployeeTable";
import HRDialog from "../../components/HRDialog/HRDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { calculateDocumentExpiry } from "../../utils/hrCalculations";
import { formatEmployeeName, formatMoney } from "../../utils/hrFormatters";

const sortEmployees = (employees, dictionaries, sort) => {
  const sign = sort.direction === "asc" ? 1 : -1;
  const accessors = {
    name: (employee) => formatEmployeeName(employee),
    position: (employee) => dictionaries.positionById[employee.positionId]?.title || "",
    branch: (employee) => dictionaries.branchById[employee.branchId]?.name || "",
    status: (employee) => employee.status,
    kpi: (employee) => Number(employee.kpiScore || 0),
  };
  const getValue = accessors[sort.key] || accessors.name;

  return [...employees].sort((a, b) => {
    const first = getValue(a);
    const second = getValue(b);
    if (typeof first === "number") return (first - second) * sign;
    return String(first).localeCompare(String(second), "uz") * sign;
  });
};

const Employees = ({ controller, onNavigate }) => {
  const { state, employeeFilters, dictionaries, pagination } = controller;
  const setPagination = controller.actions.setPagination;
  const salaryVisible = controller.actionState("salary.view").visible;
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("zenix-hr-employees-view") || "table");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const [transferEmployeeId, setTransferEmployeeId] = useState("");
  const [transferBranchId, setTransferBranchId] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));

  const sortedEmployees = useMemo(
    () => sortEmployees(employeeFilters.filteredEmployees, dictionaries, sort),
    [dictionaries, employeeFilters.filteredEmployees, sort],
  );
  const pages = Math.max(1, Math.ceil(sortedEmployees.length / pagination.pageSize));
  const safePage = Math.min(pagination.page, pages);
  const start = (safePage - 1) * pagination.pageSize;
  const employees = sortedEmployees.slice(start, start + pagination.pageSize);
  const allSelected = employees.length > 0 && employees.every((employee) => selectedIds.includes(employee.id));

  useEffect(() => {
    localStorage.setItem("zenix-hr-employees-view", viewMode);
  }, [viewMode]);

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }));
    setSelectedIds([]);
  }, [employeeFilters.filters, setPagination]);

  const setPage = (page) => setPagination({ ...pagination, page });

  const toggleSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleEmployee = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const exportCsv = () => {
    const header = ["Kod", "FIO", "Telefon", "Email", "Filial", "Bo'lim", "Lavozim", "Status", "Oylik"];
    const rows = sortedEmployees.map((employee) => [
      employee.code,
      formatEmployeeName(employee),
      employee.phone,
      employee.email,
      dictionaries.branchById[employee.branchId]?.name || "",
      dictionaries.departmentById[employee.departmentId]?.name || "",
      dictionaries.positionById[employee.positionId]?.title || "",
      employee.status,
      salaryVisible ? employee.salary : "yashirilgan",
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hr-xodimlar.csv";
    link.click();
    URL.revokeObjectURL(url);
    controller.actions.addNotification("Filterlangan xodimlar CSV faylga eksport qilindi.");
  };

  const openTransfer = (id) => {
    const employee = state.employees.find((item) => item.id === id);
    setTransferEmployeeId(id);
    setTransferBranchId(employee?.branchId || "");
  };

  const submitTransfer = () => {
    if (controller.actions.transferEmployee(transferEmployeeId, transferBranchId, effectiveDate)) {
      setTransferEmployeeId("");
    }
  };

  const cardRisk = (employee) =>
    employee.documents.some((document) => ["critical", "expired", "warning"].includes(calculateDocumentExpiry(document).status));

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div>
            <span>Xodimlar</span>
            <h2>Xodimlar ro'yxati</h2>
          </div>
          <div className="hr-actions-row">
            <button type="button" onClick={() => onNavigate("employee-create")}>
              <UserPlus size={15} /> Yangi
            </button>
            <button type="button" onClick={exportCsv}>
              <Download size={15} /> Eksport
            </button>
            <button type="button" className={viewMode === "table" ? "is-active" : ""} aria-label="Jadval ko'rinishi" onClick={() => setViewMode("table")}>
              <List size={15} />
            </button>
            <button type="button" className={viewMode === "cards" ? "is-active" : ""} aria-label="Karta ko'rinishi" onClick={() => setViewMode("cards")}>
              <Grid2X2 size={15} />
            </button>
          </div>
        </div>

        <EmployeeFilters
          filters={employeeFilters.filters}
          normalizedFilters={employeeFilters.normalizedFilters}
          activeFilters={employeeFilters.activeFilters}
          onChange={employeeFilters.updateFilter}
          onRemove={employeeFilters.removeFilter}
          onReset={employeeFilters.resetFilters}
          departments={state.departments}
          positions={state.positions}
          branches={state.branches}
        />

        {selectedIds.length > 0 && (
          <div className="hr-bulk-bar">
            <strong>{selectedIds.length} ta xodim tanlandi</strong>
            <button type="button" onClick={() => onNavigate("messages")}>
              <MessageSquare size={15} /> Bulk xabar
            </button>
            <button type="button" onClick={() => setSelectedIds([])}>Tanlovni bekor qilish</button>
          </div>
        )}

        {employees.length && viewMode === "table" ? (
          <EmployeeTable
            employees={employees}
            dictionaries={dictionaries}
            salaryVisible={salaryVisible}
            selectedIds={selectedIds}
            onToggle={toggleEmployee}
            onToggleAll={() => setSelectedIds(allSelected ? [] : employees.map((employee) => employee.id))}
            allSelected={allSelected}
            sort={sort}
            onSort={toggleSort}
            onOpen={(id) => onNavigate("employee-details", id)}
            onMessage={(id) => {
              controller.actions.setSelectedEmployeeId(id);
              onNavigate("messages");
            }}
            onTransfer={openTransfer}
          />
        ) : null}

        {employees.length && viewMode === "cards" ? (
          <section className="hr-card-grid">
            {employees.map((employee) => (
              <article className={`hr-mini-card ${cardRisk(employee) ? "is-warning" : ""}`} key={employee.id}>
                <span className="hr-avatar">{employee.photo}</span>
                <strong>{formatEmployeeName(employee)}</strong>
                <span>{dictionaries.positionById[employee.positionId]?.title}</span>
                <StatusBadge status={employee.status} />
                <span>{salaryVisible ? formatMoney(employee.salary) : "Oylik ma'lumoti yashirilgan"}</span>
                <div className="hr-actions-row">
                  <button type="button" onClick={() => onNavigate("employee-details", employee.id)}>Profil</button>
                  <button type="button" onClick={() => controller.actions.sendMessage({ text: "HR xabari", to: [employee.id], type: "personal" })}>
                    <MessageSquare size={15} /> Xabar
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {!employees.length && (
          <div className="hr-empty">
            Filter bo'yicha xodim topilmadi.
            <button type="button" onClick={employeeFilters.resetFilters}>Filtrlarni tozalash</button>
          </div>
        )}

        <div className="hr-pagination">
          <span>{sortedEmployees.length} ta natija</span>
          <GlassSelect
            value={pagination.pageSize}
            onChange={(event) => setPagination({ page: 1, pageSize: Number(event.target.value) })}
            aria-label="Sahifadagi xodimlar soni"
          >
            {[6, 12, 24].map((size) => <option key={size} value={size}>{size} ta</option>)}
          </GlassSelect>
          <button type="button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
            Oldingi
          </button>
          {Array.from({ length: pages }, (_, index) => index + 1).slice(0, 5).map((page) => (
            <button key={page} type="button" className={page === safePage ? "is-active" : ""} onClick={() => setPage(page)}>
              {page}
            </button>
          ))}
          <button type="button" disabled={safePage === pages} onClick={() => setPage(safePage + 1)}>
            Keyingi
          </button>
        </div>
      </section>

      <HRDialog open={Boolean(transferEmployeeId)} title="Filialga o'tkazish" onClose={() => setTransferEmployeeId("")}>
        <div className="hr-form-grid">
          <label>
            Yangi filial
            <GlassSelect value={transferBranchId} onChange={(event) => setTransferBranchId(event.target.value)}>
              {state.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </GlassSelect>
          </label>
          <label>
            Kuchga kirish sanasi
            <input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
          </label>
        </div>
        <div className="hr-actions-row">
          <button type="button" className="is-primary" onClick={submitTransfer}>Tasdiqlash</button>
          <button type="button" onClick={() => setTransferEmployeeId("")}>Bekor qilish</button>
        </div>
      </HRDialog>
    </div>
  );
};

export default Employees;
