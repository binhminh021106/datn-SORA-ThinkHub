# Technology And Style Guide

## Project Structure

The project has two main application areas:

- **Admin dashboard:** `frontend/src/pages/admin`, `frontend/src/layouts/AdminLayout.vue`, and `frontend/src/components/admin`
- **User client storefront:** `frontend/src/pages/user`, `frontend/src/layouts/UserLayout.vue`, and `frontend/src/components/user`

Shared frontend code lives in:

- `frontend/src/components/ui` for reusable UI components
- `frontend/src/composables` for reusable Vue logic
- `frontend/src/stores` for shared client-side state
- `frontend/src/utils` for API clients, toast config, invoice helpers, and other utilities
- `frontend/src/router` for admin and user route definitions

Agents and contributors should read the relevant admin or user area before editing, because the two areas have different visual styles and UI conventions.

## Main Technologies

### Frontend

- **Vue 3** with Composition API
- **Vite** for local development and builds
- **Vue Router** for admin and user routing
- **Pinia** plus lightweight exported refs for shared state
- **Axios** and `frontend/src/utils/apiClient.js` for HTTP requests
- **TanStack Vue Query** for server-state fetching, caching, and invalidation
- **Bootstrap 5** for layout, utilities, forms, modals, tables, buttons, and responsive behavior
- **SweetAlert2** and toast utilities for user feedback
- **Laravel Echo**, **Pusher JS**, and **Laravel Reverb** for realtime frontend updates
- **Chart.js**, **Swiper**, **qrcode.vue**, **html5-qrcode**, **xlsx**, and **Vue Quill** where needed by specific features

### Backend

- **Laravel 12** backend
- **MVC structure:** Models, Controllers, routes, requests, and views
- **Form Request classes** for validation
- **Laravel Sanctum** for API authentication
- **Laravel Reverb** for realtime events
- **Queues and scheduler** for background work
- **Eloquent models** for database access
- **API controllers** for admin and client endpoints

## Admin Style

The admin area has a practical dashboard style with green branding and dark-mode support.

Common admin paths:

- `frontend/src/layouts/AdminLayout.vue`
- `frontend/src/components/admin/Sidebar.vue`
- `frontend/src/components/admin/Header.vue`
- `frontend/src/pages/admin`

Common admin colors:

- Primary green: `#009981`
- Accent green: `#00cba9`
- Sidebar dark: `#2c3136`
- Dark background: `#121416`
- Dark card background: `#1e2125`
- Dark border: `#373b3e`

Common admin class patterns:

- `text-brand`
- `bg-brand`
- `border-brand`
- `btn-brand`
- Bootstrap utility classes for spacing, layout, borders, shadows, tables, forms, badges, and modals

Admin UI should feel operational, clear, compact, and easy to scan. Prefer dashboard cards, tables, filters, badges, modals, and clear action buttons. Keep permission-aware navigation and realtime refresh behavior intact.

## User Client Style

The user client area has a luxury storefront style with deep red SORA branding, serif headings, and product-focused visuals.

Common user paths:

- `frontend/src/layouts/UserLayout.vue`
- `frontend/src/components/user`
- `frontend/src/components/ui`
- `frontend/src/pages/user`

Common user colors:

- SORA primary red: `#9f273b`
- SORA accent red: `#cc1e2e`
- Gold accent: `#e7ce7d`
- White and light gray backgrounds for product cards and shop pages
- Dark text with muted gray supporting text

Common user class patterns:

- `text-sora-primary`
- `bg-sora-primary`
- `text-main`
- `bg-main`
- `font-serif`
- `font-oswald`
- `tracking-widest`
- `luxury-btn-solid`
- Bootstrap utility classes for grids, cards, modals, spacing, and responsiveness

User UI should feel polished, luxury-oriented, product-focused, and visually consistent across shop, cart, checkout, profile, order, news, and product detail pages.

## CSS And UI Style Rules

- Preserve the existing split between admin green dashboard styling and user red luxury storefront styling.
- Use existing scoped CSS, Bootstrap utilities, and local class naming before adding new style systems.
- Keep admin components aligned with dashboard conventions and user components aligned with SORA storefront conventions.
- Prefer small CSS patches over full rewrites.
- Avoid duplicated CSS, unused wrappers, dead code, and commented-out code.
- Keep responsive behavior consistent for mobile, tablet, and desktop.
- For modals, preserve existing open, close, overlay, scroll, and body interaction behavior unless the requested fix directly targets it.
- For mini cart work, preserve existing cart state, API calls, totals, navigation, and business logic.
- Do not expose API keys, secrets, tokens, credentials, or sensitive environment values in frontend code.

## Build And Validation

Use the existing frontend build command after frontend edits:

```bash
npm run build
```

Run it from:

```bash
frontend
```

For backend changes, use the existing Laravel test or validation commands already defined in `backend/composer.json` when relevant.
