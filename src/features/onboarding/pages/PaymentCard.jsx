import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, Input, useNotification } from "../../../components/ui";
import "./PaymentCard.scss";

const cardBrands = {
  visa: {
    name: "Visa",
    pattern: /^4/,
    image: "/visa.png",
  },
  mastercard: {
    name: "Mastercard",
    pattern: /^(5[1-5]|2[2-7])/,
    image: "/mastercard.jpg",
  },
  humo: {
    name: "Humo",
    pattern: /^9860/,
    image: "/humo.png",
  },
  uzcard: {
    name: "Uzcard",
    pattern: /^8600/,
    image: "/uzcard.jpg",
  },
  unknown: {
    name: "Card",
    pattern: /.*/,
    image: "",
  },
};

const billingCountryOptions = [
  { label: "O‘zbekiston", value: "uzbekistan" },
  { label: "Qozog‘iston", value: "kazakhstan" },
  { label: "Qirg‘iziston", value: "kyrgyzstan" },
  { label: "Tojikiston", value: "tajikistan" },
  { label: "Turkmaniston", value: "turkmenistan" },
  { label: "Turkiya", value: "turkey" },
  { label: "Ozarbayjon", value: "azerbaijan" },
  { label: "Gruziya", value: "georgia" },
  { label: "Xitoy", value: "china" },
  { label: "Janubiy Koreya", value: "south-korea" },
  { label: "Yaponiya", value: "japan" },
  { label: "Hindiston", value: "india" },
  { label: "BAA", value: "uae" },
  { label: "Saudiya Arabistoni", value: "saudi-arabia" },
  { label: "Germaniya", value: "germany" },
  { label: "Fransiya", value: "france" },
  { label: "Buyuk Britaniya", value: "united-kingdom" },
  { label: "Shveytsariya", value: "switzerland" },
  { label: "Polsha", value: "poland" },
];

function detectCardBrand(number) {
  const clean = number.replace(/\D/g, "");

  if (cardBrands.humo.pattern.test(clean)) return "humo";
  if (cardBrands.uzcard.pattern.test(clean)) return "uzcard";
  if (cardBrands.visa.pattern.test(clean)) return "visa";
  if (cardBrands.mastercard.pattern.test(clean)) return "mastercard";

  return "unknown";
}

function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value, previousValue = "") {
  const clean = value.replace(/\D/g, "").slice(0, 4);

  if (!clean) return "";

  if (clean.length === 1) {
    return Number(clean) > 1 ? previousValue : clean;
  }

  const month = Number(clean.slice(0, 2));

  if (month < 1 || month > 12) {
    return previousValue;
  }

  if (clean.length < 3) return clean;

  return `${clean.slice(0, 2)}/${clean.slice(2)}`;
}

