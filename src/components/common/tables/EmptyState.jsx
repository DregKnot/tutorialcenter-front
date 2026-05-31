export default function EmptyState({
  message = "No data found.",
  colSpan = 1,
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-center py-10 text-gray-500"
      >
        {message}
      </td>
    </tr>
  );
}