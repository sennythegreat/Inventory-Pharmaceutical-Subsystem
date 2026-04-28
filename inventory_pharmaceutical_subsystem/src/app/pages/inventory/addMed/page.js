"use client";
import { useState } from "react";
import { Button } from "@material-tailwind/react";

export default function AddMedicine() {
    const [medicineName, setMedicineName] = useState("");
    const [quantity, setQuantity] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-start justify-between mt-2 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Restock / Add New</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Update inventory levels or register new medication entries.
                    </p>
                </div>
            </div>
        </div>
        
    );
}
