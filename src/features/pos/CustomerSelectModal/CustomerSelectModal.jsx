import { Search, UserPlus, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import CustomerList from "../CustomerList/CustomerList";

import "./CustomerSelectModal.scss";

const CustomerSelectModal = ({
  open = false,
  customers = [],
  selectedCustomer = null,
  onClose,
  onSelect,
  onCreateCustomer,
}) => {
  const searchInputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [draftCustomer, setDraftCustomer] = useState(selectedCustomer);
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setQuery("");
    setDraftCustomer(selectedCustomer);
    setIsCreating(false);
    setNewCustomer({
      name: "",
      phone: "",
    });

    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, selectedCustomer, onClose]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, " ");

    if (!normalizedQuery) {
      return customers;
    }

    return customers.filter((customer) => {
      const name = customer.name.toLowerCase();
      const phone = customer.phone.replace(/\s+/g, "").toLowerCase();
      const normalizedPhoneQuery = normalizedQuery.replace(/\s+/g, "");

      return (
        name.includes(normalizedQuery) || phone.includes(normalizedPhoneQuery)
      );
    });
  }, [customers, query]);

  const handleConfirm = () => {
    onSelect?.(draftCustomer);
  };

  const handleCreateCustomer = (event) => {
    event.preventDefault();

    const name = newCustomer.name.trim();
    const phone = newCustomer.phone.trim();

    if (!name || !phone) {
      return;
    }

    const customer = {
      id: `cus-draft-${Date.now()}`,
      name,
      phone,
      level: "Standard",
      ordersCount: 0,
      totalSpent: 0,
      bonus: 0,
    };

    onCreateCustomer?.(customer);
    onSelect?.(customer);
  };

  const handleWalkInCustomer = () => {
    setDraftCustomer(null);
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="pos-customer-modal"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="pos-customer-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-select-title"
      >
        <div className="pos-customer-modal__header">
          <div>
            <span className="pos-customer-modal__eyebrow">
              <UserRound size={14} />
              Customer profile
            </span>

            <h2 id="customer-select-title">Mijozni tanlash</h2>

            <p>Xarid tarixini, bonus va loyalty darajasini savdoga ulang.</p>
          </div>

          <button
            className="pos-customer-modal__close"
            type="button"
            aria-label="Mijoz tanlash oynasini yopish"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="pos-customer-modal__toolbar">
          <label className="pos-customer-modal__search">
            <Search size={17} />

            <input
              ref={searchInputRef}
              type="search"
              value={query}
              placeholder="Ism yoki telefon raqami..."
              onChange={(event) => setQuery(event.target.value)}
            />

            <kbd>/</kbd>
          </label>

          <button
            className="pos-customer-modal__create"
            type="button"
            onClick={() => setIsCreating((current) => !current)}
          >
            <UserPlus size={17} />
            Yangi mijoz
          </button>
        </div>

        {isCreating && (
          <form
            className="pos-customer-modal__new"
            onSubmit={handleCreateCustomer}
          >
            <label>
              <span>Ism</span>
              <input
                type="text"
                value={newCustomer.name}
                placeholder="Mijoz ismi"
                onChange={(event) =>
                  setNewCustomer((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Telefon</span>
              <input
                type="tel"
                value={newCustomer.phone}
                placeholder="+998"
                onChange={(event) =>
                  setNewCustomer((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </label>

            <button
              type="submit"
              disabled={!newCustomer.name.trim() || !newCustomer.phone.trim()}
            >
              <UserPlus size={16} />
              Yaratish
            </button>
          </form>
        )}

        <button
          className={`pos-customer-modal__walk-in ${
            !draftCustomer ? "is-selected" : ""
          }`}
          type="button"
          onClick={handleWalkInCustomer}
        >
          <span>
            <UserRound size={18} />
          </span>

          <div>
            <strong>Walk-in customer</strong>
            <small>Mijoz profilini savdoga biriktirmaslik</small>
          </div>

          <b>{!draftCustomer ? "Tanlangan" : "Tanlash"}</b>
        </button>

        <CustomerList
          customers={filteredCustomers}
          selectedCustomerId={draftCustomer?.id}
          onSelect={setDraftCustomer}
        />

        <div className="pos-customer-modal__footer">
          <button
            className="pos-customer-modal__cancel"
            type="button"
            onClick={onClose}
          >
            Bekor qilish
          </button>

          <button
            className="pos-customer-modal__confirm"
            type="button"
            onClick={handleConfirm}
          >
            <UserRound size={17} />

            {draftCustomer
              ? `${draftCustomer.name}ni tanlash`
              : "Walk-in customer"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CustomerSelectModal;
