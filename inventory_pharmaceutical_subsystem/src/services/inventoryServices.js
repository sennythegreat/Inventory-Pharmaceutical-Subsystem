// src/services/inventoryServices.js
// ─────────────────────────────────────────────────────────────────────────────
// CHANGE: replaced fetch() with fetchWithAuth() on all three methods.
// fetchWithAuth automatically:
//   • adds Authorization: Bearer <token> from localStorage
//   • redirects to /login on a 401 response
// Everything else is identical to your original code.
// ─────────────────────────────────────────────────────────────────────────────

import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const inventoryService = {
  async getAllInventory() {
    const response = await fetchWithAuth("/api/inventory"); // ← was fetch()
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch inventory");
    }
    return response.json();
  },

  async addMedicine(medicineData) {
    const response = await fetchWithAuth("/api/inventory", {
      // ← was fetch()
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(medicineData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add medicine");
    }
    return response.json();
  },

  async updateStock(id, quantityToAdd, price, expiry) {
    const response = await fetchWithAuth(`/api/inventory/${id}`, {
      // ← was fetch()
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantityToAdd,
        price,
        expiry,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update stock");
    }
    return response.json();
  },
};
