export default function TableSkeleton({
  rows = 5,
  columns = 5,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              {[...Array(columns)].map((_, index) => (
                <th
                  key={index}
                  className="px-6 py-4"
                >
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-100"
              >
                {[...Array(columns)].map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4"
                  >
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}