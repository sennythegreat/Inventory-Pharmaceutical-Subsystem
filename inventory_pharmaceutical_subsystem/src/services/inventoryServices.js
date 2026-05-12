//fetchWithAuth automatically:
//   adds Authorization: Bearer <token> from localStorage
//   redirects to /login on a 401 response

import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const inventoryService = {
  async getAllInventory() {
    const response = await fetchWithAuth("/api/inventory");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch inventory");
    }
    return response.json();
  },

  async addMedicine(medicineData) {
    const response = await fetchWithAuth("/api/inventory", {
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

  async deleteMedicine(id) {
    const response = await fetchWithAuth(`/api/inventory/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete medicine");
    }
    return response.json();
  },

  async updateMedicineDetails(id, medicineData) {
    const response = await fetchWithAuth(`/api/inventory/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...medicineData,
        isFullEdit: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update medicine");
    }
    return response.json();
  },
};
