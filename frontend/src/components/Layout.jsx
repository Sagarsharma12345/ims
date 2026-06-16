import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import SideNav from "./SideNav";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Sidebar */}
      <SideNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                IMS Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Inventory Management System
              </p>
            </div>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
