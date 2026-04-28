"use client";

import StatusBadge from "./StatusBadge";

export default function InventoryTable({ data }) {
  const getQtyColor = (status) => {
    if (status === "OUT OF STOCK") return "text-red-500 font-bold";
    if (status === "LOW") return "text-orange-400 font-bold";
    return "text-gray-800 font-medium";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
              "ACTION",
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
                <td className="px-6 py-4 text-gray-500">{item.dosage}</td>
                <td className={`px-6 py-4 ${getQtyColor(item.status)}`}>
                  {item.qty}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  ₱{item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-gray-600">{item.expiry}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4">
                  <button className="border border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-600 text-xs font-semibold px-4 py-1.5 rounded transition-colors tracking-wide">
                    RESTOCK
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
