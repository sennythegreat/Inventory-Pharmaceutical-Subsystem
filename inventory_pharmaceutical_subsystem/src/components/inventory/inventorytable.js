"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { inventoryService } from "../../services/inventoryServices";
import { Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InventoryTable({ data, onRefresh }) {
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", dosage: "", price: "", expiry: "" });
  const [isDeleting, setIsDeleting] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getQtyColor = (status) => {
    if (status === "OUT OF STOCK") return "text-red-500 font-bold";
    if (status === "LOW") return "text-orange-400 font-bold";
    return "text-gray-800 font-medium";
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      dosage: item.dosage,
      price: item.price,
      expiry: item.expiry_date || item.expiry
    });
    setIsModalOpen(true);
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

  const handleSave = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      await inventoryService.updateMedicineDetails(editingItem.id, editForm);
      setIsModalOpen(false);
      setEditingItem(null);
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
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
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {item.dosage?.toLowerCase().includes("mg") || item.dosage?.toLowerCase().includes("ml") 
                    ? item.dosage 
                    : `${item.dosage}mg`}
                </td>
                <td className={`px-6 py-4 ${getQtyColor(item.status)}`}>
                  {item.quantity || item.qty || 0}
                </td>
                <td className="px-6 py-4 text-gray-700">
                   ₱{Number(item.price).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {item.expiry_date || item.expiry}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Medication"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      disabled={isDeleting === item.id}
                      onClick={() => handleDelete(item.id)} 
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Medication"
                    >
                      {isDeleting === item.id ? (
                        <span className="w-[18px] h-[18px] border-2 border-red-600 border-t-transparent rounded-full animate-spin block"></span>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-[#111827]">
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
            <DialogDescription>
              Update the details for {editingItem?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosage" className="text-right">Dosage</Label>
              <Input
                id="dosage"
                value={editForm.dosage}
                onChange={(e) => setEditForm({...editForm, dosage: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input
                id="price"
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry" className="text-right">Expiry</Label>
              <Input
                id="expiry"
                type="date"
                value={editForm.expiry}
                onChange={(e) => setEditForm({...editForm, expiry: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
