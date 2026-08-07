import { GlassSelect } from "@/components/ui";
import {
  AlertTriangle,
  Barcode,
  Check,
  FileText,
  ImagePlus,
  Layers3,
  PackageCheck,
  QrCode,
  Save,
  Settings2,
  Tag,
  UploadCloud,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useProductForm from "../../hooks/useProductForm";
import {
  calculateMargin,
  calculateMarkup,
  calculateProfit,
  createProductEntityId,
  formatMargin,
  formatMoney,
  labelProductStatus,
  toNumber,
} from "../../utils/productCalculations";

import "./ProductForm.scss";

const createSteps = [
  { id: "basic", label: "Asosiy", icon: PackageCheck },
  { id: "advanced", label: "Qo'shimcha", icon: Settings2 },
  { id: "review", label: "Tekshirish", icon: Check },
];

const integrationLabels = {
  pos: "Savdo nuqtasi",
  warehouse: "Ombor",
  crm: "Mijozlar",
  finance: "Moliya",
};

const changeLabels = {
  name: "Nomi",
  categoryId: "Kategoriya",
  unitId: "Birlik",
  price: "Sotuv narxi",
  cost: "Tannarx",
  sku: "SKU",
  barcode: "Shtrix-kod",
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
  approvalRequired = false,
}) => {
  const navigate = useNavigate();
  const mediaInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const form = useProductForm({ product, products, onSubmit });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const isEdit = mode === "edit";
  const activeStep = isEdit ? 0 : form.step;
  const currentStep = createSteps[activeStep];
  const CurrentStepIcon = currentStep.icon;
  const profit = calculateProfit(form.form.price, form.form.cost);
  const margin = calculateMargin(form.form.price, form.form.cost);
  const markup = calculateMarkup(form.form.price, form.form.cost);
  const errorEntries = Object.entries(form.errors).filter(([, message]) => Boolean(message));
  const costMissing = toNumber(form.form.cost) <= 0;
  const firstBarcode = form.form.barcodes?.[0] || "";

  const changedFields = useMemo(() => {
    if (!isEdit || !product) return [];
    const read = (source, key) => (key === "barcode" ? source.barcodes?.[0] || source.barcode || "" : source[key]);

    return Object.keys(changeLabels)
      .map((key) => ({
        key,
        label: changeLabels[key],
        before: read(product, key),
        after: read(form.form, key),
      }))
      .filter((item) => String(item.before ?? "") !== String(item.after ?? ""));
  }, [form.form, isEdit, product]);

  const basicComplete =
    String(form.form.name || "").trim().length >= 3 &&
    form.form.categoryId &&
    form.form.unitId &&
    toNumber(form.form.price) > 0 &&
    toNumber(form.form.cost) > 0;
  const maxUnlockedStep = basicComplete ? 2 : 0;
  const canShowAdvanced = isEdit || activeStep === 1;
  const canShowReview = isEdit || activeStep === 2;

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
    const brand = onCreateBrand({ name, code: name.slice(0, 3).toUpperCase(), manufacturer: name });
    if (brand?.id) form.actions.update("brandId", brand.id);
    setNewBrandName("");
  };

  const generateCodes = () => {
    const codes = onGenerateCodes({
      name: form.form.name,
      categoryId: form.form.categoryId,
      brandId: form.form.brandId,
    });
    form.actions.setForm((current) => ({
      ...current,
      sku: current.sku || codes.sku,
      barcodes: current.barcodes?.length ? current.barcodes : [codes.barcode],
      qrCode: current.qrCode || codes.qrCode,
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
      barcodes: (current.barcodes || []).length
        ? (current.barcodes || []).map((barcode, itemIndex) =>
            itemIndex === index ? value : barcode,
          )
        : [value],
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
          sku: `${current.sku || "SKU"}-V${(current.variants || []).length + 1}`,
          barcode: "",
          price: toNumber(current.price),
          cost: toNumber(current.cost),
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
        itemIndex === index
          ? {
              ...variant,
              [key]: ["price", "cost", "stock"].includes(key)
                ? value === "" ? "" : toNumber(value)
                : value,
            }
          : variant,
      ),
    }));
  };

  const addMedia = (kind, file) => {
    if (!file) return;
    const allowedTypes =
      kind === "media"
        ? ["image/png", "image/jpeg", "image/webp"]
        : ["application/pdf"];

    if (!allowedTypes.includes(file.type) || file.size > 8 * 1024 * 1024) {
      form.actions.setErrors({
        ...form.errors,
        media:
          kind === "media"
            ? "Rasm uchun faqat PNG, JPG yoki WEBP, 8MB gacha."
            : "Hujjat uchun faqat PDF, 8MB gacha.",
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
          primary: kind === "media" && !(current.media || []).length,
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

  const makePrimaryImage = (fileId) => {
    form.actions.setForm((current) => ({
      ...current,
      media: (current.media || []).map((file) => ({ ...file, primary: file.id === fileId })),
    }));
  };

  const save = (overrides = {}) => {
    const result = form.actions.submit(overrides);
    if (result?.ok) {
      navigate(`/products/${result.product.id}`);
    }
  };

  const saveAndActivate = () =>
    save({
      status: "active",
      approvalStatus: "approved",
      lifecycle: "active",
    });

  const submitForApproval = () =>
    save({
      status: "pending",
      approvalStatus: "pending",
      lifecycle: "review",
    });

  const renderStepBody = () => (
    <>
      {(isEdit || activeStep === 0) && (
        <section className="products-form-section">
          <div className="products-form-section__head">
            <span><PackageCheck size={13} /> Asosiy forma</span>
            <strong>Nom, kategoriya, birlik, tannarx, sotuv narxi va shtrix-kod</strong>
          </div>
          <div className="products-form-grid">
            <Field label="Mahsulot nomi" required error={form.errors.name}>
              <input value={form.form.name} onChange={(event) => form.actions.update("name", event.target.value)} />
            </Field>
            <Field label="Kategoriya" required error={form.errors.categoryId}>
              <GlassSelect value={form.form.categoryId} onChange={(event) => form.actions.update("categoryId", event.target.value)}>
                <option value="">Tanlang</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </GlassSelect>
            </Field>
            <Field label="O'lchov birligi" required error={form.errors.unitId}>
              <GlassSelect value={form.form.unitId} onChange={(event) => form.actions.update("unitId", event.target.value)}>
                <option value="">Tanlang</option>
                {units.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
              </GlassSelect>
            </Field>
            <Field label="Tannarx" required error={form.errors.cost}>
              <input type="number" min="0" value={form.form.cost} onChange={(event) => updateNumber("cost", event.target.value)} />
            </Field>
            <Field label="Sotuv narxi" required error={form.errors.price}>
              <input type="number" min="0" value={form.form.price} onChange={(event) => updateNumber("price", event.target.value)} />
            </Field>
            <Field label="Shtrix-kod" error={form.errors.barcodes}>
              <input value={firstBarcode} onChange={(event) => updateBarcode(0, event.target.value)} />
            </Field>
          </div>
          {costMissing && (
            <div className="products-form-warning" role="alert">
              <AlertTriangle size={16} />
              <span>Tannarx kiritilmaguncha mahsulot faollashmaydi va foyda hisoblanmaydi.</span>
            </div>
          )}
        </section>
      )}

      {canShowAdvanced && (
        <details className="products-form-section products-advanced-settings" open={isEdit}>
          <summary>
            <Settings2 size={15} />
            Qo'shimcha sozlamalar
          </summary>
          <div className="products-form-grid">
            <Field label="Brend / ishlab chiqaruvchi">
              <GlassSelect value={form.form.brandId} onChange={(event) => form.actions.update("brandId", event.target.value)}>
                <option value="">Tanlang</option>
                {brands.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.manufacturer || "Belgilanmagan"}</option>)}
              </GlassSelect>
              <div className="products-inline-create">
                <input
                  value={newBrandName}
                  placeholder="Yangi brend nomi"
                  onChange={(event) => setNewBrandName(event.target.value)}
                />
                <button type="button" className="products-mini-button" onClick={createInlineBrand}>
                  Qo'shish
                </button>
              </div>
            </Field>
            <Field label="Yangi kategoriya">
              <div className="products-inline-create">
                <input
                  value={newCategoryName}
                  placeholder="Yangi kategoriya nomi"
                  onChange={(event) => setNewCategoryName(event.target.value)}
                />
                <button type="button" className="products-mini-button" onClick={createInlineCategory}>
                  Qo'shish
                </button>
              </div>
            </Field>
            <Field label="Mahsulot turi">
              <GlassSelect value={form.form.type} onChange={(event) => form.actions.update("type", event.target.value)}>
                <option value="simple">Oddiy</option>
                <option value="variant">Variantli</option>
                <option value="bundle">To'plam</option>
                <option value="composite">Tarkibli</option>
              </GlassSelect>
            </Field>
            <Field label="Holat oqimi">
              <GlassSelect value={form.form.lifecycle} onChange={(event) => form.actions.update("lifecycle", event.target.value)}>
                <option value="draft">Qoralama</option>
                <option value="review">Tasdiq kutmoqda</option>
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
                <option value="archived">Arxiv</option>
              </GlassSelect>
            </Field>
            <Field label="SKU" error={form.errors.sku}>
              <input value={form.form.sku} onChange={(event) => form.actions.update("sku", event.target.value)} />
            </Field>
            <Field label="Ichki kod">
              <input value={form.form.internalCode} onChange={(event) => form.actions.update("internalCode", event.target.value)} />
            </Field>
            <Field label="Eng past narx" error={form.errors.minPrice}>
              <input type="number" min="0" value={form.form.minPrice} onChange={(event) => updateNumber("minPrice", event.target.value)} />
            </Field>
            <Field label="Soliq %">
              <input type="number" min="0" value={form.form.taxRate} onChange={(event) => updateNumber("taxRate", event.target.value)} />
            </Field>
            <Field label="Belgilar">
              <input value={(form.form.tags || []).join(", ")} onChange={(event) => form.actions.update("tags", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} />
            </Field>
            <Field label="Tavsif" wide>
              <textarea value={form.form.description} onChange={(event) => form.actions.update("description", event.target.value)} />
            </Field>
          </div>

          <div className="products-code-box">
            <div className="products-form-section__head">
              <span><Barcode size={13} /> SKU, shtrix-kod va QR</span>
              <strong>Bir mahsulotga bir nechta shtrix-kod qo'shish mumkin</strong>
            </div>
            <div className="products-code-box__actions">
              <button type="button" className="products-button is-primary" onClick={generateCodes}>
                <QrCode size={15} />
                Kodlarni yaratish
              </button>
              <button type="button" className="products-mini-button" onClick={addBarcode}>Shtrix-kod qo'shish</button>
            </div>
            {(form.form.barcodes || []).map((barcode, index) => (
              <input
                key={`${barcode}-${index}`}
                value={barcode}
                placeholder={`Shtrix-kod ${index + 1}`}
                onChange={(event) => updateBarcode(index, event.target.value)}
              />
            ))}
            <div className="products-qr-preview">
              <QrCode size={42} />
              <div>
                <strong>{form.form.qrCode || "QR hali yaratilmagan"}</strong>
                <span>Preview, nusxalash va chop etish uchun tayyor maydon</span>
              </div>
              <button type="button" className="products-mini-button" onClick={() => navigator.clipboard?.writeText(form.form.qrCode || "")}>
                Nusxalash
              </button>
            </div>
          </div>

          <div className="products-variant-matrix">
            <div className="products-form-section__head">
              <span><Layers3 size={13} /> Variantlar</span>
              <strong>Oddiy mahsulotda ixtiyoriy, variantli mahsulotda alohida SKU/narx/qoldiq</strong>
            </div>
            <button type="button" className="products-mini-button is-primary" onClick={addVariant}>Variant qo'shish</button>
            {form.errors.variants && <small>{form.errors.variants}</small>}
            {(form.form.variants || []).map((variant, index) => (
              <article key={variant.id}>
                <input value={variant.combination} placeholder="Atributlar" onChange={(event) => updateVariant(index, "combination", event.target.value)} aria-label="Variant atributlari" />
                <input value={variant.sku} placeholder="SKU" onChange={(event) => updateVariant(index, "sku", event.target.value)} aria-label="Variant SKU" />
                <input value={variant.barcode} placeholder="Shtrix-kod" onChange={(event) => updateVariant(index, "barcode", event.target.value)} aria-label="Variant shtrix-kodi" />
                <input type="number" value={variant.price} placeholder="Narx" onChange={(event) => updateVariant(index, "price", event.target.value)} aria-label="Variant narxi" />
                <input type="number" value={variant.cost} placeholder="Tannarx" onChange={(event) => updateVariant(index, "cost", event.target.value)} aria-label="Variant tannarxi" />
                <input type="number" value={variant.stock} placeholder="Qoldiq" onChange={(event) => updateVariant(index, "stock", event.target.value)} aria-label="Variant qoldig'i" />
              </article>
            ))}
          </div>

          <div className="products-media-drop" onDrop={(event) => { event.preventDefault(); addMedia("media", event.dataTransfer.files?.[0]); }} onDragOver={(event) => event.preventDefault()}>
            <UploadCloud size={28} />
            <strong>Rasm yuklash</strong>
            <span>Drag-and-drop yoki tugma orqali PNG, JPG, WEBP rasm yuklang. PDF hujjatlar alohida saqlanadi.</span>
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
              accept="application/pdf"
              className="products-file-input"
              onChange={(event) => addMedia("documents", event.target.files?.[0])}
            />
            <div>
              <button type="button" className="products-mini-button" onClick={() => mediaInputRef.current?.click()}>
                <ImagePlus size={14} />
                Rasm qo'shish
              </button>
              <button type="button" className="products-mini-button" onClick={() => documentInputRef.current?.click()}>
                <FileText size={14} />
                Hujjat qo'shish
              </button>
            </div>
          </div>
          <div className="products-media-list">
            {(form.form.media || []).map((file) => (
              <article className="products-mini-card" key={file.id}>
                <strong>{file.name}</strong>
                <span>{file.primary ? "Asosiy rasm" : "Qo'shimcha rasm"} - {Math.round(file.size / 1024)} KB</span>
                <div className="products-row-actions products-row-actions--text">
                  <button type="button" onClick={() => makePrimaryImage(file.id)}>Asosiy qilish</button>
                  <button type="button" onClick={() => removeFile("media", file.id)}>Olib tashlash</button>
                </div>
              </article>
            ))}
            {(form.form.documents || []).map((file) => (
              <article className="products-mini-card" key={file.id}>
                <strong>{file.name}</strong>
                <span>PDF hujjat - {Math.round(file.size / 1024)} KB</span>
                <button type="button" className="products-mini-button" onClick={() => removeFile("documents", file.id)}>Olib tashlash</button>
              </article>
            ))}
          </div>

          <div className="products-form-grid">
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
            <Field label="Bog'langan mahsulotlar">
              <GlassSelect
                value=""
                onChange={(event) =>
                  form.actions.update("relations", [...new Set([...(form.form.relations || []), event.target.value])].filter(Boolean))
                }
              >
                <option value="">Mahsulot tanlang</option>
                {allProducts.filter((item) => item.id !== form.form.id).map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </GlassSelect>
            </Field>
          </div>
        </details>
      )}

      {canShowReview && (
        <section className="products-form-section">
          <div className="products-form-section__head">
            <span><Tag size={13} /> Tekshirish</span>
            <strong>Saqlashdan oldingi foyda va holat</strong>
          </div>
          <div className="products-preview">
            <h3>{form.form.name || "Yangi mahsulot"}</h3>
            <p>{form.form.description || "Tavsif kiritilmagan."}</p>
            <div className="products-mini-grid">
              <article><strong>{form.form.sku || "Avto"}</strong><span>SKU</span></article>
              <article><strong>{firstBarcode || "Belgilanmagan"}</strong><span>Shtrix-kod</span></article>
              <article><strong>{formatMoney(form.form.price)}</strong><span>Sotuv narxi</span></article>
              <article><strong>{formatMoney(form.form.cost)}</strong><span>Tannarx</span></article>
              <article><strong>{formatMoney(profit)}</strong><span>Foyda</span></article>
              <article><strong>{formatMargin(margin)}</strong><span>Marja</span></article>
              <article><strong>{Math.round(markup)}%</strong><span>Ustama</span></article>
              <article><strong>{labelProductStatus(form.form.approvalStatus)}</strong><span>Tasdiq</span></article>
            </div>
          </div>
        </section>
      )}
    </>
  );

  return (
    <section className={`products-form-shell ${isEdit ? "is-edit" : ""}`}>
      {!isEdit && (
        <aside className="products-form-stepper" aria-label="Mahsulot formasi bosqichlari">
          {createSteps.map((step, index) => {
            const Icon = step.icon;
            const hasError =
              (index === 0 && ["name", "categoryId", "unitId", "price", "cost", "barcodes"].some((key) => form.errors[key])) ||
              (index === 1 && ["sku", "minPrice", "variants", "media"].some((key) => form.errors[key]));

            return (
              <button
                type="button"
                key={step.id}
                className={`${activeStep === index ? "is-active" : ""} ${hasError ? "has-error" : ""} ${index <= maxUnlockedStep ? "is-complete" : ""}`}
                aria-selected={activeStep === index}
                disabled={index > maxUnlockedStep}
                onClick={() => form.actions.setStep(index)}
              >
                <Icon size={16} />
                <span>{step.label}</span>
              </button>
            );
          })}
        </aside>
      )}

      <section className="products-panel products-form">
        <div className="products-panel__head">
          <div>
            <span>
              <CurrentStepIcon size={13} />
              {isEdit ? "Mahsulotni tahrirlash" : "Mahsulot yaratish"}
            </span>
            <h2>{isEdit ? "Ixcham tahrirlash" : currentStep.label}</h2>
          </div>
          <div className="products-form__status">
            {form.dirty && <span>Saqlanmagan o'zgarishlar</span>}
            <button type="button" className="products-mini-button" disabled={form.isSubmitting} onClick={form.actions.saveDraft}>
              <Save size={14} />
              Qoralama
            </button>
          </div>
        </div>

        {errorEntries.length > 0 && (
          <div className="products-form-errors" role="alert">
            <strong>Saqlashdan oldin tekshiring</strong>
            {errorEntries.map(([key, message]) => (
              <span key={key}>{message}</span>
            ))}
          </div>
        )}

        {renderStepBody()}

        {isEdit && changedFields.length > 0 && (
          <div className="products-change-summary">
            <strong>O'zgarayotgan qiymatlar</strong>
            {changedFields.map((item) => (
              <span key={item.key}>
                {item.label}: {String(item.before || "Belgilanmagan")} {" -> "} {String(item.after || "Belgilanmagan")}
              </span>
            ))}
          </div>
        )}

        <footer className="products-form__footer">
          <button type="button" className="products-mini-button" onClick={() => navigate(-1)}>
            Bekor qilish
          </button>
          {!isEdit && activeStep > 0 && (
            <button type="button" className="products-mini-button" onClick={() => form.actions.setStep(activeStep - 1)}>
              Orqaga
            </button>
          )}
          {!isEdit && activeStep < createSteps.length - 1 ? (
            <button type="button" className="products-mini-button is-primary" disabled={activeStep + 1 > maxUnlockedStep} onClick={() => form.actions.setStep(activeStep + 1)}>
              Keyingi
            </button>
          ) : (
            <>
              <button type="button" className="products-mini-button" disabled={form.isSubmitting} onClick={() => save({ status: "draft", approvalStatus: "draft", lifecycle: "draft" })}>
                <Save size={15} />
                Qoralama saqlash
              </button>
              {approvalRequired ? (
                <button type="button" className="products-mini-button is-primary" disabled={form.isSubmitting} onClick={submitForApproval}>
                  <Check size={15} />
                  Tasdiqqa yuborish
                </button>
              ) : (
                <button type="button" className="products-mini-button is-primary" disabled={form.isSubmitting} onClick={saveAndActivate}>
                  <Check size={15} />
                  {isEdit ? "O'zgarishlarni saqlash" : "Saqlash va faollashtirish"}
                </button>
              )}
            </>
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
