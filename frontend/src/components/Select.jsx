export default function Select({ label, error, children, className = '', wrapperClassName = '', bare = false, ...props }) {
  const cls = `w-full rounded border border-slate-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
    error ? 'border-red-400' : ''
  } ${className}`;

  if (bare) {
    return (
      <select className={`h-10 ${cls}`} {...props}>
        {children}
      </select>
    );
  }

  return (
    <div className={`mb-3 ${wrapperClassName}`}>
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}
      <select className={`py-2 ${cls}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
