"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Pill, PlusCircle, History } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const navItems = [
    { href: "/inventory", label: "Inventory", icon: Pill },
    { href: "/dispense", label: "Dispense", icon: PlusCircle },
    { href: "/restock", label: "Restock", icon: PlusCircle },
    { href: "/transactions", label: "Transactions", icon: History },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-3.5rem)] sticky top-14">


      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  active
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
