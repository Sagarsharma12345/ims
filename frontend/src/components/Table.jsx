import { PAGE_SIZE } from "../utils/tableHelpers";

export default function Table({
  columns = [],
  rows = [],
  emptyText = "No records found",
  sortKey,
  sortOrder,
  onSort,
  page,
}) {
  const showNo = page != null;
  const colSpan = columns.length + (showNo ? 1 : 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {showNo && (
              <th className="w-12 px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500 sm:px-5">
                #
              </th>
            )}
            {columns.map((col) => {
              const canSort = col.key !== "actions" && onSort;

              return (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500 sm:px-5 sm:py-4"
                >
                  {canSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className="hover:text-indigo-600"
                    >
                      {col.label}
                      {sortKey === col.key &&
                        (sortOrder === "asc" ? " ↑" : " ↓")}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.length ? (
            rows.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-slate-50">
                {showNo && (
                  <td className="px-3 py-3 text-sm text-slate-500 sm:px-5">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-3 py-3 text-sm text-slate-700 sm:px-5 sm:py-4"
                  >
                    {col.render ? col.render(row) : (row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={colSpan}
                className="py-10 text-center text-sm text-slate-500"
              >
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
