import { fetchWithAuth } from "@/lib/fetchWithAuth";

/**
 * Service to handle retrieval of invoices from the external subsystem
 */
export const externalInventoryService = {
  /**
   * Fetch all invoices from the external system with optional pagination
   */
  async getAllInvoices(page = 1, limit = 127) {
    const response = await fetchWithAuth(`/api/dispense/external?page=${page}&limit=${limit}`);
    if (!response.ok) {
        return { status: "error", data: [] };
    }
    return response.json();
  },

  /**
   * Search for a specific invoice by ID
   */
  async getInvoiceById(invoiceId) {
    const response = await fetchWithAuth(`/api/dispense/external?invoiceId=${invoiceId}`);
    if (!response.ok) {
        throw new Error("Invoice not found in external system");
    }
    return response.json();
  }
};
