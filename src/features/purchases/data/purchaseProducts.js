export const purchaseProducts = [];

export const getReorderSuggestions = (products = purchaseProducts) =>
  products
    .filter((product) => Number(product.stock || 0) <= Number(product.reorderPoint || 0))
    .map((product) => ({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      stock: Number(product.stock || 0),
      reorderPoint: Number(product.reorderPoint || 0),
      suggestedQty: Math.max(Number(product.moq || 0), 0),
    }));
