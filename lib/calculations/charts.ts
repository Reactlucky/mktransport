function toPaise(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

function fromPaise(paise: number): number {
  return paise / 100;
}

function inputDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export interface DailyRentPoint {
  date: string;
  day: number;
  rent: number;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function monthDateRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start: inputDate(start), end: inputDate(end) };
}

export function dailyRentTotals(
  rows: { trip_date: string; rent: number }[],
  year: number,
  month: number
): DailyRentPoint[] {
  const count = daysInMonth(year, month);
  const paise = Array.from({ length: count }, () => 0);
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;

  for (const row of rows) {
    if (!row.trip_date.startsWith(prefix)) continue;
    const day = Number(row.trip_date.slice(8, 10));
    if (day < 1 || day > count) continue;
    paise[day - 1] += toPaise(Number(row.rent));
  }

  return paise.map((amount, index) => {
    const day = index + 1;
    return {
      day,
      date: `${prefix}${String(day).padStart(2, "0")}`,
      rent: fromPaise(amount),
    };
  });
}
