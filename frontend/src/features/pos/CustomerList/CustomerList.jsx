import { SearchX, Users } from "lucide-react";

import CustomerListItem from "../CustomerListItem/CustomerListItem";

import "./CustomerList.scss";

const CustomerList = ({ customers = [], selectedCustomerId, onSelect }) => {
  if (!customers.length) {
    return (
      <div className="pos-customer-list__empty">
        <SearchX size={28} />

        <strong>Mijoz topilmadi</strong>

        <span>Ism yoki telefon raqamini tekshirib qayta qidiring.</span>
      </div>
    );
  }

  return (
    <div className="pos-customer-list">
      <div className="pos-customer-list__head">
        <span>
          <Users size={14} />
          {customers.length} ta mijoz
        </span>

        <small>Tanlash uchun mijoz ustiga bosing</small>
      </div>

      <div className="pos-customer-list__items">
        {customers.map((customer) => (
          <CustomerListItem
            customer={customer}
            selected={selectedCustomerId === customer.id}
            key={customer.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomerList;
