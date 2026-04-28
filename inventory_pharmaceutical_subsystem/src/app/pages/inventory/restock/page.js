"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RefreshCcw, Loader2 } from "lucide-react";
import { inventoryService } from "@/services/inventoryServices";

export default function RestockMedicine() {
    const router = useRouter();
    const [medications, setMedications] = useState([]);
    const [selectedMedId, setSelectedMedId] = useState("");
    const [formData, setFormData] = useState({
        quantity: "0",
        price: "0.00",
        expiry: ""
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all medications for selection
    useEffect(() => {
        const fetchMeds = async () => {
            try {
                const data = await inventoryService.getAllInventory();
                setMedications(data);
            } catch (err) {
                setError("Failed to load medications");
            } finally {
                setLoading(false);
            }
        };
        fetchMeds();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (val) => {
        setSelectedMedId(val);
        const med = medications.find(m => m.id === val);
        if (med) {
            setFormData(prev => ({ 
                ...prev, 
                price: med.price || "0.00" 
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMedId || Number(formData.quantity) <= 0) return;
        
        setSubmitting(true);
        setError(null);

        try {
            // Update stock, price and expiry
            await inventoryService.updateStock(
                selectedMedId, 
                formData.quantity, 
                formData.price, 
                formData.expiry
            );
            router.push("/pages/inventory");
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedMed = medications.find(m => m.id === selectedMedId);

    return (
        <div className="mx-auto p-6">
            {/* Page Header */}
            <div className="flex items-start justify-between mb-8 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e293b]">Restock / Add New</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Update inventory levels or register new medication entries.
                    </p>
                </div>
                <div className="flex bg-slate-100/50 rounded-md p-1 shadow-sm border border-slate-200">
                    <Button 
                        size="sm" 
                        className="bg-white text-[#0f172a] hover:bg-white shadow-sm border border-slate-200 text-[10px] font-bold px-4 h-8"
                        onClick={() => router.push("/pages/inventory/restock")}
                    >
                        RESTOCK EXISTING
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-slate-400 hover:text-slate-600 hover:bg-transparent text-[10px] font-bold px-4 h-8"
                        onClick={() => router.push("/pages/inventory/add")}
                    >
                        ADD NEW ENTRY
                    </Button>
                </div>
            </div>

            {/* Form Container */}
            <Card className="max-w-2xl mx-auto border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="bg-[#0f172a] p-2 rounded-md">
                        <RefreshCcw className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-[#1e293b] tracking-wider uppercase">Inventory Replenishment</h2>
                       
                    </div>
                </div>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-md">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Select Medication to Restock</Label>
                            <Select onValueChange={handleSelectChange} disabled={loading}>
                                <SelectTrigger className="bg-slate-50/50 border-slate-200 h-12">
                                    <SelectValue placeholder={loading ? "Loading available stock..." : "Search established medication record..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {medications.map((med) => (
                                        <SelectItem key={med.id} value={med.id}>
                                            {med.name} - {med.dosage} (Available: {med.quantity || med.stock})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details of Selection</p>
                            <h3 className="font-bold text-[#1e293b]">{selectedMed ? selectedMed.name : "No Medication Selected"}</h3>
                            <p className="text-xs text-slate-500">
                                Current Stock Level: <span className="font-bold text-[#0f172a]">{selectedMed ? (selectedMed.quantity || selectedMed.stock) : "0"}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Strength / Dosage</Label>
                                <Input
                                    readOnly
                                    className="bg-slate-100 border-slate-200 h-12 text-slate-500 cursor-not-allowed"
                                    value={selectedMed ? selectedMed.dosage : ""}
                                    placeholder="Select medication to see dosage"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Quantity (Current)</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    placeholder="0"
                                    className="bg-slate-50/50 border-slate-200 h-12 focus-visible:ring-slate-400"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    disabled={!selectedMedId}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Current Market Price (P) (Optional)</Label>
                                <Input
                                    id="price"
                                    type="text"
                                    placeholder="0.00"
                                    className="bg-slate-50/50 border-slate-200 h-12 focus-visible:ring-slate-400 text-emerald-500 font-mono"
                                    value={formData.price}
                                    onChange={handleChange}
                                    disabled={!selectedMedId}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiry" className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Estimated Expiry Date</Label>
                                <Input
                                    id="expiry"
                                    type="date"
                                    className="bg-slate-50/50 border-slate-200 h-12 focus-visible:ring-slate-400"
                                    value={formData.expiry}
                                    onChange={handleChange}
                                    disabled={!selectedMedId}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                disabled={submitting || !selectedMedId || Number(formData.quantity) <= 0}
                                className="w-full bg-[#0f172a] text-white hover:bg-[#1e293b] h-14 text-sm font-bold uppercase tracking-widest shadow-lg shadow-slate-200 mt-4"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating Inventory...
                                    </>
                                ) : (
                                    "Authorize Inventory Update"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
