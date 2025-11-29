// Utility functions
export const formatDate = (dateString: string): string => {
   const date = new Date(dateString);
   return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
   });
};
