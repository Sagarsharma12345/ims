export default function PageHeader({ title, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  );
}
