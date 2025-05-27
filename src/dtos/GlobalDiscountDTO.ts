export default function GlobalDiscountDTO(discount?: any) {
  if (!discount) return {};
  
  return {
    id: discount._id,
    discountPercentage: discount.discountPercentage,
    startDate: discount.startDate,
    endDate: discount.endDate,
    status: discount.status,
    createdAt: discount.createdAt,
    updatedAt: discount.updatedAt,
  };
}
