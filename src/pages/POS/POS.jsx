import BarcodeInput from "../../features/pos/BarcodeInput/BarcodeInput";
import Cart from "../../features/pos/Cart/Cart";
import CategoryTabs from "../../features/pos/CategoryTabs/CategoryTabs";
import CustomerSelectModal from "../../features/pos/CustomerSelectModal/CustomerSelectModal";
import DiscountModal from "../../features/pos/DiscountModal/DiscountModal";
import HeldOrders from "../../features/pos/HeldOrders/HeldOrders";
import HoldSaleModal from "../../features/pos/HoldSaleModal/HoldSaleModal";
import ItemEditModal from "../../features/pos/ItemEditModal/ItemEditModal";
import ManagerApprovalModal from "../../features/pos/ManagerApprovalModal/ManagerApprovalModal";
import POSHeader from "../../features/pos/POSHeader/POSHeader";
import POSInsightsPanel from "../../features/pos/POSInsightsPanel/POSInsightsPanel";
import POSNotifications from "../../features/pos/POSNotifications/POSNotifications";
import POSOfflineBanner from "../../features/pos/POSOfflineBanner/POSOfflineBanner";
import POSReports from "../../features/pos/POSReports/POSReports";
import POSSettings from "../../features/pos/POSSettings/POSSettings";
import PaymentModal from "../../features/pos/PaymentModal/PaymentModal";
import ProductGrid from "../../features/pos/ProductGrid/ProductGrid";
import ProductOptionsModal from "../../features/pos/ProductOptionsModal/ProductOptionsModal";
import ProductSearch from "../../features/pos/ProductSearch/ProductSearch";
import ReceiptPreview from "../../features/pos/ReceiptPreview/ReceiptPreview";
import RecentSales from "../../features/pos/RecentSales/RecentSales";
import ReturnModal from "../../features/pos/ReturnModal/ReturnModal";
import ShiftModal from "../../features/pos/ShiftModal/ShiftModal";
import usePOSController from "../../features/pos/hooks/usePOSController";
import { printReceipt } from "../../features/pos/utils/posPrint";

import "./POS.scss";

