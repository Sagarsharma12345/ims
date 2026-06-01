export default function Select({ label, error, children, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}
      <select
        className={`w-full rounded border px-3 py-2 text-sm ${error ? 'border-red-400' : 'border-gray-300'}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
