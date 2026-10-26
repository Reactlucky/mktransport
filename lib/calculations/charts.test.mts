import assert from "node:assert/strict";
import { test } from "node:test";
import { dailyRentTotals, daysInMonth } from "./charts.ts";

test("october has 31 days and same-day rents add up", () => {
  const series = dailyRentTotals(
    [
      { trip_date: "2026-10-01", rent: 100.1 },
      { trip_date: "2026-10-01", rent: 100.2 },
      { trip_date: "2026-09-30", rent: 500 },
    ],
    2026,
    10
  );

  assert.equal(daysInMonth(2026, 10), 31);
  assert.equal(series.length, 31);
  assert.equal(series[0].rent, 200.3);
  assert.equal(series[0].date, "2026-10-01");
  assert.equal(series[1].rent, 0);
});
