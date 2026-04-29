"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { inventoryService } from "@/services/inventoryServices";

export default function AddMedicine() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // State object to store all form field values
    const [formData, setFormData] = useState({
        proprietaryName: "",
        dosage: "0",
        quantity: "0",
        price: "0.00",
        expiry: ""
    });

    // Updates a specific field in the state object whenever its input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submits the form data to the backend via inventoryService
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await inventoryService.addMedicine(formData);
            // Navigate back to the inventory list upon successful addition
            router.push("/pages/inventory");
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto p-6">
            {/* Page Header */}
            <div className="flex items-start justify-between mb-8 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e293b]">Replenish Medical Inventory</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Update inventory levels or register new medication entries.
                    </p>
                </div>
                <div className="flex bg-slate-100/50 rounded-md p-1 shadow-sm border border-slate-200">
                    <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-slate-400 hover:text-slate-600 hover:bg-transparent text-[10px] font-bold px-4 h-8"
                        onClick={() => router.push("/pages/inventory/restock")}
                    >
                        RESTOCK 
                    </Button>
                    <Button 
                        size="sm" 
                        className="bg-white text-[#0f172a] hover:bg-white shadow-sm border border-slate-200 text-[10px] font-bold px-4 h-8"
                        onClick={() => router.push("/pages/inventory/add")}
                    >
                        ADD NEW ENTRY
                    </Button>
                </div>
            </div>

            {/* Form Container */}
            <Card className="max-w-2xl mx-auto border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center gap-3">
                    <div>
                        <h2 className="text-sm font-bold text-[#1e293b] tracking-wider uppercase">Medication Registration</h2>

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
                            <Label htmlFor="proprietaryName" className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Proprietary Name</Label>
                            <Input
                                id="proprietaryName"
                                name="proprietaryName"
                                placeholder="Enter generic or brand name"
                                className="bg-slate-50/50 border-slate-200 h-12 focus-visible:ring-slate-400"
                                value={formData.proprietaryName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="dosage" className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Dosage</Label>
                                <Input
                                    id="dosage"
                                    name="dosage"
                                    placeholder="e.g. 500 MG"
                                    className="bg-slate-50/50 border-slate-200 h-12 focus-visible:ring-slate-400"
                                    value={formData.dosage}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Quantity</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    className="bg-slate-50/50 border-slate-200 h-12 focus-visible:ring-slate-400"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Baseline Price</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    className="bg-slate-50/50 border-slate-200 h-12 focus-visible:ring-slate-400 text-emerald-500 font-medium"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry" className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">Expiry Validation</Label>
                                <Input
                                    id="expiry"
                                    name="expiry"
                                    type="date"
                                    className="bg-slate-50/50 border-slate-200 h-12 focus-visible:ring-slate-400 text-slate-400"
                                    value={formData.expiry}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-[#0f172a] text-white hover:bg-[#1e293b] h-14 text-sm font-bold uppercase tracking-widest shadow-lg shadow-slate-200 mt-4"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing Registry...
                                    </>
                                ) : (
                                    "Confirm Registry Selection"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
