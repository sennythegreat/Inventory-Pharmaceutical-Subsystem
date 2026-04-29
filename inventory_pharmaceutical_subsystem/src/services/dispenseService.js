export const dispenseService = {
  async submitDispense({ patientId, items, staffId }) {
    const response = await fetch("/api/dispense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, items, staffId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to process dispense session.");
    }
    return response.json();
  },
};