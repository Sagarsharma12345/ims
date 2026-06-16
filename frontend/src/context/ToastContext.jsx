import { createContext, useContext, useState } from "react";
import { X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = "success") {
    if (!message) return;

    const id = Date.now();

    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    // auto remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  function closeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start justify-between gap-3 min-w-60 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in
              ${
                toast.type === "error"
                  ? "bg-red-600"
                  : toast.type === "success"
                    ? "bg-green-600"
                    : "bg-slate-800"
              }`}
          >
            <span className="flex-1">{toast.message}</span>

            {/* Close Button */}
            <button
              onClick={() => closeToast(toast.id)}
              className="text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
