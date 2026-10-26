import assert from "node:assert/strict";
import { test } from "node:test";
import { summarizeActiveTrucks } from "./fleet.ts";

test("fleet summary counts only active trucks", () => {
  const summary = summarizeActiveTrucks([
    { is_active: true, status: "running" },
    { is_active: true, status: "available" },
    { is_active: true, status: "maintenance" },
    { is_active: false, status: "running" },
  ]);

  assert.deepEqual(summary, {
    total: 3,
    running: 1,
    available: 1,
    maintenance: 1,
  });
});
