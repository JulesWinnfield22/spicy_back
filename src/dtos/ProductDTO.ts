export default function ProductDTO(product?: any) {
  if (!product) return {};
  
  return {
    id: product?.product_id,
    title: product.title,
    images: product.images,
    description: product.description,
    ingredients: product.ingredients,
    instructions: product.instructions,
    price: product.price,
    discountPercentage: product.discountPercentage || 0,
    discountExpiry: product.discountExpiry,
    discountedPrice: product.discountedPrice,
    isDiscounted: product.isDiscounted,
    weight: product.weight,
    weightUnit: product.weightUnit,
    quantity: product.quantity,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
