"use client";

import { UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-white flex items-center justify-between px-6 text-gray-900 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-lg font-medium">Subsystem: Inventory</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold leading-tight text-gray-900">S0000 (User)</p>
        </div>
        <UserCircle className="w-8 h-8 text-gray-400" />
      </div>
    </header>
  );
}
