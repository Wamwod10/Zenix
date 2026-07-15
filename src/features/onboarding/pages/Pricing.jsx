import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Crown,
  Minus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, useNotification } from "../../../components/ui";
// ✅ BACKEND INTEGRATION: tarif tanlovini saqlash (14 kun trial boshlanadi)
import { useSelectPlanMutation } from "../onboardingApi";
import { getApiError } from "../../../shared/services/api";
import "./Pricing.scss";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Platformani sinab ko‘rish uchun.",
    badge: "Boshlash",
    features: [
      { label: "Foydalanuvchilar", value: "1", included: true },
      { label: "Filiallar", value: "1", included: true },
      { label: "Omborlar", value: "1", included: true },
      { label: "Kassalar", value: "Test", included: true },
      { label: "Mahsulot limiti", value: "100", included: true },
      { label: "POS", value: "Cheklangan", included: true },
      { label: "CRM", value: "yo‘q", included: false },
      { label: "Finance", value: "yo‘q", included: false },
      { label: "AI", value: "Demo", included: true },
      { label: "Hisobotlar", value: "Basic", included: true },
      { label: "Support", value: "Community", included: true },
      { label: "API access", value: "yo‘q", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    description: "Yangi do‘kon va kichik bizneslar uchun.",
    features: [
      { label: "Foydalanuvchilar", value: "3", included: true },
      { label: "Filiallar", value: "1", included: true },
      { label: "Omborlar", value: "1", included: true },
      { label: "Kassalar", value: "1", included: true },
      { label: "Mahsulot limiti", value: "2 000", included: true },
      { label: "POS", value: "Ha", included: true },
      { label: "CRM", value: "Basic", included: true },
      { label: "Finance", value: "Basic", included: true },
      { label: "AI", value: "Basic", included: true },
      { label: "Hisobotlar", value: "Standard", included: true },
      { label: "Support", value: "Email", included: true },
      { label: "API access", value: "yo‘q", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    description: "Faol savdo bizneslari uchun.",
    popular: true,
    features: [
      { label: "Foydalanuvchilar", value: "10", included: true },
      { label: "Filiallar", value: "3", included: true },
      { label: "Omborlar", value: "5", included: true },
      { label: "Kassalar", value: "5", included: true },
      { label: "Mahsulot limiti", value: "20 000", included: true },
      { label: "POS", value: "Advanced", included: true },
      { label: "CRM", value: "Advanced", included: true },
      { label: "Finance", value: "Advanced", included: true },
      { label: "AI", value: "AI tavsiyalar", included: true },
      { label: "Hisobotlar", value: "Advanced", included: true },
      { label: "Support", value: "Priority", included: true },
      { label: "API access", value: "yo‘q", included: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$89",
    description: "Katta va o‘sayotgan bizneslar uchun.",
    features: [
      { label: "Foydalanuvchilar", value: "50+", included: true },
      { label: "Filiallar", value: "10+", included: true },
      { label: "Omborlar", value: "20+", included: true },
      { label: "Kassalar", value: "20+", included: true },
      { label: "Mahsulot limiti", value: "100 000+", included: true },
      { label: "POS", value: "Offline + Advanced", included: true },
      { label: "CRM", value: "Full", included: true },
      { label: "Finance", value: "Full", included: true },
      { label: "AI", value: "9 AI moduli", included: true },
      { label: "Hisobotlar", value: "Enterprise", included: true },
      { label: "Support", value: "VIP", included: true },
      { label: "API access", value: "Ha", included: true },
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const { error } = useNotification();
  // ✅ BACKEND INTEGRATION: PATCH /onboarding/plan
  const [selectPlan, { isLoading }] = useSelectPlanMutation();

  const activePlan = plans.find((plan) => plan.id === selectedPlan);

  const handleBack = () => {
    navigate("/business-setup");
  };

  // ✅ BACKEND INTEGRATION: tarif bazaga saqlanadi, trialEndsAt o'rnatiladi
  const handleContinue = async () => {
    if (isLoading) return;

    try {
      await selectPlan({ plan: selectedPlan }).unwrap();
      navigate("/payment-card");
    } catch (err) {
      error(getApiError(err).message);
    }
  };

  return (
    <main className="pricing-page">
      <section className="pricing-page__content">
        <header className="pricing-page__top">
          <button
            className="pricing-page__back"
            type="button"
            onClick={handleBack}
          >
            <ArrowLeft size={17} />
            Orqaga
          </button>

          <span className="pricing-page__step">4 / 5-qadam</span>
        </header>

        <div className="pricing-page__hero">
          <span className="pricing-page__badge">
            <Sparkles size={15} />
            14 kun bepul sinov
          </span>

          <h1>Biznesingiz uchun mos tarifni tanlang.</h1>

          <p>
            Karta faqat obunani tasdiqlash uchun kerak. Sinov muddati davomida
            kartangizdan hech qanday mablag‘ yechilmaydi.
          </p>
        </div>

        <div className="pricing-page__cards">
          {plans.map((plan) => {
            const isActive = selectedPlan === plan.id;

            return (
              <button
                key={plan.id}
                type="button"
                className={`pricing-page__plan ${
                  isActive ? "pricing-page__plan--active" : ""
                } ${plan.popular ? "pricing-page__plan--popular" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <span className="pricing-page__popular">
                    <Crown size={14} />
                    Eng ommabop
                  </span>
                )}

                {isActive && (
                  <span className="pricing-page__selected">
                    <Check size={14} />
                    Tanlandi
                  </span>
                )}

                <div className="pricing-page__plan-head">
                  <h3>{plan.name}</h3>
                  <strong>
                    {plan.price}
                    <small>/ oy</small>
                  </strong>
                  <p>{plan.description}</p>
                </div>

                <div className="pricing-page__features">
                  {plan.features.map((feature) => (
                    <div
                      className={`pricing-page__feature ${
                        feature.included
                          ? ""
                          : "pricing-page__feature--disabled"
                      }`}
                      key={feature.label}
                    >
                      {feature.included ? (
                        <Check size={14} />
                      ) : (
                        <Minus size={14} />
                      )}
                      <span>{feature.label}</span>
                      <strong>{feature.value}</strong>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="pricing-page__actions">
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft size={18} />}
            onClick={handleBack}
          >
            Orqaga
          </Button>

          {/* ✅ BACKEND INTEGRATION: saqlash paytida tugma bloklanadi */}
          <Button
            rightIcon={<ArrowRight size={18} />}
            disabled={isLoading}
            onClick={handleContinue}
          >
            {isLoading ? "Saqlanmoqda..." : "Davom etish"}
          </Button>
        </div>
      </section>

      <aside className="pricing-page__preview">
        <div className="pricing-page__preview-card">
          <div className="pricing-page__preview-top">
            <span>Selected plan</span>
            <BadgeCheck size={20} />
          </div>

          <h2>{activePlan.name}</h2>
          <strong>{activePlan.price} / oy</strong>

          <div className="pricing-page__trial">
            <ShieldCheck size={18} />
            <p>
              14 kunlik bepul sinov hozir boshlanadi. Sinov muddati tugamaguncha
              pul yechilmaydi.
            </p>
          </div>

          <div className="pricing-page__preview-list">
            {activePlan.features
              .filter((feature) => feature.included)
              .slice(0, 5)
              .map((feature) => (
                <div key={feature.label}>
                  <Check size={15} />
                  <span>{feature.label}</span>
                  <strong>{feature.value}</strong>
                </div>
              ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
