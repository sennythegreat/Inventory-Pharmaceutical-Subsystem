export default function StatusBadge({ status }) {
  const styles = {
    SUFFICIENT: "bg-green-100 text-green-700 border border-green-200",
    LOW: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "OUT OF STOCK": "bg-red-100 text-red-600 border border-red-200",
    "EXPIRING SOON": "bg-orange-100 text-orange-600 border border-orange-200",
  };

  const cls =
    styles[status] || "bg-gray-100 text-gray-500 border border-gray-200";

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}
