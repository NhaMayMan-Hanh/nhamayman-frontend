// components/SidebarItem.tsx
import Link from "next/link";
import { ReactNode } from "react";

interface SidebarItemProps {
   isOpen: boolean;
   href: string;
   title: string;
   icon: ReactNode;
   gradient?: boolean;
   isActive?: boolean;
}

export default function SidebarItem({
   isOpen,
   href,
   title,
   icon,
   gradient,
   isActive = false,
}: SidebarItemProps) {
   return (
      <Link
         href={href}
         className={`flex items-center ${
            isOpen ? "justify-start" : "justify-center"
         } gap-3 px-3 py-3 rounded-xl transition-colors duration-200 group
        ${
           isActive
              ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-900/30"
              : gradient
              ? "bg-gradient-to-r from-blue-600/80 to-blue-500/80 shadow-lg shadow-blue-900/20"
              : "hover:bg-slate-700/50"
        }`}
         title={title}
      >
         <div
            className={`w-6 h-6 flex items-center justify-center shrink-0 ${
               isActive ? "text-white" : "text-slate-400"
            } group-hover:text-white transition-colors`}
         >
            {icon}
         </div>
         {isOpen && (
            <span
               className={`text-sm ${
                  isActive ? "text-white font-medium" : "text-slate-300"
               } group-hover:text-white transition-colors whitespace-nowrap`}
            >
               {title}
            </span>
         )}
      </Link>
   );
}
