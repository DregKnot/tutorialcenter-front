import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";

export default function MobileHeader() {
  return (
    <header className="
      fixed top-0 inset-x-0 z-50
      h-14 bg-blue-900 text-white
      flex items-center justify-between px-4
      lg:hidden
    ">
      <Bars3Icon className="w-6 h-6" />

      <h1 className="text-sm font-semibold tracking-wide">
        DASHBOARD
      </h1>

      <BellIcon className="w-6 h-6" />
    </header>
  );
}
