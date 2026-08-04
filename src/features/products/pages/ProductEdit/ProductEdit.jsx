import ProductForm from "../../components/ProductForm/ProductForm";

const ProductEdit = ({ product, controller }) => (
  <ProductForm
    mode="edit"
    product={product}
    products={controller.state.products}
    categories={controller.state.categories}
    brands={controller.state.brands}
    units={controller.state.units}
    allProducts={controller.products}
    onSubmit={controller.actions.createOrUpdateProduct}
    onGenerateCodes={controller.actions.generateCodes}
    onCreateCategory={controller.actions.createCategory}
    onCreateBrand={controller.actions.createBrand}
    approvalRequired={Boolean(controller.state.settings.productApprovalRequired)}
  />
);

export default ProductEdit;
