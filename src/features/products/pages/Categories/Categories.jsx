import { useState } from "react";
import { FolderTree, Plus } from "lucide-react";

import { labelProductStatus } from "../../utils/productCalculations";

const Categories = ({ categories, onCreateCategory, onUpdateCategory, onDeleteCategory }) => {
  const [form, setForm] = useState({ name: "", code: "", parentId: "" });
  const [editingId, setEditingId] = useState("");

  const submit = () => {
    if (!form.name || !form.code) return;
    if (editingId) {
      onUpdateCategory(editingId, form);
    } else {
      onCreateCategory(form);
    }
    setForm({ name: "", code: "", parentId: "" });
    setEditingId("");
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      code: category.code || "",
      parentId: category.parentId || "",
    });
  };

  return (
    <div className="products-view">
      <section className="products-panel">
        <div className="products-panel__head">
          <div>
            <span><FolderTree size={13} /> Kategoriyalar</span>
            <h2>Kategoriya va ichki kategoriyalar boshqaruvi</h2>
          </div>
        </div>
        <div className="products-form-grid">
          <label><span>Nomi</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label><span>Kod</span><input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /></label>
          <label>
            <span>Yuqori kategoriya</span>
            <select value={form.parentId} onChange={(event) => setForm({ ...form, parentId: event.target.value })}>
              <option value="">Asosiy</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <button type="button" className="products-button is-primary" onClick={submit}><Plus size={15} /> {editingId ? "Kategoriyani saqlash" : "Kategoriya yaratish"}</button>
          {editingId && (
            <button type="button" className="products-mini-button" onClick={() => { setEditingId(""); setForm({ name: "", code: "", parentId: "" }); }}>
              Bekor qilish
            </button>
          )}
        </div>
      </section>
      <section className="products-card-grid">
        {categories.map((item) => (
          <article className="products-mini-card" key={item.id}>
            <strong>{item.name}</strong>
            <span>{item.code} · {item.parentId ? "Ichki kategoriya" : "Asosiy"}</span>
            <span>{item.productCount || 0} mahsulot · {labelProductStatus(item.status)}</span>
            <div className="products-row-actions products-row-actions--text">
              <button type="button" onClick={() => startEdit(item)}>Tahrirlash</button>
              <button type="button" onClick={() => window.confirm("Kategoriyani o'chirishni tasdiqlaysizmi?") && onDeleteCategory(item.id)}>
                O'chirish
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Categories;
