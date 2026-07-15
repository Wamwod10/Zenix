import {
  ArrowRight,
  Building2,
  Check,
  FileText,
  Globe2,
  ImagePlus,
  MapPin,
  Phone,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Dropdown, Input, useNotification } from "../../../components/ui";
import { useGlassFollow } from "../../../shared/hooks/useGlassFollow";
// ✅ BACKEND INTEGRATION: kompaniya ma'lumotlarini saqlash
import { useSetBusinessSetupMutation } from "../onboardingApi";
import { getApiError } from "../../../shared/services/api";
import "./BusinessSetup.scss";

const selectedBusinessStorageKey = "zenix:selectedBusinessType";

const businessProfiles = {
  retail: {
    title: "Savdo",
    industries: [
      "Telefon do‘koni",
      "Maishiy texnika",
      "Kompyuter do‘koni",
      "Mini market",
      "Supermarket",
      "Kiyim do‘koni",
      "Poyabzal do‘koni",
      "Kosmetika",
      "Zargarlik",
      "Kitob do‘koni",
      "O‘yinchoqlar",
      "Sport anjomlari",
      "Gul do‘koni",
      "Avto ehtiyot qismlar",
      "Qurilish materiallari",
      "Mebel",
      "Elektronika",
      "Optika",
    ],
  },
  food: {
    title: "Ovqatlanish",
    industries: [
      "Restoran",
      "Kafe",
      "Fast food",
      "Milliy taomlar",
      "Burger",
      "Pitseriya",
      "Sushi",
      "Choyxona",
      "Kofe shop",
      "Nonvoyxona",
      "Qandolat",
      "Oshxona",
      "Catering",
    ],
  },
  medical: {
    title: "Apteka va tibbiyot",
    industries: [
      "Dorixona",
      "Klinika",
      "Stomatologiya",
      "Diagnostika markazi",
      "Laboratoriya",
      "Veterinariya klinikasi",
      "Tibbiy buyumlar do‘koni",
    ],
  },
  education: {
    title: "Ta’lim",
    industries: [
      "O‘quv markazi",
      "IT akademiya",
      "Til markazi",
      "Maktab",
      "Bog‘cha",
      "Universitet",
      "O‘quv kurslari",
      "Haydovchilik maktabi",
    ],
  },
  service: {
    title: "Xizmat ko‘rsatish",
    industries: [
      "Telefon ta’mirlash",
      "Kompyuter servisi",
      "Avtoservis",
      "Go‘zallik saloni",
      "Barbershop",
      "Kimyoviy tozalash",
      "Kir yuvish",
      "Foto studio",
      "Reklama agentligi",
      "Turizm agentligi",
    ],
  },
  production: {
    title: "Ishlab chiqarish",
    industries: [
      "Tikuvchilik",
      "Mebel ishlab chiqarish",
      "Metall ishlab chiqarish",
      "Plastik mahsulotlar",
      "Poligrafiya",
      "Oziq-ovqat ishlab chiqarish",
      "Ichimlik ishlab chiqarish",
    ],
  },
  hospitality: {
    title: "Mehmonxona",
    industries: [
      "Mehmonxona",
      "Hostel",
      "Kapsula hotel",
      "Dam olish maskani",
      "Mehmon uyi",
      "Resort",
      "Sanatoriya",
    ],
  },
  construction: {
    title: "Qurilish",
    industries: [
      "Qurilish kompaniyasi",
      "Ta’mirlash xizmati",
      "Arxitektura",
      "Dizayn studiyasi",
      "Qurilish materiallari ishlab chiqarish",
      "Developer kompaniyalari",
    ],
  },
};

const fallbackIndustryOptions = [
  { label: "Savdo", value: "retail" },
  { label: "Restoran va oziq-ovqat", value: "food" },
  { label: "Apteka va tibbiyot", value: "medical" },
  { label: "Ta’lim", value: "education" },
  { label: "Xizmat ko‘rsatish", value: "service" },
  { label: "Ishlab chiqarish", value: "production" },
  { label: "Mehmonxona", value: "hospitality" },
  { label: "Qurilish", value: "construction" },
  { label: "Ulgurji va distribyutor", value: "wholesale" },
];

