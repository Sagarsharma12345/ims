export default function Card({ title, children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-medium text-slate-700">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}
