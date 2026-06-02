# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
```

No test runner is configured. There are no lint scripts defined in `package.json`.

The dev server proxies `/api` and `/actuator` to the backend at `http://127.0.0.1:8081`. The backend must be running for any API calls to work.

## Architecture

**Vanilla JS SPA** — no framework. A single `index.html` shell with a fixed sidebar + topbar layout. All routing is hash-based (`#pageName`). Vite is used only for bundling and the dev proxy.

### Entry point and routing (`src/main.js`)

`main.js` is the application core. It owns:
- **Bootstrap**: checks `localStorage` for a JWT, validates it via `getContextoUsuario()`, then navigates to the role-appropriate default page.
- **Navigation**: `navigate(page, params)` calls the `render*` function from the `pages` map and pushes a history entry. Role guards live here (`ADMIN_ONLY_PAGES`).
- **Layout**: sidebar nav, topbar, mobile bottom nav, and footer are all rendered dynamically by `main.js` based on the user's role (`ADMIN`, `DOCENTE`, `COORDINADOR`).
- **Session events**: dispatches/listens to `atara:session-expired`, `atara:navigate`, and `atara:logged-in` as custom DOM events for decoupled communication.

### Pages (`src/pages/*.js`)

Each page exports a single `render*(container, params)` function. The function receives the `<main>` DOM element and writes HTML into it directly (innerHTML). Pages are lazy-loaded via `navigate()`.

Pages with sub-folders (`src/pages/estudiantes/`, `src/pages/secciones/`, etc.) break complex pages into helpers imported locally — there is no shared sub-page registry.

### API layer (`src/api.js`)

All backend communication goes through the `request(method, path, body)` wrapper, which:
- Attaches the Bearer token from `localStorage` (`atara_token`)
- On 401: silently tries one token refresh (`/api/auth/refresh`) using the stored refresh token, then retries the original request
- On second 401: dispatches `atara:session-expired` and returns `null` (caller should check for null)
- Unwraps `ApiResponse { success, message, data }` envelopes automatically — callers receive `.data` directly
- `redirectOn401: false` option (used by PIAD extraction) prevents session destruction on a heavy long-running upload

The `getContextoUsuario()` function caches the result of `GET /api/auth/me` in a module-level variable. Call `invalidarContextoUsuario()` after any operation that changes user assignments (sections, roles).

### Auth and tokens

Tokens live in `localStorage` under the keys `atara_token`, `atara_refresh`, and `atara_user_id`. Helper functions in `api.js` (`getAccessToken`, `setAccessToken`, etc.) are the canonical accessors. Direct `localStorage` manipulation elsewhere should be avoided.

Password policy (enforced client-side in `main.js` and server-side): minimum 8 characters, at least 2 uppercase, 2 lowercase, 2 digits.

### Utilities (`src/utils/`)

- `toast.js` — `showToast(message, type, duration)` for non-blocking notifications
- `storage.js` — `saveFilters`/`loadFilters`/`clearFilters` backed by `sessionStorage` (key prefix `atara_filters_`)
- `searchableSelect.js` — reusable searchable dropdown component used in forms
- `skeleton.js` — loading skeleton helpers
- `exportReportes.js` — report export (PDF via jsPDF/jsPDF-autotable, Excel via ExcelJS)

### Roles and access control

Three roles: `ADMIN`, `DOCENTE`, `COORDINADOR`. `COORDINADOR` shares the same nav and permissions as `DOCENTE`. `ADMIN_ONLY_PAGES = ['admin', 'centros', 'aniosLectivos']`. The sidebar, bottom nav, topbar title, footer links, and backend status indicator all change based on role.

### Backend API base URL

Set by `VITE_API_URL` env var, falling back to `''` (same-origin via the Vite proxy). In production, set `VITE_API_URL` to the backend origin.