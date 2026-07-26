import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  CreditCard,
  LockKeyhole,
  PackageOpen,
  ReceiptText,
  RotateCcw,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";

import { crmOrders, crmOrderStatuses } from "../../data/crmOrders";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatRelativeDate,
} from "../../utils/crmFormatters";

import "./CustomerPurchaseHistory.scss";

const INITIAL_VISIBLE_COUNT = 5;
const LOAD_MORE_COUNT = 5;

const statusLabels = Object.fromEntries(
  crmOrderStatuses.map((status) => [status.value, status.label]),
);

const filterOptions = [
  {
    value: "all",
    label: "Barchasi",
  },
  ...crmOrderStatuses,
];

const normalizeSearchValue = (value) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase("uz-UZ");

const CustomerPurchaseHistory = ({
  customerId,
  orders = crmOrders,
  canViewFinancials = true,
}) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const customerOrders = useMemo(
    () =>
      orders
        .filter((order) => String(order.customerId) === String(customerId))
        .sort(
          (firstOrder, secondOrder) =>
            new Date(secondOrder.createdAt).getTime() -
            new Date(firstOrder.createdAt).getTime(),
        ),
    [customerId, orders],
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(search);

    return customerOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues = [
        order.orderNumber,
        order.receiptNumber,
        order.branch,
        order.channel,
        order.paymentMethod,
        ...order.items.flatMap((item) => [item.name, item.sku]),
      ];

      return searchableValues.some((value) =>
        normalizeSearchValue(value).includes(normalizedSearch),
      );
    });
  }, [customerOrders, search, statusFilter]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setExpandedOrderId(null);
  }, [search, statusFilter]);

  const visibleOrders = filteredOrders.slice(0, visibleCount);

  const summary = useMemo(() => {
    const validOrders = customerOrders.filter(
      (order) => order.status !== "cancelled",
    );

    const netSpent = validOrders.reduce(
      (total, order) =>
        total + Number(order.total || 0) - Number(order.returnedAmount || 0),
      0,
    );

    const returnedAmount = validOrders.reduce(
      (total, order) => total + Number(order.returnedAmount || 0),
      0,
    );

    return {
      orderCount: validOrders.length,
      netSpent,
      returnedAmount,
      averageCheck:
        validOrders.length > 0 ? Math.round(netSpent / validOrders.length) : 0,
    };
  }, [customerOrders]);

  const formatFinancialValue = (value) =>
    canViewFinancials ? formatCurrency(value) : "••••••";

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleToggleOrder = (orderId) => {
    setExpandedOrderId((currentOrderId) =>
      currentOrderId === orderId ? null : orderId,
    );
  };

  return (
    <section
      className="crm-customer-purchases"
      aria-labelledby="crm-customer-purchases-title"
    >
      <header className="crm-customer-purchases__header">
        <div className="crm-customer-purchases__heading">
          <span>
            <ShoppingBag aria-hidden="true" />
          </span>

          <div>
            <h2 id="crm-customer-purchases-title">Xaridlar tarixi</h2>

            <p>Buyurtmalar, mahsulotlar, to‘lov va qaytarish tafsilotlari</p>
          </div>
        </div>

        {!canViewFinancials ? (
          <div className="crm-customer-purchases__permission">
            <LockKeyhole aria-hidden="true" />
            <span>Moliyaviy qiymatlar yashirilgan</span>
          </div>
        ) : null}
      </header>

      <div
        className="crm-customer-purchases__summary"
        aria-label="Xaridlar bo‘yicha qisqa ko‘rsatkichlar"
      >
        <article>
          <span>
            <ReceiptText aria-hidden="true" />
          </span>

          <div>
            <small>Buyurtmalar</small>
            <strong>{formatNumber(summary.orderCount)} ta</strong>
          </div>
        </article>

        <article>
          <span>
            <CircleDollarSign aria-hidden="true" />
          </span>

          <div>
            <small>Sof xarid</small>
            <strong>{formatFinancialValue(summary.netSpent)}</strong>
          </div>
        </article>

        <article>
          <span>
            <CreditCard aria-hidden="true" />
          </span>

          <div>
            <small>O‘rtacha chek</small>
            <strong>{formatFinancialValue(summary.averageCheck)}</strong>
          </div>
        </article>

        <article className="crm-customer-purchases__summary-refund">
          <span>
            <RotateCcw aria-hidden="true" />
          </span>

          <div>
            <small>Qaytarilgan</small>
            <strong>{formatFinancialValue(summary.returnedAmount)}</strong>
          </div>
        </article>
      </div>

      <div className="crm-customer-purchases__toolbar">
        <div className="crm-customer-purchases__search">
          <Search aria-hidden="true" />

          <input
            type="search"
            value={search}
            placeholder="Buyurtma, chek yoki mahsulot qidirish..."
            aria-label="Xaridlar tarixidan qidirish"
            onChange={(event) => setSearch(event.target.value)}
          />

          {search ? (
            <button
              type="button"
              aria-label="Qidiruvni tozalash"
              onClick={handleClearSearch}
            >
              <X aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div
          className="crm-customer-purchases__filters"
          aria-label="Buyurtma holati bo‘yicha filtrlash"
        >
          {filterOptions.map((option) => {
            const count =
              option.value === "all"
                ? customerOrders.length
                : customerOrders.filter(
                    (order) => order.status === option.value,
                  ).length;

            return (
              <button
                key={option.value}
                className={
                  statusFilter === option.value
                    ? "crm-customer-purchases__filter crm-customer-purchases__filter--active"
                    : "crm-customer-purchases__filter"
                }
                type="button"
                aria-pressed={statusFilter === option.value}
                onClick={() => setStatusFilter(option.value)}
              >
                <span>{option.label}</span>
                <small>{count}</small>
              </button>
            );
          })}
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <>
          <div className="crm-customer-purchases__list">
            <div className="crm-customer-purchases__columns" aria-hidden="true">
              <span>Buyurtma</span>
              <span>Filial va kanal</span>
              <span>To‘lov</span>
              <span>Qiymati</span>
              <span>Holati</span>
              <span />
            </div>

            {visibleOrders.map((order) => {
              const expanded = expandedOrderId === order.id;

              const totalQuantity = order.items.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0,
              );

              return (
                <article
                  className={`crm-customer-purchases__order ${
                    expanded ? "crm-customer-purchases__order--expanded" : ""
                  }`}
                  key={order.id}
                >
                  <button
                    className="crm-customer-purchases__order-row"
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`crm-order-details-${order.id}`}
                    onClick={() => handleToggleOrder(order.id)}
                  >
                    <span className="crm-customer-purchases__order-identity">
                      <span>
                        <ReceiptText aria-hidden="true" />
                      </span>

                      <span>
                        <strong>{order.orderNumber}</strong>
                        <small>{formatRelativeDate(order.createdAt)}</small>
                      </span>
                    </span>

                    <span className="crm-customer-purchases__order-location">
                      <strong>{order.branch}</strong>
                      <small>{order.channel}</small>
                    </span>

                    <span className="crm-customer-purchases__order-payment">
                      <strong>{order.paymentMethod}</strong>
                      <small>
                        {order.receiptNumber ?? "Chek yaratilmagan"}
                      </small>
                    </span>

                    <span className="crm-customer-purchases__order-total">
                      <strong>{formatFinancialValue(order.total)}</strong>
                      <small>{totalQuantity} dona mahsulot</small>
                    </span>

                    <span
                      className={`crm-customer-purchases__status crm-customer-purchases__status--${order.status}`}
                    >
                      {statusLabels[order.status] ?? order.status}
                    </span>

                    <span className="crm-customer-purchases__expand">
                      {expanded ? (
                        <ChevronUp aria-hidden="true" />
                      ) : (
                        <ChevronDown aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  {expanded ? (
                    <div
                      className="crm-customer-purchases__details"
                      id={`crm-order-details-${order.id}`}
                    >
                      <div className="crm-customer-purchases__details-meta">
                        <div>
                          <span>
                            <Store aria-hidden="true" />
                          </span>

                          <div>
                            <small>Sotuvchi</small>
                            <strong>{order.cashier}</strong>
                          </div>
                        </div>

                        <div>
                          <span>
                            <CreditCard aria-hidden="true" />
                          </span>

                          <div>
                            <small>To‘lov usuli</small>
                            <strong>{order.paymentMethod}</strong>
                          </div>
                        </div>

                        <div>
                          <span>
                            <BadgePercent aria-hidden="true" />
                          </span>

                          <div>
                            <small>Bonus olindi</small>
                            <strong>
                              {formatFinancialValue(order.loyaltyEarned)}
                            </strong>
                          </div>
                        </div>

                        <div>
                          <span>
                            <ReceiptText aria-hidden="true" />
                          </span>

                          <div>
                            <small>Savdo vaqti</small>
                            <strong>{formatDateTime(order.createdAt)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="crm-customer-purchases__items">
                        <table>
                          <thead>
                            <tr>
                              <th scope="col">Mahsulot</th>
                              <th scope="col">Miqdor</th>
                              <th scope="col">Narx</th>
                              <th scope="col">Chegirma</th>
                              <th scope="col">Jami</th>
                            </tr>
                          </thead>

                          <tbody>
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <strong>{item.name}</strong>
                                  <span>{item.sku}</span>
                                </td>
                                <td>{item.quantity} dona</td>
                                <td>{formatFinancialValue(item.unitPrice)}</td>
                                <td>{formatFinancialValue(item.discount)}</td>
                                <td>
                                  <strong>
                                    {formatFinancialValue(item.total)}
                                  </strong>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <dl className="crm-customer-purchases__totals">
                        <div>
                          <dt>Mahsulotlar qiymati</dt>
                          <dd>{formatFinancialValue(order.subtotal)}</dd>
                        </div>

                        <div>
                          <dt>Chegirma</dt>
                          <dd>− {formatFinancialValue(order.discount)}</dd>
                        </div>

                        {order.tax > 0 ? (
                          <div>
                            <dt>Soliq</dt>
                            <dd>{formatFinancialValue(order.tax)}</dd>
                          </div>
                        ) : null}

                        {order.returnedAmount > 0 ? (
                          <div className="crm-customer-purchases__returned-total">
                            <dt>Qaytarilgan summa</dt>
                            <dd>
                              − {formatFinancialValue(order.returnedAmount)}
                            </dd>
                          </div>
                        ) : null}

                        <div className="crm-customer-purchases__grand-total">
                          <dt>Yakuniy summa</dt>
                          <dd>{formatFinancialValue(order.total)}</dd>
                        </div>
                      </dl>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {visibleOrders.length < filteredOrders.length ? (
            <button
              className="crm-customer-purchases__load-more"
              type="button"
              onClick={() =>
                setVisibleCount(
                  (currentCount) => currentCount + LOAD_MORE_COUNT,
                )
              }
            >
              <ChevronDown aria-hidden="true" />
              <span>Yana ko‘rsatish</span>
              <small>
                {filteredOrders.length - visibleOrders.length} ta buyurtma qoldi
              </small>
            </button>
          ) : null}
        </>
      ) : (
        <div className="crm-customer-purchases__empty">
          <span>
            <PackageOpen aria-hidden="true" />
          </span>

          <h3>Xarid topilmadi</h3>

          <p>
            Qidiruv matnini yoki buyurtma holati filtrini o‘zgartirib ko‘ring.
          </p>

          {search || statusFilter !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Filtrlarni tozalash
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
};

export default CustomerPurchaseHistory;
