import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildContentSecurityPolicy } from "../lib/security/csp-policy";

const read = (path: string) => readFileSync(path, "utf8");

test("production CSP is nonce-bound and blocks inline/eval script execution", () => {
  const nonce = "0123456789abcdef01234567";
  const policy = buildContentSecurityPolicy(nonce, true);
  assert.match(policy, new RegExp(`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`));
  assert.doesNotMatch(policy, /script-src[^;]*'unsafe-inline'/);
  assert.doesNotMatch(policy, /script-src[^;]*'unsafe-eval'/);
  assert.match(policy, /object-src 'none'/);
  assert.match(policy, /frame-ancestors 'none'/);
  assert.match(policy, /upgrade-insecure-requests/);
});

test("development CSP permits eval only for the development bundler", () => {
  const policy = buildContentSecurityPolicy("0123456789abcdef01234567", false);
  assert.match(policy, /script-src[^;]*'unsafe-eval'/);
  assert.doesNotMatch(policy, /script-src[^;]*'unsafe-inline'/);
  assert.doesNotMatch(policy, /upgrade-insecure-requests/);
});

test("CSP builder rejects short or malformed nonces", () => {
  assert.throws(() => buildContentSecurityPolicy("short", true), /Invalid CSP nonce/);
  assert.throws(() => buildContentSecurityPolicy("<script>123456789012", true), /Invalid CSP nonce/);
});

test("nonce CSP is applied by Next.js 16 proxy to dynamically rendered HTML", () => {
  const proxy = read("proxy.ts");
  const layout = read("app/layout.tsx");
  const config = read("next.config.ts");
  assert.match(proxy, /requestHeaders\.set\("Content-Security-Policy", policy\)/);
  assert.match(proxy, /response\.headers\.set\("Content-Security-Policy", policy\)/);
  assert.match(proxy, /requestHeaders\.set\("x-nonce", nonce\)/);
  assert.match(layout, /await headers\(\)/);
  assert.doesNotMatch(config, /Content-Security-Policy-Report-Only/);
});
