const parsePagination = (query = {}, maximumPageSize = 100) => {
  const rawPage = Number.parseInt(query.page, 10);
  const rawPageSize = Number.parseInt(query.pageSize, 10);
  return {
    page: Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1,
    pageSize: Number.isFinite(rawPageSize)
      ? Math.min(maximumPageSize, Math.max(1, rawPageSize))
      : 10,
  };
};

module.exports = { parsePagination };
