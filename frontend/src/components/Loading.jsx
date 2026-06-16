export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      <p className="mt-3 text-sm font-medium text-slate-500">Loading...</p>
    </div>
  );
}
