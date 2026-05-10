"use client";
// Updated Header: reads the logged-in user from localStorage,
// shows their username and Logout button.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  //Read user from localStorage once on mount (client-side only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const handleLogout = () => {
    //1. Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    //2. Clear the HttpOnly cookie by calling a tiny logout API endpoint
    //    (the browser can't delete HttpOnly cookies directly)
    fetch("/api/logout", { method: "POST" }).finally(() => {
      //3. Redirect to login
      router.push("/login");
    });
  };

  return (
    <header className="h-20 bg-white flex items-center justify-between px-6 text-gray-900 border-b border-gray-200">
      {/* Left: app title */}
      <div className="flex items-center gap-2">
        <span className="text-black-500 text-lg font-medium">
          Inventory &amp; Medication Distribution Subsystem
        </span>
      </div>

      {/* Right: user info with Popover Logout */}
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            {user && (
              <div className="text-right">
                <p className="text-sm font-semibold leading-tight text-gray-900 capitalize">
                  {user.username}
                </p>
                <p className="text-xs text-gray-400 leading-tight">{user.role}</p>
              </div>
            )}
            <UserCircle className="w-8 h-8 text-gray-400" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 bg-white border border-gray-200 shadow-lg rounded-xl">
          <div className="px-3 py-2 border-b border-gray-100 mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
          >
            <div className="p-1.5 bg-gray-100 group-hover:bg-red-100 rounded-md transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium">Sign Out</span>
          </button>
        </PopoverContent>
      </Popover>
    </header>
  );
}
