export const formatDate = (dateString: string) => {
   const date = new Date(dateString);
   return `${date.toLocaleDateString("vi-VN")} lúc ${date.toLocaleTimeString(
      "vi-VN",
      {
         hour: "2-digit",
         minute: "2-digit",
      }
   )}`;
};