const POS = () => {
  const {
    refs,
    data,
    state,
    cart,
    heldOrders,
    recentSales,
    settings,
    notifications,
    offline,
    shift,
    actions,
  } = usePOSController();

  return (
    <main className="zenix-pos">
      <POSHeader
        metrics={state.posMetrics}
        heldCount={heldOrders.orders.length}
        recentCount={recentSales.sales.length}
        onOpenHeldOrders={() => actions.setActiveModal("held")}
        onOpenRecentSales={() => actions.openRecentSales("recent")}
      />

      <POSOfflineBanner
        isOnline={offline.isOnline}
        queueCount={offline.queueCount}
        isSyncing={offline.isSyncing}
        onSync={actions.syncOfflineQueue}
        onGoOffline={offline.simulateOffline}
        onGoOnline={offline.simulateOnline}
      />

      <section className="zenix-pos__ops" aria-label="POS operations">
        <button type="button" onClick={() => actions.openShiftModal("open")}>
          Shift open
        </button>
        <button type="button" onClick={() => actions.openShiftModal("close")}>
          Shift close
        </button>
        <button type="button" onClick={() => actions.openShiftModal("cash")}>
          Cash in/out
        </button>
        <button type="button" onClick={() => actions.openShiftModal("report")}>
          X / Z report
        </button>
        <button type="button" onClick={() => actions.setActiveModal("reports")}>
          POS reports
        </button>
        <button type="button" onClick={() => actions.setActiveModal("settings")}>
          Settings
        </button>
      </section>

      <section className="zenix-pos__workspace">
        <div className="zenix-pos__catalog">
          <ProductSearch
            ref={refs.searchInputRef}
            value={state.searchQuery}
            onChange={actions.setSearchQuery}
            onBarcodeFocus={() => refs.barcodeInputRef.current?.focus()}
          />

          <BarcodeInput
            ref={refs.barcodeInputRef}
            value={state.barcodeValue}
            status={state.barcodeStatus}
            onChange={actions.setBarcodeValue}
            onSubmit={actions.handleBarcodeLookup}
          />

          <CategoryTabs
            categories={data.categories}
            activeCategory={state.activeCategory}
            onSelectCategory={actions.setActiveCategory}
          />

          <ProductGrid
            products={data.products}
            onAddToCart={actions.handleProductSelect}
          />
        </div>

        <Cart
          customer={state.selectedCustomer}
          items={cart.items}
          summary={cart.summary}
          note={cart.note}
          onNoteChange={cart.setNote}
          onClearCart={actions.startNewSale}
          onIncreaseItem={cart.increaseItem}
          onDecreaseItem={cart.decreaseItem}
          onRemoveItem={cart.removeItem}
          onEditItem={(item) => {
            actions.setEditingItem(item);
            actions.setActiveModal("item-edit");
          }}
          onQuickAction={actions.handleQuickAction}
          onCustomerSelect={() => actions.setActiveModal("customer")}
          onPayment={actions.openPayment}
        />
      </section>

      <POSInsightsPanel
        products={data.allProducts}
        cartItems={cart.items}
        recentSales={recentSales.sales}
        shift={shift.shift}
        recommendation={state.recommendation}
        onOpenRecentSales={() => actions.openRecentSales("recent")}
        onApplyRecommendation={() =>
          state.recommendation.product &&
          actions.handleProductSelect(state.recommendation.product)
        }
      />

      {state.shortcutFeedback && (
        <div className="zenix-pos__shortcut-feedback" role="status">
          <kbd>{state.shortcutFeedback.shortcut}</kbd>
          <span>{state.shortcutFeedback.label}</span>
        </div>
      )}

      <ProductOptionsModal
        open={state.activeModal === "product-options"}
        product={state.selectedProduct}
        onClose={actions.closeActiveModal}
        onConfirm={actions.addConfiguredProduct}
      />

      <ItemEditModal
        open={state.activeModal === "item-edit"}
        item={state.editingItem}
        onClose={actions.closeActiveModal}
        onSave={(itemId, patch) => {
          cart.updateItem(itemId, patch);
          actions.closeActiveModal();
        }}
      />

      <PaymentModal
        open={state.activeModal === "payment"}
        total={cart.summary.total}
        isOnline={offline.isOnline}
        customer={state.selectedCustomer}
        onClose={actions.closeActiveModal}
        onComplete={actions.handlePaymentComplete}
      />

      <HoldSaleModal
        open={state.activeModal === "hold"}
        items={cart.items}
        total={cart.summary.total}
        customer={state.selectedCustomer}
        onClose={actions.closeActiveModal}
        onConfirm={actions.handleHoldSale}
      />

      <HeldOrders
        open={state.activeModal === "held"}
        orders={heldOrders.orders}
        onClose={actions.closeActiveModal}
        onResume={actions.handleResumeOrder}
        onDelete={heldOrders.removeHeldOrder}
      />

      <CustomerSelectModal
        open={state.activeModal === "customer"}
        customers={data.customers}
        selectedCustomer={state.selectedCustomer}
        onClose={actions.closeActiveModal}
        onSelect={actions.handleCustomerSelect}
      />

      <DiscountModal
        open={state.activeModal === "discount"}
        subtotal={cart.summary.subtotal}
        currentDiscount={cart.discount}
        onClose={actions.closeActiveModal}
        onApply={actions.handleDiscountApply}
        onRemove={() => {
          cart.removeDiscount();
          actions.closeActiveModal();
        }}
      />

      <RecentSales
        open={state.activeModal === "recent"}
        mode={state.recentMode}
        sales={recentSales.sales}
        onClose={actions.closeActiveModal}
        onReopenReceipt={(sale) => {
          actions.setReceiptSale(sale);
          actions.setActiveModal("receipt");
        }}
        onReturnSale={(sale) => {
          actions.setReturnSale(sale);
          actions.setActiveModal("return");
        }}
      />

      <ReturnModal
        open={state.activeModal === "return"}
        sale={state.returnSale}
        onClose={actions.closeActiveModal}
        onConfirm={actions.handleReturnConfirm}
      />

      <ReceiptPreview
        open={state.activeModal === "receipt"}
        sale={state.receiptSale || state.returnSale}
        onClose={actions.closeActiveModal}
        onNewSale={actions.startNewSale}
        onPrint={printReceipt}
      />

      <ShiftModal
        open={state.activeModal === "shift"}
        mode={state.shiftMode}
        shift={shift.shift}
        sales={recentSales.sales}
        onClose={actions.closeActiveModal}
        onOpenShift={(payload) => {
          shift.openShift(payload);
          actions.closeActiveModal();
        }}
        onCloseShift={actions.handleShiftClose}
        onCashMovement={(payload) => {
          shift.addCashMovement(payload);
          actions.closeActiveModal();
        }}
        onReport={(type) => {
          shift.createShiftReport(type, recentSales.sales);
          actions.closeActiveModal();
        }}
      />

      <POSSettings
        open={state.activeModal === "settings"}
        settings={settings}
        onClose={actions.closeActiveModal}
        onChange={actions.updateSettings}
        onReset={actions.resetSettings}
      />

      <POSReports
        open={state.activeModal === "reports"}
        sales={recentSales.sales}
        returns={recentSales.returns}
        shift={shift.shift}
        onClose={actions.closeActiveModal}
      />

      <ManagerApprovalModal
        open={state.activeModal === "approval"}
        request={state.approvalRequest}
        onClose={actions.closeActiveModal}
        onApprove={actions.approveRequest}
      />

      <POSNotifications
        notifications={notifications.notifications}
        onDismiss={notifications.dismissNotification}
      />
    </main>
  );
};

export default POS;
