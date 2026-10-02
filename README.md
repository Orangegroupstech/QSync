# OKL Console

Static console for `okl.orangegroupsai.online` (one Vercel deployment, no build; Root Directory blank).

- `index.html` - landing page and the **single sign-in** (email + password, forced change of the default PIN, change password, sign out). Shows a tile per console; Users only for admins.
- `employees/` - Employees console in three sections: Overview (dashboard: headcount, top skills), People (employee directory, training & competencies from the employee records) and Attendance (overtime submission, overtime list; attendance is a placeholder).
- `qsync/` - QC console (requests, reports, products/specs, audit trail). People who can only read see no "New Test Request" or edit buttons.
- `procurement/` - requisition log, approver directory and spares stock. "New Request" lists every department and opens that department's hosted requisition form.
- `users/` - Users (admins only): all people, add person, edit access, reset, unlock, deactivate, activity.
- `Orange2ballslogo.jpg` - the company logo; also loaded by the hosted requisition/checklist pages served from n8n.
- External tiles: Live production system, Zaiki & Mintacid dashboard.

Every console reads the shared token (`sessionStorage` key `okl.token`) set at the landing page and sends it to the n8n API at `https://orangegroupsai.online/webhook/...`; no token or a 401 sends you back to the landing page.
