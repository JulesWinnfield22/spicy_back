import { Request, Response } from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  removeProduct,
  updateProduct,
  applyDiscountToProduct,
  resetProductDiscount,
} from "./productsDbCall";
import ProductDTO from "../../dtos/ProductDTO";
import { asyncCall, getPagination } from "../../utils/utils";
import ProductsSchema from "src/db/models/ProductsSchema";

export async function getTopDeals(req: Request, res: Response) {
  const result = await asyncCall(
    ProductsSchema.find({
      discountPercentage: { $gt: 0 },
      discountExpiry: { $gt: new Date() },
    })
      .sort({
        discountPercentage: -1,
      })
      .limit(3)
  );

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  res.json(result.data?.map(ProductDTO));
}

export async function getAllProducts(req: Request, res: Response) {
  const result = await getProducts(req.query as any);

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  res.json({
    ...result.data,
    response: result.data.response?.map(ProductDTO),
  });
}

export async function getProduct(req: Request, res: Response) {
  const { productId } = req.params;

  const result = await getProductById(productId);

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  if (!result.data) {
    res.status(404).json({
      message: "Product not found",
    });
    return;
  }

  res.json(ProductDTO(result.data));
}

export async function addProduct(req: Request, res: Response) {
  const result = await createProduct(req.body);
  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  res.status(201).json(ProductDTO(result.data));
}

export async function editProduct(req: Request, res: Response) {
  const { productId } = req.params;
  const result = await updateProduct(productId, req.body);

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  if (!result.data) {
    res.status(404).json({
      message: "Product not found",
    });
    return;
  }

  res.json(ProductDTO(result.data));
}

export async function deleteProduct(req: Request, res: Response) {
  const { productId } = req.params;
  const result = await removeProduct(productId);

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  if (!result.data) {
    res.status(404).json({
      message: "Product not found",
    });
    return;
  }

  res.json({
    message: "Product removed successfully",
    product: ProductDTO(result.data),
  });
}

export async function applyDiscount(req: Request, res: Response) {
  const { productId } = req.params;
  const { discountPercentage, discountExpiry } = req.body;

  if (!discountPercentage || !discountExpiry) {
    res.status(400).json({
      message: "Discount percentage and expiry date are required",
    });
    return;
  }

  const result = await applyDiscountToProduct(
    productId,
    discountPercentage,
    new Date(discountExpiry)
  );

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  if (!result.data) {
    res.status(404).json({
      message: "Product not found",
    });
    return;
  }

  res.json(ProductDTO(result.data));
}

export async function removeDiscount(req: Request, res: Response) {
  const { productId } = req.params;
  const result = await resetProductDiscount(productId);

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  if (!result.data) {
    res.status(404).json({
      message: "Product not found",
    });
    return;
  }

  res.json(ProductDTO(result.data));
}
