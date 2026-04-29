"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { inventoryService } from "@/services/inventoryServices";
import { useDispense } from "@/hooks/useDispense";
import MedicineRow from "./MedicineRow";
import DispenseSummary from "./DispenseSummary";

const EMPTY_ROW = { medicationId: "", quantity: 1, unitPrice: 0, name: "", dosage: "", availableQty: 0 };

export default function DispenseForm() {
  const router = useRouter();
  const { submitDispense, submitting, error } = useDispense();
  const [medications, setMedications] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [patientId, setPatientId] = useState("");
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    inventoryService
      .getAllInventory()
      .then(setMedications)
      .finally(() => setLoadingMeds(false));
  }, []);

  const handleRowUpdate = (index, updated) => {
    setRows((prev) => prev.map((r, i) => (i === index ? updated : r)));
  };

  const handleRowRemove = (index) => {
    setRows((prev) => (prev.length === 1 ? [{ ...EMPTY_ROW }] : prev.filter((_, i) => i !== index)));
  };

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) return;
    const validItems = rows
      .filter((r) => r.medicationId && r.quantity > 0)
      .map((r) => ({ medicationId: r.medicationId, quantity: r.quantity }));
    if (validItems.length === 0) return;

    try {
      const data = await submitDispense({ patientId: patientId.trim(), items: validItems });
      setSuccessData(data);
    } catch {
      // error is already in state via hook
    }
  };

  if (successData) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="bg-white rounded-xl border border-green-200 p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <ClipboardList className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Dispense Successful</h2>
          <p className="text-sm text-slate-500">
            Transaction <span className="font-mono font-semibold text-slate-700">{successData.transactionId}</span>{" "}
            has been recorded.
          </p>
          <p className="text-2xl font-bold text-emerald-600 font-mono">
            ₱{Number(successData.totalAmount).toFixed(2)}
          </p>
          <div className="text-left bg-slate-50 rounded-lg p-4 space-y-1">
            {successData.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {item.medicationName} × {item.quantity}
                </span>
                <span className="font-mono text-slate-800">₱{Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSuccessData(null);
                setPatientId("");
                setRows([{ ...EMPTY_ROW }]);
              }}
            >
              New Session
            </Button>
            <Button
              className="flex-1 bg-[#0f172a] hover:bg-[#1e293b] text-white"
              onClick={() => router.push("/pages/transactions")}
            >
              View Transactions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Dispense Medication</h1>
          <p className="text-sm text-slate-500 mt-1">
            Initialize a multi-medication distribution for a patient.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient ID */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-[#0f172a] p-2 rounded-md">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-sm font-bold text-[#1e293b] tracking-wider uppercase">
                  Dispense Session
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">
                    Patient ID
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. PAT001"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="bg-slate-50/50 border-slate-200 h-12 focus-visible:ring-slate-400 font-mono"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medication rows */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 p-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-[#1e293b] tracking-wider uppercase">
                  Medication List
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add one or more medications to dispense in this session.
                </p>
              </div>
              <CardContent className="p-6 space-y-3">
                {loadingMeds ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Loading medications...</p>
                ) : (
                  <>
                    {rows.map((row, i) => (
                      <MedicineRow
                        key={i}
                        index={i}
                        row={row}
                        medications={medications}
                        onUpdate={handleRowUpdate}
                        onRemove={handleRowRemove}
                      />
                    ))}

                    <button
                      type="button"
                      onClick={addRow}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold pt-1 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Medicine
                    </button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-md">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting || !patientId.trim() || rows.every((r) => !r.medicationId)}
              className="w-full bg-[#0f172a] text-white hover:bg-[#1e293b] h-14 text-sm font-bold uppercase tracking-widest shadow-lg shadow-slate-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Session...
                </>
              ) : (
                "Confirm Dispense Session"
              )}
            </Button>
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <DispenseSummary patientId={patientId} items={rows} />
          </div>
        </div>
      </form>
    </div>
  );
}