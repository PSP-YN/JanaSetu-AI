import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("CI installs the CPU ONNX Runtime on GPU-less runners", () => {
  const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
  assert.match(workflow, /name: Install dependencies[\s\S]*?run: npm ci[^\n]*\n\s+env:\s*\n\s+ONNXRUNTIME_NODE_INSTALL_CUDA: skip/);
});
