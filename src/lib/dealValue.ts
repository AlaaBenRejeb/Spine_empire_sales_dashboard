export const normalizeDealValue = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const cleaned = trimmed.replace(/[^0-9.-]/g, "");
    if (!cleaned) return null;

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const toDealValueInput = (value: unknown): string => {
  const normalized = normalizeDealValue(value);
  return normalized === null ? "" : String(normalized);
};

export const formatDealValueCurrency = (value: unknown): string => {
  const normalized = normalizeDealValue(value);
  return normalized === null ? "Not set" : `$${normalized.toLocaleString()}`;
};
