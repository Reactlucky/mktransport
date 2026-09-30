import assert from "node:assert/strict";
import { test } from "node:test";
import { summarizeAttendance } from "./attendance.ts";
import {
  exceedsRemaining,
  salaryRemaining,
  sumAmounts,
} from "./payroll.ts";

test("salary remaining subtracts advances and payments", () => {
  assert.equal(salaryRemaining(25000, 5000, 0), 20000);
  assert.equal(salaryRemaining(25000, 5000, 15000), 5000);
});

test("salary remaining never goes below zero", () => {
  assert.equal(salaryRemaining(25000, 5000, 25000), 0);
  assert.equal(salaryRemaining(100, 0, 150), 0);
});

test("paise sums do not drift", () => {
  assert.equal(sumAmounts([100.1, 100.2, 0.3]), 200.6);
  assert.equal(salaryRemaining(10.1, 0.2, 0.3), 9.6);
});

test("an amount that would overdraw is rejected", () => {
  assert.equal(exceedsRemaining(25000, 5000, 0, 20000), false);
  assert.equal(exceedsRemaining(25000, 5000, 0, 20001), true);
});

test("half days count as half a present day", () => {
  const summary = summarizeAttendance([
    { status: "present" },
    { status: "present" },
    { status: "half_day" },
    { status: "absent" },
    { status: "leave" },
  ]);
  assert.equal(summary.presentDays, 2.5);
  assert.equal(summary.absent, 1);
  assert.equal(summary.leave, 1);
  assert.equal(summary.halfDay, 1);
});