const countryOptions = [
  {
    label: "O‘zbekiston",
    value: "uzbekistan",
    currency: "uzs",
    capital: "Toshkent",
    phoneCode: "+998",
  },
  {
    label: "Qozog‘iston",
    value: "kazakhstan",
    currency: "kzt",
    capital: "Ostona",
    phoneCode: "+7",
  },
  {
    label: "Qirg‘iziston",
    value: "kyrgyzstan",
    currency: "kgs",
    capital: "Bishkek",
    phoneCode: "+996",
  },
  {
    label: "Tojikiston",
    value: "tajikistan",
    currency: "tjs",
    capital: "Dushanbe",
    phoneCode: "+992",
  },
  {
    label: "Turkmaniston",
    value: "turkmenistan",
    currency: "tmt",
    capital: "Ashxobod",
    phoneCode: "+993",
  },
  {
    label: "Turkiya",
    value: "turkey",
    currency: "try",
    capital: "Anqara",
    phoneCode: "+90",
  },
  {
    label: "Ozarbayjon",
    value: "azerbaijan",
    currency: "azn",
    capital: "Boku",
    phoneCode: "+994",
  },
  {
    label: "Gruziya",
    value: "georgia",
    currency: "gel",
    capital: "Tbilisi",
    phoneCode: "+995",
  },
  {
    label: "Xitoy",
    value: "china",
    currency: "cny",
    capital: "Pekin",
    phoneCode: "+86",
  },
  {
    label: "Janubiy Koreya",
    value: "south-korea",
    currency: "krw",
    capital: "Seul",
    phoneCode: "+82",
  },
  {
    label: "Yaponiya",
    value: "japan",
    currency: "jpy",
    capital: "Tokio",
    phoneCode: "+81",
  },
  {
    label: "Hindiston",
    value: "india",
    currency: "inr",
    capital: "Nyu-Dehli",
    phoneCode: "+91",
  },
  {
    label: "BAA",
    value: "uae",
    currency: "aed",
    capital: "Abu-Dabi",
    phoneCode: "+971",
  },
  {
    label: "Saudiya Arabistoni",
    value: "saudi-arabia",
    currency: "sar",
    capital: "Ar-Riyod",
    phoneCode: "+966",
  },
  {
    label: "Germaniya",
    value: "germany",
    currency: "eur",
    capital: "Berlin",
    phoneCode: "+49",
  },
  {
    label: "Fransiya",
    value: "france",
    currency: "eur",
    capital: "Parij",
    phoneCode: "+33",
  },
  {
    label: "Buyuk Britaniya",
    value: "united-kingdom",
    currency: "gbp",
    capital: "London",
    phoneCode: "+44",
  },
  {
    label: "Shveytsariya",
    value: "switzerland",
    currency: "chf",
    capital: "Bern",
    phoneCode: "+41",
  },
  {
    label: "Polsha",
    value: "poland",
    currency: "pln",
    capital: "Varshava",
    phoneCode: "+48",
  },
];

const currencyOptions = [
  { label: "UZS - O‘zbekiston so‘mi", value: "uzs" },
  { label: "USD - AQSH dollari", value: "usd" },
  { label: "KZT - Qozog‘iston tengesi", value: "kzt" },
  { label: "KGS - Qirg‘iziston somi", value: "kgs" },
  { label: "TJS - Tojikiston somonisi", value: "tjs" },
  { label: "TMT - Turkmaniston manati", value: "tmt" },
  { label: "TRY - Turkiya lirasi", value: "try" },
  { label: "AZN - Ozarbayjon manati", value: "azn" },
  { label: "GEL - Gruziya larisi", value: "gel" },
  { label: "CNY - Xitoy yuani", value: "cny" },
  { label: "KRW - Janubiy Koreya voni", value: "krw" },
  { label: "JPY - Yaponiya yenasi", value: "jpy" },
  { label: "INR - Hindiston rupiyasi", value: "inr" },
  { label: "AED - BAA dirhami", value: "aed" },
  { label: "SAR - Saudiya riyoli", value: "sar" },
  { label: "EUR - Yevro", value: "eur" },
  { label: "GBP - Britaniya funt sterlingi", value: "gbp" },
  { label: "CHF - Shveytsariya franki", value: "chf" },
  { label: "PLN - Polsha zlotysi", value: "pln" },
];

