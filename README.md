# OKL Console

Static console for `okl.orangegroupsai.online` (one Vercel deployment, no build; Root Directory blank).

- `index.html` - landing page and the **single sign-in** (email + password, forced change of the default PIN, change password, sign out). Shows a tile per console; Users only for admins.
- `employees/` - Human Resource console in three sections: Overview (dashboard: headcount, top skills), People (employee directory with active/inactive status and join/left dates; training sessions that add skills to attendees, skills matrix and downloadable skills card) and Attendance (overtime: department tiles that open the hosted overtime form, plus an overtime overview, daily view, by-person totals and entry log (each entry is a weekday, weekend or public holiday; filter by day type; editors correct or void entries); Leave (overview, requests with route and decisions and a print view, balances with yearly days per person, and the editable leave types and rules) Public holidays (a year calendar HR fills in) and Salary (advisory estimate per person from attendance and overtime, editable formula, payroll-cycle period); Attendance uploads the device Excel export (parsed in the browser, days already entered are skipped) with overview, daily register, by-person summary, history and an editable lateness time).
- `qsync/` - QC console (requests, reports, products/specs, audit trail). People who can only read see no "New Test Request" or edit buttons.
- `procurement/` - requisition log, approver directory and spares stock. "New Request" lists every department and opens that department's hosted requisition form.
- `users/` - Users (admins only): all people, add person, edit access, reset, unlock, deactivate, activity, and **Approvers** - the one list of who approves and who can submit requests (Procurement requisitions, Leave), each linked to an employee record. The Procurement console no longer has a Roles page; it only reads this list.
- `logo.png` - the company logo (transparent background). Keep this file name: the consoles and the n8n emails and hosted forms (QSync, HR, Procurement) load `https://okl.orangegroupsai.online/logo.png`, including emails already sent.
- External tiles: Live production system, Zaiki & Mintacid dashboard.

Every console reads the shared token (`sessionStorage` key `okl.token`) set at the landing page and sends it to the n8n API at `https://orangegroupsai.online/webhook/...`; no token or a 401 sends you back to the landing page.
