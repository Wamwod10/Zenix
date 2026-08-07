import { GlassSelect } from "@/components/ui";
import { CheckCircle2, CircleDollarSign, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  formatMargin,
  formatMoney,
  labelProductStatus,
} from "../../utils/productCalculations";

const PriceLists = ({ products, priceLists, canApprove, onSubmitApproval, onResolveApproval }) => {
  const [draft, setDraft] = useState(() => ({
    productId: products[0]?.id || "",
    price: products[0]?.price || 0,
    cost: products[0]?.currentCost ?? products[0]?.cost ?? 0,
  }));
  const selected = products.find((item) => item.id === draft.productId);

  useEffect(() => {
    if (draft.productId && selected) return;
    const product = products[0];
    if (!product) return;
    setDraft({
      productId: product.id,
      price: product.price || 0,
      cost: product.currentCost ?? product.cost ?? 0,
    });
  }, [draft.productId, products, selected]);

  return (
    <div className="products-view">
      <section className="products-dashboard-grid">
        <section className="products-panel">
          <div className="products-panel__head">
            <div>
              <span><CircleDollarSign size={13} /> Narxlar</span>
              <h2>Narx ro'yxatlari, marja va tasdiqlash</h2>
            </div>
          </div>
          <div className="products-form-grid">
            <label>
              <span>Mahsulot</span>
              <GlassSelect
                value={draft.productId}
                onChange={(event) => {
                  const product = products.find((item) => item.id === event.target.value);
                  setDraft({ productId: event.target.value, price: product?.price || 0, cost: product?.currentCost ?? product?.cost ?? 0 });
                }}
              >
                {products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </GlassSelect>
            </label>
            <label><span>Sotuv narxi</span><input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} /></label>
            <label><span>Tannarx</span><input type="number" value={draft.cost} onChange={(event) => setDraft({ ...draft, cost: Number(event.target.value) })} /></label>
            <button type="button" className="products-button is-primary" onClick={() => onSubmitApproval(draft.productId, draft.price, draft.cost)}>
              Tasdiqqa yuborish
            </button>
          </div>
          {selected && (
            <div className="products-mini-grid">
              <article><strong>{formatMoney(selected.price)}</strong><span>Joriy narx</span></article>
              <article><strong>{formatMoney(selected.currentCost ?? selected.cost)}</strong><span>Joriy tannarx</span></article>
              <article><strong>{formatMargin(selected.margin)}</strong><span>Joriy marja</span></article>
              <article><strong>{labelProductStatus(selected.approvalStatus)}</strong><span>Tasdiq holati</span></article>
            </div>
          )}
        </section>

        <section className="products-panel">
          <div className="products-panel__head">
            <div><span>Narx tasdig'i</span><h2>Qoralama → kutilmoqda → tasdiqlangan / rad etilgan → faol</h2></div>
          </div>
          <div className="products-list">
            {products.filter((item) => item.approvalStatus === "pending").map((product) => (
              <article className="products-approval-row" key={product.id}>
                <div><strong>{product.name}</strong><span>{formatMoney(product.priceHistory?.[0]?.price ?? product.price)} · {formatMoney(product.priceHistory?.[0]?.cost ?? product.currentCost ?? product.cost)}</span></div>
                <button type="button" disabled={!canApprove} onClick={() => onResolveApproval(product.id, "approved")}><CheckCircle2 size={15} /> Tasdiqlash</button>
                <button type="button" disabled={!canApprove} onClick={() => onResolveApproval(product.id, "rejected")}><XCircle size={15} /> Rad etish</button>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="products-card-grid">
        {priceLists.map((list) => (
          <article className="products-mini-card" key={list.id}>
            <strong>{list.name}</strong>
            <span>{list.channel} · {list.currency} · {labelProductStatus(list.status)}</span>
            <span>{list.rules}</span>
          </article>
        ))}
      </section>
    </div>
  );
};

export default PriceLists;
