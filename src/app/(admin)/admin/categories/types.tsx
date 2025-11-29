// types/category.ts

export interface Category {
   _id: string;
   name: string;
   img: string;
   slug: string;
   description: string;
   createdAt: string;
   updatedAt: string;
   __v: number;
}

export interface ApiResponse {
   success: boolean;
   message: string;
   data: Category[];
}

export interface SingleCategoryApiResponse {
   success: boolean;
   message: string;
   data: Category;
}

export interface FilterOptions {
   sortBy: "newest" | "oldest" | "name";
   searchTerm: string;
}

export interface DeleteModalProps {
   category: Category;
   onClose: () => void;
   onConfirm: () => void;
}
