import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const extension = readFileSync(new URL("../extension/popup.js", import.meta.url), "utf8");

test("form assistant requires HTTPS government portal domains", () => {
  assert.match(extension, /portalUrl\.protocol==="https:"/);
  assert.match(extension, /host\.endsWith\("\.gov\.in"\)/);
  assert.match(extension, /host\.endsWith\("\.nic\.in"\)/);
});

test("form assistant has no automatic submission or document upload code", () => {
  assert.doesNotMatch(extension, /\.requestSubmit\s*\(|\.submit\s*\(/);
  assert.doesNotMatch(extension, /type=["']file["'].*\.files/);
});

test("form assistant requires an explicit user click before filling", () => {
  assert.match(extension, /getElementById\("fill"\)\.addEventListener\("click"/);
  assert.match(extension, /Review all values manually before submission/);
});
