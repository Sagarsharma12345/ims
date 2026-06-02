import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const menu = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-52 border-r bg-white lg:block">
        <div className="border-b px-4 py-4 font-semibold">Management System</div>
        <nav className="p-2">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) =>
                `mb-1 block rounded px-3 py-2 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b px-4 py-3 lg:hidden">
          <span className="font-semibold">Management System</span>
          <button type="button" className="rounded border px-3 py-1 text-sm" onClick={() => setOpen(!open)}>
            Menu
          </button>
        </header>

        {open && (
          <nav className="border-b p-2 lg:hidden">
            {menu.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `mb-1 block rounded px-3 py-2 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`
                }
              >
                {m.label}
              </NavLink>
            ))}
          </nav>
        )}

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
