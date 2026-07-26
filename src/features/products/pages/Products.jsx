import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  Factory,
  FolderTree,
  Import,
  PackageSearch,
  Settings,
  Sparkles,
} from "lucide-react";

import ProductsHeader from "../components/ProductsHeader/ProductsHeader";
import ProductsNavigation from "../components/ProductsNavigation/ProductsNavigation";
import ProductQuickView from "../components/ProductQuickView/ProductQuickView";
import ProductsDashboard from "./ProductsDashboard/ProductsDashboard";
import ProductList from "./ProductList/ProductList";
import ProductDetails from "./ProductDetails/ProductDetails";
import ProductCreate from "./ProductCreate/ProductCreate";
import ProductEdit from "./ProductEdit/ProductEdit";
import Categories from "./Categories/Categories";
import Brands from "./Brands/Brands";
import PriceLists from "./PriceLists/PriceLists";
import ProductAnalytics from "./ProductAnalytics/ProductAnalytics";
import ProductImportExport from "./ProductImportExport/ProductImportExport";
import ProductSettings from "./ProductSettings/ProductSettings";
import useProductsController from "../hooks/useProductsController";

import "./Products.scss";

const navigationGroups = [
  {
    id: "catalog",
    title: "Katalog",
    items: [
      { id: "dashboard", label: "Bosh sahifa", icon: Sparkles },
      { id: "list", label: "Mahsulotlar", icon: PackageSearch },
      { id: "categories", label: "Kategoriyalar", icon: FolderTree },
      { id: "brands", label: "Brend va birliklar", icon: Factory },
    ],
  },
  {
    id: "commerce",
    title: "Savdo",
    items: [
      { id: "pricing", label: "Narxlar", icon: CircleDollarSign },
      { id: "import-export", label: "Kiritish / chiqarish", icon: Import },
      { id: "analytics", label: "Tahlil", icon: BarChart3 },
      { id: "settings", label: "Sozlamalar", icon: Settings },
    ],
  },
];

const segmentToView = {
  "": "dashboard",
  list: "list",
  new: "new",
  categories: "categories",
  brands: "brands",
  pricing: "pricing",
  "import-export": "import-export",
  analytics: "analytics",
  settings: "settings",
};

const viewToPath = {
  dashboard: "",
  list: "list",
  categories: "categories",
  brands: "brands",
  pricing: "pricing",
  "import-export": "import-export",
  analytics: "analytics",
  settings: "settings",
};

const Products = () => {
  const controller = useProductsController();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.replace(/^\/products\/?/, "");
  const [segment, nested] = path.split("/");
  const activeView = segmentToView[segment || ""] || "details";
  const detailProductId = activeView === "details" ? segment : "";
  const detailProduct = detailProductId ? controller.productsById[detailProductId] : null;

  const navigateView = (view) => {
    const nextPath = viewToPath[view] || "";
    navigate(`/products/${nextPath}`.replace(/\/$/, ""));
  };

  const renderView = () => {
    if (activeView === "list") return <ProductList controller={controller} />;
    if (activeView === "new") return <ProductCreate controller={controller} />;
    if (activeView === "categories") {
      return (
        <Categories
          categories={controller.state.categories}
          onCreateCategory={controller.actions.createCategory}
        />
      );
    }
    if (activeView === "brands") {
      return (
        <Brands
          brands={controller.state.brands}
          units={controller.state.units}
          onCreateBrand={controller.actions.createBrand}
        />
      );
    }
    if (activeView === "pricing") {
      return (
        <PriceLists
          products={controller.products}
          priceLists={controller.state.priceLists}
          canApprove={controller.permissions.canApprovePrice}
          onSubmitApproval={controller.actions.submitPriceApproval}
          onResolveApproval={controller.actions.resolvePriceApproval}
        />
      );
    }
    if (activeView === "import-export") {
      return (
        <ProductImportExport
          importPreview={controller.importPreview}
          asyncStatus={controller.asyncStatus}
          canImport={controller.permissions.canImport}
          onValidateImport={controller.actions.validateImport}
          onConfirmImport={controller.actions.confirmImport}
          onExport={controller.actions.exportProducts}
        />
      );
    }
    if (activeView === "analytics") return <ProductAnalytics products={controller.products} />;
    if (activeView === "settings") {
      return (
        <ProductSettings
          state={controller.state}
          role={controller.role}
          permissions={controller.permissions}
          onMarkNotificationRead={controller.actions.markNotificationRead}
        />
      );
    }
    if (activeView === "details" && nested === "edit") {
      return <ProductEdit product={detailProduct} controller={controller} />;
    }
    if (activeView === "details") {
      return (
        <ProductDetails
          product={detailProduct}
          productsById={controller.productsById}
          canViewCost={controller.permissions.canViewCost}
          onDuplicate={controller.actions.duplicateProduct}
          onArchive={controller.actions.archiveProduct}
          onRestore={controller.actions.restoreProduct}
        />
      );
    }

    return (
      <ProductsDashboard
        metrics={controller.metrics}
        products={controller.products}
        aiInsights={controller.aiInsights}
        onNavigate={navigateView}
        onRunAiAction={controller.actions.runAiAction}
      />
    );
  };

  return (
    <main className="zenix-products">
      <ProductsHeader
        searchRef={controller.refs.searchRef}
        search={controller.search}
        onSearch={controller.actions.setSearch}
        role={controller.role}
        onRoleChange={controller.actions.setRole}
        unreadCount={controller.state.notifications.filter((item) => !item.read).length}
        onImport={() => navigate("/products/import-export")}
        onExport={controller.actions.exportProducts}
        onReset={controller.actions.resetState}
      />

      <ProductsNavigation
        groups={navigationGroups}
        activeView={activeView}
        onNavigate={navigateView}
      />

      {!controller.permissions.canViewCost && (
        <section className="products-permission-note">
          <Boxes size={15} />
          Bu rolda tannarx, foyda va ayrim narx amallari yashirilgan yoki o'chirilgan.
        </section>
      )}

      {renderView()}

      {controller.activeModal === "quickView" && (
        <ProductQuickView
          product={controller.quickViewProduct}
          canViewCost={controller.permissions.canViewCost}
          onClose={controller.actions.closeModal}
          onEdit={() => {
            const id = controller.quickViewProduct?.id;
            controller.actions.closeModal();
            if (id) navigate(`/products/${id}/edit`);
          }}
          onSubmitApproval={controller.actions.submitPriceApproval}
        />
      )}
    </main>
  );
};

export default Products;
