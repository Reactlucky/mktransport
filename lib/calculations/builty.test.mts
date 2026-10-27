import assert from "node:assert/strict";
import { test } from "node:test";
import { advanceWithinFreight, builtyBalance } from "./builty.ts";

test("balance is freight minus advance", () => {
  assert.equal(builtyBalance(1000, 250), 750);
  assert.equal(builtyBalance(1000.5, 0.2), 1000.3);
  assert.equal(builtyBalance(0, 0), 0);
});

test("advance cannot exceed freight or go negative", () => {
  assert.equal(advanceWithinFreight(1000, 250), true);
  assert.equal(advanceWithinFreight(1000, 1000), true);
  assert.equal(advanceWithinFreight(1000, 1000.01), false);
  assert.equal(advanceWithinFreight(1000, -1), false);
  assert.equal(advanceWithinFreight(-1, 0), false);
});
