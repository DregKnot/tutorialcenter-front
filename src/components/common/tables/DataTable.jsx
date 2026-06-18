export default function DataTable({
  columns,
  data,
  loading,
  renderRow,
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a2540]/40 rounded-2xl shadow-md border border-gray-200 dark:border-white/10 p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-14 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#09314F]/20 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#09314F] dark:bg-black/20 text-white">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left px-6 py-4"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500 dark:text-gray-400"
                >
                  No data found.
                </td>
              </tr>
            ) : (
              data.map((item) =>
                renderRow(item)
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}