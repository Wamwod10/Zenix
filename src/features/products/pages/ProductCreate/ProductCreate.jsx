import { useSearchParams } from "react-router-dom";

import { useSuppliers } from "../../../suppliers/suppliersApi";
import ProductForm from "../../components/ProductForm/ProductForm";

const ProductCreate = ({ controller }) => {
  const [searchParams] = useSearchParams();
  const { actions: supplierActions } = useSuppliers();
  const supplierId = searchParams.get("supplierId");

  const handleSubmit = (payload) => {
    const result = controller.actions.createOrUpdateProduct(payload);

    if (result?.ok && supplierId) {
      const productCost = Number(
        result.product.currentCost ??
          result.product.cost ??
          result.product.standardCost ??
          0,
      ) || 0;
      supplierActions.updateSupplier(supplierId, {
        productId: result.product.id,
        productTerms: {
          purchasePrice: productCost,
          currency: "UZS",
          status: "active",
          source: "product_catalog_create",
        },
      });
    }

    return result;
  };

  return (
    <ProductForm
      mode="create"
      products={controller.state.products}
      categories={controller.state.categories}
      brands={controller.state.brands}
      units={controller.state.units}
      allProducts={controller.products}
      onSubmit={handleSubmit}
      onGenerateCodes={controller.actions.generateCodes}
      onCreateCategory={controller.actions.createCategory}
      onCreateBrand={controller.actions.createBrand}
      approvalRequired={Boolean(controller.state.settings.productApprovalRequired)}
    />
  );
};

export default ProductCreate;
