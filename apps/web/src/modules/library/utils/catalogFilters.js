export function updateCatalogParams(current, updates) {
  const next = new URLSearchParams(current);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) next.delete(key);
    else next.set(key, value);
  });
  return next;
}
