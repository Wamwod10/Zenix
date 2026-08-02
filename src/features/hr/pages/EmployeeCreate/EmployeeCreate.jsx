import { useEffect, useMemo, useState } from "react";

const today = new Date().toISOString().slice(0, 10);
const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);

const stepConfig = [
  { id: "personal", label: "Shaxsiy", fields: ["firstName", "lastName", "birthDate"] },
  { id: "contact", label: "Aloqa", fields: ["phone", "email"] },
  { id: "identity", label: "Pasport", fields: ["pinfl", "passport"] },
  { id: "job", label: "Lavozim", fields: ["departmentId", "positionId", "branchId"] },
  { id: "salary", label: "Oylik", fields: ["salary", "bankCard"] },
  { id: "contract", label: "Shartnoma", fields: ["hireDate", "contractDate", "contractEndDate", "probationDays", "managerId"] },
  { id: "login", label: "Login", fields: ["login", "password", "role"] },
  { id: "preview", label: "Preview", fields: [] },
];

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
  hireDate: today,
  contractDate: today,
  contractEndDate: nextYear,
  probationDays: 90,
  managerId: "emp-003",
  login: "",
  password: "",
  role: "employee",
};

const normalizePhone = (value) => {
  const digits = value.replace(/\D/g, "");
  const withoutCountry = digits.startsWith("998") ? digits.slice(3) : digits;
  return `+998${withoutCountry.slice(0, 9)}`;
};

