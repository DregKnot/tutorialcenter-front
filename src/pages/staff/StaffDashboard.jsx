import StaffDashboardLayout from "../../components/private/Staff/DashboardLayout.jsx";

export default function StaffDashboard() {
  return (
    <StaffDashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)] gap-6">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <header className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Back / Add Staff
              </p>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Staff
              </h2>
            </div>
          </header>

          <form className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:row-span-3 flex flex-col items-center justify-start gap-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40">
              <div className="w-32 h-32 rounded-xl bg-[length:16px_16px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 text-center">
                Click/drag and drop to upload
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="first name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="last name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+234 XXX XXXX XXXX"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Gender
              </label>
              <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">select gender</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Role
              </label>
              <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">select role</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Location
              </label>
              <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">select location</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Home Address
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="enter home address"
              />
            </div>

            <div className="lg:col-span-2 mt-4">
              <button
                type="button"
                className="w-full rounded-lg bg-[#09314F] hover:bg-[#051b2b] text-white font-semibold py-3 text-sm transition-colors"
              >
                Register
              </button>
            </div>
          </form>
        </section>
      </div>
    </StaffDashboardLayout>
  );
}

