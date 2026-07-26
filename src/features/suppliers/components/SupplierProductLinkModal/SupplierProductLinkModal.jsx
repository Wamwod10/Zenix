// ERP arxitektura tuzatishi: bu modal FAQAT "mavjud katalog mahsulotini
// shu supplierga bog'lash" (Vendor/Supplier Price List yozuvi) uchun —
// "Yangi mahsulot yaratish" bilan ARALASHTIRILMAYDI (bu ikkinchisi butunlay
// alohida SupplierProductCreateModal orqali amalga oshiriladi). Shu sabab
// bu yerda faqat: mahsulot qidirish/tanlash + SHU SUPPLIERGA xos tijorat
// shartlari (narx, muddat, MOQ, SKU, izoh) bor — mahsulotning o'zini
// tavsiflovchi maydonlar (nomi, birligi, valyutasi va h.k.) YO'Q, chunki
// ular mahsulot allaqachon yaratilganda belgilangan.
//
// Bog'lanish mavjud arxitekturadan foydalanadi (`supplier.productIds` —
// xuddi shu massivni PurchaseOrderWizard ham o'qiydi), tijorat shartlari
// esa `supplier.productOverrides` (productId -> shart) ichida saqlanadi —
// mahsulot katalogini dublikatsiya qilmaydi.

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "../../../../components/ui/Button/Button";
import { Dropdown } from "../../../../components/ui/Dropdown/Dropdown";
import { Input } from "../../../../components/ui/Input/Input";
import { Modal } from "../../../../components/ui/Modal/Modal";

import "./SupplierProductLinkModal.scss";

const buildEmptyForm = () => ({
  productId: "",
  sku: "",
  price: "",
  leadTimeDays: "",
  moq: "",
  notes: "",
});

const SupplierProductLinkModal = ({
  open,
  products = [],
  linkedProductIds = [],
  onClose,
  onLink,
}) => {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(buildEmptyForm);
  const [error, setError] = useState("");

  // Har safar modal qayta ochilganda forma tozalanadi — oldingi
  // bog'langan mahsulot qoldig'i qolib ketmasligi uchun.
  useEffect(() => {
    if (open) {
      setForm(buildEmptyForm());
      setSearch("");
      setError("");
    }
  }, [open]);

  // Faqat HALI bog'lanmagan mahsulotlar tanlash uchun ko'rsatiladi —
  // aks holda bir xil mahsulot ikki marta bog'lanishi mumkin edi.
  const linkableProducts = useMemo(
    () => products.filter((product) => !linkedProductIds.includes(product.id)),
    [products, linkedProductIds],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return linkableProducts;

    return linkableProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query),
    );
  }, [linkableProducts, search]);

  const selectedProduct = linkableProducts.find(
    (product) => product.id === form.productId,
  );

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  // Mahsulot tanlanganda — supplier SKU va narx katalog standartidan
  // AVTOMATIK to'ldiriladi (boshlang'ich taklif sifatida), foydalanuvchi
  // keyin shu supplierга xos qiymat bilan almashtirishi mumkin (masalan
  // boshqa kelishilgan narx yoki supplier o'z SKU kodini ishlatsa).
  const handleSelectProduct = (productId) => {
    const product = linkableProducts.find((entry) => entry.id === productId);

    setForm((current) => ({
      ...current,
      productId,
      sku: product?.sku || "",
      price: product?.lastPrice ? String(product.lastPrice) : "",
      moq: product?.moq ? String(product.moq) : "",
    }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.productId) {
      setError("Mahsulotni tanlang");
      return;
    }

    const price = Number(form.price);

    if (!price || price <= 0) {
      setError("Supplier xarid narxini kiriting");
      return;
    }

    const moq = Number(form.moq) || 1;
    const leadTimeDays = form.leadTimeDays ? Number(form.leadTimeDays) : undefined;

    onLink?.({
      productId: form.productId,
      sku: form.sku.trim() || selectedProduct?.sku || "",
      price,
      leadTimeDays,
      moq,
      notes: form.notes.trim(),
    });
  };

  return (
    <Modal
      open={open}
      title="Mavjud mahsulotni bog'lash"
      description="Product katalogidan mavjud mahsulotni tanlang va ushbu yetkazib beruvchiga xos xarid shartlarini kiriting. Yangi mahsulot bu yerda yaratilmaydi."
      onClose={onClose}
    >
      <form className="supplier-product-link" onSubmit={handleSubmit}>
        <Input
          label="Mahsulot qidirish"
          placeholder="Nomi, SKU yoki shtrix-kod..."
          leftIcon={<Search size={15} />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Dropdown
          label="Mahsulot tanlash"
          placeholder={
            filteredProducts.length
              ? "Mahsulotni tanlang..."
              : "Mos mahsulot topilmadi"
          }
          value={form.productId}
          options={filteredProducts.map((product) => ({
            value: product.id,
            label: `${product.name} · ${product.sku}`,
          }))}
          onChange={handleSelectProduct}
        />

        <div className="supplier-product-link__grid">
          <Input
            label="Supplier SKU"
            placeholder="SKU kodi"
            value={form.sku}
            onChange={(event) => setField("sku", event.target.value)}
          />

          <Input
            label="Supplier xarid narxi"
            type="number"
            min="0"
            placeholder="0"
            value={form.price}
            onChange={(event) => setField("price", event.target.value)}
          />

          <Input
            label="Yetkazish muddati (kun, ixtiyoriy)"
            type="number"
            min="0"
            placeholder="masalan 3"
            value={form.leadTimeDays}
            onChange={(event) => setField("leadTimeDays", event.target.value)}
          />

          <Input
            label="Minimal buyurtma miqdori"
            type="number"
            min="1"
            placeholder="1"
            value={form.moq}
            onChange={(event) => setField("moq", event.target.value)}
          />
        </div>

        <Input
          className="supplier-product-link__wide"
          label="Supplier izohi (ixtiyoriy)"
          placeholder="Qo'shimcha eslatma..."
          value={form.notes}
          onChange={(event) => setField("notes", event.target.value)}
        />

        {error && <p className="supplier-product-link__error">{error}</p>}

        <div className="supplier-product-link__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary">
            Bog'lash
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierProductLinkModal;
