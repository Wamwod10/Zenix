import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { formatCurrency, formatDate } from "../../utils/crmFormatters";

import "./CustomerPurchases.scss";

const statusLabels = {
  completed: "Yakunlangan",
  pending: "Kutilmoqda",
  cancelled: "Bekor qilingan",
  refunded: "Qaytarilgan",
};

const paymentLabels = {
  cash: "Naqd pul",
  card: "Bank kartasi",
  transfer: "Pul o‘tkazmasi",
  mixed: "Aralash to‘lov",
  debt: "Nasiya",
};

const getPurchaseId = (purchase, index) =>
  purchase?.orderNumber ??
  purchase?.receiptNumber ??
  purchase?.number ??
  purchase?.id ??
  `CRM-${index + 1}`;

const getPurchaseAmount = (purchase) =>
  Number(
    purchase?.total ??
      purchase?.amount ??
      purchase?.totalAmount ??
      purchase?.grandTotal ??
      0,
  );

const getPurchaseItemsCount = (purchase) => {
  if (Array.isArray(purchase?.items)) {
    return purchase.items.reduce(
      (total, item) => total + Number(item.quantity ?? 1),
      0,
    );
  }

  return Number(
    purchase?.itemsCount ?? purchase?.productsCount ?? purchase?.quantity ?? 0,
  );
};

const getPurchaseDate = (purchase) =>
  purchase?.createdAt ??
  purchase?.purchaseDate ??
  purchase?.date ??
  purchase?.soldAt;

