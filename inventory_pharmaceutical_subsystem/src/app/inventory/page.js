"use client";

import { useState } from "react";
import InventorySearch from "./inventorysearch";
import InventoryTable from "./inventorytable";

const SAMPLE_DATA = [
  {
    id: "MED0001",
    name: "Paracetamol",
    dosage: "500mg",
    qty: 120,
    price: 5.0,
    expiry: "2027-03-01",
    status: "SUFFICIENT",
  },
  {
    id: "MED0002",
    name: "Cetirizine",
    dosage: "10mg",
    qty: 15,
    price: 12.5,
    expiry: "2026-07-15",
    status: "LOW",
  },
  {
    id: "MED0003",
    name: "Amoxicillin",
    dosage: "250mg",
    qty: 0,
    price: 18.0,
    expiry: "2026-05-20",
    status: "OUT OF STOCK",
  },
  {
    id: "MED0004",
    name: "Ibuprofen",
    dosage: "200mg",
    qty: 80,
    price: 8.0,
    expiry: "2025-12-31",
    status: "EXPIRING SOON",
  },
  {
    id: "MED0005",
    name: "Metformin",
    dosage: "500mg",
    qty: 200,
    price: 7.5,
    expiry: "2027-09-10",
    status: "SUFFICIENT",
  },
];

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setFilter] = useState("All Statuses");

  const filtered = SAMPLE_DATA.filter((item) => {
    const matchSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Statuses" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-48 bg-white border-r border-gray-200 flex-shrink-0 pt-8 px-4">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-4 uppercase">
          Main Menu
        </p>
        <nav className="space-y-1">
          <a
            href="#"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 font-medium text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            Inventory
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 text-sm transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Transaction Logs
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-400 font-medium">
            Subsystem: Inventory
          </p>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                S0001 (Health Worker)
              </p>
              <p className="text-xs text-blue-600 font-medium">
                Role: Full Access
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="flex items-start justify-between mt-6 mb-6">
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

        {/* Table */}
        <InventoryTable data={filtered} />
      </main>
    </div>
  );
}
