"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function NavLink({ href, children, onClick, className = "" }: NavLinkProps) {
  const pathname = usePathname();

  const isActiveLink = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const active = isActiveLink(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        text-gray-700 hover:text-amber-500 transition-all duration-200 px-3 py-2 
        whitespace-nowrap rounded-lg text-sm font-medium
        ${active ? "bg-amber-50 text-amber-600 font-semibold shadow-sm" : "hover:bg-gray-50"}
        ${className}
      `.trim()}
    >
      {children}
    </Link>
  );
}
