const SENSITIVE_KEY_PATTERN = /^(authorization|cookie|set-cookie|access_?token|refresh_?token|token|password|secret|api_?key)$/i;
const SENSITIVE_TEXT_PATTERN = /(bearer\s+)[^\s,;]+|((?:access[_-]?token|refresh[_-]?token|authorization|cookie|password|secret|api[_-]?key)\s*[:=]\s*["']?)[^\s,"'};]+/gi;

const redactText = (value) => String(value).replace(
  SENSITIVE_TEXT_PATTERN,
  (match, bearerPrefix, keyPrefix) => `${bearerPrefix || keyPrefix}[REDACTED]`,
);

const safeValue = (value, depth = 0, seen = new WeakSet()) => {
  if (typeof value === 'string') return redactText(value);
  if (value === null || typeof value !== 'object') return value;
  if (depth >= 3 || seen.has(value)) return '[OMITTED]';

  seen.add(value);

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactText(value.message || 'Unknown error'),
      code: value.code,
      status: value.response?.status,
      method: value.config?.method?.toUpperCase(),
      url: value.config?.url,
    };
  }

  if (Array.isArray(value)) return value.slice(0, 20).map((item) => safeValue(item, depth + 1, seen));

  return Object.entries(value).slice(0, 30).reduce((result, [key, item]) => {
    result[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : safeValue(item, depth + 1, seen);
    return result;
  }, {});
};

/**
 * Prevent diagnostic logs from exposing bearer tokens, cookies, passwords, or
 * complete Axios request objects. This is intentionally installed once at app
 * startup so legacy component logs are covered without changing their logic.
 */
export const installSafeConsoleRedaction = () => {
  if (typeof window === 'undefined' || window.__soraSafeConsoleInstalled) return;

  window.__soraSafeConsoleInstalled = true;

  ['debug', 'info', 'log', 'warn', 'error'].forEach((method) => {
    const original = console[method]?.bind(console);
    if (!original) return;

    console[method] = (...args) => original(...args.map((arg) => safeValue(arg)));
  });
};

export const logSafeApiError = (label, error) => {
  console.error(label, {
    status: error?.response?.status,
    method: error?.config?.method?.toUpperCase(),
    url: error?.config?.url,
  });
};
