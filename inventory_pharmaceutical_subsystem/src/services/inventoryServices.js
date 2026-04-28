export const inventoryService = {
  async getAllInventory() {
    const response = await fetch("/api/inventory");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch inventory");
    }
    return response.json();
  },
};