const setupItems = [
  "Company details",
  "Address",
  "Currency",
  "Tax info",
  "Logo",
  "AI presets",
];

export default function BusinessSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();
  // ✅ BACKEND INTEGRATION: PATCH /onboarding/business-setup
  const [setBusinessSetup, { isLoading }] = useSetBusinessSetupMutation();
  const glassFollowRef = useGlassFollow();
  const businessTypeId =
    location.state?.businessTypeId ||
    window.localStorage.getItem(selectedBusinessStorageKey);
  const selectedProfile = businessProfiles[businessTypeId];

  const industryOptions = useMemo(() => {
    if (!selectedProfile) return fallbackIndustryOptions;

    return selectedProfile.industries.map((industry) => ({
      label: industry,
      value: industry.toLowerCase().replace(/\s+/g, "-"),
    }));
  }, [selectedProfile]);

  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [formValues, setFormValues] = useState({
    companyName: "",
    city: "",
    address: "",
    phone: "",
  });
  const selectedCountry = useMemo(
    () => countryOptions.find((item) => item.value === country),
    [country],
  );

  const orderedCurrencyOptions = useMemo(() => {
    if (!currency) return currencyOptions;

    return [
      ...currencyOptions.filter((option) => option.value === currency),
      ...currencyOptions.filter((option) => option.value !== currency),
    ];
  }, [currency]);

  const handleInputChange = (field) => (event) => {
    setFormValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleCountryChange = (nextCountry) => {
    const nextSelectedCountry = countryOptions.find(
      (item) => item.value === nextCountry,
    );

    setCountry(nextCountry);
    setCurrency(nextSelectedCountry?.currency || "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredValues = [
      formValues.companyName,
      industry,
      country,
      formValues.city,
      formValues.address,
      formValues.phone,
      currency,
    ];

    const hasEmptyRequiredField = requiredValues.some(
      (item) => !String(item).trim(),
    );

    if (hasEmptyRequiredField) {
      notification.warning(
        "Majburiy maydonlarni to‘ldiring: kompaniya, soha, mamlakat, shahar, manzil, telefon va valyuta.",
      );
      return;
    }

    // ✅ BACKEND INTEGRATION: hammasi bazaga saqlanadi (tenants jadvali)
    try {
      await setBusinessSetup({
        companyName: formValues.companyName,
        industry,
        country,
        city: formValues.city,
        address: formValues.address,
        phone: formValues.phone,
        currency,
      }).unwrap();

      navigate("/pricing");
    } catch (err) {
      notification.error(getApiError(err).message);
    }
  };

  return (
    <main className="business-setup">
      <section className="business-setup__panel">
        <div className="business-setup__header">
          <span className="business-setup__step">3 / 5-qadam</span>

          <h1>Kompaniya ma’lumotlarini yakunlang.</h1>

          <p>
            Bu ma’lumotlar chek, hisobot, soliq va hujjatlarda ishlatiladi.
            Keyin ZENIX sizni to‘liq Dashboardga olib kiradi.
          </p>
        </div>

        <form className="business-setup__form" onSubmit={handleSubmit}>
          <div className="business-setup__group business-setup__group--full">
            <div className="business-setup__group-title">
              <Building2 size={18} />
              <div>
                <h3>Asosiy ma’lumotlar</h3>
                <p>Kompaniya nomi va faoliyat tasnifi.</p>
              </div>
            </div>

            <div className="business-setup__grid">
              <Input
                label="Kompaniya nomi"
                name="companyName"
                placeholder="Masalan: Zenix"
                value={formValues.companyName}
                onChange={handleInputChange("companyName")}
                leftIcon={<Building2 size={18} />}
              />

              <Dropdown
                label="Faoliyat sohasi"
                placeholder={
                  selectedProfile
                    ? `${selectedProfile.title} sohasini tanlang`
                    : "Sohani tanlang"
                }
                value={industry}
                onChange={setIndustry}
                options={industryOptions}
              />
            </div>
          </div>

          <div className="business-setup__group business-setup__group--full">
            <div className="business-setup__group-title">
              <MapPin size={18} />
              <div>
                <h3>Manzil va aloqa</h3>
                <p>Filial manzili, mamlakat va telefon.</p>
              </div>
            </div>

            <div className="business-setup__grid">
              <Dropdown
                label="Mamlakat"
                placeholder="Mamlakatni tanlang"
                value={country}
                onChange={handleCountryChange}
                options={countryOptions}
              />

              <Input
                label="Shahar"
                name="city"
                placeholder={selectedCountry?.capital || "Shaharni kiriting"}
                value={formValues.city}
                onChange={handleInputChange("city")}
                leftIcon={<Globe2 size={18} />}
              />

              <Input
                label="To‘liq manzil"
                name="address"
                placeholder="Tuman, ko‘cha, uy raqami"
                value={formValues.address}
                onChange={handleInputChange("address")}
                leftIcon={<MapPin size={18} />}
              />

              <Input
                label="Telefon"
                name="phone"
                type="tel"
                placeholder={selectedCountry?.phoneCode || "+998"}
                value={formValues.phone}
                onChange={handleInputChange("phone")}
                leftIcon={<Phone size={18} />}
              />
            </div>
          </div>

          <div className="business-setup__group">
            <div className="business-setup__group-title">
              <Wallet size={18} />
              <div>
                <h3>Moliyaviy</h3>
                <p>Valyuta va soliq ma’lumotlari.</p>
              </div>
            </div>

            <div className="business-setup__grid business-setup__grid--one">
              <Dropdown
                className="business-setup__dropdown--up"
                label="Valyuta"
                placeholder="Valyutani tanlang"
                value={currency}
                onChange={setCurrency}
                options={orderedCurrencyOptions}
              />

              <Input
                label="Soliq ID / STIR"
                name="taxId"
                placeholder="123456789"
                leftIcon={<FileText size={18} />}
              />
            </div>
          </div>

          <div className="business-setup__group">
            <div className="business-setup__group-title">
              <ImagePlus size={18} />
              <div>
                <h3>Brending</h3>
                <p>Logo chek va hujjatlarda chiqadi.</p>
              </div>
            </div>

            <label className="business-setup__upload">
              <ImagePlus size={24} />
              <strong>Logo yuklash</strong>
              <span>PNG yoki JPG, 5 MB gacha</span>
              <input type="file" accept="image/png,image/jpeg" />
            </label>
          </div>

          {/* ✅ BACKEND INTEGRATION: saqlash paytida tugma bloklanadi */}
          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            rightIcon={<ArrowRight size={18} />}
          >
            {isLoading ? "Saqlanmoqda..." : "Davom etish"}
          </Button>
        </form>
      </section>

      <aside className="business-setup__visual">
        <div className="business-setup__follow" ref={glassFollowRef}>
          <div className="business-setup__card">
            <div className="business-setup__card-top">
              <span>3 / 5-qadam</span>
              <strong>Ish maydonini sozlash</strong>
            </div>

            <div className="business-setup__progress">
              <div className="business-setup__progress-item business-setup__progress-item--done">
                <span>1</span>
                <p>Akkaunt</p>
              </div>

              <div className="business-setup__rope business-setup__rope--active" />

              <div className="business-setup__progress-item business-setup__progress-item--done">
                <span>2</span>
                <p>Biznes</p>
              </div>

              <div className="business-setup__rope business-setup__rope--active" />

              <div className="business-setup__progress-item business-setup__progress-item--active">
                <span>3</span>
                <p>Ish maydoni</p>
              </div>

              <div className="business-setup__rope" />

              <div className="business-setup__progress-item">
                <span>4</span>
                <p>Tariflar</p>
              </div>

              <div className="business-setup__rope" />

              <div className="business-setup__progress-item">
                <span>5</span>
                <p>AI tayyor</p>
              </div>
            </div>

            <div className="business-setup__preview">
              <span>ZENIX MOSLASHTIRADI</span>
              <h2>{selectedProfile?.title || "Business profile"}</h2>

              <div className="business-setup__list">
                {setupItems.map((item, index) => (
                  <div key={item} style={{ "--item-index": index }}>
                    <Check size={15} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="business-setup__ai">
              <Globe2 size={18} />
              <p>
                Mamlakat tanlanganda valyuta, soliq formati va hisobot sozlamalari
                avtomatik taklif qilinadi.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
