import { Navigate, useLocation, useNavigate, useParams, useRoutes } from "react-router-dom";
import { useMemo } from "react";
import { Boxes } from "lucide-react";

import ProductsHeader from "../components/ProductsHeader/ProductsHeader";
import ProductsNavigation from "../components/ProductsNavigation/ProductsNavigation";
import ProductQuickView from "../components/ProductQuickView/ProductQuickView";
import ProductsDashboard from "./ProductsDashboard/ProductsDashboard";
import ProductsHub from "./ProductsHub";
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
import { productNavigationGroups, productPathByView } from "../config/productsNavigation";

import "./Products.scss";

const ProductRouteNotFound = () => {
  const navigate = useNavigate();

  return (
    <section className="products-empty-state">
      <strong>Sahifa topilmadi</strong>
      <span>Bu mahsulotlar yo'nalishi mavjud emas yoki noto'g'ri manzil kiritilgan.</span>
      <button type="button" className="products-mini-button is-primary" onClick={() => navigate("/products/list")}>
        Mahsulotlar ro'yxati
      </button>
    </section>
  );
};

const ProductDetailsRoute = ({ controller, edit = false }) => {
  const { productId } = useParams();
  const product = productId ? controller.productsById[productId] : null;

  if (!product) return <ProductRouteNotFound />;

  if (edit) {
    return <ProductEdit product={product} controller={controller} />;
  }

  return (
    <ProductDetails
      product={product}
      productsById={controller.productsById}
      canViewCost={controller.permissions.canViewCost}
      purchaseHistoryRows={controller.purchaseHistoryRows.filter((row) => row.productId === product.id)}
      supplierSummary={controller.supplierSummariesByProductId[product.id]}
      onDuplicate={controller.actions.duplicateProduct}
      onArchive={controller.actions.archiveProduct}
      onRestore={controller.actions.restoreProduct}
    />
  );
};

const ProductsRoutes = ({ controller, categoriesWithCounts, onNavigate }) => {
  const navigate = useNavigate();

  return useRoutes([
    {
      index: true,
      element: <ProductsHub controller={controller} categoriesWithCounts={categoriesWithCounts} />,
    },
    {
      path: "overview",
      element: (
        <ProductsDashboard
          metrics={controller.metrics}
          products={controller.products}
          aiInsights={controller.aiInsights}
          onNavigate={onNavigate}
          onOpenProduct={(productId) => navigate(`/products/${productId}`)}
          onRunAiAction={controller.actions.runAiAction}
        />
      ),
    },
    { path: "dashboard", element: <Navigate to="/products/overview" replace /> },
    { path: "list", element: <ProductList controller={controller} /> },
    { path: "new", element: <ProductCreate controller={controller} /> },
    {
      path: "categories",
      element: (
        <Categories
          categories={categoriesWithCounts}
          onCreateCategory={controller.actions.createCategory}
          onUpdateCategory={controller.actions.updateCategory}
          onDeleteCategory={controller.actions.deleteCategory}
        />
      ),
    },
    {
      path: "brands",
      element: (
        <Brands
          brands={controller.state.brands}
          units={controller.state.units}
          onCreateBrand={controller.actions.createBrand}
          onUpdateBrand={controller.actions.updateBrand}
          onDeleteBrand={controller.actions.deleteBrand}
        />
      ),
    },
    {
      path: "pricing",
      element: (
        <PriceLists
          products={controller.products}
          priceLists={controller.state.priceLists}
          canApprove={controller.permissions.canApprovePrice}
          onSubmitApproval={controller.actions.submitPriceApproval}
          onResolveApproval={controller.actions.resolvePriceApproval}
        />
      ),
    },
    {
      path: "import-export",
      element: (
        <ProductImportExport
          importPreview={controller.importPreview}
          asyncStatus={controller.asyncStatus}
          canImport={controller.permissions.canImport}
          onValidateImport={controller.actions.validateImport}
          onConfirmImport={controller.actions.confirmImport}
          onExport={controller.actions.exportProducts}
        />
      ),
    },
    { path: "analytics", element: <ProductAnalytics products={controller.products} /> },
    {
      path: "settings",
      element: (
        <ProductSettings
          state={controller.state}
          role={controller.role}
          permissions={controller.permissions}
          onMarkNotificationRead={controller.actions.markNotificationRead}
        />
      ),
    },
    { path: ":productId/edit", element: <ProductDetailsRoute controller={controller} edit /> },
    { path: ":productId", element: <ProductDetailsRoute controller={controller} /> },
    { path: "*", element: <ProductRouteNotFound /> },
  ]);
};

const Products = () => {
  const controller = useProductsController();
  const location = useLocation();
  const navigate = useNavigate();
  const isHubRoute = location.pathname.replace(/\/$/, "") === "/products";
  const categoriesWithCounts = useMemo(
    () =>
      controller.state.categories.map((category) => ({
        ...category,
        productCount: controller.products.filter((product) => product.categoryId === category.id).length,
      })),
    [controller.products, controller.state.categories],
  );

  const navigateView = (view) => {
    const nextPath = productPathByView[view] || "";
    navigate(`/products/${nextPath}`.replace(/\/$/, ""));
  };

  return (
    <main className="zenix-products">
      {!isHubRoute ? (
        <>
          <ProductsHeader
            searchRef={controller.refs.searchRef}
            search={controller.search}
            onSearch={controller.actions.setSearch}
            products={controller.products}
            role={controller.role}
            onRoleChange={controller.actions.setRole}
            unreadCount={controller.state.notifications.filter((item) => !item.read).length}
            onImport={() => navigate("/products/import-export")}
            onExport={controller.actions.exportProducts}
            onReset={controller.actions.resetState}
          />

          <ProductsNavigation
            groups={productNavigationGroups}
          />
        </>
      ) : null}

      {!isHubRoute && !controller.permissions.canViewCost && (
        <section className="products-permission-note">
          <Boxes size={15} />
          Bu rolda tannarx, foyda va ayrim narx amallari yashirilgan yoki o'chirilgan.
        </section>
      )}

      <ProductsRoutes
        controller={controller}
        categoriesWithCounts={categoriesWithCounts}
        onNavigate={navigateView}
      />

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