const CustomerPurchases = ({ customer, customerId }) => {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const purchases = useMemo(() => {
    const customerPurchases =
      customer?.purchases ??
      customer?.orders ??
      customer?.sales ??
      customer?.purchaseHistory ??
      [];

    if (!Array.isArray(customerPurchases)) {
      return [];
    }

    return customerPurchases.map((purchase, index) => ({
      ...purchase,
      normalizedId: getPurchaseId(purchase, index),
      normalizedAmount: getPurchaseAmount(purchase),
      normalizedItemsCount: getPurchaseItemsCount(purchase),
      normalizedDate: getPurchaseDate(purchase),
      normalizedStatus: purchase?.status ?? "completed",
      normalizedPaymentMethod:
        purchase?.paymentMethod ?? purchase?.paymentType ?? "cash",
    }));
  }, [customer, customerId]);

  const filteredPurchases = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return purchases.filter((purchase) => {
      const matchesStatus =
        statusFilter === "all" || purchase.normalizedStatus === statusFilter;

      const searchableContent = [
        purchase.normalizedId,
        purchase.branchName,
        purchase.cashierName,
        purchase.note,
        purchase.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableContent.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [purchases, searchValue, statusFilter]);

  const metrics = useMemo(() => {
    const completedPurchases = purchases.filter(
      (purchase) => purchase.normalizedStatus === "completed",
    );

    const totalSpent = completedPurchases.reduce(
      (total, purchase) => total + purchase.normalizedAmount,
      0,
    );

    const totalItems = completedPurchases.reduce(
      (total, purchase) => total + purchase.normalizedItemsCount,
      0,
    );

    return {
      totalSpent,
      purchaseCount: purchases.length,
      totalItems,
      averageCheck:
        completedPurchases.length > 0
          ? totalSpent / completedPurchases.length
          : 0,
    };
  }, [purchases]);

  const getStatusIcon = (status) => {
    if (status === "completed") {
      return <CheckCircle2 size={13} aria-hidden="true" />;
    }

    if (status === "cancelled") {
      return <XCircle size={13} aria-hidden="true" />;
    }

    if (status === "refunded") {
      return <RotateCcw size={13} aria-hidden="true" />;
    }

    return <Clock3 size={13} aria-hidden="true" />;
  };

  return (
    <section className="crm-customer-purchases">
      <div className="crm-customer-purchases__heading">
        <div>
          <span className="crm-customer-purchases__heading-icon">
            <ShoppingBag size={19} aria-hidden="true" />
          </span>

          <div>
            <span>Xaridlar tarixi</span>
            <h2>Mijozning savdo va buyurtmalari</h2>
          </div>
        </div>

        <span className="crm-customer-purchases__count">
          {purchases.length} ta xarid
        </span>
      </div>

      <div className="crm-customer-purchases__metrics">
        <article>
          <span>
            <CircleDollarSign size={18} aria-hidden="true" />
          </span>

          <div>
            <small>Jami xarid</small>
            <strong>{formatCurrency(metrics.totalSpent)}</strong>
          </div>
        </article>

        <article>
          <span>
            <ReceiptText size={18} aria-hidden="true" />
          </span>

          <div>
            <small>Buyurtmalar</small>
            <strong>{metrics.purchaseCount} ta</strong>
          </div>
        </article>

        <article>
          <span>
            <Sparkles size={18} aria-hidden="true" />
          </span>

          <div>
            <small>O‘rtacha chek</small>
            <strong>{formatCurrency(metrics.averageCheck)}</strong>
          </div>
        </article>

        <article>
          <span>
            <PackageSearch size={18} aria-hidden="true" />
          </span>

          <div>
            <small>Sotib olingan mahsulotlar</small>
            <strong>{metrics.totalItems} ta</strong>
          </div>
        </article>
      </div>

      <div className="crm-customer-purchases__content">
        <div className="crm-customer-purchases__toolbar">
          <label className="crm-customer-purchases__search">
            <Search size={16} aria-hidden="true" />

            <input
              type="search"
              value={searchValue}
              placeholder="Chek raqami, filial yoki kassir..."
              onChange={(event) => setSearchValue(event.target.value)}
              aria-label="Xaridlarni qidirish"
            />
          </label>

          <label className="crm-customer-purchases__filter">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Xarid statusini tanlash"
            >
              <option value="all">Barcha statuslar</option>
              <option value="completed">Yakunlangan</option>
              <option value="pending">Kutilmoqda</option>
              <option value="refunded">Qaytarilgan</option>
              <option value="cancelled">Bekor qilingan</option>
            </select>

            <ChevronDown size={15} aria-hidden="true" />
          </label>
        </div>

        {filteredPurchases.length > 0 ? (
          <div className="crm-customer-purchases__table-wrapper">
            <table className="crm-customer-purchases__table">
              <thead>
                <tr>
                  <th>Buyurtma</th>
                  <th>Sana</th>
                  <th>Mahsulotlar</th>
                  <th>To‘lov usuli</th>
                  <th>Status</th>
                  <th>Summa</th>
                  <th aria-label="Amallar" />
                </tr>
              </thead>

              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr
                    key={`${purchase.normalizedId}-${purchase.normalizedDate}`}
                  >
                    <td>
                      <div className="crm-customer-purchases__order">
                        <span>
                          <ReceiptText size={16} aria-hidden="true" />
                        </span>

                        <div>
                          <strong>#{purchase.normalizedId}</strong>
                          <small>
                            {purchase.branchName ??
                              purchase.branch ??
                              "Asosiy filial"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="crm-customer-purchases__date">
                        <CalendarDays size={14} aria-hidden="true" />

                        <span>
                          {purchase.normalizedDate
                            ? formatDate(purchase.normalizedDate)
                            : "Sana yo‘q"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="crm-customer-purchases__items">
                        {purchase.normalizedItemsCount} ta mahsulot
                      </span>
                    </td>

                    <td>
                      <span className="crm-customer-purchases__payment">
                        <CreditCard size={14} aria-hidden="true" />

                        {paymentLabels[purchase.normalizedPaymentMethod] ??
                          purchase.normalizedPaymentMethod}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`crm-customer-purchases__status crm-customer-purchases__status--${purchase.normalizedStatus}`}
                      >
                        {getStatusIcon(purchase.normalizedStatus)}

                        {statusLabels[purchase.normalizedStatus] ??
                          purchase.normalizedStatus}
                      </span>
                    </td>

                    <td>
                      <strong className="crm-customer-purchases__amount">
                        {formatCurrency(purchase.normalizedAmount)}
                      </strong>
                    </td>

                    <td>
                      <button
                        className="crm-customer-purchases__view"
                        type="button"
                        aria-label={`#${purchase.normalizedId} xaridini ko‘rish`}
                        onClick={() => setSelectedPurchase(purchase)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="crm-customer-purchases__empty">
            <span>
              <PackageSearch size={27} aria-hidden="true" />
            </span>

            <strong>
              {purchases.length > 0
                ? "Mos xarid topilmadi"
                : "Xaridlar hali mavjud emas"}
            </strong>

            <p>
              {purchases.length > 0
                ? "Qidiruv matni yoki tanlangan statusni o‘zgartirib ko‘ring."
                : "Mijozning birinchi savdosi amalga oshirilgach, xarid shu yerda ko‘rinadi."}
            </p>
          </div>
        )}
      </div>

      {selectedPurchase ? (
        <div
          className="crm-customer-purchases__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPurchase(null);
            }
          }}
        >
          <section
            className="crm-customer-purchases__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-details-title"
          >
            <div className="crm-customer-purchases__modal-heading">
              <div>
                <span>
                  <ReceiptText size={19} aria-hidden="true" />
                </span>

                <div>
                  <small>Xarid tafsilotlari</small>

                  <h3 id="purchase-details-title">
                    Buyurtma #{selectedPurchase.normalizedId}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                aria-label="Oynani yopish"
                onClick={() => setSelectedPurchase(null)}
              >
                <XCircle size={19} />
              </button>
            </div>

            <div className="crm-customer-purchases__modal-summary">
              <div>
                <span>Xarid sanasi</span>
                <strong>
                  {selectedPurchase.normalizedDate
                    ? formatDate(selectedPurchase.normalizedDate)
                    : "Sana yo‘q"}
                </strong>
              </div>

              <div>
                <span>To‘lov turi</span>
                <strong>
                  {paymentLabels[selectedPurchase.normalizedPaymentMethod] ??
                    selectedPurchase.normalizedPaymentMethod}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {statusLabels[selectedPurchase.normalizedStatus] ??
                    selectedPurchase.normalizedStatus}
                </strong>
              </div>

              <div>
                <span>Jami summa</span>
                <strong>
                  {formatCurrency(selectedPurchase.normalizedAmount)}
                </strong>
              </div>
            </div>

            <div className="crm-customer-purchases__modal-products">
              <div>
                <strong>Mahsulotlar</strong>
                <span>{selectedPurchase.normalizedItemsCount} ta</span>
              </div>

              {Array.isArray(selectedPurchase.items) &&
              selectedPurchase.items.length > 0 ? (
                <div className="crm-customer-purchases__product-list">
                  {selectedPurchase.items.map((item, index) => (
                    <article
                      key={item.id ?? item.productId ?? `${item.name}-${index}`}
                    >
                      <span>
                        {String(item.name ?? "M")
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <div>
                        <strong>
                          {item.name ?? item.productName ?? "Noma’lum mahsulot"}
                        </strong>

                        <small>
                          {item.quantity ?? 1} ×{" "}
                          {formatCurrency(item.price ?? item.unitPrice ?? 0)}
                        </small>
                      </div>

                      <strong>
                        {formatCurrency(
                          item.total ??
                            Number(item.quantity ?? 1) *
                              Number(item.price ?? item.unitPrice ?? 0),
                        )}
                      </strong>
                    </article>
                  ))}
                </div>
              ) : (
                <p>
                  Ushbu xarid mahsulotlari bo‘yicha batafsil ma’lumot mavjud
                  emas.
                </p>
              )}
            </div>

            {selectedPurchase.note ? (
              <div className="crm-customer-purchases__modal-note">
                <span>Izoh</span>
                <p>{selectedPurchase.note}</p>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
};

export default CustomerPurchases;
