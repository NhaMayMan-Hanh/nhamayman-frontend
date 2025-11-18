// Type definitions
export interface Blog {
   _id: string;
   name: string;
   description: string;
   img?: string;
   slug: string;
   content: string;
   createdAt: string;
   updatedAt?: string;
}

export interface ApiResponse {
   success: boolean;
   data: Blog[];
}

export type ModalType = "delete" | "";

export interface FilterOptions {
   sortBy: "newest" | "oldest" | "name";
   dateRange: "all" | "today" | "week" | "month" | "year";
}
