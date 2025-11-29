// types/product.types.ts

export interface Category {
   _id: string;
   name: string;
}

export interface Product {
   _id: string;
   name: string;
   description: string;
   detailedDescription?: string;
   price: number;
   category: string; // Category name (String) - được lưu trực tiếp trong DB
   image: string;
   stock: number;
   __v?: number;
}

export interface ApiResponse<T> {
   success: boolean;
   data: T;
   message?: string;
}

export interface ProductFormData {
   name: string;
   description: string;
   detailedDescription: string;
   price: string;
   categoryName?: string; // Cho edit page
   category?: string; // Cho create page (lưu _id tạm)
   stock: string;
}

export type ToastType = "success" | "error" | "loading";
