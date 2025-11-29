import Link from "next/link";

const ActionButton = ({
   href,
   icon,
   color,
   title,
}: {
   href: string;
   icon: "view" | "edit";
   color: "blue" | "green";
   title: string;
}) => {
   const colors = {
      blue: "text-blue-600 hover:bg-blue-50",
      green: "text-green-600 hover:bg-green-50",
   };
   const icons = {
      view: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
      edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
   };

   return (
      <Link
         href={href}
         className={`p-2 ${colors[color]} rounded-lg transition`}
         title={title}
      >
         <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
         >
            <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d={icons[icon]}
            />
         </svg>
      </Link>
   );
};
export default ActionButton;
