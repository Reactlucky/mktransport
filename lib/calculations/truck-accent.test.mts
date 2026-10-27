import assert from "node:assert/strict";
import { test } from "node:test";
import { truckAccent, truckHue } from "./truck-accent.ts";

const plates = [
  "GJ08AW0236",
  "GJ27T9012",
  "RJ01GB8834",
  "RJ14GD5520",
  "RJ38GA3610",
  "RJ45C2219",
];

test("the same plate keeps the same hue", () => {
  assert.equal(truckHue("rj38ga3610"), truckHue("RJ38GA3610"));
  assert.equal(truckAccent("RJ38GA3610").stripe, truckAccent("  rj38ga3610 ").stripe);
});

test("the current fleet plates land on different hues", () => {
  assert.equal(new Set(plates.map(truckHue)).size, plates.length);
});
