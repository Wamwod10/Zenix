import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Eye,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button, Input, useNotification } from "../../../components/ui";
import { useGlassFollow } from "../../../shared/hooks/useGlassFollow";
import "./Register.scss";
import "./Login.scss";

const steps = ["Account", "Business", "Workspace", "Tariflar", "AI Ready"];

const initialForm = {
  company: "",
  owner: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

const requiredFields = [
  { name: "company", message: "Kompaniya nomini kiriting." },
  { name: "owner", message: "Ism va familiyangizni kiriting." },
  { name: "email", message: "Email manzilini kiriting." },
  { name: "phone", message: "Telefon raqamini kiriting." },
  { name: "password", message: "Parolni kiriting." },
  { name: "confirmPassword", message: "Parolni tasdiqlang." },
  {
    name: "terms",
    message: "Foydalanish shartlariga rozilik bering.",
  },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { error } = useNotification();
  const glassFollowRef = useGlassFollow({
    activationPaddingX: 280,
    activationPaddingY: 170,
  });

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const values = {
      company: form.company.trim(),
      owner: form.owner.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password.trim(),
      confirmPassword: form.confirmPassword.trim(),
      terms: form.terms,
    };

    const missingFields = requiredFields.filter((field) => !values[field.name]);

    if (missingFields.length > 1) {
      error("Barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    if (missingFields.length === 1) {
      error(missingFields[0].message);
      return;
    }

    if (!emailPattern.test(values.email)) {
      error("Email manzili noto'g'ri.");
      return;
    }

    if (values.password !== values.confirmPassword) {
      error("Parollar bir xil emas.");
      return;
    }

    sessionStorage.setItem("zenix_pending_email", values.email);
    navigate("/email-verification");
  };

  return (
    <main className="register-page">
      <section className="register-page__panel">
        <div className="register-page__brand">
          <div className="register-page__logo">
            <img src="/1.png" alt="ZENIX" />
          </div>

          <div>
            <p>AI Business OS</p>
            <strong>ZENIX</strong>
          </div>
        </div>

        <div className="register-page__content">
          <span className="login-page__badge">Sayohatingizni Boshlang</span>

          <h1>
            AI bilan ishlaydigan
            <br />
            biznes yarating.
          </h1>

          <p>
            Bir necha daqiqada ZENIX Workspace yarating. Savdo, CRM, ombor va AI
            yordamchingiz birinchi kundanoq tayyor bo‘ladi.
          </p>
        </div>

        <form className="register-page__form" noValidate onSubmit={handleSubmit}>
          <Input
            label="Kompaniya nomi"
            name="company"
            value={form.company}
            placeholder="Masalan: ZENIX Store"
            leftIcon={<Building2 size={18} />}
            onChange={handleChange}
          />

          <Input
            label="Ism va familiya"
            name="owner"
            value={form.owner}
            placeholder="Ism familiya"
            leftIcon={<User size={18} />}
            onChange={handleChange}
          />

          <Input
            label="Email manzil"
            name="email"
            type="email"
            value={form.email}
            placeholder="you@company.com"
            leftIcon={<Mail size={18} />}
            onChange={handleChange}
          />

          <Input
            label="Telefon raqam"
            name="phone"
            type="tel"
            value={form.phone}
            placeholder="+998 90 000 00 00"
            leftIcon={<Phone size={18} />}
            onChange={handleChange}
          />

          <Input
            label="Parol"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            onChange={handleChange}
            rightIcon={
              <button
                type="button"
                className={`register-page__password-toggle ${
                  showPassword ? "register-page__password-toggle--visible" : ""
                }`}
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <Eye size={18} />
                <span aria-hidden="true" />
              </button>
            }
          />

          <Input
            label="Parolni tasdiqlash"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            onChange={handleChange}
            rightIcon={
              <button
                type="button"
                className={`register-page__password-toggle ${
                  showConfirmPassword
                    ? "register-page__password-toggle--visible"
                    : ""
                }`}
                aria-label={
                  showConfirmPassword
                    ? "Tasdiqlash parolini yashirish"
                    : "Tasdiqlash parolini ko‘rsatish"
                }
                onClick={() => setShowConfirmPassword((visible) => !visible)}
              >
                <Eye size={18} />
                <span aria-hidden="true" />
              </button>
            }
          />

          <label className="register-page__terms">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
            />
            <span>ZENIX shartlariga va maxfiylik siyosatiga roziman.</span>
          </label>

          <Button type="submit" fullWidth>
            Hisob yaratish
          </Button>
        </form>

        <p className="register-page__footer">
          Sizning akkauntingiz bormi? <a href="/login">Kirish</a>
        </p>
      </section>

      <aside className="register-page__visual">
        <div className="register-page__follow" ref={glassFollowRef}>
          <div className="register-page__progress-card">
            <div className="register-page__progress-top">
              <span>Step 1 / 5</span>
              <strong>Workspace setup</strong>
            </div>

            <div className="register-page__timeline">
              {steps.map((step, index) => (
                <div
                  className={`register-page__step ${
                    index === 0 ? "register-page__step--active" : ""
                  }`}
                  key={step}
                >
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>

            <div className="register-page__workspace">
              <span className="register-page__workspace-label">
                Workspace Preview
              </span>

              <h2>ZENIX Workspace</h2>

              <div className="register-page__workspace-grid">
                <div>
                  <span>Business</span>
                  <strong>Not selected</strong>
                </div>

                <div>
                  <span>Products</span>
                  <strong>0</strong>
                </div>

                <div>
                  <span>Employees</span>
                  <strong>0</strong>
                </div>

                <div>
                  <span>AI Status</span>
                  <strong>Ready</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
