/* ============================================================
   Department requests (042, unified 7 Nov 2026): Quality Control and Quality Assurance raise procurement requests and
   submit overtime from the console. The forms are the shared ones in ../requests.js (the same page, words and checks as
   Engineering and HR), so a request goes into the SAME pipelines as ever (procurement intake: approvals by the department
   manager then the plant manager; overtime: HR's overtime records). The requester is the signed-in person.
   Page access: "qsync.dept" (Users console).
   ============================================================ */
let deptState = { dept: '' };
function deptData(){ return labGet('/dept'); }
function deptCfg(d, extra){
  const dept = deptState.dept || ((d.departments || []).length === 1 ? d.departments[0] : '');
  return Object.assign({ api: API_BASE, department: dept, flow: 'dept', requester: d.me || (S.me && S.me.name) || '', icons: I,
    departments: d.departments || [], onDept: v => { deptState.dept = v; render(); },
    people: ((d.roster || {})[dept] || []).map(e => ({ enroll_id: e.enroll_id, name: e.name })),
    toast, onSent: () => { labCache = {}; render(); } }, extra || {});
}
function viewDept(kind){
  const T = kind === 'overtime' ? 'Submit overtime' : 'Make a procurement request';
  const d = deptData();
  if (!d) return labWait(T, 'Department requests');
  if (d.error) return labFail(T, 'Department requests', d.error);
  if (!window.oklRequests) return labFail(T, 'Department requests', 'The request forms did not load. Reload the page.');
  const cfg = deptCfg(d, { lede: kind === 'overtime' ? 'Overtime worked by Quality Control or Quality Assurance staff, to the HR overtime log. The HR Manager is told of the day\'s submissions at midday.'
    : 'Materials, parts or services for Quality Control or Quality Assurance. Your manager approves, then the plant manager; you get the result by e-mail.' });
  const mine = x => !cfg.department || x.department === cfg.department;
  const rows = kind === 'overtime'
    ? (d.overtime || []).filter(mine).map(o => ({ date: o.date, day_type: o.day_type, name: o.name, start: o.start, end: o.end, hours: o.hours, duty: '', submitted_by: o.submitted_by }))
    : (() => { const by = {}; (d.procurement || []).filter(mine).forEach(x => { const b = by[x.batch_id || x.item_id] = by[x.batch_id || x.item_id] ||
          { batch_id: x.batch_id || '', created_at: x.at, requester: x.requestor, requirement_date: x.needed_by, status: x.status || x.review || 'Waiting for approval', decided: /approved|rejected|decided|processed/i.test(x.status || ''), items: [] };
          b.items.push({ material: x.material, detail: x.detail, qty: x.quantity + (x.unit ? ' ' + x.unit : ''), status: '' }); }); return Object.values(by); })();
  cfg.recentTitle = kind === 'overtime' ? 'Overtime, last 60 days' : 'Requests, last 120 days';
  const pg = oklRequests.page(kind, cfg, rows);
  return { title: pg.title, crumb: 'Department requests', keepScroll: true, html: pageHead(pg.title, pg.lede) + pg.html, bind: pg.bind };
}
route('/dept/procurement', () => viewDept('item'));
route('/dept/overtime', () => viewDept('overtime'));

/* ============================================================
   How to use (#/help): the short version of each task, for the people doing it. Update it with every feature people
   will notice (rule of 7 Nov 2026). One card per task, steps in the order they are done, plain words.
   ============================================================ */
