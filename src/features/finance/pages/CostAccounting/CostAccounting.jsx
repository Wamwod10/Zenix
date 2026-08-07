import { Boxes, Calculator, PackageCheck, ReceiptText, Truck } from "lucide-react";

import { formatMoney } from "../../utils/financeFormatters";

const CostAccounting = ({ controller }) => {
  const cost = controller.state.costAccounting;
  const summaryCards = [
    {
      icon: Boxes,
      label: "Tovar qiymati",
      value: formatMoney(cost.inventoryValuation),
      hint: "Ombordagi zaxiralar bahosi",
      tone: "is-flow",
    },
    {
      icon: ReceiptText,
      label: "Sotilgan tovar tannarxi",
      value: formatMoney(cost.cogs),
      hint: "Sotuvga chiqqan mahsulot tannarxi",
      tone: "is-expense",
    },
    {
      icon: Truck,
      label: "Yetkazish va bojxona xarajati",
      value: formatMoney(controller.costBreakdown.landedCost),
      hint: "Landed cost qo'shimcha xarajatlari",
      tone: "is-cash",
    },
    {
      icon: PackageCheck,
      label: "Yakuniy tannarx",
      value: formatMoney(controller.costBreakdown.finalCost),
      hint: "Mahsulotning yakuniy qiymati",
      tone: "is-income",
    },
    {
      icon: Calculator,
      label: "Birlik tannarxi",
      value: formatMoney(controller.costBreakdown.unitCost),
      hint: "Bir dona mahsulot tannarxi",
      tone: "is-net",
    },
  ];

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Tannarx hisobi</span>
            <h2>Tannarx usullari</h2>
          </div>
        </div>
        <div className="finance-segmented" role="tablist" aria-label="Tannarx usuli">
          {controller.state.settings.costMethods.map((method) => (
            <button
              type="button"
              role="tab"
              aria-selected={cost.method === method}
              className={cost.method === method ? "is-active" : ""}
              key={method}
              onClick={() => controller.actions.updateCostMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>
        <div className="finance-card-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className={`finance-mini-card finance-mini-card--metric ${card.tone}`} key={card.label}>
                <span className="finance-mini-card__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="finance-mini-card__label">{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.hint}</small>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default CostAccounting;