const EmployeeCreate = ({ controller, onNavigate }) => {
  const { state, mutationStatus } = controller;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const currentStep = stepConfig[step];
  const isFinal = currentStep.id === "preview";
  const pending = mutationStatus["employee.create"]?.pending;

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
      ["Oylik", Number(form.salary).toLocaleString("uz-UZ")],
      ["Rol", form.role],
    ],
    [form],
  );

  const update = (key, value) => {
    setDirty(true);
    setErrors((current) => ({ ...current, [key]: "" }));
    setForm((current) => ({ ...current, [key]: key === "phone" ? normalizePhone(value) : value }));
  };

  const validate = (targetStep = currentStep) => {
    const nextErrors = {};
    if (targetStep.fields.includes("firstName") && !form.firstName.trim()) nextErrors.firstName = "Ism majburiy.";
    if (targetStep.fields.includes("lastName") && !form.lastName.trim()) nextErrors.lastName = "Familiya majburiy.";
    if (targetStep.fields.includes("phone") && !/^\+998\d{9}$/.test(form.phone)) nextErrors.phone = "Telefon +998XXXXXXXXX formatida bo'lishi kerak.";
    if (targetStep.fields.includes("email") && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Email formati noto'g'ri.";
    if (targetStep.fields.includes("pinfl") && !/^\d{14}$/.test(form.pinfl)) nextErrors.pinfl = "PINFL 14 raqam bo'lishi kerak.";
    if (targetStep.fields.includes("pinfl") && state.employees.some((employee) => employee.pinfl === form.pinfl)) nextErrors.pinfl = "Bunday PINFL mavjud.";
    if (targetStep.fields.includes("phone") && state.employees.some((employee) => employee.phone === form.phone)) nextErrors.phone = "Bunday telefon mavjud.";
    if (targetStep.fields.includes("email") && form.email && state.employees.some((employee) => employee.email.toLowerCase() === form.email.toLowerCase())) nextErrors.email = "Bunday email mavjud.";
    if (targetStep.fields.includes("salary") && Number(form.salary) <= 0) nextErrors.salary = "Oylik musbat bo'lishi kerak.";
    if (targetStep.fields.includes("contractDate") && form.contractDate < form.hireDate) nextErrors.contractDate = "Shartnoma sanasi ishga qabul sanasidan oldin bo'lmasin.";
    if (targetStep.fields.includes("contractEndDate") && form.contractEndDate <= form.contractDate) nextErrors.contractEndDate = "Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak.";
    if (targetStep.fields.includes("probationDays") && Number(form.probationDays) > 90) nextErrors.probationDays = "Sinov muddati 90 kundan oshmasin.";
    if (targetStep.fields.includes("login") && !form.login.trim()) nextErrors.login = "Login majburiy.";
    if (targetStep.fields.includes("password") && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) nextErrors.password = "Parol kamida 8 belgi va raqamdan iborat bo'lsin.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (validate()) setStep((current) => Math.min(current + 1, stepConfig.length - 1));
  };

  const submit = async () => {
    const allValid = stepConfig.slice(0, -1).every((item) => {
      const ok = validate(item);
      return ok;
    });
    if (!allValid || pending) return;
    const result = await controller.actions.createEmployee(form);
    if (result.ok) {
      setDirty(false);
      onNavigate("employee-details", result.employee.id);
    }
  };

  const renderError = (key) => errors[key] && <span className="hr-field-error">{errors[key]}</span>;

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div>
            <span>Yangi xodim</span>
            <h2>Xodim yaratish</h2>
          </div>
          {dirty && <span className="hr-warning-inline">Saqlanmagan o'zgarishlar bor</span>}
        </div>

        <div className="hr-stepper" role="tablist" aria-label="Xodim yaratish bosqichlari">
          {stepConfig.map((item, index) => (
            <button key={item.id} type="button" role="tab" aria-selected={step === index} className={step === index ? "is-active" : ""} onClick={() => setStep(index)}>
              {index + 1}. {item.label}
            </button>
          ))}
        </div>

        <div className="hr-form-grid">
          {currentStep.id === "personal" && (
            <>
              <label>Ism<input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} />{renderError("firstName")}</label>
              <label>Familiya<input value={form.lastName} onChange={(event) => update("lastName", event.target.value)} />{renderError("lastName")}</label>
              <label>Tug'ilgan sana<input type="date" value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} /></label>
            </>
          )}
          {currentStep.id === "contact" && (
            <>
              <label>Telefon<input value={form.phone} onChange={(event) => update("phone", event.target.value)} />{renderError("phone")}</label>
              <label>Email<input value={form.email} onChange={(event) => update("email", event.target.value)} />{renderError("email")}</label>
            </>
          )}
          {currentStep.id === "identity" && (
            <>
              <label>PINFL<input value={form.pinfl} onChange={(event) => update("pinfl", event.target.value.replace(/\D/g, "").slice(0, 14))} maxLength={14} />{renderError("pinfl")}</label>
              <label>Pasport<input value={form.passport} onChange={(event) => update("passport", event.target.value.toUpperCase())} /></label>
            </>
          )}
          {currentStep.id === "job" && (
            <>
              <label>Bo'lim<select value={form.departmentId} onChange={(event) => update("departmentId", event.target.value)}>{state.departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Lavozim<select value={form.positionId} onChange={(event) => update("positionId", event.target.value)}>{state.positions.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
              <label>Filial<select value={form.branchId} onChange={(event) => update("branchId", event.target.value)}>{state.branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            </>
          )}
          {currentStep.id === "salary" && (
            <>
              <label>Oylik<input type="number" min="0" value={form.salary} onChange={(event) => update("salary", event.target.value)} />{renderError("salary")}</label>
              <label>Bank karta<input value={form.bankCard} onChange={(event) => update("bankCard", event.target.value)} /></label>
            </>
          )}
          {currentStep.id === "contract" && (
            <>
              <label>Ishga qabul sanasi<input type="date" value={form.hireDate} onChange={(event) => update("hireDate", event.target.value)} /></label>
              <label>Shartnoma sanasi<input type="date" value={form.contractDate} onChange={(event) => update("contractDate", event.target.value)} />{renderError("contractDate")}</label>
              <label>Shartnoma tugashi<input type="date" value={form.contractEndDate} onChange={(event) => update("contractEndDate", event.target.value)} />{renderError("contractEndDate")}</label>
              <label>Sinov muddati kunlari<input type="number" min="0" max="90" value={form.probationDays} onChange={(event) => update("probationDays", event.target.value)} />{renderError("probationDays")}</label>
            </>
          )}
          {currentStep.id === "login" && (
            <>
              <label>Login<input value={form.login} onChange={(event) => update("login", event.target.value)} />{renderError("login")}</label>
              <label>Parol<input type="password" value={form.password} onChange={(event) => update("password", event.target.value)} />{renderError("password")}</label>
              <label>Rol<select value={form.role} onChange={(event) => update("role", event.target.value)}>{controller.roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}</select></label>
            </>
          )}
          {currentStep.id === "preview" && preview.map(([label, value]) => (
            <article className="hr-mini-card" key={label}><span>{label}</span><strong>{value}</strong></article>
          ))}
        </div>

        <div className="hr-actions-row">
          <button type="button" disabled={step === 0 || pending} onClick={() => setStep(step - 1)}>Ortga</button>
          {!isFinal && <button type="button" className="is-primary" onClick={goNext}>Davom etish</button>}
          {isFinal && <button type="button" className="is-primary" disabled={pending} onClick={submit}>{pending ? "Yaratilmoqda..." : "Xodimni yaratish"}</button>}
        </div>
      </section>
    </div>
  );
};

export default EmployeeCreate;
