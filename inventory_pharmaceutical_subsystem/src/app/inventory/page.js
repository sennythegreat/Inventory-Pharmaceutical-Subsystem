"use client";

import { useState, useEffect } from "react";
import InventorySearch from "../../components/inventory/inventorysearch";
import InventoryTable from "../../components/inventory/inventorytable";
import { createClient } from "../../lib/client";

export default function InventoryPage() {
  const supabase = createClient();
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  //search & filter
  const [search, setSearch] = useState("");
  const [statusFilter, setFilter] = useState("All Statuses");

  //fetch medications from Supabase
  const fetchMedications = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: supabaseError } = await supabase
      .from("medications")
      .select("*");

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      setError("Failed to load inventory. Please try again.");
      setMedications([]);
    } else {
      setMedications(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  //filter medications based on search and status filter
  const filtered = medications.filter((item) => {
    const matchSearch =
      item.id?.toLowerCase().includes(search.toLowerCase()) ||
      item.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Statuses" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  //loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  //display error if fetch fail
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center flex-col gap-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchMedications}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Live stock levels across all medication categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <InventorySearch
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setFilter={setFilter}
          />
          <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
            <span className="text-lg leading-none">⊕</span> ADD MEDICATION
          </button>
        </div>
      </div>

      {/* Table - now uses real filtered data */}
      <InventoryTable data={filtered} />
    </div>
  );
}


