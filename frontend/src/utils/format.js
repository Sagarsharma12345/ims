export function formatINR(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '₹0.00';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
