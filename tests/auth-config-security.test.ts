import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("local Supabase auth defaults require strong passwords and verified email lifecycle", () => {
  const config = readFileSync("supabase/config.toml", "utf8");
  assert.match(config, /minimum_password_length = 12/);
  assert.match(config, /password_requirements = "lower_upper_letters_digits"/);
  assert.match(config, /enable_confirmations = true/);
  assert.match(config, /secure_password_change = true/);
  assert.match(config, /max_frequency = "60s"/);
  assert.doesNotMatch(config, /enable_confirmations = false/);
});
