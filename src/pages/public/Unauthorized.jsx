export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">403</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          You are not authorized to access this page.
        </p>
      </div>
    </div>
  );
}
