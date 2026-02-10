import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-blue-900 dark:text-yellow-400">
          404
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Page not found
        </p>

        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 rounded bg-blue-900 text-white"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
