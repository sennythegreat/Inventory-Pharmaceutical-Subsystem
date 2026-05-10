"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { inventoryService } from "../../services/inventoryServices";

export default function InventoryTable({ data, onRefresh }) {
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", dosage: "", price: "", expiry: "" });
  const [isDeleting, setIsDeleting] = useState(null);

  const getQtyColor = (status) => {
    if (status === "OUT OF STOCK") return "text-red-500 font-bold";
    if (status === "LOW") return "text-orange-400 font-bold";
    return "text-gray-800 font-medium";
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      name: item.name,
      dosage: item.dosage,
      price: item.price,
      expiry: item.expiry_date || item.expiry
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;
    setIsDeleting(id);
    try {
      await inventoryService.deleteMedicine(id);
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSave = async (id) => {
    try {
      await inventoryService.updateMedicineDetails(id, editForm);
      setEditingItem(null);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-[#111827]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {[
              "ID",
              "MEDICATION NAME",
              "DOSAGE",
              "QTY",
              "PRICE",
              "EXPIRY DATE",
              "STATUS",
              "ACTIONS"
            ].map((col) => (
              <th
                key={col}
                className="text-left text-[11px] font-semibold text-gray-400 tracking-wider px-6 py-4"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="text-center text-gray-400 py-12 text-sm"
              >
                No medications found.
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={item.id}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === data.length - 1 ? "border-b-0" : ""}`}
              >
                <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                  {item.id}
                </td>
                <td className="px-6 py-4">
                  {editingItem === item.id ? (
                    <input 
                      className="border rounded px-2 py-1 w-full"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  ) : <span className="font-semibold">{item.name}</span>}
                </td>
                <td className="px-6 py-4">
                  {editingItem === item.id ? (
                    <input 
                      className="border rounded px-2 py-1 w-full"
                      value={editForm.dosage}
                      onChange={(e) => setEditForm({...editForm, dosage: e.target.value})}
                    />
                  ) : <span className="text-gray-500">{item.dosage}</span>}
                </td>
                <td className={`px-6 py-4 ${getQtyColor(item.status)}`}>
                  {item.quantity || item.qty || 0}
                </td>
                <td className="px-6 py-4">
                  {editingItem === item.id ? (
                    <input 
                      type="number"
                      className="border rounded px-2 py-1 w-full"
                      value={editForm.price}
                      onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    />
                  ) : <span className="text-gray-700">₱{Number(item.price).toFixed(2)}</span>}
                </td>
                <td className="px-6 py-4 text-gray-600">
                   {editingItem === item.id ? (
                    <input 
                      type="date"
                      className="border rounded px-2 py-1 w-full text-xs"
                      value={editForm.expiry}
                      onChange={(e) => setEditForm({...editForm, expiry: e.target.value})}
                    />
                  ) : (item.expiry_date || item.expiry)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {editingItem === item.id ? (
                      <>
                        <button onClick={() => handleSave(item.id)} className="text-green-600 hover:text-green-800 text-xs font-bold uppercase">Save</button>
                        <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 text-xs font-bold uppercase">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Edit</button>
                        <button 
                          disabled={isDeleting === item.id}
                          onClick={() => handleDelete(item.id)} 
                          className="text-red-600 hover:text-red-800 text-xs font-bold uppercase"
                        >
                          {isDeleting === item.id ? "..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
