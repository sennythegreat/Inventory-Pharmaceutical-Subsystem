// src/hooks/hooks.js
// FIX: API now returns { data: [...], meta: {...} }
// so we unwrap `.data` before storing in state.

import { useState, useEffect } from "react";
import { inventoryService } from "../services/inventoryServices";

export function useInventory() {
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getAllInventory();

      // The API returns { data: [...], meta: {...} }
      // Extract the array; fall back to [] if shape is unexpected
      const list = Array.isArray(response)
        ? response // old shape (plain array) — just in case
        : (response?.data ?? []);

      setMedications(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return { medications, isLoading, error, refresh: fetchInventory };
}
