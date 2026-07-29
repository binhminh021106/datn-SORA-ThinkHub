# Deployment hardening checklist

This checklist compares the current local and deploy environment templates by
variable names only. It intentionally never contains credentials or tokens.

## 1. Choose one realtime provider

The frontend deploy template is configured for Reverb. The backend must use
the same provider:

```dotenv
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=...
REVERB_APP_KEY=...
REVERB_APP_SECRET=...
REVERB_HOST=your-reverb-host
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_ALLOWED_ORIGINS=https://your-frontend-origin
```

Do not keep only `PUSHER_*` keys when `BROADCAST_CONNECTION=reverb`; Laravel
will not read them for a Reverb connection. If using hosted Pusher instead,
set both backend `BROADCAST_CONNECTION=pusher` and frontend
`VITE_BROADCASTER=pusher`, then configure the matching `PUSHER_*` and
`VITE_PUSHER_*` variables.

## 2. Required production environment safeguards

Set these values in the backend deployment environment before caching config:

```dotenv
APP_ENV=production
APP_DEBUG=false
SESSION_SECURE_COOKIE=true
CACHE_STORE=redis
QUEUE_CONNECTION=redis
PAYMENT_CALLBACK_BASE_URL=https://your-public-backend-origin
PAYMENT_ATTEMPT_TTL_MINUTES=15
TRUSTED_PROXIES=the-exact-proxy-or-load-balancer-ip-addresses
RECAPTCHA_SECRET_KEY=...
```

`CACHE_STORE=file` is unsuitable for rate limits, OTP locks, cart locks, and
idempotency across multiple PHP processes or servers. Use one shared Redis
instance (and configure `REDIS_*`) before scaling the application.

Set `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, CORS allowed origins, Google
redirect URL, storage URL, and `REVERB_ALLOWED_ORIGINS` to the exact public
origins. Never use a wildcard origin with credentialed requests.

## 3. Deploy order

1. Upload backend code, frontend build, and the intended environment files.
2. Install dependencies without development packages if dependencies changed.
3. Run `php artisan optimize:clear` after placing the final `.env`.
4. Run `php artisan migrate --force` once. This release includes the
   `payment_attempts` migration; do not skip it.
5. Run `php artisan storage:link` only if the public storage symlink does not
   already exist.
6. Run `php artisan config:cache`, `php artisan route:cache`, and
   `php artisan event:cache`.
7. Restart queue workers and the long-running Reverb process so they receive
   the new config. Verify the queue is actually running.
8. Build the frontend only after its final `.env-deploy` is in place, because
   every `VITE_*` value is compiled into the static bundle.

## 4. Post-deploy smoke tests

- Log in as a client and an admin, then allow an access token to refresh.
- Trigger one realtime admin update and verify another open tab refreshes
  without F5.
- Submit one CAPTCHA-protected contact/OTP request and verify a repeated burst
  returns HTTP 429.
- Create one online-payment attempt and verify callback URLs use the public
  HTTPS backend origin.
- Check the browser console: no bearer token, cookie, password, or full Axios
  request object may be logged.

## 5. Remaining architecture decision

The access token is still held by frontend JavaScript for bearer authentication.
The current release redacts logs and keeps refresh tokens `HttpOnly`, but an
XSS running on the frontend origin can still read an access token from web
storage. Removing that residual risk requires a separately tested migration to
cookie-based access authentication (including Echo, mobile APIs, CSRF and
cross-origin deployment); do not mix it into a routine deploy.