const QSYNC_HELP = [
  ['inbox', 'What waits for you', [
    'An orange number on the menu (QC inbox, My analyses, OOS log, Lab master data) is how many things wait for <b>you</b>.',
    'Open that page: the tab with the orange number is where they are.',
    'The number goes down by itself when you have acted.']],
  ['doc', 'IPQA: fill the in-process sheet', [
    'Open the link from the WhatsApp or e-mail (or <b>My approvals</b>). It opens in the console: sign in with your e-mail and password if asked.',
    'Enter the sample quantity, the tests QC must do, then each check.',
    'A check marked <b>optional</b> (e.g. Mintacid pH while the probe is faulty) may be left blank: it is saved as "Not tested".',
    'Sign by <b>typing your full name</b> (no password: you are already signed in), then <b>Submit</b>. The QA Supervisor is told.']],
  ['check', 'QA Supervisor: review an IPQA sheet', [
    'The e-mail now shows every check: the specification, what IPQA recorded (each reading too) and PASS / FAIL.',
    'Tap <b>Review and Approve</b> (it opens in the console), look at the same table, then <b>Approve</b>, or <b>Reject</b> with a comment to send it back to IPQA.',
    'Sign by typing your full name. It must be the name on your own account.']],
  ['inbox', 'QC inbox: samples and tests', [
    'QC inbox is for samples only. <b>Waiting for receipt</b>: the QC Supervisor taps <b>Receive</b> and assigns the tests to analysts.',
    'Analysts work in <b>My analyses</b>; the QC Supervisor checks the worksheets; the QC Manager decides; the QA Manager acknowledges.']],
  ['box', 'Change a product\'s IPQA checks', [
    'Lab master data > <b>Products and specs</b> (first tab). Tap the product.',
    'Change limits or make a check optional: <b>Request change</b> on that check. Remove it: <b>Remove</b>. New check: <b>Add a check</b>.',
    'Say why, enter your password. A QC Supervisor or QA Supervisor starts it.',
    'The QC Manager reviews, then the QA Manager approves (Lab master data > <b>Changes</b>). The IPQA sheet changes only after that.']],
  ['settings', 'Method templates and working standards', [
    'Lab master data > <b>Method templates</b>: a QC or QA Supervisor drafts (one template per API), then <b>Send for approval</b>.',
    'The QC Manager approves it or returns it with a reason. Working standards: same, on their tab.']],
  ['users', 'Relievers (someone away)', [
    'Administration > <b>Relievers</b>: the QC Manager, QA Manager or an admin sets who signs for whom, and the dates.',
    'The reliever gets the role on the first day and loses it after the last.']],
  ['check', 'My approvals', [
    'Menu > <b>My approvals</b> (the first item) lists everything waiting for you in this console.',
    'Four groups: <b>To approve</b> (requests that need your decision), <b>Assigned to you</b> (work to do), <b>Returned to you</b> (things you raised that were returned or rejected) and <b>Overdue in your area</b>.',
    'The orange number on the menu is the number of items on this page. It falls as you act.',
    '<b>Open</b> takes you straight to the item. A link in an e-mail or WhatsApp message does the same: sign in once with your e-mail and password and you land on that item.']],
  ['info', 'Phone or laptop', [
    'The small <b>Phone view / Laptop view</b> green button at the top right of the screen switches the layout. It starts from your screen and is remembered on this device.']],
  ['edit', 'Suggestions', [
    'The orange <b>Suggestions</b> button at the bottom right of every page lets you tell us what is wrong or missing. Tap it, write a line or two about what is confusing, slow or missing on that page, and send.',
    'It goes to the system team only. It changes nothing in the system.']],
  ['box', 'Make a procurement request (QC / QA)', [
    'Department requests > <b>Make a procurement request</b>. If you work for both departments, choose which one first.',
    'You are the requester (your own name). Pick the date it is needed by, then each item: the name, a description, category, quantity and why it is needed. <b>Add another item</b> for more.',
    '<b>Send for approval</b>: your manager, then the plant manager approve; you are told by e-mail. What you sent shows in the list below the form.']],
  ['clock', 'Submit overtime (QC / QA)', [
    'Department requests > <b>Submit overtime</b>.',
    'Pick the day (within the last 31 days) and tick public holiday if it was one. Weekends are worked out by themselves.',
    'Set the start and end time, tick the people who worked. Different times or work? <b>Add another group</b>. A person can be in one group per day.',
    '<b>Submit overtime</b>: it goes into HR overtime records, and the HR Manager is told at midday. Anyone already recorded for that day is listed as not saved.']],
];
function viewQsyncHelp(){
  return { title: 'How to use', crumb: 'Help', html: pageHead('How to use', 'The short version of each task. Ask the QC or QA Supervisor if something is not clear.')
    + `<div class="grid g2">${QSYNC_HELP.map(([ic, t, steps]) => `<div class="card"><div class="card-h"><div><h3>${I[ic] || ''} ${esc(t)}</h3></div></div>
        <div class="card-b"><ol class="small" style="margin:0;padding-left:18px;line-height:1.55">${steps.map(x => `<li style="margin-bottom:4px">${x}</li>`).join('')}</ol></div></div>`).join('')}</div>` };
}
route('/help', viewQsyncHelp);
