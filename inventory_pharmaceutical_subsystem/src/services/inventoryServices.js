export const inventoryService = {
  async getAllInventory() {
    const response = await fetch("/api/inventory");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch inventory");
    }
    return response.json();
  },

  async addMedicine(medicineData) {
    const response = await fetch("/api/inventory", {
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
    const response = await fetch(`/api/inventory/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        quantityToAdd,
        price,
        expiry
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update stock");
    }
    return response.json();
  },
};
