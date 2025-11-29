export interface User {
   _id: string;
   name: string;
   username: string;
   email: string;
   avatar?: string;
   role: string;
   isVerified: boolean;
   createdAt: string;
   updatedAt: string;
}

export interface ApiResponse {
   success: boolean;
   data: User[];
}

export interface FilterOptions {
   sortBy: "newest" | "oldest" | "name";
   dateRange: "all" | "today" | "week" | "month" | "year";
   role: "all" | "admin" | "user";
   verified: "all" | "verified" | "unverified";
}
