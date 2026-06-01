export const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      <input className={`${inputClass} ${error ? 'border-red-400' : ''} ${className}`} {...props} />
      {error && <p className="mt-0.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
