# OKL Console

This is one Vercel deployment (no build step) serving the whole `okl.orangegroupsai.online` domain. Root Directory in Vercel should stay blank/`./`.

- **`index.html`** (this folder's root) — the console landing page. No login. Two tiles: Employee Database, QSync.
- **`qsync/`** — the QSync admin console, moved here unchanged (same `index.html`/`app.js`/`style.css`, same content/logic/flow, just relocated). Still has its own separate phone/PIN login, its own `OKL_QCD_users`/`OKL_QCD_admin_sessions` tables, its own `QCD.json` workflow — none of that changed by this move.
- **`employees/`** — the Employee Database module. **Temporarily has no login** (see the outer repo's README for why and how to re-enable it) — anyone who reaches `/employees/` can view and edit records. This is a reduced copy; the full auth-capable version of this same frontend lives in `../others/employees-frontend-full-login/`, kept in sync by hand.

## Why this structure
`okl.orangegroupsai.online` used to point straight at what's now `qsync/`. It's being widened into a small hub for multiple OKL systems, each its own path — no change to QSync's own code, content, or behavior, only where its files sit and what serves the domain root. Bookmarks/links to the bare domain root will now land on the hub page instead of QSync directly; anything that already deep-links into a QSync route (e.g. via its hash) still works once inside `qsync/`.

More modules (procurement, etc.) will get their own subfolder here the same way as they're ready.
