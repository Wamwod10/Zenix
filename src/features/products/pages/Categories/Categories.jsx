import { useState } from "react";
import { FolderTree, Plus } from "lucide-react";

import { labelProductStatus } from "../../utils/productCalculations";

const Categories = ({ categories, onCreateCategory }) => {
  const [form, setForm] = useState({ name: "", code: "", parentId: "" });

  const submit = () => {
    if (!form.name || !form.code) return;
    onCreateCategory(form);
    setForm({ name: "", code: "", parentId: "" });
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
          <button type="button" className="products-button is-primary" onClick={submit}><Plus size={15} /> Kategoriya yaratish</button>
        </div>
      </section>
      <section className="products-card-grid">
        {categories.map((item) => (
          <article className="products-mini-card" key={item.id}>
            <strong>{item.name}</strong>
            <span>{item.code} · {item.parentId ? "Ichki kategoriya" : "Asosiy"}</span>
            <span>{item.productCount || 0} mahsulot · {labelProductStatus(item.status)}</span>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Categories;
