export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {action}
      </div>

      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
