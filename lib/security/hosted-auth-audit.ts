export type HostedAuthConfig = Record<string, unknown>;

export type HostedAuthCheck = { id: string; passed: boolean; detail: string };

function stringValue(config: HostedAuthConfig, key: string): string {
  return typeof config[key] === "string" ? String(config[key]).trim() : "";
}

export function evaluateHostedAuthConfig(config: HostedAuthConfig, siteUrl: string): HostedAuthCheck[] {
  const allowlist = stringValue(config, "uri_allow_list").split(/[\n,;]/).map((value) => value.trim()).filter(Boolean);
  const callback = new URL("/auth/callback", siteUrl).toString();
  const requiredCharacters = stringValue(config, "password_required_characters");
  const passwordComplexity = /[a-z]/.test(requiredCharacters) && /[A-Z]/.test(requiredCharacters) && /[0-9]/.test(requiredCharacters);
  const smtpConfigured = ["smtp_host", "smtp_port", "smtp_user", "smtp_pass"].every((key) => Boolean(stringValue(config, key)));
  return [
    { id: "canonical_site_url", passed: stringValue(config, "site_url") === siteUrl, detail: `Site URL: ${stringValue(config, "site_url") || "not configured"}` },
    { id: "signup_enabled", passed: config.disable_signup === false, detail: `Signup disabled: ${String(config.disable_signup)}` },
    { id: "email_confirmation_required", passed: config.mailer_autoconfirm === false && config.mailer_allow_unverified_email_sign_ins === false, detail: `Autoconfirm: ${String(config.mailer_autoconfirm)}; unverified sign-in: ${String(config.mailer_allow_unverified_email_sign_ins)}` },
    { id: "smtp_configured", passed: smtpConfigured, detail: `SMTP host, port, username and password: ${smtpConfigured ? "configured" : "incomplete"}` },
    { id: "password_policy", passed: typeof config.password_min_length === "number" && config.password_min_length >= 12 && passwordComplexity, detail: `Minimum length: ${String(config.password_min_length)}; mixed-case and digit requirement: ${passwordComplexity}` },
    { id: "refresh_token_rotation", passed: config.refresh_token_rotation_enabled === true, detail: `Refresh-token rotation: ${String(config.refresh_token_rotation_enabled)}` },
    { id: "password_change_reauthentication", passed: config.security_update_password_require_reauthentication === true, detail: `Password-change reauthentication: ${String(config.security_update_password_require_reauthentication)}` },
    { id: "callback_redirect_allowlisted", passed: allowlist.includes(callback), detail: `Exact callback allowlisted: ${allowlist.includes(callback)}` }
  ];
}
