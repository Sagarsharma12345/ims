export default function StatusBadge({ stock }) {
  const n = Number(stock);
  let color = "text-green-700 bg-green-100";
  if (n === 0) color = "text-red-700 bg-red-100";
  else if (n <= 10) color = "text-amber-800 bg-amber-100";

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {n}
    </span>
  );
}
