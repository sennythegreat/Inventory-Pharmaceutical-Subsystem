"use client";

import { useState } from "react";
import { dispenseService } from "@/services/dispenseServices";
import { Search, Pill, User, ClipboardList, CheckCircle2 } from "lucide-react";

export default function DispensePage() {
  const [prescriptionId, setPrescriptionId] = useState("");
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!prescriptionId) return;

    setLoading(true);
    setError("");
    setPrescription(null);
    setSuccess(false);

    try {
      const data = await dispenseService.searchPrescription(prescriptionId);
      setPrescription(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    setLoading(true);
    try {
      await dispenseService.dispenseMedication({
        prescriptionId: prescription.id,
        items: prescription.prescription_items.map(item => ({
          medication_id: item.medication_id,
          quantity: item.quantity
        }))
      });
      setSuccess(true);
      setPrescription(null);
      setPrescriptionId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dispense Medication</h1>
        <p className="text-sm text-gray-500 mt-1">Search for a prescription ID to begin dispensing.</p>
      </div>

      {/* Search Section */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter Prescription ID (e.g. RX-123456)"
              value={prescriptionId}
              onChange={(e) => setPrescriptionId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">Medication dispensed successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Prescription Result */}
      {prescription && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">
                  Prescription Found
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-2">#{prescription.id}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
                <p className="text-sm font-bold text-amber-600">{prescription.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Patient Name</p>
                  <p className="text-sm font-bold text-gray-800">{prescription.patient_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Doctor</p>
                  <p className="text-sm font-bold text-gray-800">{prescription.doctor_name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Medications to Dispense</h3>
            <div className="space-y-3">
              {prescription.prescription_items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Pill className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.medications?.name || "Unknown Medicine"}</p>
                      <p className="text-xs text-gray-500">{item.medications?.dosage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-semibold uppercase">Qty</p>
                    <p className="text-sm font-bold text-gray-900">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleDispense}
              disabled={loading || prescription.status === "DISPENSED"}
              className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : "CONFIRM & DISPENSE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
