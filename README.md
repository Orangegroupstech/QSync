# OKL Console

Static console for `okl.orangegroupsai.online` (one Vercel deployment, no build; Root Directory blank).

- `index.html` - landing page, no login: tiles for each system.
- `qsync/` - QC admin console (phone + PIN login).
- `employees/` - Employee Database (email + PIN; admin edits, others read).
- `procurement/` - requisition log, approver directory and spares stock (email + PIN; admin edits, others read). "New Request" lists every department and opens that department's hosted requisition form.
- `Orange2ballslogo.jpg` - the company logo; also loaded by the hosted requisition/checklist pages served from n8n.
- External tiles: Live production system, Zaiki & Mintacid dashboard.

All modules call the n8n API at `https://orangegroupsai.online/webhook/...` with a bearer session token.
