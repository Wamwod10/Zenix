export const posRolePermissions = {
  cashier: [
    "pos.sale.create",
    "pos.sale.hold",
    "pos.sale.resume",
    "pos.payment.cash",
    "pos.payment.card",
    "pos.payment.digital",
    "pos.customer.select",
    "pos.return.create",
  ],
  manager: [
    "pos.sale.create",
    "pos.sale.hold",
    "pos.sale.resume",
    "pos.sale.void",
    "pos.payment.cash",
    "pos.payment.card",
    "pos.payment.digital",
    "pos.payment.debt",
    "pos.payment.advance",
    "pos.discount.order",
    "pos.discount.item",
    "pos.customer.select",
    "pos.return.create",
    "pos.shift.manage",
    "pos.report.view",
    "pos.settings.manage",
    "pos.offline.sync",
  ],
};

export const defaultPOSRole = "manager";
