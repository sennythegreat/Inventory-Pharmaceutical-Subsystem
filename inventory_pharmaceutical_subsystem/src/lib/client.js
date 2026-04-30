import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/**
 * Authenticated fetch wrapper.
 * Reads the JWT from localStorage and injects it as a Bearer token.
 * On 401, clears storage and redirects to /login automatically.
 *
 * Usage:
 *   import { apiFetch } from '@/lib/client';
 *   const res  = await apiFetch('/api/inventory');
 *   const data = await res.json();
 */
export async function apiFetch(url, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  // Auto-logout on expired / missing token
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    return res; // return so callers can still inspect if needed
  }

  return res;
}

/** Convenience: GET /api/inventory with auth */
export async function fetchInventory() {
  const res = await apiFetch("/api/inventory");
  if (!res.ok) throw new Error(`Inventory fetch failed: ${res.status}`);
  return res.json();
}

/** Convenience: GET /api/inventory/:id with auth */
export async function fetchInventoryItem(id) {
  const res = await apiFetch(`/api/inventory/${id}`);
  if (!res.ok) throw new Error(`Item fetch failed: ${res.status}`);
  return res.json();
}
