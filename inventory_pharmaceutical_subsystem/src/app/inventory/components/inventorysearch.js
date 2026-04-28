"use client";

const STATUS_OPTIONS = [
  "All Statuses",
  "SUFFICIENT",
  "LOW",
  "OUT OF STOCK",
  "EXPIRING SOON",
];

export default function InventorySearch({
  search,
  setSearch,
  statusFilter,
  setFilter,
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search MED ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 w-52 transition"
        />
      </div>

      {/* Filter dropdown */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4h18M6 8h12M9 12h6M11 16h2"
          />
        </svg>
        <select
          value={statusFilter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none transition cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
