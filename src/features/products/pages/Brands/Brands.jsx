import { useState } from "react";
import { Factory, Plus } from "lucide-react";

import { Modal } from "../../../../components/ui/Modal/Modal";

const Brands = ({ brands, units, onCreateBrand, onUpdateBrand, onDeleteBrand }) => {
  const [form, setForm] = useState({ name: "", code: "", manufacturer: "", country: "UZ" });
  const [editingId, setEditingId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const deleteCandidate = brands.find((item) => item.id === deleteId);

  const submit = () => {
    if (!form.name || !form.code) return;
    if (editingId) {
      onUpdateBrand(editingId, form);
    } else {
      onCreateBrand(form);
    }
    setForm({ name: "", code: "", manufacturer: "", country: "UZ" });
    setEditingId("");
  };
  const confirmDelete = () => {
    if (!deleteId) return;
    if (onDeleteBrand(deleteId)) setDeleteId("");
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setForm({
      name: brand.name || "",
      code: brand.code || "",
      manufacturer: brand.manufacturer || "",
      country: brand.country || "UZ",
    });
  };

  return (
    <div className="products-view">
      <section className="products-panel">
        <div className="products-panel__head">
          <div>
            <span><Factory size={13} /> Brendlar va ishlab chiqaruvchilar</span>
            <h2>Brend, ishlab chiqaruvchi va o'lchov birliklari</h2>
          </div>
        </div>
        <div className="products-form-grid">
          <label><span>Brend</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label><span>Kod</span><input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /></label>
          <label><span>Ishlab chiqaruvchi</span><input value={form.manufacturer} onChange={(event) => setForm({ ...form, manufacturer: event.target.value })} /></label>
          <label><span>Mamlakat</span><input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></label>
          <button type="button" className="products-button is-primary" onClick={submit}><Plus size={15} /> {editingId ? "Brendni saqlash" : "Brend yaratish"}</button>
          {editingId && (
            <button type="button" className="products-mini-button" onClick={() => { setEditingId(""); setForm({ name: "", code: "", manufacturer: "", country: "UZ" }); }}>
              Bekor qilish
            </button>
          )}
        </div>
      </section>
      <section className="products-dashboard-grid">
        <div className="products-card-grid">
          {brands.map((brand) => (
            <article className="products-mini-card" key={brand.id}>
              <strong>{brand.name}</strong>
              <span>{brand.code} · {brand.country}</span>
              <span>{brand.manufacturer}</span>
              <div className="products-row-actions products-row-actions--text">
                <button type="button" onClick={() => startEdit(brand)}>Tahrirlash</button>
                <button type="button" onClick={() => setDeleteId(brand.id)}>
                  O'chirish
                </button>
              </div>
            </article>
          ))}
        </div>
        <section className="products-panel">
          <div className="products-panel__head">
            <div><span>O'lchov birliklari</span><h2>Birliklarni konvertatsiya qilish</h2></div>
          </div>
          <div className="products-list">
            {units.map((unit) => (
              <article className="products-mini-card" key={unit.id}>
                <strong>{unit.name}</strong>
                <span>{unit.code} · asos {unit.base} · nisbat {unit.ratio}</span>
              </article>
            ))}
          </div>
        </section>
      </section>
      <Modal
        open={Boolean(deleteCandidate)}
        title="Brendni o'chirish"
        description={deleteCandidate?.name}
        onClose={() => setDeleteId("")}
        footer={(
          <>
            <button type="button" className="products-mini-button" onClick={() => setDeleteId("")}>Bekor qilish</button>
            <button type="button" className="products-mini-button is-danger" onClick={confirmDelete}>O'chirish</button>
          </>
        )}
      >
        <div className="products-confirm-body">
          <strong>Brend o'chirishdan oldin mahsulot bog'lanishlari tekshiriladi.</strong>
          <span>Mahsulot bog'langan bo'lsa amal bloklanadi. Avval mahsulotlarni boshqa brendga ko'chiring.</span>
        </div>
      </Modal>
    </div>
  );
};

export default Brands;
