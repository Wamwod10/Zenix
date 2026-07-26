import { useEffect, useMemo, useState } from "react";

const steps = ["Shaxsiy", "Aloqa", "Pasport", "Lavozim", "Filial", "Oylik", "Shartnoma", "Jadval", "Probation", "Login", "Preview"];

const initialForm = {
  firstName: "",
  lastName: "",
  phone: "+998",
  email: "",
  pinfl: "",
  passport: "",
  birthDate: "1996-01-01",
  positionId: "pos-cashier",
  departmentId: "dep-sales",
  branchId: "br-tashkent",
  salary: 6000000,
  bankCard: "",
  hireDate: "2026-07-24",
  contractDate: "2026-07-24",
  contractEndDate: "2027-07-24",
  probationDays: 90,
  managerId: "emp-003",
  login: "",
  password: "",
  role: "employee",
};

const EmployeeCreate = ({ controller, onNavigate }) => {
  const { state } = controller;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [dirty, setDirty] = useState(false);
  const currentStep = steps[step];

  useEffect(() => {
    const handler = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const preview = useMemo(
    () => [
      ["F.I.O", `${form.firstName} ${form.lastName}`],
      ["Telefon", form.phone],
      ["PINFL", form.pinfl],
      ["Salary", form.salary],
      ["Role", form.role],
    ],
    [form],
  );

  const update = (key, value) => {
    setDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    const result = await controller.actions.createEmployee(form);
    if (result.ok) {
      setDirty(false);
      onNavigate("employee-details", result.employee.id);
    }
  };

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div>
            <span>Multi-step form</span>
            <h2>Yangi xodim yaratish</h2>
          </div>
          {dirty && <span className="hr-warning-inline">Saqlanmagan o'zgarishlar bor</span>}
        </div>

        <div className="hr-stepper" role="tablist" aria-label="Employee create steps">
          {steps.map((item, index) => (
            <button key={item} type="button" role="tab" aria-selected={step === index} className={step === index ? "is-active" : ""} onClick={() => setStep(index)}>
              {index + 1}. {item}
            </button>
          ))}
        </div>

        <div className="hr-form-grid">
          {["Shaxsiy", "Aloqa", "Pasport"].includes(currentStep) && (
            <>
              <label>Ism<input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></label>
              <label>Familiya<input value={form.lastName} onChange={(event) => update("lastName", event.target.value)} /></label>
              <label>Telefon<input value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
              <label>Email<input value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
              <label>PINFL<input value={form.pinfl} onChange={(event) => update("pinfl", event.target.value)} maxLength={14} /></label>
              <label>Passport<input value={form.passport} onChange={(event) => update("passport", event.target.value)} /></label>
              <label>Tug'ilgan sana<input type="date" value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} /></label>
            </>
          )}
          {["Lavozim", "Filial", "Oylik", "Shartnoma", "Jadval", "Probation", "Login"].includes(currentStep) && (
            <>
              <label>Bo'lim<select value={form.departmentId} onChange={(event) => update("departmentId", event.target.value)}>{state.departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Lavozim<select value={form.positionId} onChange={(event) => update("positionId", event.target.value)}>{state.positions.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
              <label>Filial<select value={form.branchId} onChange={(event) => update("branchId", event.target.value)}>{state.branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Oylik<input type="number" value={form.salary} onChange={(event) => update("salary", event.target.value)} /></label>
              <label>Contract date<input type="date" value={form.contractDate} onChange={(event) => update("contractDate", event.target.value)} /></label>
              <label>Contract end<input type="date" value={form.contractEndDate} onChange={(event) => update("contractEndDate", event.target.value)} /></label>
              <label>Probation days<input type="number" value={form.probationDays} onChange={(event) => update("probationDays", event.target.value)} /></label>
              <label>Login<input value={form.login} onChange={(event) => update("login", event.target.value)} /></label>
              <label>Password<input type="password" value={form.password} onChange={(event) => update("password", event.target.value)} /></label>
              <label>Role<select value={form.role} onChange={(event) => update("role", event.target.value)}>{controller.roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}</select></label>
            </>
          )}
          {currentStep === "Preview" && preview.map(([label, value]) => (
            <article className="hr-mini-card" key={label}><span>{label}</span><strong>{value}</strong></article>
          ))}
        </div>

        <div className="hr-actions-row">
          <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>Ortga</button>
          <button type="button" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Keyingi</button>
          <button type="button" className="is-primary" onClick={submit}>Saqlash</button>
        </div>
      </section>
    </div>
  );
};

export default EmployeeCreate;
