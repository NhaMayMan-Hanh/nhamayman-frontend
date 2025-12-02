// Blog Data Model
export interface BlogData {
   _id: string;
   name: string;
   like: number;
   description: string;
   img?: string;
   slug: string;
   content: string;
   createdAt: string;
   updatedAt: string;
   __v?: number;
}

// Generic API Response
export interface ApiResponse<T = any> {
   success: boolean;
   data: T;
   message?: string; // Thêm message cho error handling
}

// Specific Response Types
export type BlogListResponse = ApiResponse<BlogData[]>;
export type BlogDetailResponse = ApiResponse<BlogData>;
export type BlogCreateResponse = ApiResponse<BlogData>;
export type BlogUpdateResponse = ApiResponse<BlogData>;
export type BlogDeleteResponse = ApiResponse<{ message: string }>;

// Form Data Types
export interface BlogFormData {
   name: string;
   slug: string;
   description: string;
   content: string;
   img: string | File | null;
}

// UI State Types
export type ModalType = "delete" | "";

export interface FilterOptions {
   sortBy: "newest" | "oldest" | "name";
   dateRange: "all" | "today" | "week" | "month" | "year";
}
