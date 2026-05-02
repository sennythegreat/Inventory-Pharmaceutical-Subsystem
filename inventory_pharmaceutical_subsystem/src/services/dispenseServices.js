import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const dispenseService = {
  /**
   * Search for a prescription by ID
   */
  async searchPrescription(prescriptionId) {
    const response = await fetchWithAuth(`/api/dispense?prescriptionId=${prescriptionId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Prescription not found");
    }
    return response.json();
  },

  /**
   * Complete the dispense process
   */
  async dispenseMedication(dispenseData) {
    const response = await fetchWithAuth("/api/dispense", {
      method: "POST",
      body: JSON.stringify(dispenseData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to dispense medication");
    }
    return response.json();
  }
};