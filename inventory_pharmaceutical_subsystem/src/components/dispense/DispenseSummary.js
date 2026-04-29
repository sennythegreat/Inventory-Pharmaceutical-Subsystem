"use client";

export default function DispenseSummary({ patientId, items }) {
  const filledItems = items.filter((r) => r.medicationId && r.quantity > 0);
  const total = filledItems.reduce((sum, r) => sum + (r.unitPrice || 0) * r.quantity, 0);

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4 sticky top-4">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Current Session</p>
        <h3 className="text-sm font-bold mt-0.5 text-white truncate">
          Patient: <span className="text-blue-300">{patientId || "—"}</span>
        </h3>
      </div>

      <div className="border-t border-slate-700 pt-4 space-y-2">
        {filledItems.length === 0 ? (
          <p className="text-slate-500 text-xs">No medications added yet.</p>
        ) : (
          filledItems.map((item, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-slate-300 truncate max-w-[60%]">
                {item.name || item.medicationId}
              </span>
              <span className="text-slate-200 font-mono">
                ₱{((item.unitPrice || 0) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
        <span className="text-lg font-bold text-emerald-400 font-mono">₱{total.toFixed(2)}</span>
      </div>
    </div>
  );
}