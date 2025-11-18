import { Blog, FilterOptions } from "./types";

export const formatDate = (dateString: string): string => {
   const date = new Date(dateString);
   return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
   });
};

export const filterBlogs = (
   blogs: Blog[],
   searchTerm: string,
   filters: FilterOptions
): Blog[] => {
   let filtered = blogs.filter(
      (blog) =>
         blog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         blog.description.toLowerCase().includes(searchTerm.toLowerCase())
   );

   // Apply date range filter
   const now = new Date();
   if (filters.dateRange !== "all") {
      filtered = filtered.filter((blog) => {
         const blogDate = new Date(blog.createdAt);
         const diffTime = Math.abs(now.getTime() - blogDate.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

         switch (filters.dateRange) {
            case "today":
               return diffDays === 0;
            case "week":
               return diffDays <= 7;
            case "month":
               return diffDays <= 30;
            case "year":
               return diffDays <= 365;
            default:
               return true;
         }
      });
   }

   // Apply sorting
   return filtered.sort((a, b) => {
      switch (filters.sortBy) {
         case "newest":
            return (
               new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
         case "oldest":
            return (
               new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
         case "name":
            return a.name.localeCompare(b.name);
         default:
            return 0;
      }
   });
};

export const paginateBlogs = (
   blogs: Blog[],
   currentPage: number,
   itemsPerPage: number
): Blog[] => {
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   return blogs.slice(startIndex, endIndex);
};

export const getTotalPages = (
   totalItems: number,
   itemsPerPage: number
): number => {
   return Math.ceil(totalItems / itemsPerPage);
};
