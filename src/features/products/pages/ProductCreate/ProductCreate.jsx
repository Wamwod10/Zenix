import ProductForm from "../../components/ProductForm/ProductForm";

const ProductCreate = ({ controller }) => (
  <ProductForm
    mode="create"
    products={controller.state.products}
    categories={controller.state.categories}
    brands={controller.state.brands}
    units={controller.state.units}
    allProducts={controller.products}
    onSubmit={controller.actions.createOrUpdateProduct}
    onGenerateCodes={controller.actions.generateCodes}
    onCreateCategory={controller.actions.createCategory}
    onCreateBrand={controller.actions.createBrand}
  />
);

export default ProductCreate;
