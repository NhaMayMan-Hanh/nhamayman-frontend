import { FilterOptions, User } from "./types";

export const filterUsers = (
   users: User[],
   searchTerm: string,
   filters: FilterOptions
): User[] => {
   let filtered = users.filter(
      (user) =>
         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.username.toLowerCase().includes(searchTerm.toLowerCase())
   );

   // Apply role filter
   if (filters.role !== "all") {
      filtered = filtered.filter((user) => user.role === filters.role);
   }

   // Apply verified filter
   if (filters.verified !== "all") {
      filtered = filtered.filter((user) =>
         filters.verified === "verified" ? user.isVerified : !user.isVerified
      );
   }

   // Apply date range filter
   const now = new Date();
   if (filters.dateRange !== "all") {
      filtered = filtered.filter((user) => {
         const userDate = new Date(user.createdAt);
         const diffTime = Math.abs(now.getTime() - userDate.getTime());
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
