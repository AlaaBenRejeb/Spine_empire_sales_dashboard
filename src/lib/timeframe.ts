export type Timeframe = "today" | "month" | "all";

const pad = (value: number) => value.toString().padStart(2, "0");

const toDate = (value: Date | string | number | null | undefined): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getLocalDayKey = (value: Date | string | number = new Date()): string | null => {
  const date = toDate(value);
  if (!date) return null;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getLocalMonthKey = (value: Date | string | number = new Date()): string | null => {
  const date = toDate(value);
  if (!date) return null;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

export const isInLocalTimeframe = (
  value: Date | string | number | null | undefined,
  timeframe: Timeframe,
): boolean => {
  if (timeframe === "all") {
    return toDate(value) !== null;
  }

  const date = toDate(value);
  if (!date) return false;

  if (timeframe === "today") {
    return getLocalDayKey(date) === getLocalDayKey(new Date());
  }

  return getLocalMonthKey(date) === getLocalMonthKey(new Date());
};
