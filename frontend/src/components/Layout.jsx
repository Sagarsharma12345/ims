import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/products", label: "Products" },
  { to: "/customers", label: "Customers" },
  { to: "/orders", label: "Orders" },
];

function linkClass({ isActive }) {
  return `mx-3 block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-indigo-600 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (onNavigate) =>
    links.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={linkClass}
        onClick={onNavigate}
      >
        {item.label}
      </NavLink>
    ));

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-5 py-5">
          <h1 className="text-base font-semibold text-slate-900">
            Inventory Manager
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">Orders & stock</p>
        </div>
        <nav className="flex flex-col gap-0.5 py-4">{navLinks()}</nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div>
            <p className="font-semibold text-slate-900">Inventory Manager</p>
            <p className="text-xs text-slate-500">Orders & stock</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </header>

        {menuOpen && (
          <nav className="border-b border-slate-200 bg-white py-2 lg:hidden">
            {navLinks(() => setMenuOpen(false))}
          </nav>
        )}

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
