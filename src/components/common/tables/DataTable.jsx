export default function DataTable({
  columns,
  data,
  loading,
  renderRow,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-14 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#09314F] text-white">
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
                  className="text-center py-10 text-gray-500"
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