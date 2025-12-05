export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface Category {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  category: string;
  categoryName?: string;
  image: string;
  stock: number;
}

export interface Blog {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description: string;
}

export interface Me {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export type { Category, Product };
