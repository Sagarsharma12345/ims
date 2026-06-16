import { NavLink } from "react-router-dom";
import { menuItems } from "../constants/menuItems";

export default function SideNav({ isOpen, onClose }) {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-slate-900 text-white border-r border-slate-800
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col
        `}
      >
        {/* Logo */}
        <div className="border-b border-slate-800 px-5 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">IMS Dashboard</h1>
              <p className="mt-1 text-xs text-slate-400">
                Inventory Management System
              </p>
            </div>

            <button onClick={onClose} className="text-xl lg:hidden">
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={navLinkClass}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
