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
      const data = await inventoryService.getAllInventory();
      setMedications(data);
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
