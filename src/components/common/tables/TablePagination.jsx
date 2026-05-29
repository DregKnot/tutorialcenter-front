export default function TablePagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">

      <p className="text-sm text-gray-500">
        Page {currentPage} of {totalPages || 1}
      </p>

      <div className="flex gap-2">

        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
        >
          Previous
        </button>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
        >
          Next
        </button>

      </div>

    </div>
  );
}