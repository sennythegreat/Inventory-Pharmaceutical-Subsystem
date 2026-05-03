"use client";
// Updated Header: reads the logged-in user from localStorage,
// shows their username and Logout button.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, LogOut } from "lucide-react";

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

      {/* Right: user info + logout */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight text-gray-900">
              {user.username}
            </p>
            <p className="text-xs text-gray-400 leading-tight">{user.role}</p>
          </div>
        )}

        <UserCircle className="w-8 h-8 text-gray-400" />

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Log out"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors ml-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
