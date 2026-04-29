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

//DISPENSE HOOKS HERE!! 

import { useState } from "react";
import { dispenseService } from "../services/dispenseService";

export function useDispense() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submitDispense = async ({ patientId, items, staffId }) => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const data = await dispenseService.submitDispense({ patientId, items, staffId });
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitDispense, submitting, error, result };
}