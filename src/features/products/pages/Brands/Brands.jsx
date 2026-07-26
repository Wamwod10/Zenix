import { useState } from "react";
import { Factory, Plus } from "lucide-react";

const Brands = ({ brands, units, onCreateBrand }) => {
  const [form, setForm] = useState({ name: "", code: "", manufacturer: "", country: "UZ" });

  const submit = () => {
    if (!form.name || !form.code) return;
    onCreateBrand(form);
    setForm({ name: "", code: "", manufacturer: "", country: "UZ" });
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
          <button type="button" className="products-button is-primary" onClick={submit}><Plus size={15} /> Brend yaratish</button>
        </div>
      </section>
      <section className="products-dashboard-grid">
        <div className="products-card-grid">
          {brands.map((brand) => (
            <article className="products-mini-card" key={brand.id}>
              <strong>{brand.name}</strong>
              <span>{brand.code} · {brand.country}</span>
              <span>{brand.manufacturer}</span>
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
    </div>
  );
};

export default Brands;
