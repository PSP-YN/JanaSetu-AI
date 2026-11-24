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

test("hosted Auth audit requires exact production callback and verified email settings", async () => {
  const { evaluateHostedAuthConfig } = await import("../lib/security/hosted-auth-audit");
  const config = {
    site_url: "https://jana-setu-ai.vercel.app",
    disable_signup: false,
    mailer_autoconfirm: false,
    mailer_allow_unverified_email_sign_ins: false,
    smtp_host: "smtp.example.test",
    smtp_port: "587",
    smtp_user: "mailer",
    smtp_pass: "configured-secret",
    password_min_length: 12,
    password_required_characters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    refresh_token_rotation_enabled: true,
    security_update_password_require_reauthentication: true,
    uri_allow_list: "https://jana-setu-ai.vercel.app/auth/callback"
  };
  const checks = evaluateHostedAuthConfig(config, "https://jana-setu-ai.vercel.app");
  assert.ok(checks.every((check) => check.passed));
  const insecure = evaluateHostedAuthConfig({ ...config, mailer_autoconfirm: true, uri_allow_list: "https://*.vercel.app/**" }, "https://jana-setu-ai.vercel.app");
  assert.equal(insecure.find((check) => check.id === "email_confirmation_required")?.passed, false);
  assert.equal(insecure.find((check) => check.id === "callback_redirect_allowlisted")?.passed, false);
});

test("hosted Auth audit never prints or returns SMTP credential values", async () => {
  const { evaluateHostedAuthConfig } = await import("../lib/security/hosted-auth-audit");
  const checks = evaluateHostedAuthConfig({ smtp_host: "smtp.example.test", smtp_port: "587", smtp_user: "mailer", smtp_pass: "do-not-print" }, "https://jana-setu-ai.vercel.app");
  assert.ok(checks.every((check) => !check.detail.includes("do-not-print")));
});
