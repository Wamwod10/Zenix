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
  />
);

export default ProductEdit;
