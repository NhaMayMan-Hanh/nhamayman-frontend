import { Product } from "../types";

interface RelatedProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface ProductData {
  message: string;
  success: boolean;
  data: {
    product: Product;
    relatedProducts: RelatedProduct[];
  };
}
