import { X } from "lucide-react";

export default function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-lg
          rounded-xl bg-white shadow-xl
          max-h-[90vh]
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(90vh-64px)] overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
