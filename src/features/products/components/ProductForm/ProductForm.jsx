import {
  Barcode,
  Boxes,
  Check,
  ImagePlus,
  Layers3,
  PackageCheck,
  QrCode,
  Save,
  Sparkles,
  Tag,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useProductForm from "../../hooks/useProductForm";
import {
  calculateMargin,
  calculateMarkup,
  calculateProfit,
  createProductEntityId,
  formatMoney,
  labelProductStatus,
  toNumber,
} from "../../utils/productCalculations";

import "./ProductForm.scss";

const steps = [
  { id: "basic", label: "Asosiy", icon: PackageCheck },
  { id: "taxonomy", label: "Kategoriya", icon: Tag },
  { id: "codes", label: "Artikul / shtrix-kod", icon: Barcode },
  { id: "pricing", label: "Narx", icon: Sparkles },
  { id: "variants", label: "Variant", icon: Layers3 },
  { id: "media", label: "Rasm va fayl", icon: ImagePlus },
  { id: "integrations", label: "Ko'rib chiqish", icon: Boxes },
];

const integrationLabels = {
  pos: "Savdo nuqtasi",
  warehouse: "Ombor",
  crm: "Mijozlar",
  finance: "Moliya",
};

const ProductForm = ({
  mode = "create",
  product,
  products,
  categories,
  brands,
  units,
  allProducts,
  onSubmit,
  onGenerateCodes,
  onCreateCategory,
  onCreateBrand,
}) => {
  const navigate = useNavigate();
  const mediaInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const form = useProductForm({ product, products, onSubmit });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const currentStep = steps[form.step];
  const CurrentStepIcon = currentStep.icon;
  const profit = calculateProfit(form.form.price, form.form.cost);
  const margin = calculateMargin(form.form.price, form.form.cost);
  const markup = calculateMarkup(form.form.price, form.form.cost);
  const errorEntries = Object.entries(form.errors).filter(([, message]) => Boolean(message));

  const requiredByStep = [
    ["name"],
    ["categoryId", "unitId"],
    ["sku"],
    ["price"],
    [],
    [],
    [],
  ];
  const isStepComplete = (index) =>
    requiredByStep[index].every((key) => {
      const value = form.form[key];
      if (key === "price") return toNumber(value) > 0;
      return String(value || "").trim();
    });
  const maxUnlockedStep = requiredByStep.reduce(
    (max, _fields, index) => (index === max && isStepComplete(index) ? max + 1 : max),
    0,
  );
  const goToStep = (index) => {
    if (index <= maxUnlockedStep) form.actions.setStep(index);
  };

  const updateNumber = (key, value) => form.actions.update(key, value === "" ? "" : toNumber(value));

  const createInlineCategory = () => {
    const name = newCategoryName.trim();
    if (!name || typeof onCreateCategory !== "function") return;
    const category = onCreateCategory({ name, code: name.slice(0, 3).toUpperCase() });
    if (category?.id) form.actions.update("categoryId", category.id);
    setNewCategoryName("");
  };

  const createInlineBrand = () => {
    const name = newBrandName.trim();
    if (!name || typeof onCreateBrand !== "function") return;
    const brand = onCreateBrand({ name, manufacturer: name });
    if (brand?.id) form.actions.update("brandId", brand.id);
    setNewBrandName("");
  };

  const generateCodes = () => {
    const hasExistingCode = form.form.sku || form.form.barcodes?.some(Boolean) || form.form.qrCode;
    const canReplace =
      !hasExistingCode ||
      typeof window === "undefined" ||
      window.confirm("Mavjud artikul, shtrix-kod yoki QR almashtirilsinmi?");

    if (!canReplace) return;

    const codes = onGenerateCodes({
      name: form.form.name,
      categoryId: form.form.categoryId,
      brandId: form.form.brandId,
    });
    form.actions.setForm((current) => ({
      ...current,
      sku: codes.sku,
      barcodes: [codes.barcode, ...(current.barcodes || []).slice(1)],
      qrCode: codes.qrCode,
    }));
  };

  const addBarcode = () => {
    form.actions.setForm((current) => ({
      ...current,
      barcodes: [...(current.barcodes || []), ""],
    }));
  };

  const updateBarcode = (index, value) => {
    form.actions.setForm((current) => ({
      ...current,
      barcodes: (current.barcodes || []).map((barcode, itemIndex) =>
        itemIndex === index ? value : barcode,
      ),
    }));
  };

  const addVariant = () => {
    form.actions.setForm((current) => ({
      ...current,
      variants: [
        ...(current.variants || []),
        {
          id: createProductEntityId("var"),
          combination: "",
          sku: `${current.sku || "ART"}-V${(current.variants || []).length + 1}`,
          barcode: "",
          price: toNumber(current.price),
          stock: 0,
          status: "draft",
        },
      ],
    }));
  };

  const updateVariant = (index, key, value) => {
    form.actions.setForm((current) => ({
      ...current,
      variants: (current.variants || []).map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, [key]: key === "price" || key === "stock" ? (value === "" ? "" : toNumber(value)) : value } : variant,
      ),
    }));
  };

  const addMedia = (kind, file) => {
    if (!file) return;
    const allowedTypes =
      kind === "media"
        ? ["image/png", "image/jpeg", "image/webp"]
        : ["application/pdf", "image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type) || file.size > 8 * 1024 * 1024) {
      form.actions.setErrors({
        ...form.errors,
        media: "Fayl turi yoki hajmi noto'g'ri. 8MB gacha PNG, JPG, WEBP yoki PDF tanlang.",
      });
      return;
    }

    form.actions.setErrors({ ...form.errors, media: "" });
    form.actions.setForm((current) => ({
      ...current,
      [kind]: [
        ...(current[kind] || []),
        {
          id: createProductEntityId(kind),
          name: file.name,
          type: file.type,
          size: file.size,
        },
      ],
    }));
  };

  const removeFile = (kind, fileId) => {
    form.actions.setForm((current) => ({
      ...current,
      [kind]: (current[kind] || []).filter((file) => file.id !== fileId),
    }));
  };

  const save = () => {
    const result = form.actions.submit();
    if (result?.ok) {
      navigate(`/products/${result.product.id}`);
    }
  };

  return (
    <section className="products-form-shell">
      <aside className="products-form-stepper" aria-label="Mahsulot formasi bosqichlari">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <button
              type="button"
              key={step.id}
              className={form.step === index ? "is-active" : ""}
              aria-selected={form.step === index}
              disabled={index > maxUnlockedStep}
              onClick={() => goToStep(index)}
            >
              <Icon size={16} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </aside>

      <section className="products-panel products-form">
        <div className="products-panel__head">
          <div>
            <span>
              <CurrentStepIcon size={13} />
              {mode === "edit" ? "Mahsulotni tahrirlash" : "Mahsulot yaratish"}
            </span>
            <h2>{currentStep.label}</h2>
          </div>
          <div className="products-form__status">
            {form.dirty && <span>Saqlanmagan o'zgarishlar</span>}
            <button type="button" className="products-mini-button" onClick={form.actions.saveDraft}>
              <Save size={14} />
              Qoralama
            </button>
          </div>
        </div>

        {errorEntries.length > 0 && (
          <div className="products-form-errors" role="alert">
            <strong>Saqlashdan oldin tekshiring</strong>
            {errorEntries.map(([key, message]) => (
              <button type="button" key={key} onClick={() => form.actions.setErrors({ ...form.errors, [key]: message })}>
                {message}
              </button>
            ))}
          </div>
        )}

        {form.step === 0 && (
          <div className="products-form-grid">
            <Field label="Nomi" required error={form.errors.name}>
              <input value={form.form.name} onChange={(event) => form.actions.update("name", event.target.value)} />
            </Field>
            <Field label="Hayot sikli">
              <select value={form.form.lifecycle} onChange={(event) => form.actions.update("lifecycle", event.target.value)}>
                <option value="draft">Qoralama</option>
                <option value="active">Faol</option>
                <option value="growth">O'sish</option>
                <option value="mature">Barqaror</option>
                <option value="phase-out">Bosqichma-bosqich chiqarish</option>
              </select>
            </Field>
            <Field label="Mahsulot turi">
              <select value={form.form.type} onChange={(event) => form.actions.update("type", event.target.value)}>
                <option value="simple">Oddiy</option>
                <option value="variant">Variantli</option>
                <option value="bundle">To'plam</option>
                <option value="composite">Tarkibli</option>
              </select>
            </Field>
            <Field label="Tavsif" wide>
              <textarea value={form.form.description} onChange={(event) => form.actions.update("description", event.target.value)} />
            </Field>
          </div>
        )}

        {form.step === 1 && (
          <div className="products-form-grid">
            <Field label="Kategoriya" required error={form.errors.categoryId}>
              <select value={form.form.categoryId} onChange={(event) => form.actions.update("categoryId", event.target.value)}>
                <option value="">Tanlang</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <div className="products-inline-create">
                <input
                  value={newCategoryName}
                  placeholder="Yangi kategoriya nomi"
                  onChange={(event) => setNewCategoryName(event.target.value)}
                />
                <button type="button" className="products-mini-button" onClick={createInlineCategory}>
                  + Qo'shish
                </button>
              </div>
            </Field>
            <Field label="Brend / ishlab chiqaruvchi">
              <select value={form.form.brandId} onChange={(event) => form.actions.update("brandId", event.target.value)}>
                <option value="">Tanlang</option>
                {brands.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.manufacturer}</option>)}
              </select>
              <div className="products-inline-create">
                <input
                  value={newBrandName}
                  placeholder="Yangi brend nomi"
                  onChange={(event) => setNewBrandName(event.target.value)}
                />
                <button type="button" className="products-mini-button" onClick={createInlineBrand}>
                  + Qo'shish
                </button>
              </div>
            </Field>
            <Field label="O'lchov birligi" required error={form.errors.unitId}>
              <select value={form.form.unitId} onChange={(event) => form.actions.update("unitId", event.target.value)}>
                <option value="">Tanlang</option>
                {units.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
              </select>
            </Field>
            <Field label="Belgilar">
              <input value={(form.form.tags || []).join(", ")} onChange={(event) => form.actions.update("tags", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} />
            </Field>
          </div>
        )}

        {form.step === 2 && (
          <div className="products-form-grid">
            <Field label="Artikul" required error={form.errors.sku}>
              <input value={form.form.sku} onChange={(event) => form.actions.update("sku", event.target.value)} />
            </Field>
            <Field label="Ichki kod">
              <input value={form.form.internalCode} onChange={(event) => form.actions.update("internalCode", event.target.value)} />
            </Field>
            <Field label="QR">
              <input value={form.form.qrCode} onChange={(event) => form.actions.update("qrCode", event.target.value)} />
            </Field>
            <div className="products-form-grid__wide products-code-box">
              <button type="button" className="products-button is-primary" onClick={generateCodes}>
                <QrCode size={15} />
                Artikul / shtrix-kod / QR yaratish
              </button>
              <button type="button" className="products-mini-button" onClick={addBarcode}>Shtrix-kod qo'shish</button>
              {form.errors.barcodes && <small>{form.errors.barcodes}</small>}
              {(form.form.barcodes || []).map((barcode, index) => (
                <input
                  key={`${barcode}-${index}`}
                  value={barcode}
                  placeholder="Shtrix-kod"
                  onChange={(event) => updateBarcode(index, event.target.value)}
                />
              ))}
            </div>
          </div>
        )}

        {form.step === 3 && (
          <div className="products-form-grid">
            <Field label="Sotuv narxi" required error={form.errors.price}>
              <input type="number" value={form.form.price} onChange={(event) => updateNumber("price", event.target.value)} />
            </Field>
            <Field label="Tannarx">
              <input type="number" value={form.form.cost} onChange={(event) => updateNumber("cost", event.target.value)} />
            </Field>
            <Field label="Eng past narx" error={form.errors.minPrice}>
              <input type="number" value={form.form.minPrice} onChange={(event) => updateNumber("minPrice", event.target.value)} />
            </Field>
            <Field label="Soliq %">
              <input type="number" value={form.form.taxRate} onChange={(event) => updateNumber("taxRate", event.target.value)} />
            </Field>
            <div className="products-mini-grid products-form-grid__wide">
              <article><strong>{formatMoney(profit)}</strong><span>Foyda</span></article>
              <article><strong>{Math.round(margin)}%</strong><span>Marja</span></article>
              <article><strong>{Math.round(markup)}%</strong><span>Ustama</span></article>
              <article><strong>{labelProductStatus(form.form.approvalStatus)}</strong><span>Tasdiq</span></article>
            </div>
          </div>
        )}

        {form.step === 4 && (
          <div className="products-form-grid">
            <Field label="Rang">
              <input value={form.form.attributes?.color || ""} onChange={(event) => form.actions.updateNested("attributes", "color", event.target.value)} />
            </Field>
            <Field label="O'lcham / Xotira">
              <input value={form.form.attributes?.memory || form.form.attributes?.size || ""} onChange={(event) => form.actions.updateNested("attributes", "memory", event.target.value)} />
            </Field>
            <Field label="Material">
              <input value={form.form.attributes?.material || ""} onChange={(event) => form.actions.updateNested("attributes", "material", event.target.value)} />
            </Field>
            <div className="products-form-grid__wide products-variant-matrix">
              <button type="button" className="products-mini-button is-primary" onClick={addVariant}>Variant qo'shish</button>
              {form.errors.variants && <small>{form.errors.variants}</small>}
              {(form.form.variants || []).map((variant, index) => (
                <article key={variant.id}>
                  <input value={variant.combination} onChange={(event) => updateVariant(index, "combination", event.target.value)} aria-label="Variant birikmasi" />
                  <input value={variant.sku} onChange={(event) => updateVariant(index, "sku", event.target.value)} aria-label="Variant artikuli" />
                  <input value={variant.barcode} onChange={(event) => updateVariant(index, "barcode", event.target.value)} aria-label="Variant shtrix-kodi" />
                  <input type="number" value={variant.price} onChange={(event) => updateVariant(index, "price", event.target.value)} aria-label="Variant narxi" />
                  <input type="number" value={variant.stock} onChange={(event) => updateVariant(index, "stock", event.target.value)} aria-label="Variant qoldig'i" />
                </article>
              ))}
            </div>
          </div>
        )}

        {form.step === 5 && (
          <div className="products-form-grid">
            <div className="products-form-grid__wide products-media-drop">
              <ImagePlus size={28} />
              <strong>Rasm va fayl yuklash namoyishi</strong>
              <span>PNG, JPG, WEBP va PDF. Hajm 8MB dan oshmasligi kerak.</span>
              {form.errors.media && <small>{form.errors.media}</small>}
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="products-file-input"
                onChange={(event) => addMedia("media", event.target.files?.[0])}
              />
              <input
                ref={documentInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="products-file-input"
                onChange={(event) => addMedia("documents", event.target.files?.[0])}
              />
              <div>
                <button type="button" className="products-mini-button" onClick={() => mediaInputRef.current?.click()}>Rasm qo'shish</button>
                <button type="button" className="products-mini-button" onClick={() => documentInputRef.current?.click()}>Hujjat qo'shish</button>
              </div>
            </div>
            {(form.form.media || []).map((file) => (
              <article className="products-mini-card" key={file.id}>
                <strong>{file.name}</strong>
                <span>{file.type}</span>
                <span>{Math.round(file.size / 1024)} KB</span>
                <button type="button" className="products-mini-button" onClick={() => removeFile("media", file.id)}>Olib tashlash</button>
              </article>
            ))}
            {(form.form.documents || []).map((file) => (
              <article className="products-mini-card" key={file.id}>
                <strong>{file.name}</strong>
                <span>{file.type}</span>
                <span>{Math.round(file.size / 1024)} KB</span>
                <button type="button" className="products-mini-button" onClick={() => removeFile("documents", file.id)}>Olib tashlash</button>
              </article>
            ))}
          </div>
        )}

        {form.step === 6 && (
          <div className="products-form-grid">
            <Field label="Bog'langan mahsulotlar">
              <select
                value=""
                onChange={(event) =>
                  form.actions.update("relations", [...new Set([...(form.form.relations || []), event.target.value])].filter(Boolean))
                }
              >
                <option value="">Mahsulot tanlang</option>
                {allProducts.filter((item) => item.id !== form.form.id).map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </Field>
            {["pos", "warehouse", "crm", "finance"].map((key) => (
              <label className="products-toggle" key={key}>
                <input
                  type="checkbox"
                  checked={Boolean(form.form.integrations?.[key])}
                  onChange={(event) => form.actions.updateNested("integrations", key, event.target.checked)}
                />
                <span>{integrationLabels[key]}</span>
              </label>
            ))}
            <div className="products-preview products-form-grid__wide">
              <span className="products-eyebrow">Ko'rib chiqish va saqlash</span>
              <h3>{form.form.name || "Yangi mahsulot"}</h3>
              <p>{form.form.description || "Tavsif kiritilmagan."}</p>
              <div className="products-mini-grid">
                <article><strong>{form.form.sku || "-"}</strong><span>Artikul</span></article>
                <article><strong>{form.form.barcodes?.[0] || "-"}</strong><span>Shtrix-kod</span></article>
                <article><strong>{formatMoney(form.form.price)}</strong><span>Narx</span></article>
                <article><strong>{form.form.relations?.length || 0}</strong><span>Bog'lanishlar</span></article>
              </div>
            </div>
          </div>
        )}

        <footer className="products-form__footer">
          <button type="button" className="products-mini-button" disabled={form.step === 0} onClick={() => form.actions.setStep(form.step - 1)}>
            Orqaga
          </button>
          {form.step < steps.length - 1 ? (
            <button type="button" className="products-mini-button is-primary" disabled={form.step + 1 > maxUnlockedStep} onClick={() => goToStep(form.step + 1)}>
              Keyingi
            </button>
          ) : (
            <button type="button" className="products-mini-button is-primary" onClick={save}>
              <Check size={15} />
              Saqlash
            </button>
          )}
        </footer>
      </section>
    </section>
  );
};

const Field = ({ label, required = false, error, wide = false, children }) => (
  <label className={wide ? "products-form-grid__wide" : ""}>
    <span>{label}{required ? " *" : ""}</span>
    {children}
    {error && <small>{error}</small>}
  </label>
);

export default ProductForm;
