export default function FilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  totalResults,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

      {/* SEARCH INPUT */}

      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
        className="border border-gray-300 rounded-xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-[#09314F]"
      />

      {/* STATUS FILTER */}

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
        className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#09314F]"
      >
        <option value="all">
          All Status
        </option>

        <option value="successful">
          Successful
        </option>

        <option value="pending">
          Pending
        </option>

        <option value="failed">
          Failed
        </option>
      </select>

      {/* RESULTS */}

      <p className="text-sm text-gray-500 whitespace-nowrap">
        {totalResults} payment(s) found
      </p>

    </div>
  );
}