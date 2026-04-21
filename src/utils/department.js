export function normalizeDepartmentName(name) {
  return (name || "").trim().toUpperCase();
}

export function getDepartmentPath(name) {
  const normalized = normalizeDepartmentName(name);

  switch (normalized) {
    case "NEW":
      return "/new";
    case "NAM":
      return "/men";
    case "NỮ":
      return "/women";
    case "THỂ THAO":
      return "/sports";
    case "PHỤ KIỆN":
      return "/accessories";
    default:
      return `/department/${encodeURIComponent(
        normalized.toLowerCase().replace(/\s+/g, "-")
      )}`;
  }
}

export function sortDepartments(departments) {
  const order = ["NEW", "NAM", "NỮ", "THỂ THAO", "PHỤ KIỆN"];

  return [...departments].sort((a, b) => {
    const indexA = order.indexOf(normalizeDepartmentName(a.name));
    const indexB = order.indexOf(normalizeDepartmentName(b.name));

    const safeA = indexA === -1 ? 999 : indexA;
    const safeB = indexB === -1 ? 999 : indexB;

    return safeA - safeB;
  });
}