export default function PaymentCard() {
  const navigate = useNavigate();
  const notification = useNotification();
  const [form, setForm] = useState({
    cardNumber: "",
    holder: "",
    expiry: "",
    cvc: "",
    country: "uzbekistan",
  });

  const cardBrand = useMemo(
    () => detectCardBrand(form.cardNumber),
    [form.cardNumber],
  );

  const brandName = cardBrands[cardBrand].name;
  const brandImage = cardBrands[cardBrand].image;
  const requiresCvc = cardBrand === "visa" || cardBrand === "mastercard";

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    navigate("/pricing");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cardNumber = form.cardNumber.replace(/\D/g, "");
    const hasCompleteCard =
      cardNumber.length === 16 &&
      form.holder.trim() &&
      form.expiry.length === 5 &&
      (!requiresCvc || form.cvc.length === 3) &&
      form.country;

    if (!hasCompleteCard) {
      notification.warning(
        requiresCvc
          ? "Visa yoki Mastercard uchun CVC kodini kiriting."
          : "Karta ma'lumotlarini to'liq kiriting.",
      );
      return;
    }

    navigate("/ai-preparing");
  };

  return (
    <main className="payment-card-page">
      <section className="payment-card-page__content">
        <header className="payment-card-page__top">
          <button
            className="payment-card-page__back"
            type="button"
            onClick={handleBack}
          >
            <ArrowLeft size={17} />
            Orqaga
          </button>

          <span className="payment-card-page__step">5 / 5-qadam</span>
        </header>

        <div className="payment-card-page__hero">
          <span className="payment-card-page__badge">
            <ShieldCheck size={15} />
            14 kun bepul sinov
          </span>

          <h1>To‘lov kartangizni qo‘shing.</h1>

          <p>
            Karta faqat obunani tasdiqlash uchun kerak. Sinov muddati davomida
            kartangizdan hech qanday mablag‘ yechilmaydi.
          </p>
        </div>

        <form className="payment-card-page__form" onSubmit={handleSubmit}>
          <Input
            label="Karta raqami"
            name="cardNumber"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={form.cardNumber}
            onChange={(event) =>
              updateField("cardNumber", formatCardNumber(event.target.value))
            }
            leftIcon={<CreditCard size={18} />}
          />

          <Input
            label="Karta egasi"
            name="holder"
            placeholder="ISM FAMILIYA"
            value={form.holder}
            onChange={(event) =>
              updateField("holder", event.target.value.toUpperCase())
            }
          />

          <Input
            label="Amal qilish muddati"
            name="expiry"
            placeholder="MM/YY"
            inputMode="numeric"
            value={form.expiry}
            onChange={(event) =>
              updateField("expiry", formatExpiry(event.target.value, form.expiry))
            }
          />

          <Input
            label={requiresCvc ? "CVC" : "CVC (shart emas)"}
            name="cvc"
            placeholder={requiresCvc ? "123" : "Humo/Uzcard uchun kerak emas"}
            inputMode="numeric"
            maxLength="3"
            value={form.cvc}
            onChange={(event) =>
              updateField("cvc", event.target.value.replace(/\D/g, "").slice(0, 3))
            }
            disabled={!requiresCvc}
            leftIcon={<LockKeyhole size={18} />}
          />

          <Dropdown
            label="Billing country"
            value={form.country}
            onChange={(value) => updateField("country", value)}
            options={billingCountryOptions}
          />

          <div className="payment-card-page__notice">
            <ShieldCheck size={18} />
            <p>
              Hozir kartangizdan pul yechilmaydi. 14 kunlik sinov muddati
              tugashidan oldin sizga eslatma beriladi.
            </p>
          </div>

          <Button type="submit" fullWidth rightIcon={<ArrowRight size={18} />}>
            Sinovni boshlash
          </Button>
        </form>
      </section>

      <aside className="payment-card-page__preview">
        <div className={`payment-card-page__card payment-card-page__card--${cardBrand}`}>
          <div className="payment-card-page__card-glow" />

          <div className="payment-card-page__card-top">
            <span>ZENIX</span>
            <strong>{brandName}</strong>
          </div>

          <div
            className={`payment-card-page__chip payment-card-page__chip--${cardBrand}`}
          >
            {brandImage && <img src={brandImage} alt={`${brandName} logo`} />}
          </div>

          <p className="payment-card-page__number">
            {form.cardNumber || "0000 0000 0000 0000"}
          </p>

          <div className="payment-card-page__card-bottom">
            <div>
              <span>Card holder</span>
              <strong>{form.holder || "YOUR NAME"}</strong>
            </div>

            <div>
              <span>Expires</span>
              <strong>{form.expiry || "MM/YY"}</strong>
            </div>
          </div>
        </div>

        <div className="payment-card-page__summary">
          <span>Free trial</span>
          <h2>14 kun bepul</h2>
          <p>
            Sinov davomida barcha asosiy imkoniyatlarni ko‘rasiz. To‘lov sinov
            muddati tugagandan keyin boshlanadi.
          </p>
        </div>
      </aside>
    </main>
  );
}
