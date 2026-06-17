export const PAGE_SIZE = 10;

export function filterSortPage(
  list,
  { search, keys, sortKey, sortOrder, page },
) {
  let rows = [...list];

  const q = search.trim().toLowerCase();
  if (q) {
    rows = rows.filter((row) =>
      keys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  if (sortKey) {
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const n1 = Number(av);
      const n2 = Number(bv);

      if (!Number.isNaN(n1) && !Number.isNaN(n2)) {
        return sortOrder === "asc" ? n1 - n2 : n2 - n1;
      }

      const s1 = String(av ?? "").toLowerCase();
      const s2 = String(bv ?? "").toLowerCase();
      if (s1 < s2) return sortOrder === "asc" ? -1 : 1;
      if (s1 > s2) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), pages);
  const start = (currentPage - 1) * PAGE_SIZE;

  return {
    rows: rows.slice(start, start + PAGE_SIZE),
    total,
    pages,
    page: currentPage,
  };
}
