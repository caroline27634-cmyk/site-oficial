// Allowlisted diagnostics only. Never serialize the provider error or its message/cause.
const codes = new Set([
  "over_email_send_rate_limit",
  "over_request_rate_limit",
  "unexpected_failure",
  "email_address_not_authorized",
  "email_address_invalid",
  "email_provider_disabled",
  "signup_disabled",
  "bad_jwt",
  "no_authorization",
  "invalid_credentials",
  "captcha_failed",
  "validation_failed",
  "request_timeout",
  "hook_timeout",
  "hook_timeout_after_retry",
  "user_banned",
]);
const names = new Set([
  "AuthApiError",
  "AuthRetryableFetchError",
  "AuthUnknownError",
  "AbortError",
  "TimeoutError",
  "TypeError",
]);
export type RecoveryFailure =
  | "rate_limit"
  | "email_delivery"
  | "auth_configuration"
  | "redirect_configuration"
  | "captcha"
  | "network"
  | "provider_unclassified";
export function classifyRecoveryFailure(error: unknown) {
  const e =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};
  const status =
    typeof e.status === "number" &&
    Number.isInteger(e.status) &&
    e.status >= 100 &&
    e.status <= 599
      ? e.status
      : null;
  const name =
    typeof e.name === "string" && names.has(e.name) ? e.name : "unrecognized";
  let message = typeof e.message === "string" ? e.message : "";
  let embedded: Record<string, unknown> = {};
  // Auth-js can wrap HTTP 500 JSON bodies inside AuthRetryableFetchError.message.
  // Read only for classification; none of this raw body is returned or logged.
  if (message.length <= 16000 && message.trimStart().startsWith("{"))
    try {
      const value: unknown = JSON.parse(message);
      if (value && typeof value === "object" && !Array.isArray(value))
        embedded = value as Record<string, unknown>;
    } catch {}
  const candidates = [e.code, embedded.code, embedded.error_code];
  const code =
    candidates.find(
      (v): v is string => typeof v === "string" && codes.has(v),
    ) || "unrecognized";
  if (typeof embedded.msg === "string") message = embedded.msg;
  else if (typeof embedded.message === "string") message = embedded.message;
  let category: RecoveryFailure = "provider_unclassified";
  if (
    status === 429 ||
    ["over_email_send_rate_limit", "over_request_rate_limit"].includes(code) ||
    /email rate limit|rate limit exceeded/i.test(message)
  )
    category = "rate_limit";
  else if (code === "captcha_failed") category = "captcha";
  else if (
    /smtp|sending (recovery |confirmation )?email|email.*delivery|mail.*authentication/i.test(
      message,
    )
  )
    category = "email_delivery";
  else if (
    status === 401 ||
    status === 403 ||
    [
      "bad_jwt",
      "no_authorization",
      "email_address_not_authorized",
      "email_address_invalid",
      "email_provider_disabled",
      "signup_disabled",
      "invalid_credentials",
      "validation_failed",
      "user_banned",
    ].includes(code)
  )
    category = "auth_configuration";
  else if (/redirect|redirect_to/i.test(message))
    category = "redirect_configuration";
  else if (
    code === "request_timeout" ||
    name === "AbortError" ||
    name === "TimeoutError" ||
    (!status && ["AuthRetryableFetchError", "TypeError"].includes(name)) ||
    /fetch failed|network|timed? ?out/i.test(message)
  )
    category = "network";
  return {
    category,
    providerStatus: status,
    providerCode: code,
    errorType: name,
  };
}
export type RecoveryConfigStatus = {
  supabaseUrlPresent: boolean;
  supabaseKeyPresent: boolean;
  supabaseConfigValid: boolean;
  appUrlPresent: boolean;
  appUrlValid: boolean;
  requestOriginMatches: boolean | null;
};
export function recoveryDiagnostic(
  reference: string,
  stage: "configuration" | "client_init" | "provider" | "exception",
  config: RecoveryConfigStatus,
  error?: unknown,
) {
  return {
    event: "admin.recovery.request_failed",
    reference,
    stage,
    ...classifyRecoveryFailure(error),
    configuration: {
      supabaseUrlPresent: config.supabaseUrlPresent,
      supabaseKeyPresent: config.supabaseKeyPresent,
      supabaseConfigValid: config.supabaseConfigValid,
      appUrlPresent: config.appUrlPresent,
      appUrlValid: config.appUrlValid,
      requestOriginMatches: config.requestOriginMatches,
    },
    redirectPath: "/admin/auth/confirm",
  };
}
export function reportRecoveryFailure(
  reference: string,
  stage: "configuration" | "client_init" | "provider" | "exception",
  config: RecoveryConfigStatus,
  error?: unknown,
) {
  const diagnostic = recoveryDiagnostic(reference, stage, config, error);
  console.warn("[auth.recovery]", JSON.stringify(diagnostic));
  return diagnostic.category;
}
