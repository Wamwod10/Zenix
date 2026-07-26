// Xaridlar moduli domen tiplari (JSDoc typedef).
// PDF ERP Arxitektura: purchase_orders, purchase_order_items, suppliers,
// goods_receipts, invoices, payments, purchase_returns.

/**
 * @typedef {Object} PurchaseSupplier
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} category
 * @property {number} score           Supplier Score 0-100 (PDF 6)
 * @property {number} leadTimeDays    O'rtacha yetkazish vaqti (PDF 13)
 * @property {number} creditLimit     Kredit limiti (PDF 51)
 * @property {number} debt            Joriy qarzdorlik (PDF 53)
 * @property {boolean} blocked        Qora ro'yxat (PDF 6)
 */

/**
 * @typedef {Object} PurchaseOrderItem
 * @property {string} id
 * @property {string} productId
 * @property {string} name
 * @property {string} sku
 * @property {string} unit            Tanlangan birlik kodi (PDF 9)
 * @property {number} unitFactor      1 quti = N dona
 * @property {number} quantity        Buyurtma miqdori (tanlangan birlikda)
 * @property {number} receivedQty     Qabul qilingan (bazaviy birlikda)
 * @property {number} returnedQty     Qaytarilgan
 * @property {number} damagedQty      Buzuq deb belgilangan (PDF 34)
 * @property {number} missingQty      Yetishmagan (qabulda topilmagan) miqdor
 * @property {number} price           Birlik narxi
 * @property {number} lastPrice       Oxirgi xarid narxi (PDF 10)
 * @property {number} moq             Minimal buyurtma miqdori (PDF 8)
 * @property {number} discountPercent Qator chegirmasi (PDF 11)
 * @property {number} taxRate         QQS stavkasi (PDF 12)
 * @property {number} landedCostAllocated  Barcha qabullardan yig'ilgan taqsimlangan landed cost (PDF 56, Enterprise)
 * @property {number} landedUnitCost       landedCostAllocated / receivedQty — birlikka qo'shilgan qo'shimcha tannarx
 */

/**
 * @typedef {Object} ApprovalStep
 * @property {string} role
 * @property {string} label
 * @property {"pending"|"approved"|"rejected"} status
 * @property {string|null} actor
 * @property {string|null} actedAt
 * @property {string} reason
 */

/**
 * @typedef {Object} PurchaseOrder
 * @property {string} id
 * @property {string} number             PO raqami
 * @property {string} status             PDF 18 holatlaridan biri
 * @property {PurchaseSupplier} supplier
 * @property {{id: string, name: string}} buyer
 * @property {string} warehouseId
 * @property {string} branch
 * @property {string} currency
 * @property {string} createdAt
 * @property {string} expectedDate       Kutilayotgan yetkazish (PDF 13)
 * @property {PurchaseOrderItem[]} items
 * @property {number} orderDiscountPercent Umumiy chegirma (PDF 11)
 * @property {string} taxMode            inclusive/exclusive (PDF 12)
 * @property {string} paymentTerm        PDF 14
 * @property {ApprovalStep[]} approvalSteps
 * @property {Array} notes               PDF 16: internal/supplier
 * @property {Array} attachments         PDF 15
 * @property {Array} timeline            PDF 19
 */

/**
 * @typedef {Object} GoodsReceipt PDF 21-26
 * @property {string} id
 * @property {string} number
 * @property {string} orderId
 * @property {string} warehouseId
 * @property {string} receivedAt
 * @property {string} receivedBy
 * @property {Array<{itemId: string, name: string, ordered: number, received: number, damaged: number, missing: number}>} items
 * @property {Array<{type: string, amount: number}>} landedCosts           Qo'shimcha xarajat turlari (PDF 56, Enterprise — LANDED_COST_TYPES)
 * @property {string} landedCostMethod    Taqsimlash usuli (LANDED_COST_ALLOCATION_METHODS)
 * @property {number} landedCostTotal
 * @property {Array<{itemId: string, name: string, basis: number|null, sharePercent: number, allocatedAmount: number, unitCostAdded: number}>} landedCostAllocations
 */

/**
 * @typedef {Object} PurchaseInvoice PDF 41-46
 * @property {string} id
 * @property {string} number
 * @property {string} orderId
 * @property {number} amount
 * @property {string} dueDate
 * @property {string} status
 * @property {number} paidAmount
 * @property {Array<{id: string, amount: number, method: string, paidAt: string}>} payments
 * @property {{poTotal: number, receivedValue: number, delta: number, matched: boolean}} matching PDF 42-43
 */

/**
 * @typedef {Object} PurchaseReturn PDF 36-37
 * @property {string} id
 * @property {string} number
 * @property {string} orderId
 * @property {string} reason
 * @property {string} status
 * @property {number} total
 * @property {Array<{itemId: string, name: string, quantity: number, price: number}>} items
 */

/**
 * @typedef {Object} PurchaseBudget PDF 57-60 (Enterprise Budget Control)
 * @property {string} id
 * @property {string} name
 * @property {"overall"|"supplier"|"category"|"department"|"project"} scopeType
 * @property {string|null} scopeValue      overall uchun null, boshqalar uchun ID/nom
 * @property {"monthly"|"quarterly"|"annual"} periodType
 * @property {number} periodYear
 * @property {number|null} periodMonth     1-12, faqat monthly uchun
 * @property {number|null} periodQuarter   1-4, faqat quarterly uchun
 * @property {string} currency
 * @property {number} allocated
 * @property {number[]} thresholds         Ogohlantirish foizlari, masalan [50,75,90,95,100]
 * @property {boolean} hardLimit           true = Hard Limit (bloklaydi), false = Soft Limit
 * @property {boolean} active
 * @property {string} notes
 */

export {};
