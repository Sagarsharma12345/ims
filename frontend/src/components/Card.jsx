export default function Card({ title, children }) {
  return (
    <div className=" border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
